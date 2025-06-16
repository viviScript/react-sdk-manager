import { Plugin, PluginManager as IPluginManager, SDKError } from '../types';

export class PluginManager implements IPluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map();

  async register(plugin: Plugin): Promise<void> {
    try {
      // 检查插件是否已存在
      if (this.plugins.has(plugin.name)) {
        throw new SDKError(
          `Plugin ${plugin.name} is already registered`,
          'PLUGIN_ALREADY_EXISTS'
        );
      }

      // 检查依赖关系
      await this.validateDependencies(plugin);

      // 注册插件
      this.plugins.set(plugin.name, { ...plugin });
      
      // 更新依赖图
      this.updateDependencyGraph(plugin);

      // 如果插件启用，则初始化
      if (plugin.enabled && plugin.initialize) {
        await plugin.initialize();
      }

      console.log(`Plugin ${plugin.name} registered successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new SDKError(
        `Failed to register plugin ${plugin.name}: ${errorMessage}`,
        'PLUGIN_REGISTRATION_FAILED',
        error
      );
    }
  }

  async unregister(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new SDKError(
        `Plugin ${name} not found`,
        'PLUGIN_NOT_FOUND'
      );
    }

    try {
      // 检查是否有其他插件依赖此插件
      const dependents = this.getDependents(name);
      if (dependents.length > 0) {
        throw new SDKError(
          `Cannot unregister plugin ${name} because it is required by: ${dependents.join(', ')}`,
          'PLUGIN_HAS_DEPENDENTS'
        );
      }

      // 销毁插件
      if (plugin.enabled && plugin.destroy) {
        await plugin.destroy();
      }

      // 移除插件
      this.plugins.delete(name);
      this.dependencyGraph.delete(name);

      console.log(`Plugin ${name} unregistered successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new SDKError(
        `Failed to unregister plugin ${name}: ${errorMessage}`,
        'PLUGIN_UNREGISTRATION_FAILED',
        error
      );
    }
  }

  async enable(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new SDKError(
        `Plugin ${name} not found`,
        'PLUGIN_NOT_FOUND'
      );
    }

    if (plugin.enabled) {
      return; // 已经启用
    }

    try {
      // 检查依赖是否都已启用
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          const depPlugin = this.plugins.get(dep);
          if (!depPlugin || !depPlugin.enabled) {
            throw new SDKError(
              `Dependency ${dep} is not enabled`,
              'DEPENDENCY_NOT_ENABLED'
            );
          }
        }
      }

      // 初始化插件
      if (plugin.initialize) {
        await plugin.initialize();
      }

      // 标记为启用
      plugin.enabled = true;

      console.log(`Plugin ${name} enabled successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new SDKError(
        `Failed to enable plugin ${name}: ${errorMessage}`,
        'PLUGIN_ENABLE_FAILED',
        error
      );
    }
  }

  async disable(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new SDKError(
        `Plugin ${name} not found`,
        'PLUGIN_NOT_FOUND'
      );
    }

    if (!plugin.enabled) {
      return; // 已经禁用
    }

    try {
      // 检查是否有启用的插件依赖此插件
      const enabledDependents = this.getDependents(name).filter(dep => {
        const depPlugin = this.plugins.get(dep);
        return depPlugin && depPlugin.enabled;
      });

      if (enabledDependents.length > 0) {
        throw new SDKError(
          `Cannot disable plugin ${name} because it is required by enabled plugins: ${enabledDependents.join(', ')}`,
          'PLUGIN_HAS_ENABLED_DEPENDENTS'
        );
      }

      // 销毁插件
      if (plugin.destroy) {
        await plugin.destroy();
      }

      // 标记为禁用
      plugin.enabled = false;

      console.log(`Plugin ${name} disabled successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new SDKError(
        `Failed to disable plugin ${name}: ${errorMessage}`,
        'PLUGIN_DISABLE_FAILED',
        error
      );
    }
  }

  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabled(): Plugin[] {
    return Array.from(this.plugins.values()).filter(plugin => plugin.enabled);
  }

  private async validateDependencies(plugin: Plugin): Promise<void> {
    if (!plugin.dependencies) return;

    for (const dep of plugin.dependencies) {
      const depPlugin = this.plugins.get(dep);
      if (!depPlugin) {
        throw new SDKError(
          `Dependency ${dep} not found`,
          'DEPENDENCY_NOT_FOUND'
        );
      }
    }

    // 检查循环依赖
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (pluginName: string): boolean => {
      visited.add(pluginName);
      recursionStack.add(pluginName);

      const pluginDeps = pluginName === plugin.name 
        ? plugin.dependencies || []
        : this.plugins.get(pluginName)?.dependencies || [];

      for (const dep of pluginDeps) {
        if (!visited.has(dep)) {
          if (hasCycle(dep)) return true;
        } else if (recursionStack.has(dep)) {
          return true;
        }
      }

      recursionStack.delete(pluginName);
      return false;
    };

    if (hasCycle(plugin.name)) {
      throw new SDKError(
        `Circular dependency detected for plugin ${plugin.name}`,
        'CIRCULAR_DEPENDENCY'
      );
    }
  }

  private updateDependencyGraph(plugin: Plugin): void {
    if (!plugin.dependencies) return;

    for (const dep of plugin.dependencies) {
      if (!this.dependencyGraph.has(dep)) {
        this.dependencyGraph.set(dep, new Set());
      }
      this.dependencyGraph.get(dep)!.add(plugin.name);
    }
  }

  private getDependents(pluginName: string): string[] {
    return Array.from(this.dependencyGraph.get(pluginName) || []);
  }
} 