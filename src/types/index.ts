import { ReactNode } from 'react';

// 插件相关类型
export interface Plugin {
  name: string;
  version: string;
  enabled: boolean;
  dependencies?: string[];
  initialize?: () => Promise<void> | void;
  destroy?: () => Promise<void> | void;
  component?: React.ComponentType<any>;
  hooks?: PluginHooks;
}

export interface PluginHooks {
  onMount?: () => void;
  onUnmount?: () => void;
  onStateChange?: (state: any) => void;
  onError?: (error: Error) => void;
}

export interface PluginManager {
  register: (plugin: Plugin) => Promise<void>;
  unregister: (name: string) => Promise<void>;
  enable: (name: string) => Promise<void>;
  disable: (name: string) => Promise<void>;
  get: (name: string) => Plugin | undefined;
  getAll: () => Plugin[];
  getEnabled: () => Plugin[];
}

// 状态管理相关类型
export interface StateManager<T = any> {
  getState: () => T;
  setState: (state: Partial<T> | ((prev: T) => T)) => void;
  subscribe: (listener: StateListener<T>) => () => void;
  reset: () => void;
  getListenerCount: () => number;
  clearListeners: () => void;
}

export type StateListener<T> = (state: T, prevState: T) => void;

export interface StateConfig<T> {
  initialState: T;
  persist?: boolean;
  persistKey?: string;
}

// 生命周期钩子相关类型
export type LifecycleHook = 'beforeMount' | 'afterMount' | 'beforeUnmount' | 'afterUnmount' | 'stateChange' | 'error';

export interface LifecycleManager {
  on: (hook: LifecycleHook, callback: LifecycleCallback) => () => void;
  off: (hook: LifecycleHook, callback: LifecycleCallback) => void;
  emit: (hook: LifecycleHook, ...args: any[]) => void;
  clear: (hook?: LifecycleHook) => void;
  emitAsync: (hook: LifecycleHook, ...args: any[]) => Promise<void>;
  getRegisteredHooks: () => LifecycleHook[];
  setDebugMode: (debug: boolean) => void;
}

export type LifecycleCallback = (...args: any[]) => void;

// SDK Manager 主要接口
export interface SDKManagerConfig {
  name?: string;
  version?: string;
  debug?: boolean;
  plugins?: Plugin[];
  initialState?: any;
  persist?: boolean;
  persistKey?: string;
}

export interface SDKManager {
  plugins: PluginManager;
  state: StateManager;
  lifecycle: LifecycleManager;
  initialize: () => Promise<void>;
  destroy: () => Promise<void>;
  getConfig: () => SDKManagerConfig;
  getInfo: () => {
    name?: string;
    version?: string;
    isInitialized: boolean;
    isDestroyed: boolean;
    pluginCount: number;
    enabledPluginCount: number;
    stateListenerCount: number;
    registeredHooks: LifecycleHook[];
  };
  reset: () => Promise<void>;
  updateConfig: (newConfig: Partial<SDKManagerConfig>) => void;
}

// React 组件相关类型
export interface SDKProviderProps {
  config: SDKManagerConfig;
  children: ReactNode;
}

export interface PluginRendererProps {
  pluginName: string;
  props?: any;
}

// 错误相关类型
export class SDKError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SDKError';
  }
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// 事件相关类型
export interface SDKEvent {
  type: string;
  payload?: any;
  timestamp: number;
}

export type EventListener = (event: SDKEvent) => void; 