# SDKProvider React组件文档

## 概述

[`SDKProvider`](../../src/components/SDKProvider.tsx) 是 React SDK Manager 的核心React组件，它提供了SDK的React上下文集成，负责SDK的初始化、错误处理和状态管理，并通过React Context为整个应用提供SDK实例访问。

## 组件结构

```typescript
interface SDKProviderProps {
  config: SDKManagerConfig;
  children: ReactNode;
  onError?: (error: Error) => void;
  onInitialized?: (sdk: SDKManager) => void;
}

export const SDKProvider: React.FC<SDKProviderProps>
```

## 核心功能

### 1. SDK上下文提供

#### `SDKProvider` 组件
- **功能**: 为React应用提供SDK上下文
- **Props**:
  - `config`: SDK配置对象
  - `children`: 子组件
  - `onError`: 错误处理回调（可选）
  - `onInitialized`: 初始化完成回调（可选）

**组件状态管理**:
```typescript
const [sdk, setSdk] = useState<SDKManager | null>(null);
const [isInitialized, setIsInitialized] = useState(false);
const [error, setError] = useState<Error | null>(null);
```

### 2. SDK生命周期管理

#### 初始化流程
```typescript
useEffect(() => {
  const initializeSDK = async () => {
    try {
      // 1. 创建SDK实例
      sdkInstance = createSDKManager(config);

      // 2. 设置错误处理
      sdkInstance.lifecycle.on('error', (err: Error) => {
        setError(err);
        if (onError) onError(err);
      });

      // 3. 初始化SDK
      await sdkInstance.initialize();
      
      // 4. 更新状态
      setSdk(sdkInstance);
      setIsInitialized(true);
      setError(null);

      // 5. 触发回调
      if (onInitialized) onInitialized(sdkInstance);
    } catch (err) {
      // 错误处理
    }
  };

  initializeSDK();
}, [config, onError, onInitialized]);
```

#### 清理机制
```typescript
// 组件卸载时自动清理SDK资源
return () => {
  if (sdkInstance) {
    sdkInstance.destroy().catch(console.error);
  }
};
```

### 3. 错误处理和UI状态

#### 错误显示
```typescript
if (error) {
  return (
    <div style={{ /* 错误样式 */ }}>
      <h3>SDK Error</h3>
      <p>{error.message}</p>
      {config.debug && (
        <details>
          <summary>Error Details</summary>
          <pre>{error.stack}</pre>
        </details>
      )}
    </div>
  );
}
```

#### 加载状态
```typescript
if (!isInitialized || !sdk) {
  return (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <p>Initializing SDK...</p>
    </div>
  );
}
```

## React Hooks

### 1. `useSDK()` - 获取SDK实例

```typescript
export const useSDK = (): SDKManager => {
  const sdk = useContext(SDKContext);
  if (!sdk) {
    throw new Error('useSDK must be used within a SDKProvider');
  }
  return sdk;
};
```

**特性**:
- 必须在 `SDKProvider` 内部使用
- 返回完整的SDK实例
- 提供类型安全的访问

### 2. `usePlugins()` - 获取插件管理器

```typescript
export const usePlugins = () => {
  const sdk = useSDK();
  return sdk.plugins;
};
```

**用途**:
- 直接访问插件管理功能
- 简化插件操作的代码

### 3. `useSDKState()` - 响应式状态管理

```typescript
export const useSDKState = <T = any>() => {
  const sdk = useSDK();
  const [state, setState] = useState<T>(sdk.state.getState());

  useEffect(() => {
    const unsubscribe = sdk.state.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, [sdk]);

  return [state, sdk.state.setState] as const;
};
```

**特性**:
- 自动订阅状态变化
- 组件卸载时自动清理订阅
- 返回类似 `useState` 的接口
- 支持泛型类型

### 4. `useLifecycle()` - 生命周期管理

```typescript
export const useLifecycle = () => {
  const sdk = useSDK();
  return sdk.lifecycle;
};
```

