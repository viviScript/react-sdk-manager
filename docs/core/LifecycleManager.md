# LifecycleManager 生命周期管理器文档

## 概述

[`LifecycleManager`](../../src/core/LifecycleManager.ts) 是管理整个SDK生命周期事件的核心组件。它提供了完整的事件系统，支持同步和异步的生命周期钩子，并具备错误隔离和调试功能。

## 类结构

```typescript
export class LifecycleManager implements ILifecycleManager {
  private hooks: Map<LifecycleHook, Set<LifecycleCallback>> = new Map();
  private isDebug: boolean = false;
}
```

## 生命周期钩子类型

```typescript
type LifecycleHook = 
  | 'beforeMount'    // 挂载前
  | 'afterMount'     // 挂载后
  | 'beforeUnmount'  // 卸载前
  | 'afterUnmount'   // 卸载后
  | 'stateChange'    // 状态变化
  | 'error';         // 错误处理
```

## 核心功能

### 1. 初始化

#### `constructor(debug: boolean = false)`
- **功能**: 创建生命周期管理器实例
- **参数**: `debug` - 是否启用调试模式
- **初始化流程**:
  1. 设置调试模式
  2. 初始化所有钩子类型的空集合

### 2. 钩子注册

#### `on(hook: LifecycleHook, callback: LifecycleCallback): () => void`
- **功能**: 注册生命周期钩子回调
- **参数**:
  - `hook`: 生命周期钩子类型
  - `callback`: 回调函数
- **返回**: 取消注册的函数
- **特性**:
  - 支持同一钩子注册多个回调
  - 自动创建钩子集合（如果不存在）
  - 调试模式下输出注册日志

**示例**:
```typescript
const unsubscribe = lifecycleManager.on('afterMount', () => {
  console.log('SDK mounted successfully');
});

// 取消注册
unsubscribe();
```

#### `off(hook: LifecycleHook, callback: LifecycleCallback): void`
- **功能**: 取消注册指定的钩子回调
- **参数**:
  - `hook`: 生命周期钩子类型
  - `callback`: 要取消的回调函数
- **特性**: 调试模式下输出取消注册日志

### 3. 事件触发

#### `emit(hook: LifecycleHook, ...args: any[]): void`
- **功能**: 同步触发生命周期钩子
- **参数**:
  - `hook`: 要触发的钩子类型
  - `...args`: 传递给回调的参数
- **执行流程**:
  1. 输出调试日志（如果启用）
  2. 获取钩子的所有回调
  3. 创建回调数组副本（避免执行过程中修改）
  4. 依次执行所有回调
  5. 错误隔离处理

**错误处理**:
- 单个回调的错误不会影响其他回调
- 错误会被捕获并输出到控制台
- 如果不是 `error` 钩子本身出错，会触发 `error` 钩子

#### `async emitAsync(hook: LifecycleHook, ...args: any[]): Promise<void>`
- **功能**: 异步触发生命周期钩子
- **参数**: 同 `emit` 方法
- **执行流程**:
  1. 输出调试日志
  2. 获取所有回调并转换为Promise数组
  3. 使用 `Promise.all` 并行执行所有回调
  4. 等待所有回调完成

**异步特性**:
- 支持异步回调函数
- 并行执行所有回调以提高性能
- 错误隔离，单个回调失败不影响其他回调

**示例**:
```typescript
// 同步触发
lifecycleManager.emit('stateChange', newState, prevState);

// 异步触发
await lifecycleManager.emitAsync('beforeMount');
```

### 4. 钩子管理

#### `clear(hook?: LifecycleHook): void`
- **功能**: 清除钩子回调
- **参数**: `hook` - 可选，指定要清除的钩子类型
- **行为**:
  - 如果指定钩子类型，只清除该类型的所有回调
  - 如果不指定，清除所有钩子的所有回调，然后重新初始化

#### `getCallbackCount(hook: LifecycleHook): number`
- **功能**: 获取指定钩子的回调数量
- **用途**: 调试和性能监控

#### `getRegisteredHooks(): LifecycleHook[]`
- **功能**: 获取所有有回调的钩子类型
- **返回**: 包含回调的钩子类型数组

#### `hasCallbacks(hook: LifecycleHook): boolean`
- **功能**: 检查指定钩子是否有回调
- **返回**: 布尔值表示是否有回调

### 5. 调试功能

#### `setDebugMode(debug: boolean): void`
- **功能**: 设置调试模式
- **参数**: `debug` - 是否启用调试模式
- **调试输出**: 在调试模式下会输出钩子注册、取消注册、触发等信息

## 内部机制

### 1. 钩子初始化
```typescript
private initializeHooks(): void {
  const hookTypes: LifecycleHook[] = [
    'beforeMount',
    'afterMount', 
    'beforeUnmount',
    'afterUnmount',
    'stateChange',
    'error'
  ];

  hookTypes.forEach(hook => {
    if (!this.hooks.has(hook)) {
      this.hooks.set(hook, new Set());
    }
  });
}
```

### 2. 错误隔离机制
```typescript
callbackArray.forEach(callback => {
  try {
    callback(...args);
  } catch (error) {
    console.error(`Error in lifecycle hook '${hook}':`, error);
    
    // 避免错误钩子的无限递归
    if (hook !== 'error') {
      this.emit('error', error, hook);
    }
  }
});
```

### 3. 异步执行机制
```typescript
const promises = callbackArray.map(async callback => {
  try {
    await Promise.resolve(callback(...args));
  } catch (error) {
    console.error(`Error in async lifecycle hook '${hook}':`, error);
    
    if (hook !== 'error') {
      this.emit('error', error, hook);
    }
  }
});

await Promise.all(promises);
```

