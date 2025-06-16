// Complete Demo File

import React from 'react';
import {
  SDKProvider,
  useSDK,
  useSDKState,
  useLifecycle,
  useSDKInfo,
  createPlugin,
  PluginRenderer,
  PluginList,
  PluginManagerComponent as PluginManager,
  withSDK,
  withPluginGuard
} from '../src';

// ===== PLUGINS =====

// Theme Plugin - Controls app theming
const ThemePlugin = createPlugin({
  name: 'theme-plugin',
  version: '1.2.0',
  component: ({ sdk }) => {
    const [state, setState] = useSDKState<AppState>();
    
    const themes = {
      light: { bg: '#ffffff', text: '#333333', border: '#e0e0e0' },
      dark: { bg: '#1a1a1a', text: '#ffffff', border: '#333333' },
      blue: { bg: '#e3f2fd', text: '#0d47a1', border: '#2196f3' }
    };

    const currentTheme = themes[state.theme] || themes.light;
    
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
        border: `2px solid ${currentTheme.border}`,
        borderRadius: '8px',
        margin: '10px 0'
      }}>
        <h3>🎨 Theme Controller</h3>
        <p>Current theme: <strong>{state.theme}</strong></p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {Object.keys(themes).map(themeName => (
            <button
              key={themeName}
              onClick={() => setState(prev => ({ ...prev, theme: themeName as any }))}
              style={{
                padding: '8px 16px',
                backgroundColor: state.theme === themeName ? currentTheme.border : 'transparent',
                color: currentTheme.text,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  },
  initialize: async () => {
    console.log('🎨 Theme plugin initializing...');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('🎨 Theme plugin ready');
  },
  hooks: {
    onMount: () => console.log('🎨 Theme plugin mounted'),
    onStateChange: (state: AppState, prevState: AppState) => {
      if (state.theme !== prevState.theme) {
        console.log(`🎨 Theme changed: ${prevState.theme} → ${state.theme}`);
      }
    }
  }
});

// User Management Plugin
const UserPlugin = createPlugin({
  name: 'user-plugin',
  version: '2.0.0',
  dependencies: ['theme-plugin'],
  component: ({ sdk }) => {
    const [state, setState] = useSDKState<AppState>();
    const lifecycle = useLifecycle();
    const [loading, setLoading] = React.useState(false);
    
    const mockUsers = [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
      { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User' }
    ];

    const login = async (user: typeof mockUsers[0]) => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setState(prev => ({ 
          ...prev, 
          user,
          notifications: [...prev.notifications, {
            id: Date.now(),
            message: `Welcome back, ${user.name}!`,
            type: 'success',
            timestamp: new Date()
          }]
        }));
        lifecycle.emit('userLoggedIn', user);
      } catch (error) {
        lifecycle.emit('error', error, 'user-login');
      } finally {
        setLoading(false);
      }
    };

    const logout = () => {
      setState(prev => ({ 
        ...prev, 
        user: null,
        notifications: [...prev.notifications, {
          id: Date.now(),
          message: 'You have been logged out',
          type: 'info',
          timestamp: new Date()
        }]
      }));
      lifecycle.emit('userLoggedOut');
    };

    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px 0' }}>
        <h3>👤 User Management</h3>
        {state.user ? (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <h4>Welcome, {state.user.name}!</h4>
              <p><strong>Email:</strong> {state.user.email}</p>
              <p><strong>Role:</strong> {state.user.role}</p>
            </div>
            <button 
              onClick={logout}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#f44336', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p>Choose a user to login:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mockUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => login(user)}
                  disabled={loading}
                  style={{
                    padding: '10px',
                    backgroundColor: loading ? '#ccc' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {loading ? 'Logging in...' : `${user.name} (${user.role})`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
});

// Counter Plugin - Simple interactive example
const CounterPlugin = createPlugin({
  name: 'counter-plugin',
  version: '1.1.0',
  component: ({ sdk }) => {
    const [state, setState] = useSDKState<AppState>();
    
    const increment = () => {
      setState(prev => ({ 
        ...prev, 
        counters: { 
          ...prev.counters, 
          main: (prev.counters.main || 0) + 1 
        }
      }));
    };
    
    const decrement = () => {
      setState(prev => ({ 
        ...prev, 
        counters: { 
          ...prev.counters, 
          main: Math.max(0, (prev.counters.main || 0) - 1)
        }
      }));
    };
    
    const reset = () => {
      setState(prev => ({ 
        ...prev, 
        counters: { 
          ...prev.counters, 
          main: 0 
        }
      }));
    };

    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px 0' }}>
        <h3>🔢 Counter Demo</h3>
        <div style={{ fontSize: '2em', margin: '10px 0', textAlign: 'center' }}>
          Count: {state.counters.main || 0}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={decrement} style={buttonStyle}>
            ➖ Decrease
          </button>
          <button onClick={reset} style={{ ...buttonStyle, backgroundColor: '#ff9800' }}>
            🔄 Reset
          </button>
          <button onClick={increment} style={buttonStyle}>
            ➕ Increase
          </button>
        </div>
      </div>
    );
  },
  hooks: {
    onStateChange: (state: AppState, prevState: AppState) => {
      const currentCount = state.counters?.main || 0;
      const prevCount = prevState.counters?.main || 0;
      
      if (currentCount !== prevCount) {
        console.log(`🔢 Counter changed: ${prevCount} → ${currentCount}`);
        
        // Achievement system
        if (currentCount === 10) {
          console.log('🏆 Achievement unlocked: Reached 10!');
        } else if (currentCount === 50) {
          console.log('🏆 Achievement unlocked: Half century!');
        }
      }
    }
  }
});

// ===== TYPES =====

interface AppState {
  theme: 'light' | 'dark' | 'blue';
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  counters: {
    main: number;
  };
  notifications: Array<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: Date;
  }>;
}

// ===== COMPONENTS =====

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#2196f3',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};

// SDK Info Component
const SDKInfoComponent = withSDK(({ sdk }) => {
  const info = useSDKInfo();
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px 0' }}>
      <h3>ℹ️ SDK Information</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '15px' }}>
        <div><strong>Name:</strong> {info.name}</div>
        <div><strong>Version:</strong> {info.version}</div>
        <div><strong>Status:</strong> {info.isInitialized ? '✅ Ready' : '⏳ Loading'}</div>
        <div><strong>Plugins:</strong> {info.enabledPluginCount}/{info.pluginCount}</div>
      </div>

      <button 
        onClick={() => setShowDetails(!showDetails)} 
        style={buttonStyle}
      >
        {showDetails ? 'Hide' : 'Show'} Details
      </button>

      {showDetails && (
        <div style={{ marginTop: '15px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
          <h4>Detailed Information</h4>
          <pre style={{ overflow: 'auto', fontSize: '12px' }}>
            {JSON.stringify(info, null, 2)}
          </pre>
          
          <h4>Current State</h4>
          <pre style={{ overflow: 'auto', fontSize: '12px' }}>
            {JSON.stringify(sdk.state.getState(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
});

// Main App Content
const AppContent: React.FC = () => {
  const sdk = useSDK();
  const [state] = useSDKState<AppState>();
  const [pluginsRegistered, setPluginsRegistered] = React.useState(false);

  React.useEffect(() => {
    const registerPlugins = async () => {
      try {
        console.log('📦 Registering plugins...');
        
        // Register plugins in dependency order
        await sdk.plugins.register(ThemePlugin);
        await sdk.plugins.register(UserPlugin);
        await sdk.plugins.register(CounterPlugin);
        
        setPluginsRegistered(true);
        console.log('✅ All plugins registered successfully');
      } catch (error) {
        console.error('❌ Failed to register plugins:', error);
      }
    };

    registerPlugins();

    // Set up global lifecycle listeners
    const unsubscribes = [
      sdk.lifecycle.on('stateChange', (newState: AppState, prevState: AppState) => {
        console.log('🔄 Global state change detected:', { newState, prevState });
      }),
      sdk.lifecycle.on('error', (error: Error, context?: string) => {
        console.error(`💥 Global error in ${context}:`, error);
      })
    ];

    return () => unsubscribes.forEach(fn => fn());
  }, [sdk]);

  if (!pluginsRegistered) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>🚀 Initializing React SDK Manager Demo</h2>
        <p>Loading plugins and setting up the application...</p>
      </div>
    );
  }

  const currentTheme = state.theme === 'dark' ? 
    { bg: '#1a1a1a', text: '#ffffff' } : 
    state.theme === 'blue' ?
    { bg: '#e3f2fd', text: '#0d47a1' } :
    { bg: '#ffffff', text: '#333333' };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: currentTheme.bg,
      color: currentTheme.text,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>🚀 React SDK Manager - Complete Demo</h1>
          <p>A comprehensive demonstration of plugin management, state handling, and lifecycle hooks</p>
        </header>

        {/* Core Plugins */}
        <section>
          <h2>🔌 Core Plugins</h2>
          <PluginRenderer pluginName="theme-plugin" />
          <PluginRenderer pluginName="user-plugin" />
          <PluginRenderer pluginName="counter-plugin" />
        </section>

        {/* Plugin Management */}
        <section style={{ marginTop: '30px' }}>
          <h2>⚙️ Plugin Management</h2>
          <PluginManager 
            showDisabled={true}
            onPluginToggle={(pluginName, enabled) => {
              console.log(`Plugin ${pluginName} ${enabled ? 'enabled' : 'disabled'}`);
            }}
          />
        </section>

        {/* SDK Information */}
        <section style={{ marginTop: '30px' }}>
          <h2>📋 SDK Information</h2>
          <SDKInfoComponent />
        </section>

        {/* Footer */}
        <footer style={{ 
          textAlign: 'center', 
          marginTop: '50px', 
          padding: '20px', 
          borderTop: `1px solid ${currentTheme.text}33` 
        }}>
          <p>
            <strong>React SDK Manager Demo</strong> | 
            Built with ❤️ using TypeScript & React | 
            Check the console for detailed logs
          </p>
        </footer>
      </div>
    </div>
  );
};

// Root App Component
const CompleteDemoApp: React.FC = () => {
  const config = {
    name: 'React SDK Manager Demo',
    version: '1.0.0',
    debug: true,
    initialState: {
      theme: 'light' as const,
      user: null,
      counters: { main: 0 },
      notifications: [
        {
          id: 1,
          message: 'Welcome to React SDK Manager Demo!',
          type: 'success' as const,
          timestamp: new Date()
        }
      ]
    },
    persist: true,
    persistKey: 'react-sdk-manager-demo'
  };

  return (
    <SDKProvider
      config={config}
      onError={(error) => {
        console.error('🚨 SDK Error:', error);
        alert(`SDK Error: ${error.message}`);
      }}
      onInitialized={(sdk) => {
        console.log('🎉 SDK initialized successfully:', sdk.getInfo());
      }}
    >
      <AppContent />
    </SDKProvider>
  );
};

export default CompleteDemoApp;
