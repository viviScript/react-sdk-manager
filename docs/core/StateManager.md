# StateManager 状态管理器文档

## 概述

[`StateManager`](../../src/core/StateManager.ts) 是提供响应式状态管理功能的核心组件。它支持状态的获取、设置、订阅，并提供可选的持久化功能，确保状态在页面刷新后能够恢复。

## 类结构

```typescript
export class StateManager<T = any> implements IStateManager<T> {
  private state: T;
  private listeners: Set<StateListener<T>> = new Set();
  private config: StateConfig<T>;
}
```

## 核心功能

### 1. 状态管理

#### `constructor(config: StateConfig<T>)`
- **功能**: 创建状态管理器实例
- **参数**: `config` - 状态配置对象
- **初始化流程**:
  1. 保存配置信息
  2. 加载初始状态（优先从持久化存储加载）
  3. 初始化监听器集合

**配置接口**:
```typescript
interface StateConfig<T> {
  initialState: T;        // 初始状态
  persist?: boolean;      // 是否启用持久化
  persistKey?: string;    // 持久化存储键名
}
```

#### `getState(): T`
- **功能**: 获取当前状态
- **返回**: 当前状态对象
- **特性**: 返回状态的引用，修改返回值会影响内部状态

#### `setState(newState: Partial<T> | ((prev: T) => T)): void`
- **功能**: 更新状态
- **参数**: 
  - `newState`: 新状态（部分更新）或状态更新函数
- **支持两种更新方式**:
  1. **对象合并**: `setState({ key: value })`
  2. **函数式更新**: `setState(prev => ({ ...prev, key: value }))`
- **执行流程**:
  1. 保存当前状态作为前一状态
  2. 根据参数类型执行状态更新
  3. 检查状态是否发生变化
  4. 通知所有监听器
  5. 执行持久化（如果启用）

**示例**:
```typescript
// 对象合并更新
stateManager.setState({ count: 10 });

// 函数式更新
stateManager.setState(prev => ({
  ...prev,
  count: prev.count + 1
}));
```

### 2. 订阅机制

#### `subscribe(listener: StateListener<T>): () => void`
- **功能**: 订阅状态变化
- **参数**: `listener` - 状态变化监听器函数
- **返回**: 取消订阅的函数
- **监听器签名**: `(state: T, prevState: T) => void`

**示例**:
```typescript
const unsubscribe = stateManager.subscribe((newState, prevState) => {
  console.log('State changed:', { newState, prevState });
});

// 取消订阅
unsubscribe();
```

### 3. 状态重置

#### `reset(): void`
- **功能**: 重置状态到初始值
- **执行流程**:
  1. 保存当前状态作为前一状态
  2. 将状态重置为初始状态
  3. 通知所有监听器
  4. 清除持久化存储（如果启用）

### 4. 监听器管理

#### `getListenerCount(): number`
- **功能**: 获取当前监听器数量
- **用途**: 调试和性能监控

#### `clearListeners(): void`
- **功能**: 清除所有监听器
- **用途**: 在组件卸载或SDK销毁时清理资源

## 持久化功能

### 1. 状态加载

#### `loadInitialState(): T`
- **功能**: 加载初始状态
- **逻辑**:
  1. 如果启用持久化，尝试从localStorage加载
  2. 将持久化状态与初始状态合并
  3. 如果加载失败，使用初始状态
- **错误处理**: 持久化加载失败时输出警告，不影响正常初始化

### 2. 状态持久化

#### `persistState(): void`
- **功能**: 将当前状态持久化到localStorage
- **序列化**: 使用JSON.stringify序列化状态
- **错误处理**: 持久化失败时输出错误，不影响状态更新

#### `getPersistedState(): T | null`
- **功能**: 从localStorage获取持久化状态
- **反序列化**: 使用JSON.parse反序列化状态
- **错误处理**: 解析失败时返回null

#### `clearPersistedState(): void`
- **功能**: 清除localStorage中的持久化状态
- **用途**: 在状态重置时清理持久化数据

## 内部机制

### 1. 状态变化检测
```typescript
if (this.state !== prevState) {
  this.notifyListeners(this.state, prevState);
  
  if (this.config.persist) {
    this.persistState();
  }
}
```

### 2. 监听器通知
```typescript
private notifyListeners(state: T, prevState: T): void {
  this.listeners.forEach(listener => {
    try {
      listener(state, prevState);
    } catch (error) {
      console.error('Error in state listener:', error);
    }
  });
}
```

