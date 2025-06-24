# PluginRenderer 插件渲染组件文档

## 概述

[`PluginRenderer`](../../src/components/PluginRenderer.tsx) 文件包含了用于渲染和管理插件的React组件集合。这些组件提供了插件的可视化渲染、列表展示和管理界面功能。

## 组件结构

该文件导出三个主要组件：
- `PluginRenderer` - 单个插件渲染器
- `PluginList` - 插件列表组件
- `PluginManager` - 插件管理界面组件

## 核心组件

### 1. PluginRenderer - 单个插件渲染器

#### 接口定义
```typescript
export interface PluginRendererProps {
  pluginName: string;
  props?: any;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export const PluginRenderer: React.FC<PluginRendererProps>
```

#### 功能特性
- **插件查找**: 根据插件名称查找已注册的插件
- **状态检查**: 验证插件是否存在和启用
- **组件渲染**: 安全地渲染插件的React组件
- **错误处理**: 提供完整的错误处理和回退机制
- **Props传递**: 支持向插件组件传递自定义属性

#### 渲染逻辑
```typescript
try {
  // 1. 获取插件
  const plugin = sdk.plugins.get(pluginName);

  // 2. 检查插件是否存在
  if (!plugin) {
    const error = new Error(`Plugin '${pluginName}' not found`);
    if (onError) onError(error);
    return <div>Plugin '{pluginName}' not found</div>;
  }

  // 3. 检查插件是否启用
  if (!plugin.enabled) {
    return <div>Plugin '{pluginName}' is disabled</div>;
  }

  // 4. 检查插件是否有组件
  if (!plugin.component) {
    return <div>Plugin '{pluginName}' has no component</div>;
  }

  // 5. 渲染插件组件
  const PluginComponent = plugin.component;
  return <PluginComponent {...props} sdk={sdk} />;

} catch (error) {
  // 错误处理
  return fallback || <div>Error rendering plugin '{pluginName}'</div>;
}
```

#### 使用示例
```typescript
// 基本使用
<PluginRenderer pluginName="user-dashboard" />

// 传递属性
<PluginRenderer 
  pluginName="user-dashboard"
  props={{
    userId: currentUser.id,
    theme: 'dark'
  }}
/>

// 自定义回退和错误处理
<PluginRenderer 
  pluginName="analytics-widget"
  fallback={<div>Loading analytics...</div>}
  onError={(error) => {
    console.error('Analytics plugin error:', error);
    analytics.track('plugin_error', { plugin: 'analytics-widget' });
  }}
/>
```

### 2. PluginList - 插件列表组件

#### 接口定义
```typescript
export interface PluginListProps {
  filter?: (pluginName: string) => boolean;
  itemProps?: any;
  onPluginError?: (pluginName: string, error: Error) => void;
}

export const PluginList: React.FC<PluginListProps>
```

#### 功能特性
- **自动渲染**: 自动渲染所有启用的插件
- **插件过滤**: 支持自定义过滤函数
- **统一属性**: 为所有插件传递统一的属性
- **错误隔离**: 单个插件错误不影响其他插件
- **动态更新**: 插件状态变化时自动更新列表

#### 实现逻辑
```typescript
const sdk = useSDK();
const enabledPlugins = sdk.plugins.getEnabled();

const filteredPlugins = filter 
  ? enabledPlugins.filter(plugin => filter(plugin.name))
  : enabledPlugins;

return (
  <div>
    {filteredPlugins.map(plugin => (
      <PluginRenderer
        key={plugin.name}
        pluginName={plugin.name}
        props={itemProps}
        onError={(error) => {
          if (onPluginError) {
            onPluginError(plugin.name, error);
          }
        }}
      />
    ))}
  </div>
);
```

#### 使用示例
```typescript
// 渲染所有启用的插件
<PluginList />

// 过滤特定类型的插件
<PluginList 
  filter={(pluginName) => pluginName.startsWith('widget-')}
  itemProps={{ size: 'small', theme: 'light' }}
/>

// 自定义错误处理
<PluginList 
  onPluginError={(pluginName, error) => {
    console.error(`Plugin ${pluginName} failed:`, error);
    errorReporting.captureException(error, {
      tags: { plugin: pluginName }
    });
  }}
/>

// 仪表板场景
const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>用户仪表板</h1>
      <PluginList 
        filter={(name) => name.includes('dashboard')}
        itemProps={{ 
          userId: currentUser.id,
          permissions: userPermissions 
        }}
      />
    </div>
  );
};
```

### 3. PluginManager - 插件管理界面

