# pluginHelpers 插件工具函数文档

## 概述

[`pluginHelpers`](../../src/utils/pluginHelpers.ts) 提供了一系列用于插件开发和管理的辅助函数。这些工具函数简化了插件的创建、验证、兼容性检查和依赖管理等操作。

## 核心函数

### 1. `createPlugin()` - 插件创建工厂函数

#### 函数签名
```typescript
export function createPlugin(config: {
  name: string;
  version: string;
  enabled?: boolean;
  dependencies?: string[];
  initialize?: () => Promise<void> | void;
  destroy?: () => Promise<void> | void;
  component?: any;
  hooks?: {
    onMount?: () => void;
    onUnmount?: () => void;
    onStateChange?: (state: any) => void;
    onError?: (error: Error) => void;
  };
}): Plugin
```

#### 功能特性
- **简化插件创建**: 提供便捷的插件创建接口
- **默认值处理**: 自动设置合理的默认值
- **类型安全**: 确保插件配置的类型正确性
- **灵活配置**: 支持所有插件配置选项

#### 使用示例

**基本插件创建**:
```typescript
import { createPlugin } from '@webscript/react-sdk-manager';

const simplePlugin = createPlugin({
  name: 'simple-plugin',
  version: '1.0.0'
});
```

**完整功能插件**:
```typescript
const advancedPlugin = createPlugin({
  name: 'user-dashboard',
  version: '2.1.0',
  enabled: true,
  dependencies: ['auth-plugin', 'theme-plugin'],
  
  // 异步初始化
  initialize: async () => {
    console.log('Initializing user dashboard...');
    await loadUserData();
    console.log('User dashboard ready');
  },
  
  // React组件
  component: ({ sdk, userId }) => {
    const [state, setState] = useSDKState();
    
    return (
      <div className="user-dashboard">
        <h2>Welcome, {state.user?.name}</h2>
        <UserStats userId={userId} />
      </div>
    );
  },
  
  // 生命周期钩子
  hooks: {
    onMount: () => {
      console.log('User dashboard mounted');
    },
    
    onStateChange: (newState, prevState) => {
      if (newState.user !== prevState.user) {
        console.log('User changed:', newState.user);
      }
    },
    
    onError: (error) => {
      console.error('Dashboard error:', error);
    }
  }
});
```

### 2. `validatePlugin()` - 插件验证函数

#### 函数签名
```typescript
export function validatePlugin(plugin: Plugin): string[]
```

#### 功能特性
- **配置验证**: 检查插件配置的完整性和正确性
- **错误收集**: 收集所有验证错误并返回
- **类型检查**: 验证配置项的类型是否正确

#### 验证规则
- 插件名称不能为空
- 插件版本不能为空
- 依赖项必须是数组类型（如果提供）

#### 使用示例
```typescript
import { validatePlugin } from '@webscript/react-sdk-manager';

const plugin = createPlugin({
  name: '', // 错误：名称为空
  version: '1.0.0'
});

const errors = validatePlugin(plugin);
console.log(errors);
// 输出: ['Plugin name is required']

// 在插件注册前验证
const registerPluginSafely = async (sdk, plugin) => {
  const errors = validatePlugin(plugin);
  
  if (errors.length > 0) {
    console.error('Plugin validation failed:', errors);
    throw new Error(`Plugin validation failed: ${errors.join(', ')}`);
  }
  
  await sdk.plugins.register(plugin);
};
```

### 3. `checkPluginCompatibility()` - 插件兼容性检查

#### 函数签名
```typescript
export function checkPluginCompatibility(
  plugin: Plugin, 
  availablePlugins: Plugin[]
): {
  compatible: boolean;
  missingDependencies: string[];
}
```

#### 功能特性
- **依赖检查**: 验证插件的所有依赖是否可用
- **兼容性报告**: 提供详细的兼容性检查结果
- **缺失依赖列表**: 列出所有缺失的依赖项

#### 使用示例
```typescript
import { checkPluginCompatibility } from '@webscript/react-sdk-manager';

const availablePlugins = [
  createPlugin({ name: 'auth-plugin', version: '1.0.0' }),
  createPlugin({ name: 'theme-plugin', version: '2.0.0' })
];

const newPlugin = createPlugin({
  name: 'dashboard-plugin',
  version: '1.0.0',
  dependencies: ['auth-plugin', 'missing-plugin']
});

const compatibility = checkPluginCompatibility(newPlugin, availablePlugins);
console.log(compatibility);
// 输出: {
//   compatible: false,
//   missingDependencies: ['missing-plugin']
// }
```

