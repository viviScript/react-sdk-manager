# React SDK Manager Examples / 示例集合

This directory contains comprehensive examples and demonstrations of the React SDK Manager.

本目录包含 React SDK Manager 的全面示例和演示。

[English](#english) | [中文](#中文)

---

## 中文

### 📁 文件概览

#### 📄 文档
- **`README.md`** - 本文件，所有示例的概览
- **`advanced-usage.md`** - 详细的高级用法模式和实际场景

#### 🔧 代码示例
- **`basic-example.tsx`** - 简单的入门示例
- **`complete-demo.tsx`** - 展示所有功能的综合演示应用
- **`plugin-patterns.tsx`** - 不同插件模式和架构的集合

#### 🌐 交互式演示
- **`demo.html`** - 包含实时交互演示的独立HTML文件

### 🚀 开始使用

#### 1. 基础示例
开始使用 React SDK Manager 的最简单方式：

```tsx
import { basic-example.tsx } from './basic-example';
// 按照 basic-example.tsx 中的代码进行最小化设置
```

#### 2. 完整演示应用
获得全功能演示：

```tsx
import CompleteDemoApp from './complete-demo';

// 渲染完整演示
<CompleteDemoApp />
```

#### 3. 交互式HTML演示
在浏览器中打开 `demo.html` 获得无需构建过程的实时交互演示。

### 📚 学习路径

#### 初学者
1. 从 `basic-example.tsx` 开始理解核心概念
2. 在浏览器中打开 `demo.html` 进行交互式探索
3. 阅读主要的 README.md 获取 API 文档

#### 中级
1. 探索 `complete-demo.tsx` 了解综合功能用法
2. 研究 `plugin-patterns.tsx` 了解不同的架构方法
3. 体验插件管理器组件

#### 高级
1. 查看 `advanced-usage.md` 了解复杂场景
2. 基于模式实现自定义插件
3. 研究测试策略和性能优化

### 🔌 特色插件示例

#### 核心插件
- **主题插件** - 多种颜色方案的动态主题
- **用户插件** - 身份验证和用户管理
- **计数器插件** - 简单的状态管理演示

#### 高级插件
- **分析插件** - 实时指标和仪表板
- **通知插件** - Toast通知和消息中心
- **设置插件** - 配置管理界面

#### 架构模式
- **懒加载** - 动态插件加载策略
- **错误边界** - 强大的错误处理和恢复
- **通信** - 插件间消息传递和事件
- **表单处理** - 复杂的表单状态管理
- **数据获取** - API集成和缓存模式

### 🛠️ 开发工作流程

#### 本地运行示例

```bash
# 安装依赖
npm install

# 启动开发服务器（如果使用React应用）
npm run dev

# 或直接在浏览器中打开demo.html
open examples/demo.html
```

#### 创建自定义插件

1. **定义插件结构**
```tsx
const MyPlugin = createPlugin({
  name: 'my-custom-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    // 您的插件UI
    return <div>我的自定义插件</div>;
  },
  hooks: {
    onMount: () => console.log('插件已挂载'),
    onStateChange: (state) => console.log('状态已改变', state)
  }
});
```

2. **注册插件**
```tsx
await sdk.plugins.register(MyPlugin);
```

3. **渲染插件**
```tsx
<PluginRenderer pluginName="my-custom-plugin" />
```

### 🧪 测试示例

每个示例都包含测试策略：

```tsx
// 单元测试插件
describe('MyPlugin', () => {
  test('应该正确渲染', () => {
    const sdk = createTestSDK();
    render(<PluginRenderer pluginName="my-plugin" />);
    expect(screen.getByText('我的插件')).toBeInTheDocument();
  });
});

// 集成测试
describe('SDK集成', () => {
  test('应该处理插件注册', async () => {
    const sdk = createTestSDK();
    await sdk.plugins.register(MyPlugin);
    expect(sdk.plugins.get('my-plugin')).toBeDefined();
  });
});
```

### 🎯 演示的用例

#### 1. 企业仪表板
- 基于角色的访问控制
- 模块化UI组件
- 实时数据更新
- 插件依赖管理

#### 2. 电商平台
- 产品目录管理
- 购物车功能
- 用户身份验证
- 分析和报告

#### 3. 管理面板
- 用户管理界面
- 系统配置
- 审计日志
- 备份和恢复

#### 4. 内容管理
- 动态内容插件
- 媒体画廊
- SEO优化
- 多语言支持

### 📊 性能考虑

示例演示：
- **懒加载** - 仅在需要时加载插件
- **内存管理** - 正确的清理和销毁
- **状态优化** - 高效的状态更新和订阅
- **包分割** - 用于最佳加载的代码分割

### 🔍 调试和开发工具

#### 调试模式
启用调试模式以获取详细日志：
```tsx
const config = {
  debug: true, // 启用详细的控制台日志
  // ... 其他配置
};
```

#### 浏览器开发工具
- React DevTools 集成
- 状态检查
- 插件生命周期跟踪
- 性能分析

#### 错误处理
- 全局错误边界
- 插件特定的错误恢复
- 详细的错误报告
- 用户友好的错误消息

### 🤝 贡献示例

要添加新示例：

1. **创建示例文件**
2. **添加全面的注释**
3. **包含TypeScript类型**
4. **添加到此README**
5. **彻底测试**

#### 示例模板
```tsx
import React from 'react';
import { createPlugin, useSDKState } from '../src';

/**
 * 示例插件：[描述]
 * 
 * 演示：[它展示了什么]
 * 用例：[何时使用这种模式]
 */
const ExamplePlugin = createPlugin({
  name: 'example-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    // 在此实现
    return <div>示例插件</div>;
  }
});

export default ExamplePlugin;
```

### 💡 提示和最佳实践

1. **从简单开始** - 从基础插件开始，逐步增加复杂性
2. **使用TypeScript** - 利用类型安全获得更好的开发体验
3. **处理错误** - 始终实现适当的错误边界
4. **彻底测试** - 为插件和集成编写测试
5. **良好文档** - 清晰的文档有助于团队采用
6. **性能优先** - 考虑对非关键插件使用懒加载
7. **状态管理** - 谨慎使用全局状态，在可能时首选本地状态
8. **插件依赖** - 设计清晰的依赖层次结构

### 🆘 故障排除

#### 常见问题

1. **插件不渲染**
   - 检查插件是否已注册
   - 验证插件是否已启用
   - 检查TypeScript错误

2. **状态未更新**
   - 确保正确调用setState
   - 检查状态突变
   - 验证订阅模式

3. **性能问题**
   - 分析组件重新渲染
   - 检查内存泄漏
   - 优化状态选择器

4. **依赖错误**
   - 验证插件注册顺序
   - 检查依赖名称
   - 避免循环依赖

---

## English

### 📁 Files Overview

#### 📄 Documentation
- **`README.md`** - This file, overview of all examples
- **`advanced-usage.md`** - Detailed advanced usage patterns and real-world scenarios

#### 🔧 Code Examples
- **`basic-example.tsx`** - Simple getting started example
- **`complete-demo.tsx`** - Comprehensive demo application showcasing all features
- **`plugin-patterns.tsx`** - Collection of different plugin patterns and architectures

#### 🌐 Interactive Demos
- **`demo.html`** - Self-contained HTML file with live interactive demo

### 🚀 Getting Started

#### 1. Basic Example
The simplest way to get started with React SDK Manager:

```tsx
import { basic-example.tsx } from './basic-example';
// Follow the code in basic-example.tsx for a minimal setup
```

#### 2. Complete Demo Application
For a full-featured demonstration:

```tsx
import CompleteDemoApp from './complete-demo';

// Render the complete demo
<CompleteDemoApp />
```

#### 3. Interactive HTML Demo
Open `demo.html` in your browser for a live, interactive demonstration that runs without any build process.

### 📚 Learning Path

#### Beginner
1. Start with `basic-example.tsx` to understand core concepts
2. Open `demo.html` in your browser for interactive exploration
3. Read the main README.md for API documentation

#### Intermediate
1. Explore `complete-demo.tsx` for comprehensive feature usage
2. Study `plugin-patterns.tsx` for different architectural approaches
3. Experiment with the Plugin Manager component

#### Advanced
1. Review `advanced-usage.md` for complex scenarios
2. Implement custom plugins based on the patterns
3. Study the testing strategies and performance optimizations

### 🔌 Featured Plugin Examples

#### Core Plugins
- **Theme Plugin** - Dynamic theming with multiple color schemes
- **User Plugin** - Authentication and user management
- **Counter Plugin** - Simple state management demonstration

#### Advanced Plugins
- **Analytics Plugin** - Real-time metrics and dashboard
- **Notifications Plugin** - Toast notifications and message center
- **Settings Plugin** - Configuration management interface

#### Architectural Patterns
- **Lazy Loading** - Dynamic plugin loading strategies
- **Error Boundaries** - Robust error handling and recovery
- **Communication** - Inter-plugin messaging and events
- **Form Handling** - Complex form state management
- **Data Fetching** - API integration and caching patterns

### 🛠️ Development Workflow

#### Running Examples Locally

```bash
# Install dependencies
npm install

# Start development server (if using a React app)
npm run dev

# Or open demo.html directly in browser
open examples/demo.html
```

#### Creating Custom Plugins

1. **Define Plugin Structure**
```tsx
const MyPlugin = createPlugin({
  name: 'my-custom-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    // Your plugin UI here
    return <div>My Custom Plugin</div>;
  },
  hooks: {
    onMount: () => console.log('Plugin mounted'),
    onStateChange: (state) => console.log('State changed', state)
  }
});
```

2. **Register Plugin**
```tsx
await sdk.plugins.register(MyPlugin);
```

3. **Render Plugin**
```tsx
<PluginRenderer pluginName="my-custom-plugin" />
```

### 🧪 Testing Examples

Each example includes testing strategies:

```tsx
// Unit testing plugins
describe('MyPlugin', () => {
  test('should render correctly', () => {
    const sdk = createTestSDK();
    render(<PluginRenderer pluginName="my-plugin" />);
    expect(screen.getByText('My Plugin')).toBeInTheDocument();
  });
});

// Integration testing
describe('SDK Integration', () => {
  test('should handle plugin registration', async () => {
    const sdk = createTestSDK();
    await sdk.plugins.register(MyPlugin);
    expect(sdk.plugins.get('my-plugin')).toBeDefined();
  });
});
```

### 🎯 Use Cases Demonstrated

#### 1. Enterprise Dashboard
- Role-based access control
- Modular UI components
- Real-time data updates
- Plugin dependency management

#### 2. E-commerce Platform
- Product catalog management
- Shopping cart functionality
- User authentication
- Analytics and reporting

#### 3. Admin Panel
- User management interface
- System configuration
- Audit logging
- Backup and restore

#### 4. Content Management
- Dynamic content plugins
- Media gallery
- SEO optimization
- Multi-language support

### 📊 Performance Considerations

Examples demonstrate:
- **Lazy Loading** - Load plugins only when needed
- **Memory Management** - Proper cleanup and disposal
- **State Optimization** - Efficient state updates and subscriptions
- **Bundle Splitting** - Code splitting for optimal loading

### 🔍 Debugging & Development Tools

#### Debug Mode
Enable debug mode for detailed logging:
```tsx
const config = {
  debug: true, // Enable detailed console logs
  // ... other config
};
```

#### Browser DevTools
- React DevTools integration
- State inspection
- Plugin lifecycle tracking
- Performance profiling

#### Error Handling
- Global error boundaries
- Plugin-specific error recovery
- Detailed error reporting
- User-friendly error messages

### 🤝 Contributing Examples

To add a new example:

1. **Create the example file**
2. **Add comprehensive comments**
3. **Include TypeScript types**
4. **Add to this README**
5. **Test thoroughly**

#### Example Template
```tsx
import React from 'react';
import { createPlugin, useSDKState } from '../src';

/**
 * Example Plugin: [Description]
 * 
 * Demonstrates: [What it shows]
 * Use case: [When to use this pattern]
 */
const ExamplePlugin = createPlugin({
  name: 'example-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    // Implementation here
    return <div>Example Plugin</div>;
  }
});

export default ExamplePlugin;
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

### 🆘 Troubleshooting

#### Common Issues

1. **Plugin Not Rendering**
   - Check if plugin is registered
   - Verify plugin is enabled
   - Check for TypeScript errors

2. **State Not Updating**
   - Ensure setState is called correctly
   - Check for state mutation
   - Verify subscription patterns

3. **Performance Issues**
   - Profile component re-renders
   - Check for memory leaks
   - Optimize state selectors

4. **Dependency Errors**
   - Verify plugin registration order
   - Check dependency names
   - Avoid circular dependencies

---

🚀 **Happy coding with React SDK Manager!** 

🚀 **祝你使用 React SDK Manager 编程愉快！**

For questions or issues, please check the main documentation or create an issue in the repository.

如有问题或疑问，请查看主要文档或在仓库中创建issue。 