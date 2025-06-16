import { 
  SDKManager as ISDKManager, 
  SDKManagerConfig, 
  PluginManager as IPluginManager,
  StateManager as IStateManager,
  LifecycleManager as ILifecycleManager,
  SDKError 
} from '../types';
import { PluginManager } from './PluginManager';
import { StateManager } from './StateManager';
import { LifecycleManager } from './LifecycleManager';

export class SDKManager implements ISDKManager {
  public readonly plugins: IPluginManager;
  public readonly state: IStateManager;
  public readonly lifecycle: ILifecycleManager;
  
  private config: SDKManagerConfig;
  private isInitialized: boolean = false;
  private isDestroyed: boolean = false;

  constructor(config: SDKManagerConfig = {}) {
    this.config = {
      name: 'React SDK Manager',
      version: '1.0.0',
      debug: false,
      plugins: [],
      initialState: {},
      persist: false,
      persistKey: 'react-sdk-manager-state',
      ...config
    };

    // 初始化核心组件
    this.plugins = new PluginManager();
    this.state = new StateManager({
      initialState: this.config.initialState,
      persist: this.config.persist,
      persistKey: this.config.persistKey
    });
    this.lifecycle = new LifecycleManager(this.config.debug);

    // 设置状态变化监听器
    this.state.subscribe((newState, prevState) => {
      this.lifecycle.emit('stateChange', newState, prevState);
    });

    // 设置错误处理
    this.lifecycle.on('error', (error: Error, context?: string) => {
      if (this.config.debug) {
        console.error(`SDK Error${context ? ` in ${context}` : ''}:`, error);
      }
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new SDKError('SDK is already initialized', 'ALREADY_INITIALIZED');
    }

    if (this.isDestroyed) {
      throw new SDKError('SDK has been destroyed', 'SDK_DESTROYED');
    }

    try {
      // 触发初始化前钩子
      await this.lifecycle.emitAsync('beforeMount');

      // 注册配置中的插件
      if (this.config.plugins && this.config.plugins.length > 0) {
        for (const plugin of this.config.plugins) {
          await this.plugins.register(plugin);
        }
      }

      this.isInitialized = true;

      // 触发初始化后钩子
      await this.lifecycle.emitAsync('afterMount');

      if (this.config.debug) {
        console.log(`${this.config.name} v${this.config.version} initialized successfully`);
      }
    } catch (error) {
      const sdkError = error instanceof SDKError ? error : new SDKError(
        `Failed to initialize SDK: ${error instanceof Error ? error.message : String(error)}`,
        'INITIALIZATION_FAILED',
        error
      );
      
      this.lifecycle.emit('error', sdkError, 'initialization');
      throw sdkError;
    }
  }

  async destroy(): Promise<void> {
    if (this.isDestroyed) {
      return; // 已经销毁
    }

    try {
      // 触发销毁前钩子
      await this.lifecycle.emitAsync('beforeUnmount');

      // 获取所有插件并按依赖关系逆序禁用
      const allPlugins = this.plugins.getAll();
      const sortedPlugins = this.sortPluginsByDependenciesReverse(allPlugins);

      // 按逆序禁用插件
      for (const plugin of sortedPlugins) {
        if (plugin.enabled) {
          try {
            await this.plugins.disable(plugin.name);
          } catch (error) {
            // 在销毁过程中忽略依赖错误，强制禁用
            if (plugin.destroy) {
              await plugin.destroy();
            }
            plugin.enabled = false;
          }
        }
      }

      // 注销所有插件
      for (const plugin of allPlugins) {
        try {
          await this.plugins.unregister(plugin.name);
        } catch (error) {
          // 在销毁过程中忽略错误，强制清理
          console.warn(`Failed to unregister plugin ${plugin.name} during destroy:`, error);
        }
      }

      // 清理状态监听器
      this.state.clearListeners();

      // 清理生命周期钩子
      this.lifecycle.clear();

      this.isDestroyed = true;
      this.isInitialized = false;

      // 触发销毁后钩子
      await this.lifecycle.emitAsync('afterUnmount');

      if (this.config.debug) {
        console.log(`${this.config.name} destroyed successfully`);
      }
    } catch (error) {
      const sdkError = error instanceof SDKError ? error : new SDKError(
        `Failed to destroy SDK: ${error instanceof Error ? error.message : String(error)}`,
        'DESTRUCTION_FAILED',
        error
      );
      
      this.lifecycle.emit('error', sdkError, 'destruction');
      throw sdkError;
    }
  }

  getConfig(): SDKManagerConfig {
    return { ...this.config };
  }

  // 获取SDK状态信息
  getInfo() {
    return {
      name: this.config.name,
      version: this.config.version,
      isInitialized: this.isInitialized,
      isDestroyed: this.isDestroyed,
      pluginCount: this.plugins.getAll().length,
      enabledPluginCount: this.plugins.getEnabled().length,
      stateListenerCount: this.state.getListenerCount(),
      registeredHooks: this.lifecycle.getRegisteredHooks()
    };
  }

  // 重置SDK状态
  async reset(): Promise<void> {
    if (!this.isInitialized) {
      throw new SDKError('SDK is not initialized', 'NOT_INITIALIZED');
    }

    try {
      // 重置状态
      this.state.reset();

      // 重新启用所有插件
      const allPlugins = this.plugins.getAll();
      for (const plugin of allPlugins) {
        if (plugin.enabled) {
          await this.plugins.disable(plugin.name);
          await this.plugins.enable(plugin.name);
        }
      }

      if (this.config.debug) {
        console.log('SDK reset successfully');
      }
    } catch (error) {
      const sdkError = error instanceof SDKError ? error : new SDKError(
        `Failed to reset SDK: ${error instanceof Error ? error.message : String(error)}`,
        'RESET_FAILED',
        error
      );
      
      this.lifecycle.emit('error', sdkError, 'reset');
      throw sdkError;
    }
  }

  // 更新配置
  updateConfig(newConfig: Partial<SDKManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 更新调试模式
    if (newConfig.debug !== undefined) {
      this.lifecycle.setDebugMode(newConfig.debug);
    }
  }

  // 按依赖关系逆序排序插件（用于销毁）
  private sortPluginsByDependenciesReverse(plugins: any[]): any[] {
    const sorted: any[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (plugin: any) => {
      if (visiting.has(plugin.name)) {
        return; // 避免循环依赖
      }

      if (visited.has(plugin.name)) {
        return;
      }

      visiting.add(plugin.name);

      // 先访问依赖此插件的其他插件
      for (const otherPlugin of plugins) {
        if (otherPlugin.dependencies && otherPlugin.dependencies.indexOf(plugin.name) !== -1) {
          visit(otherPlugin);
        }
      }

      visiting.delete(plugin.name);
      visited.add(plugin.name);
      sorted.push(plugin);
    };

    for (const plugin of plugins) {
      visit(plugin);
    }

    return sorted;
  }
}

// 创建SDK Manager的工厂函数
export function createSDKManager(config?: SDKManagerConfig): SDKManager {
  return new SDKManager(config);
} 