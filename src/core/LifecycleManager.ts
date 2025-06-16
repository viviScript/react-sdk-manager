import { LifecycleManager as ILifecycleManager, LifecycleHook, LifecycleCallback } from '../types';

export class LifecycleManager implements ILifecycleManager {
  private hooks: Map<LifecycleHook, Set<LifecycleCallback>> = new Map();
  private isDebug: boolean = false;

  constructor(debug: boolean = false) {
    this.isDebug = debug;
    this.initializeHooks();
  }

  on(hook: LifecycleHook, callback: LifecycleCallback): () => void {
    if (!this.hooks.has(hook)) {
      this.hooks.set(hook, new Set());
    }

    this.hooks.get(hook)!.add(callback);

    if (this.isDebug) {
      console.log(`Lifecycle hook '${hook}' registered`);
    }

    // 返回取消订阅函数
    return () => {
      this.off(hook, callback);
    };
  }

  off(hook: LifecycleHook, callback: LifecycleCallback): void {
    const callbacks = this.hooks.get(hook);
    if (callbacks) {
      callbacks.delete(callback);
      
      if (this.isDebug) {
        console.log(`Lifecycle hook '${hook}' unregistered`);
      }
    }
  }

  emit(hook: LifecycleHook, ...args: any[]): void {
    const callbacks = this.hooks.get(hook);
    
    if (this.isDebug) {
      console.log(`Emitting lifecycle hook '${hook}' with args:`, args);
    }

    if (callbacks && callbacks.size > 0) {
      // 创建回调数组副本以避免在执行过程中修改集合
      const callbackArray = Array.from(callbacks);
      
      callbackArray.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in lifecycle hook '${hook}':`, error);
          
          // 如果是错误钩子本身出错，避免无限递归
          if (hook !== 'error') {
            this.emit('error', error, hook);
          }
        }
      });
    }
  }

  clear(hook?: LifecycleHook): void {
    if (hook) {
      // 清除特定钩子的所有回调
      this.hooks.delete(hook);
      
      if (this.isDebug) {
        console.log(`All callbacks for lifecycle hook '${hook}' cleared`);
      }
    } else {
      // 清除所有钩子
      this.hooks.clear();
      this.initializeHooks();
      
      if (this.isDebug) {
        console.log('All lifecycle hooks cleared');
      }
    }
  }

  // 获取指定钩子的回调数量
  getCallbackCount(hook: LifecycleHook): number {
    const callbacks = this.hooks.get(hook);
    return callbacks ? callbacks.size : 0;
  }

  // 获取所有已注册的钩子类型
  getRegisteredHooks(): LifecycleHook[] {
    return Array.from(this.hooks.keys()).filter(hook => this.hooks.get(hook)!.size > 0);
  }

  // 检查是否有指定钩子的回调
  hasCallbacks(hook: LifecycleHook): boolean {
    const callbacks = this.hooks.get(hook);
    return callbacks ? callbacks.size > 0 : false;
  }

  // 异步版本的emit，支持异步回调
  async emitAsync(hook: LifecycleHook, ...args: any[]): Promise<void> {
    const callbacks = this.hooks.get(hook);
    
    if (this.isDebug) {
      console.log(`Emitting async lifecycle hook '${hook}' with args:`, args);
    }

    if (callbacks && callbacks.size > 0) {
      const callbackArray = Array.from(callbacks);
      
      const promises = callbackArray.map(async callback => {
        try {
          await Promise.resolve(callback(...args));
        } catch (error) {
          console.error(`Error in async lifecycle hook '${hook}':`, error);
          
          if (hook !== 'error') {
            this.emit('error', error, hook);
          }
        }
      });

      await Promise.all(promises);
    }
  }

  // 设置调试模式
  setDebugMode(debug: boolean): void {
    this.isDebug = debug;
  }

  private initializeHooks(): void {
    // 初始化所有钩子类型
    const hookTypes: LifecycleHook[] = [
      'beforeMount',
      'afterMount',
      'beforeUnmount',
      'afterUnmount',
      'stateChange',
      'error'
    ];

    hookTypes.forEach(hook => {
      if (!this.hooks.has(hook)) {
        this.hooks.set(hook, new Set());
      }
    });
  }
} 