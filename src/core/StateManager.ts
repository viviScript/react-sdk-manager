import { StateManager as IStateManager, StateListener, StateConfig } from '../types';

export class StateManager<T = any> implements IStateManager<T> {
  private state: T;
  private listeners: Set<StateListener<T>> = new Set();
  private config: StateConfig<T>;

  constructor(config: StateConfig<T>) {
    this.config = config;
    this.state = this.loadInitialState();
  }

  getState(): T {
    return this.state;
  }

  setState(newState: Partial<T> | ((prev: T) => T)): void {
    const prevState = this.state;
    
    if (typeof newState === 'function') {
      this.state = newState(this.state);
    } else {
      this.state = { ...this.state, ...newState };
    }

    // 如果状态发生变化，通知监听器
    if (this.state !== prevState) {
      this.notifyListeners(this.state, prevState);
      
      // 持久化状态
      if (this.config.persist) {
        this.persistState();
      }
    }
  }

  subscribe(listener: StateListener<T>): () => void {
    this.listeners.add(listener);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    const prevState = this.state;
    this.state = this.config.initialState;
    
    this.notifyListeners(this.state, prevState);
    
    // 清除持久化状态
    if (this.config.persist && this.config.persistKey) {
      this.clearPersistedState();
    }
  }

  // 获取监听器数量（用于调试）
  getListenerCount(): number {
    return this.listeners.size;
  }

  // 清除所有监听器
  clearListeners(): void {
    this.listeners.clear();
  }

  private loadInitialState(): T {
    if (this.config.persist && this.config.persistKey) {
      try {
        const persistedState = this.getPersistedState();
        if (persistedState !== null) {
          return { ...this.config.initialState, ...persistedState };
        }
      } catch (error) {
        console.warn('Failed to load persisted state:', error);
      }
    }
    
    return this.config.initialState;
  }

  private notifyListeners(state: T, prevState: T): void {
    this.listeners.forEach(listener => {
      try {
        listener(state, prevState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  private persistState(): void {
    if (!this.config.persistKey) return;
    
    try {
      const serializedState = JSON.stringify(this.state);
      localStorage.setItem(this.config.persistKey, serializedState);
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  private getPersistedState(): T | null {
    if (!this.config.persistKey) return null;
    
    try {
      const persistedState = localStorage.getItem(this.config.persistKey);
      return persistedState ? JSON.parse(persistedState) : null;
    } catch (error) {
      console.error('Failed to parse persisted state:', error);
      return null;
    }
  }

  private clearPersistedState(): void {
    if (!this.config.persistKey) return;
    
    try {
      localStorage.removeItem(this.config.persistKey);
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
    }
  }
}

// 创建状态管理器的工厂函数
export function createStateManager<T>(config: StateConfig<T>): StateManager<T> {
  return new StateManager(config);
} 