#### 接口定义
```typescript
export interface PluginManagerProps {
  showDisabled?: boolean;
  onPluginToggle?: (pluginName: string, enabled: boolean) => void;
}

export const PluginManager: React.FC<PluginManagerProps>
```

#### 功能特性
- **插件列表**: 显示所有插件的详细信息
- **状态切换**: 提供启用/禁用插件的界面
- **依赖显示**: 显示插件的依赖关系
- **版本信息**: 显示插件版本号
- **过滤选项**: 可选择是否显示禁用的插件

#### 界面布局
```typescript
return (
  <div style={{ padding: '16px' }}>
    <h3>Plugin Manager</h3>
    <div>
      {plugins.map(plugin => (
        <div 
          key={plugin.name} 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '8px',
            border: '1px solid #ccc',
            margin: '4px 0',
            borderRadius: '4px'
          }}
        >
          <div>
            <strong>{plugin.name}</strong>
            <span style={{ marginLeft: '8px', fontSize: '0.9em', color: '#666' }}>
              v{plugin.version}
            </span>
            {plugin.dependencies && plugin.dependencies.length > 0 && (
              <div style={{ fontSize: '0.8em', color: '#888' }}>
                Dependencies: {plugin.dependencies.join(', ')}
              </div>
            )}
          </div>
          <button
            onClick={() => handleToggle(plugin.name, plugin.enabled)}
            style={{
              padding: '4px 8px',
              backgroundColor: plugin.enabled ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {plugin.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      ))}
    </div>
  </div>
);
```

#### 插件切换逻辑
```typescript
const handleToggle = async (pluginName: string, currentEnabled: boolean) => {
  try {
    if (currentEnabled) {
      await sdk.plugins.disable(pluginName);
    } else {
      await sdk.plugins.enable(pluginName);
    }
    
    if (onPluginToggle) {
      onPluginToggle(pluginName, !currentEnabled);
    }
  } catch (error) {
    console.error(`Failed to toggle plugin ${pluginName}:`, error);
    // 可以添加用户通知
  }
};
```

#### 使用示例
```typescript
// 基本插件管理界面
<PluginManager />

// 显示所有插件（包括禁用的）
<PluginManager showDisabled={true} />

// 自定义切换回调
<PluginManager 
  onPluginToggle={(pluginName, enabled) => {
    console.log(`Plugin ${pluginName} is now ${enabled ? 'enabled' : 'disabled'}`);
    
    // 记录用户操作
    analytics.track('plugin_toggled', {
      plugin: pluginName,
      enabled,
      timestamp: Date.now()
    });
    
    // 更新用户偏好
    updateUserPreferences({
      plugins: {
        ...userPreferences.plugins,
        [pluginName]: enabled
      }
    });
  }}
/>

// 管理员界面
const AdminPanel = () => {
  const [showDisabled, setShowDisabled] = useState(true);
  
  return (
    <div>
      <h2>插件管理</h2>
      <label>
        <input 
          type="checkbox" 
          checked={showDisabled}
          onChange={(e) => setShowDisabled(e.target.checked)}
        />
        显示禁用的插件
      </label>
      
      <PluginManager 
        showDisabled={showDisabled}
        onPluginToggle={(name, enabled) => {
          toast.success(`插件 ${name} 已${enabled ? '启用' : '禁用'}`);
        }}
      />
    </div>
  );
};
```

## 高级使用模式

### 1. 条件渲染插件

```typescript
const ConditionalPluginRenderer = ({ pluginName, condition, ...props }) => {
  if (!condition) {
    return null;
  }
  
  return <PluginRenderer pluginName={pluginName} {...props} />;
};

// 使用
<ConditionalPluginRenderer 
  pluginName="premium-features"
  condition={user.isPremium}
  props={{ userId: user.id }}
/>
```

### 2. 插件加载状态

```typescript
const PluginWithLoading = ({ pluginName, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <div>Loading plugin {pluginName}...</div>;
  }
  
  return <PluginRenderer pluginName={pluginName} {...props} />;
};
```

### 3. 插件性能监控

```typescript
const MonitoredPluginRenderer = ({ pluginName, ...props }) => {
  const startTime = useRef(Date.now());
  
  useEffect(() => {
    return () => {
      const renderTime = Date.now() - startTime.current;
      analytics.track('plugin_render_time', {
        plugin: pluginName,
        renderTime
      });
    };
  }, [pluginName]);
  
  return <PluginRenderer pluginName={pluginName} {...props} />;
};
```

### 4. 插件权限控制

