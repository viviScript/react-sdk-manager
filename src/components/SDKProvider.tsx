import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SDKManager, SDKManagerConfig } from '../types';
import { createSDKManager } from '../core/SDKManager';

// SDK Context
const SDKContext = createContext<SDKManager | null>(null);

// SDK Provider Props
interface SDKProviderProps {
  config: SDKManagerConfig;
  children: ReactNode;
  onError?: (error: Error) => void;
  onInitialized?: (sdk: SDKManager) => void;
}

// SDK Provider Component
export const SDKProvider: React.FC<SDKProviderProps> = ({
  config,
  children,
  onError,
  onInitialized
}) => {
  const [sdk, setSdk] = useState<SDKManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let sdkInstance: SDKManager | null = null;

    const initializeSDK = async () => {
      try {
        // 创建SDK实例
        sdkInstance = createSDKManager(config);

        // 设置错误处理
        sdkInstance.lifecycle.on('error', (err: Error) => {
          setError(err);
          if (onError) {
            onError(err);
          }
        });

        // 初始化SDK
        await sdkInstance.initialize();
        
        setSdk(sdkInstance);
        setIsInitialized(true);
        setError(null);

        if (onInitialized) {
          onInitialized(sdkInstance);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        if (onError) {
          onError(error);
        }
      }
    };

    initializeSDK();

    // 清理函数
    return () => {
      if (sdkInstance) {
        sdkInstance.destroy().catch(console.error);
      }
    };
  }, [config, onError, onInitialized]);

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div style={{ padding: '16px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
        <h3>SDK Error</h3>
        <p>{error.message}</p>
        {config.debug && (
          <details>
            <summary>Error Details</summary>
            <pre>{error.stack}</pre>
          </details>
        )}
      </div>
    );
  }

  // 如果还没有初始化，显示加载状态
  if (!isInitialized || !sdk) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p>Initializing SDK...</p>
      </div>
    );
  }

  return (
    <SDKContext.Provider value={sdk}>
      {children}
    </SDKContext.Provider>
  );
};

// Hook to use SDK
export const useSDK = (): SDKManager => {
  const sdk = useContext(SDKContext);
  if (!sdk) {
    throw new Error('useSDK must be used within a SDKProvider');
  }
  return sdk;
};

// Hook to use SDK plugins
export const usePlugins = () => {
  const sdk = useSDK();
  return sdk.plugins;
};

// Hook to use SDK state
export const useSDKState = <T = any>() => {
  const sdk = useSDK();
  const [state, setState] = useState<T>(sdk.state.getState());

  useEffect(() => {
    const unsubscribe = sdk.state.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [sdk]);

  return [state, sdk.state.setState] as const;
};

// Hook to use lifecycle hooks
export const useLifecycle = () => {
  const sdk = useSDK();
  return sdk.lifecycle;
};

// Hook to get SDK info
export const useSDKInfo = () => {
  const sdk = useSDK();
  const [info, setInfo] = useState(sdk.getInfo());

  useEffect(() => {
    const updateInfo = () => {
      setInfo(sdk.getInfo());
    };

    // 监听状态变化更新信息
    const unsubscribe = sdk.state.subscribe(updateInfo);

    // 监听生命周期变化更新信息
    const unsubscribeMount = sdk.lifecycle.on('afterMount', updateInfo);
    const unsubscribeUnmount = sdk.lifecycle.on('afterUnmount', updateInfo);

    return () => {
      unsubscribe();
      unsubscribeMount();
      unsubscribeUnmount();
    };
  }, [sdk]);

  return info;
}; 