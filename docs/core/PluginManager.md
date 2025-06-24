# PluginManager 插件管理器文档

## 概述

[`PluginManager`](../../src/core/PluginManager.ts) 是负责插件完整生命周期管理的核心组件。它提供了插件的注册、注销、启用、禁用功能，并具备完善的依赖关系管理和循环依赖检测机制。

## 类结构

```typescript
export class PluginManager implements IPluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map();
}
```

## 核心功能

### 1. 插件注册

#### `async register(plugin: Plugin): Promise<void>`
- **功能**: 注册新插件到系统中
- **参数**: `plugin` - 要注册的插件对象
- **执行流程**:
  1. 检查插件是否已存在
  2. 验证插件依赖关系
  3. 检测循环依赖
  4. 注册插件到内部Map
  5. 更新依赖图
  6. 如果插件启用，执行初始化
- **错误处理**:
  - `PLUGIN_ALREADY_EXISTS`: 插件已存在
  - `PLUGIN_REGISTRATION_FAILED`: 注册失败
  - `CIRCULAR_DEPENDENCY`: 检测到循环依赖
  - `DEPENDENCY_NOT_FOUND`: 依赖的插件不存在

**示例**:
```typescript
const plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  enabled: true,
  dependencies: ['base-plugin'],
  initialize: async () => {
    console.log('Plugin initialized');
  }
};

await pluginManager.register(plugin);
```

### 2. 插件注销

#### `async unregister(name: string): Promise<void>`
- **功能**: 从系统中注销插件
- **参数**: `name` - 要注销的插件名称
- **执行流程**:
  1. 检查插件是否存在
  2. 检查是否有其他插件依赖此插件
  3. 如果插件启用，执行销毁逻辑
  4. 从插件Map和依赖图中移除
- **依赖检查**: 如果有其他插件依赖此插件，将抛出错误
- **错误处理**:
  - `PLUGIN_NOT_FOUND`: 插件不存在
  - `PLUGIN_HAS_DEPENDENTS`: 插件被其他插件依赖
  - `PLUGIN_UNREGISTRATION_FAILED`: 注销失败

**示例**:
```typescript
await pluginManager.unregister('my-plugin');
```

### 3. 插件启用

#### `async enable(name: string): Promise<void>`
- **功能**: 启用指定插件
- **参数**: `name` - 要启用的插件名称
- **执行流程**:
  1. 检查插件是否存在
  2. 检查插件是否已启用（幂等操作）
  3. 验证所有依赖插件是否已启用
  4. 执行插件初始化逻辑
  5. 标记插件为启用状态
- **依赖验证**: 确保所有依赖的插件都已启用
- **错误处理**:
  - `PLUGIN_NOT_FOUND`: 插件不存在
  - `DEPENDENCY_NOT_ENABLED`: 依赖插件未启用
  - `PLUGIN_ENABLE_FAILED`: 启用失败

**示例**:
```typescript
await pluginManager.enable('my-plugin');
```

### 4. 插件禁用

#### `async disable(name: string): Promise<void>`
- **功能**: 禁用指定插件
- **参数**: `name` - 要禁用的插件名称
- **执行流程**:
  1. 检查插件是否存在
  2. 检查插件是否已禁用（幂等操作）
  3. 检查是否有启用的插件依赖此插件
  4. 执行插件销毁逻辑
  5. 标记插件为禁用状态
- **依赖检查**: 如果有启用的插件依赖此插件，将抛出错误
- **错误处理**:
  - `PLUGIN_NOT_FOUND`: 插件不存在
  - `PLUGIN_HAS_ENABLED_DEPENDENTS`: 有启用的插件依赖此插件
  - `PLUGIN_DISABLE_FAILED`: 禁用失败

**示例**:
```typescript
await pluginManager.disable('my-plugin');
```

## 查询功能

### 1. 获取单个插件

#### `get(name: string): Plugin | undefined`
- **功能**: 根据名称获取插件
- **参数**: `name` - 插件名称
- **返回**: 插件对象或undefined

### 2. 获取所有插件

#### `getAll(): Plugin[]`
- **功能**: 获取所有已注册的插件
- **返回**: 插件数组

### 3. 获取启用的插件

#### `getEnabled(): Plugin[]`
- **功能**: 获取所有启用的插件
- **返回**: 启用插件的数组

## 依赖管理

### 1. 依赖验证

#### `validateDependencies(plugin: Plugin): Promise<void>`
- **功能**: 验证插件的依赖关系
- **检查项**:
  - 依赖的插件是否存在
  - 是否存在循环依赖
- **算法**: 使用深度优先搜索检测循环依赖

**循环依赖检测算法**:
```typescript
const hasCycle = (pluginName: string): boolean => {
  visited.add(pluginName);
  recursionStack.add(pluginName);

  const pluginDeps = getPluginDependencies(pluginName);
  
  for (const dep of pluginDeps) {
    if (!visited.has(dep)) {
      if (hasCycle(dep)) return true;
    } else if (recursionStack.has(dep)) {
      return true; // 发现循环
    }
  }

  recursionStack.delete(pluginName);
  return false;
};
```

### 2. 依赖图管理

#### `updateDependencyGraph(plugin: Plugin): void`
- **功能**: 更新内部依赖图
- **数据结构**: `Map<string, Set<string>>` - 映射被依赖插件到依赖它的插件集合

