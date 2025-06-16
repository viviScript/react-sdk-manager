import React from 'react';
import { useSDK } from '../components/SDKProvider';
import { SDKManager } from '../types';

// WithSDK HOC Props
export interface WithSDKProps {
  sdk: SDKManager;
}

// WithSDK HOC - 为组件注入SDK实例
export function withSDK<P extends object>(
  Component: React.ComponentType<P & WithSDKProps>
): React.ComponentType<Omit<P, keyof WithSDKProps>> {
  const WrappedComponent: React.FC<Omit<P, keyof WithSDKProps>> = (props) => {
    const sdk = useSDK();
    return <Component {...(props as P)} sdk={sdk} />;
  };

  WrappedComponent.displayName = `withSDK(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// WithPlugins HOC Props
export interface WithPluginsProps {
  plugins: SDKManager['plugins'];
}

// WithPlugins HOC - 为组件注入插件管理器
export function withPlugins<P extends object>(
  Component: React.ComponentType<P & WithPluginsProps>
): React.ComponentType<Omit<P, keyof WithPluginsProps>> {
  const WrappedComponent: React.FC<Omit<P, keyof WithPluginsProps>> = (props) => {
    const sdk = useSDK();
    return <Component {...(props as P)} plugins={sdk.plugins} />;
  };

  WrappedComponent.displayName = `withPlugins(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// WithState HOC Props
export interface WithStateProps<T = any> {
  state: T;
  setState: (state: Partial<T> | ((prev: T) => T)) => void;
}

// WithState HOC - 为组件注入状态管理
export function withState<P extends object, T = any>(
  Component: React.ComponentType<P & WithStateProps<T>>
): React.ComponentType<Omit<P, keyof WithStateProps<T>>> {
  const WrappedComponent: React.FC<Omit<P, keyof WithStateProps<T>>> = (props) => {
    const sdk = useSDK();
    const [state, setState] = React.useState<T>(sdk.state.getState());

    React.useEffect(() => {
      const unsubscribe = sdk.state.subscribe((newState) => {
        setState(newState);
      });

      return unsubscribe;
    }, [sdk]);

    return <Component {...(props as P)} state={state} setState={sdk.state.setState} />;
  };

  WrappedComponent.displayName = `withState(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// WithLifecycle HOC Props
export interface WithLifecycleProps {
  lifecycle: SDKManager['lifecycle'];
}

// WithLifecycle HOC - 为组件注入生命周期管理器
export function withLifecycle<P extends object>(
  Component: React.ComponentType<P & WithLifecycleProps>
): React.ComponentType<Omit<P, keyof WithLifecycleProps>> {
  const WrappedComponent: React.FC<Omit<P, keyof WithLifecycleProps>> = (props) => {
    const sdk = useSDK();
    return <Component {...(props as P)} lifecycle={sdk.lifecycle} />;
  };

  WrappedComponent.displayName = `withLifecycle(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Compose HOCs - 组合多个HOC
export function compose<T>(...hocs: Array<(component: any) => any>) {
  return (component: T): T => {
    return hocs.reduceRight((acc, hoc) => hoc(acc), component);
  };
}

// Plugin Guard HOC - 只有当指定插件启用时才渲染组件
export interface PluginGuardProps {
  pluginName: string;
  fallback?: React.ReactNode;
}

export function withPluginGuard<P extends object>(
  pluginName: string,
  fallback?: React.ReactNode
) {
  return function (Component: React.ComponentType<P>): React.ComponentType<P> {
    const WrappedComponent: React.FC<P> = (props) => {
      const sdk = useSDK();
      const plugin = sdk.plugins.get(pluginName);

      if (!plugin || !plugin.enabled) {
        return <>{fallback || null}</>;
      }

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `withPluginGuard(${pluginName})(${Component.displayName || Component.name})`;
    
    return WrappedComponent;
  };
} 