**用途**:
- 在组件中注册生命周期钩子
- 监听SDK事件

### 5. `useSDKInfo()` - SDK信息查询

```typescript
export const useSDKInfo = () => {
  const sdk = useSDK();
  const [info, setInfo] = useState(sdk.getInfo());

  useEffect(() => {
    const updateInfo = () => setInfo(sdk.getInfo());

    // 监听多种变化事件
    const unsubscribe = sdk.state.subscribe(updateInfo);
    const unsubscribeMount = sdk.lifecycle.on('afterMount', updateInfo);
    const unsubscribeUnmount = sdk.lifecycle.on('afterUnmount', updateInfo);

    return () => {
      unsubscribe();
      unsubscribeMount();
      unsubscribeUnmount();
    };
  }, [sdk]);

  return info;
};
```

**特性**:
- 响应式的SDK信息
- 自动更新插件数量、状态等信息
- 适用于调试和监控界面

## 使用示例

### 基本使用

```typescript
import React from 'react';
import { SDKProvider, useSDK } from '@webscript/react-sdk-manager';

const App = () => {
  const config = {
    name: 'My Application',
    version: '1.0.0',
    debug: process.env.NODE_ENV === 'development',
    initialState: {
      user: null,
      theme: 'light',
      settings: {}
    },
    persist: true,
    persistKey: 'my-app-state'
  };

  return (
    <SDKProvider 
      config={config}
      onError={(error) => {
        console.error('SDK Error:', error);
        // 发送到错误监控服务
      }}
      onInitialized={(sdk) => {
        console.log('SDK Ready:', sdk.getInfo());
        // 执行初始化后的操作
      }}
    >
      <MyApplication />
    </SDKProvider>
  );
};

const MyApplication = () => {
  const sdk = useSDK();
  
  React.useEffect(() => {
    console.log('SDK Version:', sdk.getConfig().version);
  }, [sdk]);

  return <div>My Application Content</div>;
};
```

### 状态管理使用

```typescript
const UserProfile = () => {
  const [state, setState] = useSDKState();

  const updateUser = (userData) => {
    setState(prev => ({
      ...prev,
      user: userData
    }));
  };

  const logout = () => {
    setState(prev => ({
      ...prev,
      user: null
    }));
  };

  return (
    <div>
      {state.user ? (
        <div>
          <h2>Welcome, {state.user.name}!</h2>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => updateUser({ name: 'John Doe' })}>
          Login
        </button>
      )}
    </div>
  );
};
```

### 生命周期钩子使用

```typescript
const LifecycleMonitor = () => {
  const lifecycle = useLifecycle();

  React.useEffect(() => {
    const unsubscribes = [
      lifecycle.on('stateChange', (newState, prevState) => {
        console.log('State changed:', { newState, prevState });
      }),
      
      lifecycle.on('error', (error, context) => {
        console.error(`Error in ${context}:`, error);
      })
    ];

    return () => unsubscribes.forEach(fn => fn());
  }, [lifecycle]);

  return <div>Lifecycle Monitor Active</div>;
};
```

### 插件管理使用

```typescript
const PluginController = () => {
  const plugins = usePlugins();
  const [pluginList, setPluginList] = React.useState([]);

  React.useEffect(() => {
    setPluginList(plugins.getAll());
  }, [plugins]);

  const togglePlugin = async (pluginName, enabled) => {
    try {
      if (enabled) {
        await plugins.disable(pluginName);
      } else {
        await plugins.enable(pluginName);
      }
      setPluginList(plugins.getAll()); // 更新列表
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    }
  };

  return (
    <div>
      <h3>Plugin Management</h3>
      {pluginList.map(plugin => (
        <div key={plugin.name}>
          <span>{plugin.name} v{plugin.version}</span>
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
```

### SDK信息显示

