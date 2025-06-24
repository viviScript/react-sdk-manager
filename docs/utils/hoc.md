# hoc 高阶组件工具文档

## 概述

[`hoc`](../../src/utils/hoc.tsx) 提供了一系列React高阶组件(Higher-Order Components)，用于增强组件功能。这些HOC简化了SDK功能的集成，提供了声明式的方式来为组件注入SDK相关的功能。

## 核心HOC组件

### 1. `withSDK()` - SDK实例注入HOC

#### 函数签名
```typescript
export function withSDK<P extends object>(
  Component: React.ComponentType<P & WithSDKProps>
): React.ComponentType<Omit<P, keyof WithSDKProps>>

export interface WithSDKProps {
  sdk: SDKManager;
}
```

#### 功能特性
- **SDK实例注入**: 自动为组件注入SDK实例
- **类型安全**: 完整的TypeScript类型支持
- **Props透传**: 保持原组件的所有Props
- **显示名称**: 自动设置组件的displayName用于调试

#### 使用示例

**基本使用**:
```typescript
import React from 'react';
import { withSDK, WithSDKProps } from '@webscript/react-sdk-manager';

interface MyComponentProps {
  title: string;
  userId: string;
}

const MyComponent: React.FC<MyComponentProps & WithSDKProps> = ({ 
  title, 
  userId, 
  sdk 
}) => {
  React.useEffect(() => {
    console.log('SDK Info:', sdk.getInfo());
  }, [sdk]);

  const handleAction = () => {
    sdk.state.setState({ lastAction: Date.now() });
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>User ID: {userId}</p>
      <button onClick={handleAction}>Perform Action</button>
    </div>
  );
};

// 使用HOC增强组件
const EnhancedComponent = withSDK(MyComponent);

// 使用增强后的组件（不需要传递sdk prop）
<EnhancedComponent title="Dashboard" userId="123" />
```

**类组件使用**:
```typescript
interface ClassComponentProps {
  data: any[];
}

class ClassComponent extends React.Component<ClassComponentProps & WithSDKProps> {
  componentDidMount() {
    console.log('SDK initialized:', this.props.sdk.getInfo());
  }

  render() {
    const { data, sdk } = this.props;
    
    return (
      <div>
        <h3>Data Count: {data.length}</h3>
        <p>SDK Version: {sdk.getConfig().version}</p>
      </div>
    );
  }
}

const EnhancedClassComponent = withSDK(ClassComponent);
```

### 2. `withPlugins()` - 插件管理器注入HOC

#### 函数签名
```typescript
export function withPlugins<P extends object>(
  Component: React.ComponentType<P & WithPluginsProps>
): React.ComponentType<Omit<P, keyof WithPluginsProps>>

export interface WithPluginsProps {
  plugins: SDKManager['plugins'];
}
```

#### 功能特性
- **插件管理器注入**: 直接访问插件管理功能
- **简化插件操作**: 无需通过SDK实例访问插件
- **类型安全**: 完整的插件管理器类型支持

#### 使用示例

```typescript
import React from 'react';
import { withPlugins, WithPluginsProps } from '@webscript/react-sdk-manager';

interface PluginControllerProps {
  category: string;
}

const PluginController: React.FC<PluginControllerProps & WithPluginsProps> = ({ 
  category, 
  plugins 
}) => {
  const [pluginList, setPluginList] = React.useState([]);

  React.useEffect(() => {
    const allPlugins = plugins.getAll();
    const filteredPlugins = allPlugins.filter(p => 
      p.name.startsWith(category)
    );
    setPluginList(filteredPlugins);
  }, [category, plugins]);

  const togglePlugin = async (pluginName: string, enabled: boolean) => {
    try {
      if (enabled) {
        await plugins.disable(pluginName);
      } else {
        await plugins.enable(pluginName);
      }
      
      // 更新列表
      setPluginList(plugins.getAll().filter(p => 
        p.name.startsWith(category)
      ));
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    }
  };

  return (
    <div>
      <h3>{category} Plugins</h3>
      {pluginList.map(plugin => (
        <div key={plugin.name}>
          <span>{plugin.name}</span>
          <button 
            onClick={() => togglePlugin(plugin.name, plugin.enabled)}
          >
            {plugin.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      ))}
    </div>
  );
};

const EnhancedPluginController = withPlugins(PluginController);

// 使用
<EnhancedPluginController category="widget" />
```

### 3. `withState()` - 状态管理注入HOC