### 4. `sortPluginsByDependencies()` - 依赖排序函数

#### 函数签名
```typescript
export function sortPluginsByDependencies(plugins: Plugin[]): Plugin[]
```

#### 功能特性
- **拓扑排序**: 按依赖关系对插件进行拓扑排序
- **循环依赖检测**: 检测并抛出循环依赖错误
- **安全初始化**: 确保插件按正确顺序初始化

#### 使用示例
```typescript
import { sortPluginsByDependencies } from '@webscript/react-sdk-manager';

const plugins = [
  createPlugin({ name: 'app-plugin', version: '1.0.0', dependencies: ['auth-plugin'] }),
  createPlugin({ name: 'auth-plugin', version: '1.0.0', dependencies: ['base-plugin'] }),
  createPlugin({ name: 'base-plugin', version: '1.0.0' })
];

try {
  const sortedPlugins = sortPluginsByDependencies(plugins);
  console.log('Initialization order:', sortedPlugins.map(p => p.name));
  // 输出: ['base-plugin', 'auth-plugin', 'app-plugin']
  
  // 按顺序初始化插件
  for (const plugin of sortedPlugins) {
    await sdk.plugins.register(plugin);
  }
} catch (error) {
  console.error('Circular dependency detected:', error.message);
}
```

### 5. `getPluginDependencyChain()` - 依赖链获取函数

#### 函数签名
```typescript
export function getPluginDependencyChain(
  pluginName: string, 
  plugins: Plugin[]
): string[]
```

#### 功能特性
- **依赖链追踪**: 获取插件的完整依赖链
- **递归解析**: 递归解析所有层级的依赖
- **去重处理**: 自动去除重复的依赖项

#### 使用示例
```typescript
import { getPluginDependencyChain } from '@webscript/react-sdk-manager';

const plugins = [
  createPlugin({ name: 'app', version: '1.0.0', dependencies: ['ui', 'data'] }),
  createPlugin({ name: 'ui', version: '1.0.0', dependencies: ['base'] }),
  createPlugin({ name: 'data', version: '1.0.0', dependencies: ['base'] }),
  createPlugin({ name: 'base', version: '1.0.0' })
];

const dependencyChain = getPluginDependencyChain('app', plugins);
console.log('App dependencies:', dependencyChain);
// 输出: ['base', 'ui', 'data']
```

### 6. `canUnloadPlugin()` - 插件卸载检查函数

#### 函数签名
```typescript
export function canUnloadPlugin(
  pluginName: string, 
  plugins: Plugin[]
): {
  canUnload: boolean;
  dependents: string[];
}
```

#### 功能特性
- **依赖检查**: 检查是否有其他插件依赖目标插件
- **安全卸载**: 确保卸载操作不会破坏依赖关系
- **依赖者列表**: 提供依赖目标插件的所有插件列表

#### 使用示例
```typescript
import { canUnloadPlugin } from '@webscript/react-sdk-manager';

const plugins = [
  createPlugin({ name: 'base-plugin', version: '1.0.0' }),
  createPlugin({ name: 'ui-plugin', version: '1.0.0', dependencies: ['base-plugin'] }),
  createPlugin({ name: 'app-plugin', version: '1.0.0', dependencies: ['base-plugin'] })
];

// 检查是否可以卸载基础插件
const baseUnloadCheck = canUnloadPlugin('base-plugin', plugins);
console.log(baseUnloadCheck);
// 输出: {
//   canUnload: false,
//   dependents: ['ui-plugin', 'app-plugin']
// }

// 检查是否可以卸载应用插件
const appUnloadCheck = canUnloadPlugin('app-plugin', plugins);
console.log(appUnloadCheck);
// 输出: {
//   canUnload: true,
//   dependents: []
// }
```

## 高级使用模式

### 1. 插件工厂模式

