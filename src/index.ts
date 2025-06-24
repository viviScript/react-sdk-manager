// 核心类和接口
export { SDKManager, createSDKManager } from './core/SDKManager';
export { PluginManager } from './core/PluginManager';
export { StateManager, createStateManager } from './core/StateManager';
export { LifecycleManager } from './core/LifecycleManager';

// React 组件
export {
  SDKProvider,
  useSDK,
  usePlugins,
  useSDKState,
  useLifecycle,
  useSDKInfo
} from './components/SDKProvider';

export {
  PluginRenderer,
  PluginList,
  PluginManager as PluginManagerComponent
} from './components/PluginRenderer';

// 类型定义
export type {
  Plugin,
  PluginHooks,
  PluginManager as IPluginManager,
  StateManager as IStateManager,
  StateListener,
  StateConfig,
  LifecycleHook,
  LifecycleManager as ILifecycleManager,
  LifecycleCallback,
  SDKManagerConfig,
  SDKManager as ISDKManager,
  SDKProviderProps,
  PluginRendererProps,
  ErrorInfo,
  SDKEvent,
  EventListener
} from './types';

// 错误类
export { SDKError } from './types';

// 工具函数
export { createPlugin } from './utils/pluginHelpers';
export { 
  withSDK, 
  withPlugins, 
  withState, 
  withLifecycle, 
  withPluginGuard,
  compose
} from './utils/hoc';
