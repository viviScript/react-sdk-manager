# Advanced Usage Examples

This document provides comprehensive examples of advanced React SDK Manager usage patterns.

## Table of Contents

1. [Plugin Communication Patterns](#plugin-communication-patterns)
2. [State Management Strategies](#state-management-strategies)
3. [Dynamic Plugin Loading](#dynamic-plugin-loading)
4. [Error Handling & Recovery](#error-handling--recovery)
5. [Performance Optimization](#performance-optimization)
6. [Testing Strategies](#testing-strategies)
7. [Real-World Scenarios](#real-world-scenarios)

## Plugin Communication Patterns

### 1. Event-Based Communication

```tsx
// Publisher Plugin
const PublisherPlugin = createPlugin({
  name: 'publisher-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    const sendNotification = () => {
      // Emit a state change that other plugins can listen to
      sdk.state.setState(prev => ({
        ...prev,
        notifications: [...(prev.notifications || []), {
          id: Date.now(),
          type: 'info',
          message: 'Message from Publisher Plugin',
          timestamp: new Date()
        }]
      }));
    };

    return (
      <div>
        <h3>Publisher Plugin</h3>
        <button onClick={sendNotification}>Send Notification</button>
      </div>
    );
  }
});

// Subscriber Plugin
const SubscriberPlugin = createPlugin({
  name: 'subscriber-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    const [messages, setMessages] = React.useState([]);
    
    React.useEffect(() => {
      return sdk.state.subscribe((newState, prevState) => {
        const newNotifications = newState.notifications || [];
        const oldNotifications = prevState.notifications || [];
        
        if (newNotifications.length > oldNotifications.length) {
          const latestNotification = newNotifications[newNotifications.length - 1];
          setMessages(prev => [...prev, latestNotification]);
        }
      });
    }, [sdk]);

    return (
      <div>
        <h3>Subscriber Plugin</h3>
        <div>Messages received: {messages.length}</div>
        {messages.slice(-3).map(msg => (
          <div key={msg.id}>{msg.message}</div>
        ))}
      </div>
    );
  }
});
```

### 2. Direct Plugin Communication

```tsx
const ControllerPlugin = createPlugin({
  name: 'controller-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    const toggleTargetPlugin = async () => {
      const targetPlugin = sdk.plugins.get('target-plugin');
      if (targetPlugin) {
        if (targetPlugin.enabled) {
          await sdk.plugins.disable('target-plugin');
        } else {
          await sdk.plugins.enable('target-plugin');
        }
      }
    };

    return (
      <div>
        <h3>Controller Plugin</h3>
        <button onClick={toggleTargetPlugin}>
          Toggle Target Plugin
        </button>
      </div>
    );
  }
});

const TargetPlugin = createPlugin({
  name: 'target-plugin',
  version: '1.0.0',
  component: () => {
    return (
      <div>
        <h3>Target Plugin</h3>
        <p>I can be controlled by the Controller Plugin!</p>
      </div>
    );
  },
  hooks: {
    onMount: () => console.log('Target plugin mounted'),
    onUnmount: () => console.log('Target plugin unmounted')
  }
});
```

## State Management Strategies

### 1. Modular State Management

```tsx
// Define state modules
interface AppState {
  user: UserState;
  ui: UIState;
  data: DataState;
}

interface UserState {
  currentUser: User | null;
  preferences: UserPreferences;
  session: SessionInfo;
}

// User state plugin
const UserStatePlugin = createPlugin({
  name: 'user-state-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    const [state, setState] = useSDKState<AppState>();

    const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          preferences: { ...prev.user.preferences, ...preferences }
        }
      }));
    };

    return (
      <div>
        <h3>User State Management</h3>
        {/* User management UI */}
      </div>
    );
  }
});
```

### 2. State Validation & Middleware

```tsx
const StateValidationPlugin = createPlugin({
  name: 'state-validation-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    React.useEffect(() => {
      return sdk.state.subscribe((newState, prevState) => {
        // Validate state changes
        if (!validateState(newState)) {
          console.error('Invalid state detected, reverting changes');
          sdk.state.setState(prevState);
        }
        
        // Log state changes for debugging
        if (sdk.getConfig().debug) {
          console.log('State changed:', {
            from: prevState,
            to: newState,
            timestamp: Date.now()
          });
        }
      });
    }, [sdk]);

    return null; // This is a background plugin
  }
});

function validateState(state: any): boolean {
  // Add your validation logic here
  if (state.user && typeof state.user.id !== 'number') {
    return false;
  }
  return true;
}
```

## Dynamic Plugin Loading

### 1. Conditional Plugin Loading

```tsx
const ConditionalLoaderPlugin = createPlugin({
  name: 'conditional-loader',
  version: '1.0.0',
  component: ({ sdk }) => {
    const [userRole, setUserRole] = React.useState<string>('guest');

    React.useEffect(() => {
      const loadRoleBasedPlugins = async () => {
        // Load plugins based on user role
        if (userRole === 'admin') {
          const adminPlugin = await import('./AdminPlugin');
          await sdk.plugins.register(adminPlugin.default);
        } else if (userRole === 'user') {
          const userPlugin = await import('./UserPlugin');
          await sdk.plugins.register(userPlugin.default);
        }
      };

      loadRoleBasedPlugins();
    }, [userRole, sdk]);

    return (
      <div>
        <h3>Role-Based Plugin Loader</h3>
        <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
          <option value="guest">Guest</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    );
  }
});
```

### 2. Feature Flag Integration

```tsx
const FeatureFlagPlugin = createPlugin({
  name: 'feature-flag-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    const [features, setFeatures] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
      // Simulate feature flag service
      const loadFeatureFlags = async () => {
        const flags = await fetchFeatureFlags();
        setFeatures(flags);

        // Enable/disable plugins based on feature flags
        for (const [feature, enabled] of Object.entries(flags)) {
          const pluginName = `${feature}-plugin`;
          const plugin = sdk.plugins.get(pluginName);
          
          if (plugin) {
            if (enabled && !plugin.enabled) {
              await sdk.plugins.enable(pluginName);
            } else if (!enabled && plugin.enabled) {
              await sdk.plugins.disable(pluginName);
            }
          }
        }
      };

      loadFeatureFlags();
    }, [sdk]);

    return (
      <div>
        <h3>Feature Flags</h3>
        {Object.entries(features).map(([feature, enabled]) => (
          <div key={feature}>
            {feature}: {enabled ? '✅' : '❌'}
          </div>
        ))}
      </div>
    );
  }
});

async function fetchFeatureFlags(): Promise<Record<string, boolean>> {
  // Simulate API call
  return {
    'advanced-analytics': true,
    'beta-features': false,
    'experimental-ui': true
  };
}
```

## Error Handling & Recovery

### 1. Global Error Handler

```tsx
const ErrorHandlerPlugin = createPlugin({
  name: 'error-handler-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    const [errors, setErrors] = React.useState<ErrorLog[]>([]);

    React.useEffect(() => {
      const handleError = (error: Error, context?: string) => {
        const errorLog: ErrorLog = {
          id: Date.now(),
          error: error.message,
          context,
          timestamp: new Date(),
          stack: error.stack
        };

        setErrors(prev => [...prev.slice(-9), errorLog]); // Keep last 10 errors

        // Send to error reporting service
        if (typeof window !== 'undefined' && window.Sentry) {
          window.Sentry.captureException(error, {
            tags: { context, sdkVersion: sdk.getConfig().version }
          });
        }
      };

      return sdk.lifecycle.on('error', handleError);
    }, [sdk]);

    return (
      <div>
        <h3>Error Monitor</h3>
        <div>Total errors: {errors.length}</div>
        {errors.slice(-3).map(error => (
          <div key={error.id} style={{ color: 'red', fontSize: '12px' }}>
            {error.context}: {error.error}
          </div>
        ))}
      </div>
    );
  }
});

interface ErrorLog {
  id: number;
  error: string;
  context?: string;
  timestamp: Date;
  stack?: string;
}
```

### 2. Plugin Recovery System

```tsx
const RecoveryPlugin = createPlugin({
  name: 'recovery-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    const [failedPlugins, setFailedPlugins] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
      const handleError = (error: Error, context?: string) => {
        if (context && context.includes('plugin')) {
          const pluginName = extractPluginNameFromContext(context);
          if (pluginName) {
            setFailedPlugins(prev => new Set(prev).add(pluginName));
          }
        }
      };

      return sdk.lifecycle.on('error', handleError);
    }, [sdk]);

    const recoverPlugin = async (pluginName: string) => {
      try {
        await sdk.plugins.disable(pluginName);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait
        await sdk.plugins.enable(pluginName);
        
        setFailedPlugins(prev => {
          const newSet = new Set(prev);
          newSet.delete(pluginName);
          return newSet;
        });
      } catch (error) {
        console.error(`Failed to recover plugin ${pluginName}:`, error);
      }
    };

    return (
      <div>
        <h3>Plugin Recovery</h3>
        {Array.from(failedPlugins).map(pluginName => (
          <div key={pluginName}>
            <span style={{ color: 'red' }}>{pluginName} failed</span>
            <button onClick={() => recoverPlugin(pluginName)}>
              Recover
            </button>
          </div>
        ))}
      </div>
    );
  }
});

function extractPluginNameFromContext(context: string): string | null {
  const match = context.match(/plugin[:\s]+([a-zA-Z0-9-_]+)/i);
  return match ? match[1] : null;
}
```

## Performance Optimization

### 1. Lazy Plugin Loading

```tsx
const LazyPluginManager = createPlugin({
  name: 'lazy-plugin-manager',
  version: '1.0.0',
  component: ({ sdk }) => {
    const [loadedPlugins, setLoadedPlugins] = React.useState<Set<string>>(new Set());

    const loadPluginOnDemand = async (pluginName: string) => {
      if (loadedPlugins.has(pluginName)) return;

      try {
        // Dynamic import based on plugin name
        const pluginModule = await import(`../plugins/${pluginName}`);
        await sdk.plugins.register(pluginModule.default);
        
        setLoadedPlugins(prev => new Set(prev).add(pluginName));
      } catch (error) {
        console.error(`Failed to load plugin ${pluginName}:`, error);
      }
    };

    return (
      <div>
        <h3>Lazy Plugin Manager</h3>
        <button onClick={() => loadPluginOnDemand('analytics-plugin')}>
          Load Analytics
        </button>
        <button onClick={() => loadPluginOnDemand('dashboard-plugin')}>
          Load Dashboard
        </button>
        <div>Loaded: {Array.from(loadedPlugins).join(', ')}</div>
      </div>
    );
  }
});
```

### 2. State Optimization

```tsx
const OptimizedStatePlugin = createPlugin({
  name: 'optimized-state-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    // Memoize expensive computations
    const expensiveComputation = React.useMemo(() => {
      const state = sdk.state.getState();
      return computeExpensiveValue(state);
    }, [sdk.state.getState()]);

    // Debounce state updates
    const debouncedSetState = React.useMemo(
      () => debounce((newState: any) => {
        sdk.state.setState(newState);
      }, 300),
      [sdk]
    );

    // Use shallow comparison for state changes
    const [localState, setLocalState] = React.useState({});
    
    React.useEffect(() => {
      return sdk.state.subscribe((newState, prevState) => {
        if (shallowCompare(newState.ui, prevState.ui)) {
          setLocalState(newState.ui);
        }
      });
    }, [sdk]);

    return (
      <div>
        <h3>Optimized State Plugin</h3>
        <div>Computed value: {expensiveComputation}</div>
      </div>
    );
  }
});

function computeExpensiveValue(state: any): number {
  // Simulate expensive computation
  return Object.keys(state).length * 42;
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

function shallowCompare(obj1: any, obj2: any): boolean {
  const keys1 = Object.keys(obj1 || {});
  const keys2 = Object.keys(obj2 || {});
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}
```

## Testing Strategies

### 1. Plugin Testing

```tsx
// Test utilities
export const createTestSDK = (initialState = {}) => {
  return createSDKManager({
    name: 'Test SDK',
    debug: false,
    initialState
  });
};

export const createMockPlugin = (overrides = {}) => {
  return createPlugin({
    name: 'mock-plugin',
    version: '1.0.0',
    component: () => <div data-testid="mock-plugin">Mock Plugin</div>,
    ...overrides
  });
};

// Example test
describe('Plugin Integration Tests', () => {
  let sdk: SDKManager;

  beforeEach(async () => {
    sdk = createTestSDK({ count: 0 });
    await sdk.initialize();
  });

  afterEach(async () => {
    await sdk.destroy();
  });

  test('should register and enable plugin', async () => {
    const testPlugin = createMockPlugin({
      name: 'test-plugin'
    });

    await sdk.plugins.register(testPlugin);
    
    const plugin = sdk.plugins.get('test-plugin');
    expect(plugin).toBeDefined();
    expect(plugin.enabled).toBe(true);
  });

  test('should handle plugin dependencies', async () => {
    const basePlugin = createMockPlugin({ name: 'base-plugin' });
    const dependentPlugin = createMockPlugin({
      name: 'dependent-plugin',
      dependencies: ['base-plugin']
    });

    await sdk.plugins.register(basePlugin);
    await sdk.plugins.register(dependentPlugin);

    expect(sdk.plugins.getAll()).toHaveLength(2);
  });

  test('should manage state correctly', () => {
    const initialState = sdk.state.getState();
    expect(initialState.count).toBe(0);

    sdk.state.setState({ count: 5 });
    
    const updatedState = sdk.state.getState();
    expect(updatedState.count).toBe(5);
  });
});
```

### 2. Component Testing

```tsx
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';

const TestApp = () => {
  const sdk = createTestSDK();
  
  return (
    <SDKProvider config={{ initialState: { count: 0 } }} sdk={sdk}>
      <PluginRenderer pluginName="counter-plugin" />
    </SDKProvider>
  );
};

test('should render plugin component', () => {
  render(<TestApp />);
  
  expect(screen.getByText(/counter/i)).toBeInTheDocument();
});

test('should handle plugin interactions', () => {
  render(<TestApp />);
  
  const incrementButton = screen.getByText(/increment/i);
  fireEvent.click(incrementButton);
  
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

## Real-World Scenarios

### 1. E-commerce Dashboard

```tsx
// Product management plugin
const ProductManagementPlugin = createPlugin({
  name: 'product-management',
  version: '2.1.0',
  dependencies: ['auth-plugin'],
  component: ({ sdk }) => {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
        
        // Update global state
        sdk.state.setState(prev => ({
          ...prev,
          products: data,
          lastProductSync: new Date()
        }));
      } catch (error) {
        sdk.lifecycle.emit('error', error, 'product-loading');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <h3>Product Management</h3>
        <button onClick={loadProducts} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Products'}
        </button>
        <div>Products: {products.length}</div>
      </div>
    );
  }
});

// Analytics plugin
const AnalyticsPlugin = createPlugin({
  name: 'analytics-plugin',
  version: '1.5.0',
  dependencies: ['product-management'],
  component: ({ sdk }) => {
    const [metrics, setMetrics] = React.useState({});

    React.useEffect(() => {
      return sdk.state.subscribe((newState, prevState) => {
        // Track product views
        if (newState.products && newState.products !== prevState.products) {
          const metrics = calculateProductMetrics(newState.products);
          setMetrics(metrics);
          
          // Send to analytics service
          sendAnalytics('product_metrics', metrics);
        }
      });
    }, [sdk]);

    return (
      <div>
        <h3>Analytics Dashboard</h3>
        <div>Total Products: {metrics.total}</div>
        <div>Categories: {metrics.categories}</div>
        <div>Average Price: ${metrics.avgPrice}</div>
      </div>
    );
  }
});
```

### 2. Admin Panel with Role-Based Access

```tsx
const AdminPanelPlugin = createPlugin({
  name: 'admin-panel',
  version: '1.0.0',
  dependencies: ['auth-plugin'],
  component: ({ sdk }) => {
    const [state] = useSDKState();
    const [activeTab, setActiveTab] = React.useState('users');

    // Check user permissions
    const hasPermission = (permission: string) => {
      return state.user?.permissions?.includes(permission);
    };

    if (!hasPermission('admin_access')) {
      return (
        <div style={{ color: 'red' }}>
          Access denied. Administrator privileges required.
        </div>
      );
    }

    return (
      <div>
        <h3>Admin Panel</h3>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('users')}
            style={{ backgroundColor: activeTab === 'users' ? '#007bff' : '#f8f9fa' }}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            style={{ backgroundColor: activeTab === 'settings' ? '#007bff' : '#f8f9fa' }}
          >
            Settings
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            style={{ backgroundColor: activeTab === 'logs' ? '#007bff' : '#f8f9fa' }}
          >
            Logs
          </button>
        </div>

        {activeTab === 'users' && hasPermission('manage_users') && (
          <PluginRenderer pluginName="user-management-plugin" />
        )}
        
        {activeTab === 'settings' && hasPermission('manage_settings') && (
          <PluginRenderer pluginName="settings-plugin" />
        )}
        
        {activeTab === 'logs' && hasPermission('view_logs') && (
          <PluginRenderer pluginName="audit-logs-plugin" />
        )}
      </div>
    );
  }
});
```

These examples demonstrate the flexibility and power of the React SDK Manager for building complex, modular applications with dynamic plugin systems. 