```typescript
// 创建插件工厂
class PluginFactory {
  private baseConfig: Partial<Plugin>;
  
  constructor(baseConfig: Partial<Plugin> = {}) {
    this.baseConfig = baseConfig;
  }
  
  createWidget(name: string, config: any) {
    return createPlugin({
      ...this.baseConfig,
      name: `widget-${name}`,
      version: '1.0.0',
      component: ({ sdk }) => <Widget config={config} sdk={sdk} />,
      hooks: {
        onMount: () => console.log(`Widget ${name} mounted`),
        onError: (error) => console.error(`Widget ${name} error:`, error)
      }
    });
  }
}

// 使用工厂
const factory = new PluginFactory({
  dependencies: ['base-plugin']
});

const weatherWidget = factory.createWidget('weather', { location: 'Beijing' });
```

### 2. 插件配置验证器

```typescript
// 扩展验证功能
class PluginValidator {
  private rules: Array<(plugin: Plugin) => string[]> = [];
  
  addRule(rule: (plugin: Plugin) => string[]) {
    this.rules.push(rule);
    return this;
  }
  
  validate(plugin: Plugin): string[] {
    const errors = validatePlugin(plugin); // 基础验证
    
    // 应用自定义规则
    for (const rule of this.rules) {
      errors.push(...rule(plugin));
    }
    
    return errors;
  }
}

// 创建验证器
const validator = new PluginValidator()
  .addRule((plugin) => {
    // 版本格式验证
    if (!/^\d+\.\d+\.\d+$/.test(plugin.version)) {
      return ['Plugin version must follow semver format (x.y.z)'];
    }
    return [];
  })
  .addRule((plugin) => {
    // 命名规范验证
    if (!/^[a-z][a-z0-9-]*$/.test(plugin.name)) {
      return ['Plugin name must be lowercase with hyphens only'];
    }
    return [];
  });
```

### 3. 插件依赖管理器

```typescript
class PluginDependencyManager {
  private plugins: Plugin[] = [];
  
  addPlugin(plugin: Plugin) {
    this.plugins.push(plugin);
  }
  
  getInstallationOrder(): Plugin[] {
    return sortPluginsByDependencies(this.plugins);
  }
  
  getUninstallationOrder(): Plugin[] {
    return this.getInstallationOrder().reverse();
  }
  
  findMissingDependencies(): Record<string, string[]> {
    const missing: Record<string, string[]> = {};
    
    for (const plugin of this.plugins) {
      const compatibility = checkPluginCompatibility(plugin, this.plugins);
      if (!compatibility.compatible) {
        missing[plugin.name] = compatibility.missingDependencies;
      }
    }
    
    return missing;
  }
  
  canSafelyRemove(pluginName: string): boolean {
    const check = canUnloadPlugin(pluginName, this.plugins);
    return check.canUnload;
  }
}
```

## 最佳实践

### 1. 插件命名规范

```typescript
// 推荐的插件命名模式
const createNamedPlugin = (category: string, name: string, version: string) => {
  return createPlugin({
    name: `${category}-${name}`,
    version,
    // 其他配置...
  });
};

// 使用示例
const authPlugin = createNamedPlugin('auth', 'oauth', '1.0.0');
const uiWidget = createNamedPlugin('widget', 'weather', '2.1.0');
```

### 2. 错误处理

```typescript
// 安全的插件操作包装器
const safePluginOperation = async <T>(
  operation: () => Promise<T>,
  pluginName: string,
  operationName: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Failed to ${operationName} plugin '${pluginName}':`, error);
    return null;
  }
};

// 使用示例
const result = await safePluginOperation(
  () => sdk.plugins.register(myPlugin),
  myPlugin.name,
  'register'
);
```

## 依赖关系

### 依赖的模块
- `Plugin`: 插件接口定义
- 无其他外部依赖

### 被依赖的模块
- `PluginManager`: 使用这些工具函数进行插件管理
- 应用代码: 使用这些函数创建和管理插件

## 注意事项

1. **循环依赖**: `sortPluginsByDependencies` 会检测并抛出循环依赖错误
2. **性能考虑**: 对于大量插件，依赖排序可能较慢，考虑缓存结果
3. **版本兼容性**: 当前实现不包含语义化版本检查，可根据需要扩展
4. **内存管理**: 确保插件的 `destroy` 方法正确清理资源
5. **类型安全**: 使用TypeScript时，为插件组件提供适当的类型定义