#### 函数签名
```typescript
export function withState<P extends object, T = any>(
  Component: React.ComponentType<P & WithStateProps<T>>
): React.ComponentType<Omit<P, keyof WithStateProps<T>>>

export interface WithStateProps<T = any> {
  state: T;
  setState: (state: Partial<T> | ((prev: T) => T)) => void;
}
```

#### 功能特性
- **状态注入**: 自动注入当前状态和setState函数
- **响应式更新**: 状态变化时自动重新渲染组件
- **类型安全**: 支持泛型类型定义
- **自动清理**: 组件卸载时自动清理订阅

#### 使用示例

```typescript
import React from 'react';
import { withState, WithStateProps } from '@webscript/react-sdk-manager';

interface UserProfileProps {
  showDetails: boolean;
}

interface AppState {
  user: { name: string; email: string } | null;
  theme: 'light' | 'dark';
}

const UserProfile: React.FC<UserProfileProps & WithStateProps<AppState>> = ({ 
  showDetails, 
  state, 
  setState 
}) => {
  const login = () => {
    setState(prev => ({
      ...prev,
      user: { name: 'John Doe', email: 'john@example.com' }
    }));
  };

  const logout = () => {
    setState(prev => ({
      ...prev,
      user: null
    }));
  };

  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  return (
    <div style={{ 
      backgroundColor: state.theme === 'dark' ? '#333' : '#fff',
      color: state.theme === 'dark' ? '#fff' : '#333'
    }}>
      <h2>User Profile</h2>
      
      {state.user ? (
        <div>
          <p>Name: {state.user.name}</p>
          {showDetails && <p>Email: {state.user.email}</p>}
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Login</button>
      )}
      
      <button onClick={toggleTheme}>
        Switch to {state.theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
    </div>
  );
};

const EnhancedUserProfile = withState<UserProfileProps, AppState>(UserProfile);

// 使用
<EnhancedUserProfile showDetails={true} />
```

### 4. `withLifecycle()` - 生命周期管理器注入HOC

#### 函数签名
```typescript
export function withLifecycle<P extends object>(
  Component: React.ComponentType<P & WithLifecycleProps>
): React.ComponentType<Omit<P, keyof WithLifecycleProps>>

export interface WithLifecycleProps {
  lifecycle: SDKManager['lifecycle'];
}
```

#### 功能特性
- **生命周期管理器注入**: 直接访问生命周期功能
- **事件监听**: 简化生命周期事件的监听
- **事件触发**: 方便地触发自定义生命周期事件

#### 使用示例

```typescript
import React from 'react';
import { withLifecycle, WithLifecycleProps } from '@webscript/react-sdk-manager';

interface EventMonitorProps {
  eventTypes: string[];
}

const EventMonitor: React.FC<EventMonitorProps & WithLifecycleProps> = ({ 
  eventTypes, 
  lifecycle 
}) => {
  const [events, setEvents] = React.useState<Array<{
    type: string;
    timestamp: number;
    data?: any;
  }>>([]);

  React.useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    // 监听指定的事件类型
    eventTypes.forEach(eventType => {
      const unsubscribe = lifecycle.on(eventType as any, (...args) => {
        setEvents(prev => [...prev, {
          type: eventType,
          timestamp: Date.now(),
          data: args
        }]);
      });
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(fn => fn());
    };
  }, [eventTypes, lifecycle]);

  const clearEvents = () => {
    setEvents([]);
  };

  const triggerCustomEvent = () => {
    lifecycle.emit('customEvent', { message: 'Hello from component!' });
  };

  return (
    <div>
      <h3>Event Monitor</h3>
      <button onClick={clearEvents}>Clear Events</button>
      <button onClick={triggerCustomEvent}>Trigger Custom Event</button>
      
      <div style={{ maxHeight: '200px', overflow: 'auto' }}>
        {events.map((event, index) => (
          <div key={index} style={{ padding: '4px', borderBottom: '1px solid #ccc' }}>
            <strong>{event.type}</strong> - {new Date(event.timestamp).toLocaleTimeString()}
            {event.data && <pre>{JSON.stringify(event.data, null, 2)}</pre>}
          </div>
        ))}
      </div>
    </div>
  );
};

const EnhancedEventMonitor = withLifecycle(EventMonitor);

// 使用
<EnhancedEventMonitor eventTypes={['stateChange', 'error', 'customEvent']} />
```

### 5. `withPluginGuard()` - 插件守卫HOC

#### 函数签名
```typescript
export function withPluginGuard<P extends object>(
  pluginName: string,
  fallback?: React.ReactNode
) {
  return function (Component: React.ComponentType<P>): React.ComponentType<P>
}
```