#### `getDependents(pluginName: string): string[]`
- **功能**: 获取依赖指定插件的所有插件
- **参数**: `pluginName` - 被依赖的插件名称
- **返回**: 依赖此插件的插件名称数组

## 错误处理

### 错误类型
- `PLUGIN_ALREADY_EXISTS`: 插件已存在
- `PLUGIN_NOT_FOUND`: 插件不存在
- `PLUGIN_HAS_DEPENDENTS`: 插件有依赖者
- `PLUGIN_HAS_ENABLED_DEPENDENTS`: 插件有启用的依赖者
- `DEPENDENCY_NOT_FOUND`: 依赖不存在
- `DEPENDENCY_NOT_ENABLED`: 依赖未启用
- `CIRCULAR_DEPENDENCY`: 循环依赖
- `PLUGIN_REGISTRATION_FAILED`: 注册失败
- `PLUGIN_UNREGISTRATION_FAILED`: 注销失败
- `PLUGIN_ENABLE_FAILED`: 启用失败
- `PLUGIN_DISABLE_FAILED`: 禁用失败

### 错误处理策略
1. **详细错误信息**: 每个错误都包含具体的上下文信息
2. **错误包装**: 将原始错误包装为 `SDKError`
3. **操作原子性**: 确保操作要么完全成功，要么完全失败
4. **状态一致性**: 在错误情况下保持插件状态的一致性

## 使用示例

### 基本插件管理
```typescript
import { PluginManager } from '@webscript/react-sdk-manager';

const pluginManager = new PluginManager();

// 注册插件
const basePlugin = {
  name: 'base-plugin',
  version: '1.0.0',
  enabled: true,
  initialize: async () => {
    console.log('Base plugin initialized');
  }
};

await pluginManager.register(basePlugin);

// 注册有依赖的插件
const advancedPlugin = {
  name: 'advanced-plugin',
  version: '1.0.0',
  enabled: true,
  dependencies: ['base-plugin'],
  initialize: async () => {
    console.log('Advanced plugin initialized');
  }
};

await pluginManager.register(advancedPlugin);

// 查询插件
const plugin = pluginManager.get('base-plugin');
const allPlugins = pluginManager.getAll();
const enabledPlugins = pluginManager.getEnabled();
```

### 动态插件管理
```typescript
// 禁用插件
await pluginManager.disable('advanced-plugin');

// 启用插件
await pluginManager.enable('advanced-plugin');

// 注销插件
await pluginManager.unregister('advanced-plugin');
```

### 错误处理
```typescript
try {
  await pluginManager.register(plugin);
} catch (error) {
  if (error.code === 'PLUGIN_ALREADY_EXISTS') {
    console.log('Plugin already registered');
  } else if (error.code === 'CIRCULAR_DEPENDENCY') {
    console.error('Circular dependency detected:', error.message);
  }
}
```

## 最佳实践

### 1. 插件设计
- **单一职责**: 每个插件应该有明确的单一职责
- **最小依赖**: 尽量减少插件间的依赖关系
- **版本管理**: 使用语义化版本号
- **错误处理**: 在插件的 `initialize` 和 `destroy` 方法中提供完整的错误处理

### 2. 依赖管理
- **避免循环依赖**: 设计插件架构时避免循环依赖
- **分层设计**: 使用分层架构，底层插件不依赖上层插件
- **可选依赖**: 考虑使用可选依赖而不是硬依赖

### 3. 生命周期管理
- **异步初始化**: 使用异步初始化处理复杂的启动逻辑
- **资源清理**: 在 `destroy` 方法中清理所有资源
- **幂等操作**: 确保启用/禁用操作是幂等的

### 4. 性能优化
- **懒加载**: 只在需要时初始化插件
- **批量操作**: 考虑提供批量启用/禁用功能
- **缓存查询**: 对频繁查询的结果进行缓存

## 高级特性

### 1. 插件热重载
```typescript
// 重新加载插件
async reloadPlugin(name: string): Promise<void> {
  const plugin = this.get(name);
  if (plugin && plugin.enabled) {
    await this.disable(name);
    await this.enable(name);
  }
}
```

### 2. 批量操作
```typescript
// 批量启用插件
async enableMultiple(names: string[]): Promise<void> {
  for (const name of names) {
    await this.enable(name);
  }
}
```

### 3. 插件状态监听
```typescript
// 监听插件状态变化
onPluginStateChange(callback: (name: string, enabled: boolean) => void): void {
  // 实现状态变化监听
}
```

## 依赖关系

### 依赖的模块
- `Plugin`: 插件接口定义
- `SDKError`: 错误类型

### 被依赖的模块
- `SDKManager`: 使用插件管理器
- `PluginRenderer`: 渲染插件组件
- React Hooks: 通过SDK实例访问

## 注意事项

1. **异步操作**: 所有插件操作都是异步的，需要正确处理Promise
2. **状态一致性**: 在并发操作时需要注意状态一致性
3. **内存管理**: 确保插件注销时清理所有相关资源
4. **依赖顺序**: 插件的启用顺序会影响初始化顺序
5. **错误恢复**: 在插件初始化失败时，考虑错误恢复策略