### 3. 错误隔离
- 单个监听器的错误不会影响其他监听器
- 持久化错误不会影响状态更新
- 所有错误都会被捕获并记录

## 使用示例

### 基本使用
```typescript
import { StateManager } from '@webscript/react-sdk-manager';

// 创建状态管理器
const stateManager = new StateManager({
  initialState: {
    user: null,
    theme: 'light',
    settings: {}
  },
  persist: true,
  persistKey: 'app-state'
});

// 获取状态
const currentState = stateManager.getState();

// 更新状态
stateManager.setState({ theme: 'dark' });

// 订阅状态变化
const unsubscribe = stateManager.subscribe((newState, prevState) => {
  console.log('Theme changed:', newState.theme);
});
```

### 函数式更新
```typescript
// 复杂状态更新
stateManager.setState(prev => ({
  ...prev,
  user: {
    ...prev.user,
    lastLogin: new Date()
  },
  settings: {
    ...prev.settings,
    notifications: !prev.settings.notifications
  }
}));
```

### 类型安全使用
```typescript
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  settings: AppSettings;
}

const stateManager = new StateManager<AppState>({
  initialState: {
    user: null,
    theme: 'light',
    settings: {}
  }
});

// TypeScript 会提供完整的类型检查
stateManager.setState({ theme: 'dark' }); // ✓ 正确
stateManager.setState({ theme: 'blue' }); // ✗ 类型错误
```

### 工厂函数使用
```typescript
import { createStateManager } from '@webscript/react-sdk-manager';

const stateManager = createStateManager({
  initialState: { count: 0 },
  persist: true,
  persistKey: 'counter-state'
});
```

## 最佳实践

### 1. 状态设计
- **扁平化结构**: 避免过深的嵌套结构
- **不可变更新**: 使用不可变的方式更新状态
- **类型定义**: 为状态定义明确的TypeScript类型
- **初始状态**: 提供完整的初始状态结构

### 2. 性能优化
- **批量更新**: 避免频繁的小幅度状态更新
- **选择性订阅**: 只订阅需要的状态变化
- **及时取消订阅**: 在组件卸载时取消订阅
- **状态分割**: 将大状态分割为多个小状态管理器

### 3. 持久化策略
- **选择性持久化**: 只持久化需要的状态部分
- **版本管理**: 考虑状态结构变化时的兼容性
- **存储限制**: 注意localStorage的存储限制
- **敏感数据**: 避免持久化敏感信息

### 4. 错误处理
- **监听器错误**: 在监听器中处理可能的异常
- **持久化失败**: 优雅处理持久化失败的情况
- **状态验证**: 在加载持久化状态时进行验证

## 高级特性

### 1. 状态中间件
```typescript
// 可以扩展为支持中间件
class StateManagerWithMiddleware<T> extends StateManager<T> {
  private middlewares: Array<(state: T, prevState: T) => void> = [];
  
  addMiddleware(middleware: (state: T, prevState: T) => void) {
    this.middlewares.push(middleware);
  }
  
  protected notifyListeners(state: T, prevState: T): void {
    // 先执行中间件
    this.middlewares.forEach(middleware => {
      try {
        middleware(state, prevState);
      } catch (error) {
        console.error('Middleware error:', error);
      }
    });
    
    // 再通知监听器
    super.notifyListeners(state, prevState);
  }
}
```

### 2. 状态历史记录
```typescript
// 可以扩展为支持历史记录
class StateManagerWithHistory<T> extends StateManager<T> {
  private history: T[] = [];
  private maxHistorySize = 10;
  
  setState(newState: Partial<T> | ((prev: T) => T)): void {
    // 保存到历史记录
    this.history.push(this.getState());
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
    
    super.setState(newState);
  }
  
  undo(): void {
    const prevState = this.history.pop();
    if (prevState) {
      super.setState(() => prevState);
    }
  }
}
```

## 依赖关系

### 依赖的模块
- 无外部依赖（仅依赖浏览器API）

### 被依赖的模块
- `SDKManager`: 使用状态管理器
- `SDKProvider`: React组件中使用
- React Hooks: 通过SDK实例访问

## 注意事项

1. **浏览器兼容性**: 持久化功能依赖localStorage，需要考虑兼容性
2. **内存泄漏**: 确保及时清理监听器，避免内存泄漏
3. **状态大小**: 避免在状态中存储过大的对象
4. **引用相等性**: 状态变化检测使用引用相等性，需要注意不可变更新
5. **并发更新**: 在高频更新场景下需要考虑状态一致性