#### 功能特性
- **条件渲染**: 只有当指定插件启用时才渲染组件
- **回退内容**: 支持自定义回退内容
- **插件状态检查**: 自动检查插件的存在和启用状态

#### 使用示例

```typescript
import React from 'react';
import { withPluginGuard } from '@webscript/react-sdk-manager';

interface PremiumFeatureProps {
  feature: string;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({ feature }) => {
  return (
    <div style={{ border: '2px solid gold', padding: '16px' }}>
      <h3>🌟 Premium Feature: {feature}</h3>
      <p>This is a premium feature available to subscribers.</p>
    </div>
  );
};

// 只有当premium-plugin启用时才显示
const GuardedPremiumFeature = withPluginGuard(
  'premium-plugin',
  <div>Premium features are not available</div>
)(PremiumFeature);

// 使用
<GuardedPremiumFeature feature="Advanced Analytics" />
```

**多个插件守卫**:
```typescript
// 需要多个插件都启用
const MultiGuardedComponent = withPluginGuard(
  'auth-plugin',
  <div>Authentication required</div>
)(
  withPluginGuard(
    'premium-plugin',
    <div>Premium subscription required</div>
  )(PremiumFeature)
);
```

### 6. `compose()` - HOC组合函数

#### 函数签名
```typescript
export function compose<T>(...hocs: Array<(component: any) => any>) {
  return (component: T): T
}
```

#### 功能特性
- **HOC组合**: 将多个HOC组合成一个
- **函数式编程**: 支持函数式的组合方式
- **类型保持**: 保持最终组件的类型

#### 使用示例

```typescript
import React from 'react';
import { 
  compose, 
  withSDK, 
  withState, 
  withPlugins, 
  withLifecycle,
  WithSDKProps,
  WithStateProps,
  WithPluginsProps,
  WithLifecycleProps
} from '@webscript/react-sdk-manager';

interface ComplexComponentProps {
  title: string;
}

type EnhancedProps = ComplexComponentProps & 
  WithSDKProps & 
  WithStateProps & 
  WithPluginsProps & 
  WithLifecycleProps;

const ComplexComponent: React.FC<EnhancedProps> = ({ 
  title, 
  sdk, 
  state, 
  setState, 
  plugins, 
  lifecycle 
}) => {
  React.useEffect(() => {
    console.log('Complex component mounted with all enhancements');
    
    // 使用所有注入的功能
    console.log('SDK Info:', sdk.getInfo());
    console.log('Current State:', state);
    console.log('Available Plugins:', plugins.getAll().length);
    
    const unsubscribe = lifecycle.on('stateChange', (newState) => {
      console.log('State changed in complex component:', newState);
    });
    
    return unsubscribe;
  }, [sdk, state, plugins, lifecycle]);

  return (
    <div>
      <h2>{title}</h2>
      <p>This component has access to all SDK features!</p>
    </div>
  );
};

// 使用compose组合多个HOC
const EnhancedComplexComponent = compose(
  withSDK,
  withState,
  withPlugins,
  withLifecycle
)(ComplexComponent);

// 使用
<EnhancedComplexComponent title="Super Enhanced Component" />
```

**自定义组合**:
```typescript
// 创建常用的HOC组合
const withFullSDK = compose(
  withSDK,
  withState,
  withPlugins
);

// 应用到多个组件
const ComponentA = withFullSDK(BaseComponentA);
const ComponentB = withFullSDK(BaseComponentB);
const ComponentC = withFullSDK(BaseComponentC);
```

## 高级使用模式

### 1. 条件HOC

```typescript
// 根据条件应用不同的HOC
const withConditionalEnhancement = <P extends object>(
  condition: boolean,
  enhancementHOC: (component: React.ComponentType<P>) => React.ComponentType<P>
) => {
  return (Component: React.ComponentType<P>) => {
    return condition ? enhancementHOC(Component) : Component;
  };
};

// 使用
const ConditionallyEnhanced = withConditionalEnhancement(
  process.env.NODE_ENV === 'development',
  withLifecycle // 只在开发环境中添加生命周期监听
)(MyComponent);
```

### 2. 配置化HOC