## 使用示例

### 基本使用
```typescript
import { LifecycleManager } from '@react-sdk/manager';

const lifecycleManager = new LifecycleManager(true); // 启用调试模式

// 注册钩子
const unsubscribeMount = lifecycleManager.on('afterMount', () => {
  console.log('SDK mounted');
});

const unsubscribeState = lifecycleManager.on('stateChange', (newState, prevState) => {
  console.log('State changed:', { newState, prevState });
});

// 触发钩子
lifecycleManager.emit('afterMount');
lifecycleManager.emit('stateChange', { count: 1 }, { count: 0 });

// 清理
unsubscribeMount();
unsubscribeState();
```

### 异步钩子使用
```typescript
// 注册异步钩子
lifecycleManager.on('beforeMount', async () => {
  console.log('Initializing...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Initialization complete');
});

// 异步触发
await lifecycleManager.emitAsync('beforeMount');
```

### 错误处理
```typescript
// 注册错误处理钩子
lifecycleManager.on('error', (error, context) => {
  console.error(`Error in ${context}:`, error);
  
  // 发送到监控服务
  errorReporting.captureException(error, { context });
});

// 注册可能出错的钩子
lifecycleManager.on('stateChange', (state) => {
  if (!state.user) {
    throw new Error('User is required');
  }
});
```

### 插件生命周期集成
```typescript
// 在插件中使用生命周期
class MyPlugin {
  constructor(private lifecycle: LifecycleManager) {
    this.setupLifecycleHooks();
  }
  
  private setupLifecycleHooks() {
    this.lifecycle.on('beforeMount', this.onBeforeMount.bind(this));
    this.lifecycle.on('afterMount', this.onAfterMount.bind(this));
    this.lifecycle.on('stateChange', this.onStateChange.bind(this));
  }
  
  private async onBeforeMount() {
    console.log('Plugin preparing to mount');
    await this.loadResources();
  }
  
  private onAfterMount() {
    console.log('Plugin mounted successfully');
    this.startServices();
  }
  
  private onStateChange(newState: any, prevState: any) {
    if (newState.theme !== prevState.theme) {
      this.updateTheme(newState.theme);
    }
  }
}
```

## 最佳实践

### 1. 钩子设计
- **明确职责**: 每个钩子应该有明确的触发时机和用途
- **参数一致性**: 同类型钩子的参数应该保持一致
- **错误处理**: 在钩子回调中提供适当的错误处理
- **异步支持**: 对于可能耗时的操作使用异步钩子

### 2. 性能优化
- **避免重复注册**: 确保不会重复注册相同的回调
- **及时清理**: 在不需要时及时取消钩子注册
- **批量操作**: 考虑批量触发相关钩子
- **异步并行**: 使用异步钩子并行执行独立的操作

### 3. 错误处理
- **错误隔离**: 确保单个回调的错误不影响其他回调
- **错误上报**: 在错误钩子中实现错误上报机制
- **降级策略**: 在关键钩子失败时提供降级策略
- **调试信息**: 在调试模式下提供详细的错误信息

### 4. 调试和监控
- **调试模式**: 在开发环境中启用调试模式
- **性能监控**: 监控钩子执行时间和频率
- **回调统计**: 定期检查钩子回调数量，避免内存泄漏
- **日志记录**: 记录重要的生命周期事件

## 高级特性

### 1. 钩子优先级
```typescript
// 可以扩展为支持优先级
interface PriorityCallback {
  callback: LifecycleCallback;
  priority: number;
}

class LifecycleManagerWithPriority extends LifecycleManager {
  private priorityHooks: Map<LifecycleHook, PriorityCallback[]> = new Map();
  
  onWithPriority(hook: LifecycleHook, callback: LifecycleCallback, priority: number = 0) {
    if (!this.priorityHooks.has(hook)) {
      this.priorityHooks.set(hook, []);
    }
    
    const callbacks = this.priorityHooks.get(hook)!;
    callbacks.push({ callback, priority });
    callbacks.sort((a, b) => b.priority - a.priority); // 高优先级先执行
  }
}
```

### 2. 条件钩子
```typescript
// 可以扩展为支持条件钩子
class LifecycleManagerWithConditions extends LifecycleManager {
  onIf(hook: LifecycleHook, condition: () => boolean, callback: LifecycleCallback) {
    return this.on(hook, (...args) => {
      if (condition()) {
        callback(...args);
      }
    });
  }
}
```

### 3. 钩子链
```typescript
// 可以扩展为支持钩子链
class LifecycleManagerWithChain extends LifecycleManager {
  async emitChain(hooks: LifecycleHook[], ...args: any[]): Promise<void> {
    for (const hook of hooks) {
      await this.emitAsync(hook, ...args);
    }
  }
}
```

## 依赖关系

### 依赖的模块
- `LifecycleHook`: 钩子类型定义
- `LifecycleCallback`: 回调函数类型定义

### 被依赖的模块
- `SDKManager`: 使用生命周期管理器
- `PluginManager`: 在插件生命周期中使用
- React Hooks: 通过SDK实例访问

## 注意事项

1. **内存泄漏**: 确保及时清理不再需要的钩子回调
2. **错误传播**: 避免在错误钩子中再次抛出错误，防止无限递归
3. **异步顺序**: 异步钩子是并行执行的，如果需要顺序执行需要特殊处理
4. **调试性能**: 调试模式会影响性能，生产环境应关闭
5. **回调数量**: 避免注册过多回调，影响性能
