# SDKManager 核心管理器文档

## 概述

[`SDKManager`](../../src/core/SDKManager.ts) 是整个 React SDK Manager 的核心协调器，负责管理和协调所有子系统的运行。它是SDK的入口点，提供了完整的生命周期管理、配置管理和错误处理功能。

## 类结构

```typescript
export class SDKManager implements ISDKManager {
  public readonly plugins: IPluginManager;
  public readonly state: IStateManager;
  public readonly lifecycle: ILifecycleManager;
  
  private config: SDKManagerConfig;
  private isInitialized: boolean = false;
  private isDestroyed: boolean = false;
}
```

## 核心功能

### 1. 初始化管理

#### `constructor(config: SDKManagerConfig)`
- **功能**: 创建SDK实例并初始化所有子系统
- **参数**: 
  - `config`: SDK配置对象，包含名称、版本、调试模式等设置
- **行为**:
  - 合并默认配置和用户配置
  - 创建 `PluginManager`、`StateManager`、`LifecycleManager` 实例
  - 设置状态变化监听器，将状态变化转发到生命周期系统
  - 配置全局错误处理

**默认配置**:
```typescript
{
  name: 'React SDK Manager',
  version: '1.0.0',
  debug: false,
  plugins: [],
  initialState: {},
  persist: false,
  persistKey: 'react-sdk-manager-state'
}
```

#### `async initialize(): Promise<void>`
- **功能**: 异步初始化SDK，启动所有系统
- **执行流程**:
  1. 检查是否已初始化或已销毁
  2. 触发 `beforeMount` 生命周期钩子
  3. 注册配置中预定义的插件
  4. 设置初始化标志
  5. 触发 `afterMount` 生命周期钩子
  6. 输出调试信息（如果启用调试模式）
- **错误处理**: 捕获所有初始化错误，包装为 `SDKError` 并触发错误事件
- **异常**: 
  - `ALREADY_INITIALIZED`: SDK已经初始化
  - `SDK_DESTROYED`: SDK已被销毁
  - `INITIALIZATION_FAILED`: 初始化失败

### 2. 销毁管理

#### `async destroy(): Promise<void>`
- **功能**: 安全销毁SDK，清理所有资源
- **执行流程**:
  1. 检查是否已销毁（幂等操作）
  2. 触发 `beforeUnmount` 生命周期钩子
  3. 按依赖关系逆序禁用所有插件
  4. 注销所有插件
  5. 清理状态监听器
  6. 清理生命周期钩子
  7. 设置销毁标志
  8. 触发 `afterUnmount` 生命周期钩子
- **特殊处理**: 在销毁过程中忽略依赖错误，强制清理所有资源
- **错误处理**: 即使单个插件销毁失败，也会继续清理其他资源

### 3. 配置管理

#### `getConfig(): SDKManagerConfig`
- **功能**: 获取当前SDK配置的副本
- **返回**: 配置对象的深拷贝，防止外部修改

#### `updateConfig(newConfig: Partial<SDKManagerConfig>): void`
- **功能**: 更新SDK配置
- **参数**: `newConfig` - 要更新的配置项
- **特殊处理**: 
  - 如果更新了 `debug` 配置，会同步更新生命周期管理器的调试模式
  - 配置更新是浅合并，不会影响已初始化的状态

### 4. 状态查询

#### `getInfo()`
- **功能**: 获取SDK的运行时信息
- **返回值**:
```typescript
{
  name?: string;                    // SDK名称
  version?: string;                 // SDK版本
  isInitialized: boolean;           // 是否已初始化
  isDestroyed: boolean;             // 是否已销毁
  pluginCount: number;              // 插件总数
  enabledPluginCount: number;       // 启用的插件数量
  stateListenerCount: number;       // 状态监听器数量
  registeredHooks: LifecycleHook[]; // 已注册的生命周期钩子
}
```

### 5. 重置功能

#### `async reset(): Promise<void>`
- **功能**: 重置SDK状态，重新启用所有插件
- **执行流程**:
  1. 检查是否已初始化
  2. 重置状态管理器到初始状态
  3. 重新启用所有插件（先禁用再启用）
