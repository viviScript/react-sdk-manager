# React SDK Manager

[![npm version](https://badge.fury.io/js/@react-sdk%2Fmanager.svg)](https://badge.fury.io/js/@react-sdk%2Fmanager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

[English](#english-documentation) | [中文](#中文文档)

---

## 中文文档

一个功能全面的 React SDK，用于管理插件、状态和生命周期钩子，具备企业级特性。

### 🌟 核心特性

- 🔌 **高级插件管理** - 插件注册、启用/禁用、依赖管理及循环依赖检测
- 🗄️ **响应式状态管理** - 内置状态管理，支持持久化、历史记录和开发工具
- 🔄 **完整生命周期系统** - 完整的生命周期管理，支持异步钩子和错误边界
- ⚛️ **深度 React 集成** - 原生 React 组件、钩子和高阶组件
- 🛡️ **完整 TypeScript 支持** - 全面的类型定义和严格类型检查
- 🧪 **测试就绪** - 内置测试支持和测试工具
- 🚀 **性能优化** - 懒加载、树摇和最小化包体积
- 🔍 **优秀的开发体验** - 调试模式、开发工具集成和全面的错误处理

### 📦 安装

```bash
# npm
npm install @react-sdk/manager

# yarn
yarn add @react-sdk/manager

# pnpm
pnpm add @react-sdk/manager
```

#### 对等依赖

```bash
npm install react react-dom
```

### 🚀 快速开始

#### 基本设置

```tsx
import React from 'react';
import { SDKProvider, useSDK } from '@react-sdk/manager';

const App = () => {
  const config = {
    name: 'My App SDK',
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
      onError={(error) => console.error('SDK 错误:', error)}
      onInitialized={(sdk) => console.log('SDK 就绪:', sdk.getInfo())}
    >
      <MyApplication />
    </SDKProvider>
  );
};

const MyApplication = () => {
  const sdk = useSDK();
  
  React.useEffect(() => {
    // Set up global lifecycle listeners
    const unsubscribes = [
      sdk.lifecycle.on('afterMount', () => {
        console.log('✅ SDK initialized successfully');
      }),
      sdk.lifecycle.on('error', (error, context) => {
        console.error(`❌ Error in ${context}:`, error);
      })
    ];

    return () => unsubscribes.forEach(fn => fn());
  }, [sdk]);

  return <div>My Application Content</div>;
};
```

#### 创建高级插件

```tsx
import { createPlugin, useSDKState, useLifecycle } from '@react-sdk/manager';

// 主题插件
const ThemePlugin = createPlugin({
  name: 'theme-plugin',
  version: '1.2.0',
  component: ({ sdk }) => {
    const [state, setState] = useSDKState();
    
    const themes = {
      light: { bg: '#ffffff', text: '#333333' },
      dark: { bg: '#1a1a1a', text: '#ffffff' },
      blue: { bg: '#e3f2fd', text: '#0d47a1' }
    };

    const toggleTheme = () => {
      setState(prev => ({
        ...prev,
        theme: prev.theme === 'light' ? 'dark' : 'light'
      }));
    };

    return (
      <div style={{ 
        padding: '20px',
        backgroundColor: themes[state.theme]?.bg,
        color: themes[state.theme]?.text
      }}>
        <h3>🎨 主题控制器</h3>
        <p>当前主题: {state.theme}</p>
        <button onClick={toggleTheme}>切换主题</button>
      </div>
    );
  },
  initialize: async () => {
    console.log('🎨 主题插件初始化中...');
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('🎨 主题插件就绪');
  },
  hooks: {
    onMount: () => console.log('🎨 主题插件已挂载'),
    onStateChange: (state, prevState) => {
      if (state.theme !== prevState.theme) {
        console.log(`🎨 主题已更改: ${prevState.theme} → ${state.theme}`);
      }
    }
  }
});

// User Management Plugin with Dependencies
const UserPlugin = createPlugin({
  name: 'user-plugin',
  version: '1.0.0',
  dependencies: ['theme-plugin'], // Requires theme plugin
  component: ({ sdk }) => {
    const [state, setState] = useSDKState();
    const lifecycle = useLifecycle();
    
    const login = async () => {
      try {
        // Simulate API call
        const user = await fakeApiCall();
        setState(prev => ({ ...prev, user }));
        lifecycle.emit('userLoggedIn', user);
      } catch (error) {
        lifecycle.emit('error', error, 'user-login');
      }
    };

    return (
      <div>
        <h3>User Management</h3>
        {state.user ? (
          <div>
            <p>Welcome, {state.user.name}!</p>
            <button onClick={() => setState(prev => ({ ...prev, user: null }))}>
              Logout
            </button>
          </div>
        ) : (
          <button onClick={login}>Login</button>
        )}
      </div>
    );
  }
});

// Register plugins
const sdk = useSDK();
React.useEffect(() => {
  const registerPlugins = async () => {
    await sdk.plugins.register(ThemePlugin);
    await sdk.plugins.register(UserPlugin);
  };
  registerPlugins();
}, [sdk]);
```

### 📚 完整 API 参考

#### SDK 配置

```tsx
interface SDKManagerConfig {
  name?: string;                    // SDK 实例名称
  version?: string;                 // SDK 版本
  debug?: boolean;                  // 启用调试模式
  plugins?: Plugin[];               // 初始注册的插件
  initialState?: any;               // 初始状态对象
  persist?: boolean;                // 启用状态持久化
  persistKey?: string;              // localStorage 持久化键名
}
```

#### 插件接口

```tsx
interface Plugin {
  name: string;                     // 唯一插件标识符
  version: string;                  // 插件版本 (semver)
  enabled: boolean;                 // 插件是否启用
  dependencies?: string[];          // 插件依赖
  initialize?: () => Promise<void> | void;  // 异步初始化函数
  destroy?: () => Promise<void> | void;     // 清理函数
  component?: React.ComponentType<any>;     // React 组件
  hooks?: PluginHooks;              // 生命周期钩子
}
```

### 🔧 React 集成

#### React 钩子

```tsx
// 核心 SDK 访问
const sdk = useSDK();                    // 获取 SDK 实例
const plugins = usePlugins();            // 获取插件管理器
const lifecycle = useLifecycle();        // 获取生命周期管理器

// 状态管理
const [state, setState] = useSDKState(); // 获取响应式状态
const info = useSDKInfo();               // 获取 SDK 信息 (响应式)
```

#### Component Reference

```tsx
// SDK 提供器设置
<SDKProvider
  config={{
    name: 'My Enterprise App',
    version: '2.1.0',
    debug: __DEV__,
    initialState: getInitialState(),
    persist: true,
    persistKey: `${APP_NAME}-state-v2`
  }}
  onError={(error) => {
    console.error('SDK 错误:', error);
    // 发送到监控服务
    Sentry.captureException(error);
  }}
  onInitialized={(sdk) => {
    console.log('SDK 就绪:', sdk.getInfo());
    // 注册全局插件
    registerCorePlugins(sdk);
  }}
>
  <App />
</SDKProvider>

// Advanced plugin rendering
<PluginRenderer
  pluginName="user-dashboard"
  props={{
    userId: currentUser.id,
    permissions: userPermissions
  }}
  fallback={<div>加载插件中...</div>}
  onError={(error) => {
    console.error('插件渲染错误:', error);
  }}
/>
```

### 🎯 实际应用场景

#### 电商平台

```tsx
// 产品目录插件
const ProductCatalogPlugin = createPlugin({
  name: 'product-catalog',
  version: '2.1.0',
  component: ({ sdk }) => {
    const [state, setState] = useSDKState();
    const [products, setProducts] = React.useState([]);

    React.useEffect(() => {
      fetchProducts(state.filters).then(setProducts);
    }, [state.filters]);

    return (
      <div>
        <ProductGrid products={products} />
        <ProductFilters 
          filters={state.filters}
          onFilterChange={(filters) => setState({ filters })}
        />
      </div>
    );
  },
  hooks: {
    onStateChange: (state, prevState) => {
      if (state.cart !== prevState.cart) {
        // Update cart analytics
        analytics.track('cart_updated', { 
          itemCount: state.cart.items.length 
        });
      }
    }
  }
});
```

### 💡 最佳实践

1. **从简单开始** - 从基础插件开始，逐步增加复杂性
2. **使用 TypeScript** - 利用类型安全获得更好的开发体验
3. **错误处理** - 始终实现适当的错误边界
4. **全面测试** - 为插件和集成编写测试
5. **良好文档** - 清晰的文档有助于团队采用
6. **性能优先** - 考虑对非关键插件使用懒加载
7. **状态管理** - 谨慎使用全局状态，在可能的情况下优先使用本地状态
8. **插件依赖** - 设计清晰的依赖层次结构

### 🛠️ 开发

```bash
# 安装依赖
npm install

# 运行开发模式
npm run dev

# 运行测试
npm test

# 生产构建
npm run build

# 代码检查
npm run lint
```

### 🤝 贡献

我们欢迎贡献！请查看我们的 [贡献指南](CONTRIBUTING.md) 了解详情。

### 📄 许可证

该项目基于 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

### 🙏 致谢

- React 团队提供的优秀框架
- TypeScript 团队提供的类型安全
- 开源社区的灵感和反馈

---

## English Documentation

A comprehensive React SDK for managing plugins, state, and lifecycle hooks with enterprise-grade features.

### 🌟 Features

- 🔌 **Advanced Plugin Management**: Register, enable/disable, and manage plugin dependencies with circular dependency detection
- 🗄️ **Reactive State Management**: Built-in state management with persistence, history, and dev tools support
- 🔄 **Comprehensive Lifecycle System**: Complete lifecycle management with async hooks and error boundaries
- ⚛️ **Deep React Integration**: Native React components, hooks, and higher-order components
- 🛡️ **Full TypeScript Support**: Comprehensive type definitions with strict type checking
- 🧪 **Testing Ready**: Built with testing in mind, includes test utilities
- 🚀 **Performance Optimized**: Lazy loading, tree-shaking, and minimal bundle size
- 🔍 **Developer Experience**: Debug mode, dev tools integration, and comprehensive error handling

### 📦 Installation

```bash
# npm
npm install @react-sdk/manager

# yarn
yarn add @react-sdk/manager

# pnpm
pnpm add @react-sdk/manager
```

#### Peer Dependencies

```bash
npm install react react-dom
```

### 🚀 Quick Start

#### Basic Setup

```tsx
import React from 'react';
import { SDKProvider, useSDK } from '@react-sdk/manager';

const App = () => {
  const config = {
    name: 'My App SDK',
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
      onError={(error) => console.error('SDK Error:', error)}
      onInitialized={(sdk) => console.log('SDK Ready:', sdk.getInfo())}
    >
      <MyApplication />
    </SDKProvider>
  );
};
```

#### Creating Advanced Plugins

```tsx
import { createPlugin, useSDKState, useLifecycle } from '@react-sdk/manager';

// Theme Plugin
const ThemePlugin = createPlugin({
  name: 'theme-plugin',
  version: '1.2.0',
  component: ({ sdk }) => {
    const [state, setState] = useSDKState();
    
    const themes = {
      light: { bg: '#ffffff', text: '#333333' },
      dark: { bg: '#1a1a1a', text: '#ffffff' },
      blue: { bg: '#e3f2fd', text: '#0d47a1' }
    };

    const toggleTheme = () => {
      setState(prev => ({
        ...prev,
        theme: prev.theme === 'light' ? 'dark' : 'light'
      }));
    };

    return (
      <div style={{ 
        padding: '20px',
        backgroundColor: themes[state.theme]?.bg,
        color: themes[state.theme]?.text
      }}>
        <h3>🎨 Theme Controller</h3>
        <p>Current theme: {state.theme}</p>
        <button onClick={toggleTheme}>Toggle Theme</button>
      </div>
    );
  },
  initialize: async () => {
    console.log('🎨 Theme plugin initializing...');
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('🎨 Theme plugin ready');
  },
  hooks: {
    onMount: () => console.log('🎨 Theme plugin mounted'),
    onStateChange: (state, prevState) => {
      if (state.theme !== prevState.theme) {
        console.log(`🎨 Theme changed: ${prevState.theme} → ${state.theme}`);
      }
    }
  }
});
```

### 📚 Complete API Reference

#### SDKManagerConfig

```tsx
interface SDKManagerConfig {
  name?: string;                    // SDK instance name
  version?: string;                 // SDK version
  debug?: boolean;                  // Enable debug mode
  plugins?: Plugin[];               // Initial plugins to register
  initialState?: any;               // Initial state object
  persist?: boolean;                // Enable state persistence
  persistKey?: string;              // LocalStorage key for persistence
}
```

#### Plugin Interface

```tsx
interface Plugin {
  name: string;                     // Unique plugin identifier
  version: string;                  // Plugin version (semver)
  enabled: boolean;                 // Whether plugin is enabled
  dependencies?: string[];          // Plugin dependencies
  initialize?: () => Promise<void> | void;  // Async init function
  destroy?: () => Promise<void> | void;     // Cleanup function
  component?: React.ComponentType<any>;     // React component
  hooks?: PluginHooks;              // Lifecycle hooks
}

interface PluginHooks {
  onMount?: () => void;
  onUnmount?: () => void;
  onStateChange?: (state: any, prevState: any) => void;
  onError?: (error: Error, context?: string) => void;
}
```

### 🔧 React Integration

#### Hooks Reference

```tsx
// Core SDK access
const sdk = useSDK();                    // Get SDK instance
const plugins = usePlugins();            // Get plugin manager
const lifecycle = useLifecycle();        // Get lifecycle manager

// State management
const [state, setState] = useSDKState(); // Get reactive state
const info = useSDKInfo();               // Get SDK info (reactive)
```

#### Component Reference

```tsx
// SDK injection
const MyComponent = withSDK<Props>(({ sdk, ...props }) => {
  return <div>SDK Version: {sdk.getConfig().version}</div>;
});

// Multiple HOC composition
const EnhancedComponent = compose(
  withSDK,
  withPlugins,
  withState
)(MyBaseComponent);

// Plugin guard (conditional rendering)
const ConditionalComponent = withPluginGuard('required-plugin')(
  ({ children }) => <div>{children}</div>
);
```

### 🎯 Real-World Examples

#### E-commerce Platform

```tsx
// Product catalog plugin
const ProductCatalogPlugin = createPlugin({
  name: 'product-catalog',
  version: '2.1.0',
  component: ({ sdk }) => {
    const [state, setState] = useSDKState();
    const [products, setProducts] = React.useState([]);

    React.useEffect(() => {
      fetchProducts(state.filters).then(setProducts);
    }, [state.filters]);

    return (
      <div>
        <ProductGrid products={products} />
        <ProductFilters 
          filters={state.filters}
          onFilterChange={(filters) => setState({ filters })}
        />
      </div>
    );
  },
  hooks: {
    onStateChange: (state, prevState) => {
      if (state.cart !== prevState.cart) {
        // Update cart analytics
        analytics.track('cart_updated', { 
          itemCount: state.cart.items.length 
        });
      }
    }
  }
});
```

### 💡 Tips & Best Practices

1. **Start Simple** - Begin with basic plugins, add complexity gradually
2. **Use TypeScript** - Leverage type safety for better development experience
3. **Handle Errors** - Always implement proper error boundaries
4. **Test Thoroughly** - Write tests for both plugins and integration
5. **Document Well** - Clear documentation helps team adoption
6. **Performance First** - Consider lazy loading for non-critical plugins
7. **State Management** - Use global state judiciously, prefer local state when possible
8. **Plugin Dependencies** - Design clear dependency hierarchies

### 🛠️ Development

```bash
# Install dependencies
npm install

# Run development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

### 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

- React team for the excellent framework
- TypeScript team for type safety
- Open source community for inspiration and feedback

---

<div align="center">
  <strong>Happy coding! 🚀</strong>
  <br />
  <strong>祝你编程愉快！🚀</strong>
</div> 