```typescript
const SDKInfo = () => {
  const info = useSDKInfo();

  return (
    <div>
      <h3>SDK Information</h3>
      <p>Name: {info.name}</p>
      <p>Version: {info.version}</p>
      <p>Status: {info.isInitialized ? 'Ready' : 'Initializing'}</p>
      <p>Plugins: {info.enabledPluginCount}/{info.pluginCount}</p>
      <p>State Listeners: {info.stateListenerCount}</p>
    </div>
  );
};
```

## 错误处理模式

### 全局错误处理

```typescript
const App = () => {
  const handleSDKError = (error) => {
    // 记录错误
    console.error('SDK Error:', error);
    
    // 发送到监控服务
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
    
    // 用户通知
    if (error.code === 'INITIALIZATION_FAILED') {
      alert('应用初始化失败，请刷新页面重试');
    }
  };

  return (
    <SDKProvider 
      config={config}
      onError={handleSDKError}
    >
      <App />
    </SDKProvider>
  );
};
```

### 组件级错误边界

```typescript
class SDKErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SDK Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong with the SDK</h2>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 使用
<SDKErrorBoundary>
  <SDKProvider config={config}>
    <App />
  </SDKProvider>
</SDKErrorBoundary>
```

## 最佳实践

### 1. 配置管理

```typescript
// 环境相关配置
const getSDKConfig = () => {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    name: process.env.REACT_APP_NAME || 'My App',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    debug: isDev,
    initialState: getInitialState(),
    persist: true,
    persistKey: `${process.env.REACT_APP_NAME}-state-${isDev ? 'dev' : 'prod'}`
  };
};
```

### 2. 条件渲染

```typescript
const ConditionalComponent = () => {
  const sdk = useSDK();
  const info = useSDKInfo();

  // 只在SDK完全初始化后渲染
  if (!info.isInitialized) {
    return <LoadingSpinner />;
  }

  return <MainContent />;
};
```

### 3. 性能优化

```typescript
// 使用 memo 避免不必要的重渲染
const OptimizedComponent = React.memo(() => {
  const [state] = useSDKState();
  
  // 只关注特定状态变化
  const user = state.user;
  
  return <UserDisplay user={user} />;
});

// 自定义Hook优化
const useUserState = () => {
  const [state] = useSDKState();
  return React.useMemo(() => state.user, [state.user]);
};
```

### 4. 类型安全

```typescript
// 定义应用状态类型
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  settings: AppSettings;
}

// 类型安全的Hook使用
const TypedComponent = () => {
  const [state, setState] = useSDKState<AppState>();
  
  const updateTheme = (theme: AppState['theme']) => {
    setState(prev => ({ ...prev, theme }));
  };

  return <ThemeSelector onThemeChange={updateTheme} />;
};
```

## 依赖关系

### 依赖的模块
- `SDKManager`: 核心SDK管理器
- `createSDKManager`: SDK工厂函数
- React: Context, useState, useEffect等

### 被依赖的模块
- 应用组件: 通过Hooks访问SDK功能
- 插件组件: 使用SDK上下文

## 注意事项

1. **Context边界**: 确保所有使用SDK Hooks的组件都在 `SDKProvider` 内部
2. **初始化时机**: SDK初始化是异步的，需要处理加载状态
3. **错误处理**: 提供适当的错误边界和用户反馈
4. **内存泄漏**: Hooks会自动处理订阅清理，但要注意手动注册的监听器
5. **性能考虑**: 避免在渲染函数中直接调用SDK方法，使用适当的缓存策略

## 扩展性

### 自定义Provider

```typescript
// 扩展SDKProvider功能
const EnhancedSDKProvider = ({ children, ...props }) => {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <SDKProvider {...props}>
          {children}
        </SDKProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
};
```

### 自定义Hooks

```typescript
// 创建特定用途的Hook
const useAuthState = () => {
  const [state] = useSDKState();
  return {
    user: state.user,
    isAuthenticated: !!state.user,
    login: (userData) => setState(prev => ({ ...prev, user: userData })),
    logout: () => setState(prev => ({ ...prev, user: null }))
  };
};
