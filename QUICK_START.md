# 🚀 Quick Start Guide / 快速开始指南

[English](#english) | [中文](#中文)

---

## 中文

用几分钟时间快速上手 React SDK Manager！

### 📦 安装

```bash
npm install @webscript/react-sdk-manager
```

### ⚡ 30秒快速设置

#### 1. 用 SDKProvider 包装你的应用

```tsx
import React from 'react';
import { SDKProvider } from '@webscript/react-sdk-manager';

function App() {
  const config = {
    name: 'My App',
    version: '1.0.0',
    initialState: { theme: 'light', count: 0 }
  };

  return (
    <SDKProvider config={config}>
      <MyComponent />
    </SDKProvider>
  );
}
```

#### 2. 创建你的第一个插件

```tsx
import { createPlugin, useSDKState } from '@webscript/react-sdk-manager';

const CounterPlugin = createPlugin({
  name: 'counter-plugin',
  version: '1.0.0',
  component: () => {
    const [state, setState] = useSDKState();
    
    const increment = () => {
      setState(prev => ({ ...prev, count: (prev.count || 0) + 1 }));
    };

    return (
      <div>
        <h3>计数器: {state.count || 0}</h3>
        <button onClick={increment}>+1</button>
      </div>
    );
  }
});
```

#### 3. 注册并渲染插件

```tsx
import { useSDK, PluginRenderer } from '@webscript/react-sdk-manager';

function MyComponent() {
  const sdk = useSDK();

  React.useEffect(() => {
    sdk.plugins.register(CounterPlugin);
  }, [sdk]);

  return (
    <div>
      <h1>我的应用</h1>
      <PluginRenderer pluginName="counter-plugin" />
    </div>
  );
}
```

### 🎉 完成！

你现在有了一个具备以下功能的 React 应用：
- ✅ 插件系统
- ✅ 全局状态管理  
- ✅ 组件生命周期管理

### 🔥 接下来做什么？

#### 添加更多插件
```tsx
const ThemePlugin = createPlugin({
  name: 'theme-plugin',
  version: '1.0.0',
  component: () => {
    const [state, setState] = useSDKState();
    
    return (
      <div>
        <h3>当前主题: {state.theme}</h3>
        <button onClick={() => setState(prev => ({ 
          ...prev, 
          theme: prev.theme === 'light' ? 'dark' : 'light' 
        }))}>
          切换主题
        </button>
      </div>
    );
  }
});
```

#### 插件依赖
```tsx
const DependentPlugin = createPlugin({
  name: 'dependent-plugin',
  version: '1.0.0',
  dependencies: ['counter-plugin'], // 将在 counter-plugin 之后加载
  component: () => <div>我依赖于计数器插件！</div>
});
```

#### 插件管理界面
```tsx
import { PluginManagerComponent } from '@webscript/react-sdk-manager';

function AdminPanel() {
  return (
    <div>
      <h2>插件管理器</h2>
      <PluginManagerComponent />
    </div>
  );
}
```

### 📚 了解更多

- **[完整文档](README.md)** - 完整的 API 参考和高级用法
- **[示例](examples/)** - 全面的示例和模式
- **[演示](examples/demo.html)** - 可在浏览器中运行的交互式演示

### 🛠️ 常用模式

#### 状态管理
```tsx
// 获取和更新全局状态
const [state, setState] = useSDKState();

// 访问特定部分
const theme = state.theme;
const user = state.user;

// 更新状态
setState(prev => ({ ...prev, newField: 'value' }));
```

#### 插件通信
```tsx
// 插件 A 更新状态
setState(prev => ({ ...prev, messages: [...prev.messages, 'Hello'] }));

// 插件 B 监听状态变化
React.useEffect(() => {
  // 响应状态变化
  console.log('消息已更新:', state.messages);
}, [state.messages]);
```

#### 错误处理
```tsx
const config = {
  name: 'My App',
  debug: true, // 启用调试日志
  onError: (error) => {
    console.error('SDK 错误:', error);
    // 发送到错误跟踪服务
  }
};
```

### 🎯 专业技巧

1. **从简单开始** - 从一个插件开始，逐步增加复杂性
2. **使用 TypeScript** - 通过类型安全获得更好的开发体验
3. **状态设计** - 保持全局状态扁平和简单
4. **插件命名** - 使用描述性、唯一的插件名称
5. **依赖关系** - 保持插件依赖最小且清晰

---

## English

Get up and running with React SDK Manager in just a few minutes!

### 📦 Installation

```bash
npm install @webscript/react-sdk-manager
```

### ⚡ 30-Second Setup

#### 1. Wrap Your App with SDKProvider

```tsx
import React from 'react';
import { SDKProvider } from '@webscript/react-sdk-manager';

function App() {
  const config = {
    name: 'My App',
    version: '1.0.0',
    initialState: { theme: 'light', count: 0 }
  };

  return (
    <SDKProvider config={config}>
      <MyComponent />
    </SDKProvider>
  );
}
```

#### 2. Create Your First Plugin

```tsx
import { createPlugin, useSDKState } from '@webscript/react-sdk-manager';

const CounterPlugin = createPlugin({
  name: 'counter-plugin',
  version: '1.0.0',
  component: () => {
    const [state, setState] = useSDKState();
    
    const increment = () => {
      setState(prev => ({ ...prev, count: (prev.count || 0) + 1 }));
    };

    return (
      <div>
        <h3>Counter: {state.count || 0}</h3>
        <button onClick={increment}>+1</button>
      </div>
    );
  }
});
```

#### 3. Register and Render Plugin

```tsx
import { useSDK, PluginRenderer } from '@webscript/react-sdk-manager';

function MyComponent() {
  const sdk = useSDK();

  React.useEffect(() => {
    sdk.plugins.register(CounterPlugin);
  }, [sdk]);

  return (
    <div>
      <h1>My App</h1>
      <PluginRenderer pluginName="counter-plugin" />
    </div>
  );
}
```

### 🎉 That's It!

You now have a working React app with:
- ✅ Plugin system
- ✅ Global state management  
- ✅ Component lifecycle management

### 🔥 What's Next?

#### Add More Plugins
```tsx
const ThemePlugin = createPlugin({
  name: 'theme-plugin',
  version: '1.0.0',
  component: () => {
    const [state, setState] = useSDKState();
    
    return (
      <div>
        <h3>Current theme: {state.theme}</h3>
        <button onClick={() => setState(prev => ({ 
          ...prev, 
          theme: prev.theme === 'light' ? 'dark' : 'light' 
        }))}>
          Toggle Theme
        </button>
      </div>
    );
  }
});
```

#### Plugin Dependencies
```tsx
const DependentPlugin = createPlugin({
  name: 'dependent-plugin',
  version: '1.0.0',
  dependencies: ['counter-plugin'], // Will load after counter-plugin
  component: () => <div>I depend on counter plugin!</div>
});
```

#### Plugin Management UI
```tsx
import { PluginManagerComponent } from '@webscript/react-sdk-manager';

function AdminPanel() {
  return (
    <div>
      <h2>Plugin Manager</h2>
      <PluginManagerComponent />
    </div>
  );
}
```

### 📚 Learn More

- **[Complete Documentation](README.md)** - Full API reference and advanced usage
- **[Examples](examples/)** - Comprehensive examples and patterns
- **[Demo](examples/demo.html)** - Interactive demo you can run in browser

### 🛠️ Common Patterns

#### State Management
```tsx
// Get and update global state
const [state, setState] = useSDKState();

// Access specific parts
const theme = state.theme;
const user = state.user;

// Update state
setState(prev => ({ ...prev, newField: 'value' }));
```

#### Plugin Communication
```tsx
// Plugin A updates state
setState(prev => ({ ...prev, messages: [...prev.messages, 'Hello'] }));

// Plugin B listens to state changes
React.useEffect(() => {
  // Respond to state changes
  console.log('Messages updated:', state.messages);
}, [state.messages]);
```

#### Error Handling
```tsx
const config = {
  name: 'My App',
  debug: true, // Enable debug logging
  onError: (error) => {
    console.error('SDK Error:', error);
    // Send to error tracking service
  }
};
```

### 🎯 Pro Tips

1. **Start Simple** - Begin with one plugin, add complexity gradually
2. **Use TypeScript** - Get better developer experience with type safety
3. **State Design** - Keep global state flat and simple
4. **Plugin Naming** - Use descriptive, unique plugin names
5. **Dependencies** - Keep plugin dependencies minimal and clear

---

**Ready to build something awesome? Check out the [complete examples](examples/) for inspiration! 🚀**

**准备构建令人惊叹的应用？查看[完整示例](examples/)获取灵感！🚀** 