```typescript
const SecurePluginRenderer = ({ pluginName, requiredPermission, ...props }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(requiredPermission)) {
    return <div>您没有权限访问此插件</div>;
  }
  
  return <PluginRenderer pluginName={pluginName} {...props} />;
};

// 使用
<SecurePluginRenderer 
  pluginName="admin-tools"
  requiredPermission="admin"
  props={{ adminLevel: user.adminLevel }}
/>
```

### 5. 插件布局容器

```typescript
const PluginGrid = ({ plugins, columns = 3 }) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '16px'
    }}>
      {plugins.map(pluginName => (
        <div key={pluginName} style={{ border: '1px solid #ddd', padding: '16px' }}>
          <PluginRenderer 
            pluginName={pluginName}
            fallback={<div>Plugin not available</div>}
          />
        </div>
      ))}
    </div>
  );
};
```

## 错误处理策略

### 1. 全局错误边界

```typescript
class PluginErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Plugin Error:', error, errorInfo);
    
    // 发送错误报告
    errorReporting.captureException(error, {
      tags: { 
        component: 'PluginRenderer',
        plugin: this.props.pluginName 
      },
      extra: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '16px', border: '1px solid #f5c6cb', backgroundColor: '#f8d7da' }}>
          <h4>插件加载失败</h4>
          <p>插件 "{this.props.pluginName}" 遇到错误</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 使用
<PluginErrorBoundary pluginName={pluginName}>
  <PluginRenderer pluginName={pluginName} />
</PluginErrorBoundary>
```

### 2. 插件降级策略

```typescript
const RobustPluginRenderer = ({ pluginName, fallbackComponent, ...props }) => {
  const [hasError, setHasError] = useState(false);
  
  const handleError = (error) => {
    console.error(`Plugin ${pluginName} failed:`, error);
    setHasError(true);
    
    // 尝试降级到备用插件
    if (fallbackComponent) {
      return;
    }
    
    // 或者显示静态内容
  };
  
  if (hasError && fallbackComponent) {
    return React.createElement(fallbackComponent, props);
  }
  
  return (
    <PluginRenderer 
      pluginName={pluginName}
      onError={handleError}
      {...props}
    />
  );
};
```

## 最佳实践

### 1. 插件组织

```typescript
// 按功能区域组织插件
const DashboardLayout = () => {
  return (
    <div className="dashboard">
      {/* 头部插件 */}
      <header>
        <PluginList filter={(name) => name.startsWith('header-')} />
      </header>
      
      {/* 主要内容插件 */}
      <main>
        <PluginList filter={(name) => name.startsWith('main-')} />
      </main>
      
      {/* 侧边栏插件 */}
      <aside>
        <PluginList filter={(name) => name.startsWith('sidebar-')} />
      </aside>
    </div>
  );
};
```

### 2. 性能优化

```typescript
// 懒加载插件
const LazyPluginRenderer = React.memo(({ pluginName, ...props }) => {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldRender(true);
        observer.disconnect();
      }
    });
    
    const element = document.getElementById(`plugin-${pluginName}`);
    if (element) observer.observe(element);
    
    return () => observer.disconnect();
  }, [pluginName]);
  
  return (
    <div id={`plugin-${pluginName}`}>
      {shouldRender ? (
        <PluginRenderer pluginName={pluginName} {...props} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
});
```

### 3. 插件通信

```typescript
// 插件间通信
const CommunicatingPlugins = () => {
  const [sharedData, setSharedData] = useState({});
  
  const handlePluginMessage = (pluginName, message) => {
    setSharedData(prev => ({
      ...prev,
      [pluginName]: message
    }));
  };
  
  return (
    <div>
      <PluginRenderer 
        pluginName="data-provider"
        props={{
          onDataChange: (data) => handlePluginMessage('data-provider', data)
        }}
      />
      
      <PluginRenderer 
        pluginName="data-consumer"
        props={{
          data: sharedData['data-provider']
        }}
      />
    </div>
  );
};
```

## 依赖关系

### 依赖的模块
- `useSDK`: 获取SDK实例
- React: 基础React功能

### 被依赖的模块
- 应用组件: 使用这些组件渲染插件
- 插件组件: 被这些组件渲染

## 注意事项

1. **插件存在性**: 始终检查插件是否存在和启用
2. **错误隔离**: 确保单个插件错误不影响整个应用
3. **性能考虑**: 对于大量插件，考虑使用虚拟化或懒加载
4. **内存管理**: 插件组件卸载时确保清理资源
5. **类型安全**: 为插件属性提供适当的类型定义
6. **用户体验**: 提供适当的加载状态和错误反馈
