# React SDK Manager

[![npm version](https://badge.fury.io/js/@react-sdk%2Fmanager.svg)](https://badge.fury.io/js/@react-sdk%2Fmanager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()

[English](#english-documentation) | [中文](#中文文档)

---

## 文档导航
- [核心特性](#核心特性)
- [安装指南](#安装指南)
- [快速开始](#快速开始)
- [API参考](#api参考)
- [实际应用](#实际应用)
- [最佳实践](#最佳实践)
- [开发指南](#开发指南)
- [贡献说明](#贡献说明)
- [许可证](#许可证)

---

## 核心特性 / Core Features

| 中文 | English |
|------|---------|
| 🔌 **高级插件管理** - 插件注册、启用/禁用、依赖管理及循环依赖检测 | 🔌 **Advanced Plugin Management** - Plugin registration, enable/disable, dependency management with circular dependency detection |
| 🗄️ **响应式状态管理** - 内置状态管理，支持持久化、历史记录和开发工具 | 🗄️ **Reactive State Management** - Built-in state management with persistence, history, and dev tools |
| 🔄 **完整生命周期系统** - 完整的生命周期管理，支持异步钩子和错误边界 | 🔄 **Comprehensive Lifecycle System** - Full lifecycle management with async hooks and error boundaries |
| ⚛️ **深度 React 集成** - 原生 React 组件、钩子和高阶组件 | ⚛️ **Deep React Integration** - Native React components, hooks and HOCs |
| 🛡️ **完整 TypeScript 支持** - 全面的类型定义和严格类型检查 | 🛡️ **Full TypeScript Support** - Comprehensive type definitions and strict type checking |
| 🧪 **测试就绪** - 内置测试支持和测试工具 | 🧪 **Testing Ready** - Built-in test support and utilities |
| 🚀 **性能优化** - 懒加载、树摇和最小化包体积 | 🚀 **Performance Optimized** - Lazy loading, tree-shaking and minimal bundle size |
| 🔍 **优秀的开发体验** - 调试模式、开发工具集成和全面的错误处理 | 🔍 **Developer Experience** - Debug mode, dev tools integration and comprehensive error handling |

---

## 安装指南 / Installation

```bash
# npm
npm install @webscript/react-sdk-manager

# yarn
yarn add @webscript/react-sdk-manager

# pnpm
pnpm add @webscript/react-sdk-manager
```

#### 对等依赖 / Peer Dependencies
```bash
npm install react react-dom
```

---

## 快速开始 / Quick Start

#### 基础设置 / Basic Setup
```tsx
import React from 'react';
import { SDKProvider, useSDK } from '@webscript/react-sdk-manager';

const App = () => {
  return (
    <SDKProvider 
      config={{
        name: 'My App',
        initialState: { theme: 'light' },
        debug: true
      }}
    >
      <MyComponent />
    </SDKProvider>
  );
};

const MyComponent = () => {
  const sdk = useSDK();
  return <div>SDK Version: {sdk.getInfo().version}</div>;
};
```

#### 完整示例 / Complete Example
查看完整示例代码: [`examples/complete-demo.tsx`](examples/complete-demo.tsx)

![Demo Screenshot](docs/images/demo-screenshot.png) <!-- 用户可添加实际截图 -->

---

## API参考 / API Reference

### SDK配置 / SDK Configuration
```tsx
interface SDKConfig {
  name: string;                    // SDK名称 / SDK name
  initialState?: any;              // 初始状态 / Initial state
  persist?: boolean;               // 启用状态持久化 / Enable state persistence
  plugins?: Plugin[];              // 初始插件 / Initial plugins
}
```

### 插件接口 / Plugin Interface
```tsx
interface Plugin {
  name: string;                    // 唯一标识符 / Unique identifier
  component?: React.ComponentType; // React组件 / React component
  initialize?: () => void;         // 初始化函数 / Initialization function
}
```

详细API文档: 
- [核心模块](docs/core/README.md)
- [工具函数](docs/utils/README.md)
- [组件文档](docs/components/README.md)

---

## 实际应用 / Real-World Examples

### 电商平台 / E-commerce Platform
```tsx
const ProductCatalog = createPlugin({
  name: 'product-catalog',
  component: () => (
    <ProductGrid>
      <ProductFilter />
    </ProductGrid>
  )
});
```

### 用户管理系统 / User Management System
```tsx
const UserPlugin = createPlugin({
  name: 'user-plugin',
  dependencies: ['auth-plugin'],
  component: ({ sdk }) => {
    const [users] = useUserData();
    return <UserList users={users} />;
  }
});
```

---

## 最佳实践 / Best Practices

1. **从简单开始** - 从基础插件开始，逐步增加复杂性  
   **Start Simple** - Begin with basic plugins, add complexity gradually

2. **使用TypeScript** - 利用类型安全获得更好的开发体验  
   **Use TypeScript** - Leverage type safety for better DX

3. **错误处理** - 始终实现适当的错误边界  
   **Error Handling** - Always implement error boundaries

4. **状态管理** - 谨慎使用全局状态，在可能的情况下优先使用本地状态  
   **State Management** - Use global state judiciously, prefer local state

---

## 开发指南 / Development

```bash
# 安装依赖 / Install dependencies
npm install

# 开发模式 (监听文件变化) / Dev mode (watch files)
npm run dev

# 生产环境构建 / Production build
npm run build

# 运行测试 / Run tests
npm test

# 代码检查 / Lint code
npm run lint

# 类型检查 / Type checking
npm run typecheck
```

---

## 贡献说明 / Contributing

我们欢迎贡献！请查看[贡献指南](CONTRIBUTING.md)了解详情。  
We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 许可证 / License

该项目基于MIT许可证 - 详情请查看[LICENSE](LICENSE)文件。  
Licensed under MIT - see [LICENSE](LICENSE) file.

---

<div align="center">
  <strong>Happy coding! 🚀</strong>
  <br />
  <strong>祝你编程愉快！🚀</strong>
</div>
