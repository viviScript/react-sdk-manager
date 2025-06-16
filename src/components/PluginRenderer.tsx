import React from 'react';
import { useSDK } from './SDKProvider';

export interface PluginRendererProps {
  pluginName: string;
  props?: any;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export const PluginRenderer: React.FC<PluginRendererProps> = ({
  pluginName,
  props = {},
  fallback = null,
  onError
}) => {
  const sdk = useSDK();

  try {
    // 获取插件
    const plugin = sdk.plugins.get(pluginName);

    // 检查插件是否存在
    if (!plugin) {
      const error = new Error(`Plugin '${pluginName}' not found`);
      if (onError) {
        onError(error);
      }
      return <div>Plugin '{pluginName}' not found</div>;
    }

    // 检查插件是否启用
    if (!plugin.enabled) {
      return <div>Plugin '{pluginName}' is disabled</div>;
    }

    // 检查插件是否有组件
    if (!plugin.component) {
      return <div>Plugin '{pluginName}' has no component</div>;
    }

    // 渲染插件组件
    const PluginComponent = plugin.component;
    return <PluginComponent {...props} sdk={sdk} />;

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    if (onError) {
      onError(err);
    } else {
      console.error(`Error rendering plugin '${pluginName}':`, err);
    }

    return fallback || <div>Error rendering plugin '{pluginName}'</div>;
  }
};

// Plugin List Component - 显示所有启用的插件
export interface PluginListProps {
  filter?: (pluginName: string) => boolean;
  itemProps?: any;
  onPluginError?: (pluginName: string, error: Error) => void;
}

export const PluginList: React.FC<PluginListProps> = ({
  filter,
  itemProps = {},
  onPluginError
}) => {
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
};

// Plugin Manager Component - 插件管理界面
export interface PluginManagerProps {
  showDisabled?: boolean;
  onPluginToggle?: (pluginName: string, enabled: boolean) => void;
}

export const PluginManager: React.FC<PluginManagerProps> = ({
  showDisabled = true,
  onPluginToggle
}) => {
  const sdk = useSDK();
  const allPlugins = sdk.plugins.getAll();
  const plugins = showDisabled ? allPlugins : allPlugins.filter(p => p.enabled);

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
    }
  };

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
      {plugins.length === 0 && (
        <p>No plugins available</p>
      )}
    </div>
  );
}; 