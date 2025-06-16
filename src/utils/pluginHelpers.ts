import { Plugin } from '../types';

// 创建插件的辅助函数
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
}): Plugin {
  return {
    name: config.name,
    version: config.version,
    enabled: config.enabled ?? true,
    dependencies: config.dependencies,
    initialize: config.initialize,
    destroy: config.destroy,
    component: config.component,
    hooks: config.hooks
  };
}

// 验证插件配置
export function validatePlugin(plugin: Plugin): string[] {
  const errors: string[] = [];

  if (!plugin.name) {
    errors.push('Plugin name is required');
  }

  if (!plugin.version) {
    errors.push('Plugin version is required');
  }

  if (plugin.dependencies) {
    if (!Array.isArray(plugin.dependencies)) {
      errors.push('Plugin dependencies must be an array');
    }
  }

  return errors;
}

// 检查插件兼容性
export function checkPluginCompatibility(plugin: Plugin, availablePlugins: Plugin[]): {
  compatible: boolean;
  missingDependencies: string[];
} {
  const missingDependencies: string[] = [];

  if (plugin.dependencies) {
    for (const dep of plugin.dependencies) {
      const found = availablePlugins.find(p => p.name === dep);
      if (!found) {
        missingDependencies.push(dep);
      }
    }
  }

  return {
    compatible: missingDependencies.length === 0,
    missingDependencies
  };
}

// 按依赖顺序排序插件
export function sortPluginsByDependencies(plugins: Plugin[]): Plugin[] {
  const sorted: Plugin[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (plugin: Plugin) => {
    if (visiting.has(plugin.name)) {
      throw new Error(`Circular dependency detected involving plugin: ${plugin.name}`);
    }

    if (visited.has(plugin.name)) {
      return;
    }

    visiting.add(plugin.name);

    if (plugin.dependencies) {
      for (const depName of plugin.dependencies) {
        const depPlugin = plugins.find(p => p.name === depName);
        if (depPlugin) {
          visit(depPlugin);
        }
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

// 获取插件的依赖链
export function getPluginDependencyChain(pluginName: string, plugins: Plugin[]): string[] {
  const chain: string[] = [];
  const visited = new Set<string>();

  const visit = (name: string) => {
    if (visited.has(name)) return;
    visited.add(name);

    const plugin = plugins.find(p => p.name === name);
    if (plugin && plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        visit(dep);
        chain.push(dep);
      }
    }
  };

  visit(pluginName);
  return chain;
}

// 检查插件是否可以安全卸载
export function canUnloadPlugin(pluginName: string, plugins: Plugin[]): {
  canUnload: boolean;
  dependents: string[];
} {
  const dependents: string[] = [];

  for (const plugin of plugins) {
    if (plugin.dependencies && plugin.dependencies.indexOf(pluginName) !== -1) {
      dependents.push(plugin.name);
    }
  }

  return {
    canUnload: dependents.length === 0,
    dependents
  };
} 