```typescript
// 可配置的状态HOC
const withConfigurableState = <T>(config: {
  selector?: (state: any) => T;
  shouldUpdate?: (prevState: T, nextState: T) => boolean;
}) => {
  return <P extends object>(Component: React.ComponentType<P & { selectedState: T }>) => {
    return (props: P) => {
      const [fullState] = useSDKState();
      const selectedState = config.selector ? config.selector(fullState) : fullState;
      
      return <Component {...props} selectedState={selectedState} />;
    };
  };
};

// 使用
const UserComponent = withConfigurableState({
  selector: (state) => state.user,
  shouldUpdate: (prev, next) => prev?.id !== next?.id
})(BaseUserComponent);
```

### 3. 错误边界HOC

```typescript
// 为组件添加错误边界
const withErrorBoundary = <P extends object>(
  fallback?: React.ComponentType<{ error: Error }>
) => {
  return (Component: React.ComponentType<P>) => {
    return class extends React.Component<P, { hasError: boolean; error?: Error }> {
      constructor(props: P) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Component error:', error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          const FallbackComponent = fallback || DefaultErrorFallback;
          return <FallbackComponent error={this.state.error!} />;
        }

        return <Component {...this.props} />;
      }
    };
  };
};

const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div>
    <h3>Something went wrong</h3>
    <p>{error.message}</p>
  </div>
);
```

### 4. 性能优化HOC

```typescript
// 添加性能监控
const withPerformanceMonitoring = <P extends object>(
  componentName: string
) => {
  return (Component: React.ComponentType<P>) => {
    return React.memo((props: P) => {
      const renderStart = React.useRef(Date.now());
      
      React.useEffect(() => {
        const renderTime = Date.now() - renderStart.current;
        console.log(`${componentName} render time: ${renderTime}ms`);
        
        if (window.performance && window.performance.mark) {
          window.performance.mark(`${componentName}-render-end`);
        }
      });

      React.useEffect(() => {
        renderStart.current = Date.now();
        
        if (window.performance && window.performance.mark) {
          window.performance.mark(`${componentName}-render-start`);
        }
      });

      return <Component {...props} />;
    });
  };
};
```

## 最佳实践

### 1. HOC命名和组织

```typescript
// 统一的HOC命名前缀
const withSDKFeature = withSDK;
const withPluginAccess = withPlugins;
const withStateManagement = withState;

// 按功能组织HOC
export const sdkHOCs = {
  withSDK,
  withPlugins,
  withState,
  withLifecycle
};

export const utilityHOCs = {
  withPluginGuard,
  compose
};
```

### 2. 类型安全

```typescript
// 创建类型安全的HOC组合
type SDKEnhancedProps = WithSDKProps & WithStateProps;

const withSDKAndState = <P extends object>(
  Component: React.ComponentType<P & SDKEnhancedProps>
): React.ComponentType<P> => {
  return compose(withSDK, withState)(Component);
};

// 使用时有完整的类型检查
const TypeSafeComponent: React.FC<{ title: string } & SDKEnhancedProps> = ({
  title,
  sdk,
  state,
  setState
}) => {
  // TypeScript会提供完整的类型提示
  return <div>{title}</div>;
};

const Enhanced = withSDKAndState(TypeSafeComponent);
```

### 3. 性能优化

```typescript
// 使用React.memo优化HOC
const withOptimizedSDK = <P extends object>(
  Component: React.ComponentType<P & WithSDKProps>
) => {
  const WrappedComponent = React.memo<P>((props) => {
    const sdk = useSDK();
    return <Component {...props} sdk={sdk} />;
  });

  WrappedComponent.displayName = `withOptimizedSDK(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
```

### 4. 调试支持

```typescript
// 添加调试信息的HOC
const withDebugInfo = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Rendering ${Component.displayName || Component.name}`, props);
    }
    
    return <Component {...props} />;
  };
};

// 在开发环境中自动添加调试信息
const withConditionalDebug = process.env.NODE_ENV === 'development' 
  ? compose(withDebugInfo, withSDK)
  : withSDK;
```

## 依赖关系

### 依赖的模块
- `useSDK`: 获取SDK实例
- React: 基础React功能

### 被依赖的模块
- 应用组件: 使用这些HOC增强组件功能
- 其他HOC: 可以组合使用

## 注意事项

1. **HOC顺序**: 在使用`compose`时，HOC的应用顺序很重要
2. **Props冲突**: 注意不同HOC注入的Props可能存在命名冲突
3. **性能影响**: 过多的HOC嵌套可能影响性能，考虑使用Hooks替代
4. **调试困难**: 多层HOC嵌套可能使调试变得困难，设置合适的displayName
5. **类型复杂性**: 复杂的HOC组合可能导致TypeScript类型推断困难
6. **Ref转发**: 如果需要访问被包装组件的ref，需要使用`React.forwardRef`