- **用途**: 用于开发调试或需要重置应用状态的场景
- **异常**: `NOT_INITIALIZED` - SDK未初始化

## 内部方法

### `sortPluginsByDependenciesReverse(plugins: any[]): any[]`
- **功能**: 按依赖关系逆序排序插件，用于安全销毁
- **算法**: 深度优先搜索，确保被依赖的插件最后销毁
- **循环依赖处理**: 使用 `visiting` 集合检测并避免无限递归

## 错误处理

### 错误类型
- `ALREADY_INITIALIZED`: 重复初始化
- `SDK_DESTROYED`: 操作已销毁的SDK
- `NOT_INITIALIZED`: 操作未初始化的SDK
- `INITIALIZATION_FAILED`: 初始化失败
- `DESTRUCTION_FAILED`: 销毁失败
- `RESET_FAILED`: 重置失败

### 错误处理策略
1. **包装原始错误**: 将所有错误包装为 `SDKError`，提供统一的错误格式
2. **上下文信息**: 为每个错误提供发生的上下文信息
3. **生命周期通知**: 所有错误都会触发 `error` 生命周期钩子
4. **调试支持**: 在调试模式下输出详细的错误信息

## 生命周期集成

### 状态变化监听
```typescript
this.state.subscribe((newState, prevState) => {
  this.lifecycle.emit('stateChange', newState, prevState);
});
```

### 错误处理集成
```typescript
this.lifecycle.on('error', (error: Error, context?: string) => {
  if (this.config.debug) {
    console.error(`SDK Error${context ? ` in ${context}` : ''}:`, error);
  }
});
```

## 使用示例

### 基本使用
```typescript
import { SDKManager } from '@react-sdk/manager';

const sdk = new SDKManager({
  name: 'My Application SDK',
  version: '1.0.0',
  debug: true,
  initialState: { user: null, theme: 'light' },
  persist: true,
  persistKey: 'my-app-state'
});

// 初始化
await sdk.initialize();

// 获取信息
console.log(sdk.getInfo());

// 重置状态
await sdk.reset();

// 销毁
await sdk.destroy();
```

### 工厂函数使用
```typescript
import { createSDKManager } from '@react-sdk/manager';

const sdk = createSDKManager({
  name: 'My App',
  debug: process.env.NODE_ENV === 'development'
});
```

### 错误处理
```typescript
const sdk = new SDKManager(config);

sdk.lifecycle.on('error', (error, context) => {
  console.error(`Error in ${context}:`, error);
  // 发送到监控服务
  errorReporting.captureException(error, { context });
});

try {
  await sdk.initialize();
} catch (error) {
  console.error('Failed to initialize SDK:', error);
}
```

## 最佳实践

### 1. 配置管理
- 在生产环境中关闭调试模式
- 为不同环境使用不同的持久化键
- 合理设置初始状态，避免过大的对象

### 2. 生命周期管理
- 在应用启动时初始化SDK
- 在应用卸载时销毁SDK
- 使用生命周期钩子进行资源清理

### 3. 错误处理
- 始终处理初始化和销毁的异常
- 使用生命周期的错误钩子进行全局错误处理
- 在调试模式下启用详细日志

### 4. 性能考虑
- 避免频繁调用 `getInfo()`，考虑缓存结果
- 合理使用 `reset()` 功能，避免不必要的重置
- 在不需要时及时销毁SDK实例

## 依赖关系

### 依赖的模块
- `PluginManager`: 插件管理
- `StateManager`: 状态管理
- `LifecycleManager`: 生命周期管理
- `SDKError`: 错误类型

### 被依赖的模块
- `SDKProvider`: React组件中使用
- 各种Hook: 通过Context提供SDK实例

## 注意事项

1. **线程安全**: 当前实现不是线程安全的，在并发环境中需要额外的同步机制
2. **内存泄漏**: 确保在不使用时调用 `destroy()` 方法清理资源
3. **状态持久化**: 持久化功能依赖于 `localStorage`，在某些环境中可能不可用
4. **插件依赖**: 插件的依赖关系在销毁时会被逆序处理，确保依赖关系的正确性
