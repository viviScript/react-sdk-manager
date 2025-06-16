import React from 'react';
import { createPlugin, useSDKState, useLifecycle } from '../src';

// ===== PLUGIN PATTERNS EXAMPLES =====

// 1. Simple Stateless Plugin
export const SimplePlugin = createPlugin({
  name: 'simple-plugin',
  version: '1.0.0',
  component: () => {
    return (
      <div style={{ padding: '16px', border: '1px solid #ccc' }}>
        <h3>Simple Plugin</h3>
        <p>This is a basic plugin without state or dependencies.</p>
      </div>
    );
  }
});

// 2. Stateful Plugin with Local State
export const StatefulPlugin = createPlugin({
  name: 'stateful-plugin',
  version: '1.0.0',
  component: () => {
    const [localState, setLocalState] = React.useState({ count: 0 });
    const [globalState, setGlobalState] = useSDKState();

    return (
      <div style={{ padding: '16px', border: '1px solid #ccc' }}>
        <h3>Stateful Plugin</h3>
        <p>Local Count: {localState.count}</p>
        <p>Global Count: {globalState.count || 0}</p>
        
        <button onClick={() => setLocalState(prev => ({ count: prev.count + 1 }))}>
          Increment Local
        </button>
        <button 
          onClick={() => setGlobalState(prev => ({ ...prev, count: (prev.count || 0) + 1 }))}
          style={{ marginLeft: '8px' }}
        >
          Increment Global
        </button>
      </div>
    );
  }
});

// 3. Plugin with Dependencies
export const DependentPlugin = createPlugin({
  name: 'dependent-plugin',
  version: '1.0.0',
  dependencies: ['simple-plugin'],
  component: ({ sdk }) => {
    const simplePlugin = sdk.plugins.get('simple-plugin');
    
    return (
      <div style={{ padding: '16px', border: '1px solid #ccc' }}>
        <h3>Dependent Plugin</h3>
        <p>This plugin depends on: {simplePlugin?.name}</p>
        <p>Dependency status: {simplePlugin?.enabled ? '✅ Enabled' : '❌ Disabled'}</p>
      </div>
    );
  }
});

// 4. Lazy Loaded Plugin
export const LazyPlugin = createPlugin({
  name: 'lazy-plugin',
  version: '1.0.0',
  component: React.lazy(() => 
    Promise.resolve({
      default: () => (
        <div style={{ padding: '16px', border: '1px solid #ccc' }}>
          <h3>Lazy Loaded Plugin</h3>
          <p>This plugin was loaded dynamically!</p>
        </div>
      )
    })
  ),
  initialize: async () => {
    console.log('Lazy plugin initializing...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Lazy plugin ready!');
  }
});

// 5. Error Boundary Plugin
export const ErrorBoundaryPlugin = createPlugin({
  name: 'error-boundary-plugin',
  version: '1.0.0',
  component: () => {
    const [hasError, setHasError] = React.useState(false);
    const [errorCount, setErrorCount] = React.useState(0);

    const triggerError = () => {
      setHasError(true);
      setErrorCount(prev => prev + 1);
    };

    const recover = () => {
      setHasError(false);
    };

    if (hasError) {
      return (
        <div style={{ padding: '16px', border: '2px solid #f44336', backgroundColor: '#ffebee' }}>
          <h3>❌ Plugin Error</h3>
          <p>This plugin encountered an error (#{errorCount})</p>
          <button onClick={recover}>Recover</button>
        </div>
      );
    }

    return (
      <div style={{ padding: '16px', border: '1px solid #ccc' }}>
        <h3>Error Boundary Plugin</h3>
        <p>Error count: {errorCount}</p>
        <button onClick={triggerError}>Trigger Error</button>
      </div>
    );
  },
  hooks: {
    onError: (error) => {
      console.error('Plugin error handled:', error);
    }
  }
});

// 6. Communication Plugin (Event Emitter)
export const CommunicationPlugin = createPlugin({
  name: 'communication-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    const [messages, setMessages] = React.useState<string[]>([]);
    const lifecycle = useLifecycle();

    React.useEffect(() => {
      const unsubscribe = lifecycle.on('customMessage', (message: string) => {
        setMessages(prev => [...prev, message]);
      });

      return unsubscribe;
    }, [lifecycle]);

    const sendMessage = () => {
      const message = `Message sent at ${new Date().toLocaleTimeString()}`;
      lifecycle.emit('customMessage', message);
    };

    return (
      <div style={{ padding: '16px', border: '1px solid #ccc' }}>
        <h3>Communication Plugin</h3>
        <button onClick={sendMessage}>Send Message</button>
        <div style={{ marginTop: '10px', maxHeight: '100px', overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ fontSize: '12px', padding: '2px 0' }}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    );
  }
});

// 7. Data Fetching Plugin
export const DataFetchingPlugin = createPlugin({
  name: 'data-fetching-plugin',
  version: '1.0.0',
  component: () => {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate random success/failure
        if (Math.random() > 0.3) {
          setData({
            id: Math.floor(Math.random() * 1000),
            name: `User ${Math.floor(Math.random() * 100)}`,
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error('Random API failure');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={{ padding: '16px', border: '1px solid #ccc' }}>
        <h3>Data Fetching Plugin</h3>
        
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>

        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Error: {error}
          </div>
        )}

        {data && (
          <div style={{ marginTop: '10px', backgroundColor: '#f5f5f5', padding: '8px' }}>
            <pre style={{ margin: 0, fontSize: '12px' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }
});

// 8. Form Plugin
export const FormPlugin = createPlugin({
  name: 'form-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    const [formData, setFormData] = React.useState({
      name: '',
      email: '',
      message: ''
    });
    const [submitted, setSubmitted] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Save to global state
      sdk.state.setState(prev => ({
        ...prev,
        formSubmissions: [...(prev.formSubmissions || []), {
          id: Date.now(),
          ...formData,
          timestamp: new Date()
        }]
      }));

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      
      // Reset form
      setFormData({ name: '', email: '', message: '' });
    };

    return (
      <div style={{ padding: '16px', border: '1px solid #ccc' }}>
        <h3>Form Plugin</h3>
        
        {submitted && (
          <div style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '8px', 
            marginBottom: '10px',
            borderRadius: '4px'
          }}>
            Form submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label>Name:</label><br />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={{ width: '100%', padding: '4px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label>Email:</label><br />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              style={{ width: '100%', padding: '4px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label>Message:</label><br />
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              style={{ width: '100%', padding: '4px', minHeight: '60px' }}
              required
            />
          </div>
          
          <button type="submit" style={{ 
            backgroundColor: '#4caf50', 
            color: 'white', 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Submit
          </button>
        </form>
      </div>
    );
  }
});

// 9. Chart/Visualization Plugin
export const ChartPlugin = createPlugin({
  name: 'chart-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    const [globalState] = useSDKState();
    const [chartData, setChartData] = React.useState<number[]>([10, 20, 15, 25, 30]);

    React.useEffect(() => {
      // Update chart when global counter changes
      if (globalState.count !== undefined) {
        setChartData(prev => [...prev.slice(-4), globalState.count]);
      }
    }, [globalState.count]);

    const maxValue = Math.max(...chartData);
    
    return (
      <div style={{ padding: '16px', border: '1px solid #ccc' }}>
        <h3>Chart Plugin</h3>
        <p>Data visualization of global counter</p>
        
        <div style={{ display: 'flex', alignItems: 'end', height: '100px', gap: '4px' }}>
          {chartData.map((value, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#2196f3',
                width: '20px',
                height: `${(value / maxValue) * 80 + 10}px`,
                borderRadius: '2px 2px 0 0'
              }}
              title={`Value: ${value}`}
            />
          ))}
        </div>
        
        <div style={{ fontSize: '12px', marginTop: '8px' }}>
          Latest value: {chartData[chartData.length - 1]}
        </div>
      </div>
    );
  }
});

// 10. Settings/Configuration Plugin
export const SettingsPlugin = createPlugin({
  name: 'settings-plugin',
  version: '1.0.0',
  component: ({ sdk }) => {
    const [globalState, setGlobalState] = useSDKState();
    
    const settings = globalState.settings || {
      notifications: true,
      autoSave: false,
      theme: 'light',
      language: 'en'
    };

    const updateSetting = (key: string, value: any) => {
      setGlobalState(prev => ({
        ...prev,
        settings: { ...settings, [key]: value }
      }));
    };

    return (
      <div style={{ padding: '16px', border: '1px solid #ccc' }}>
        <h3>Settings Plugin</h3>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => updateSetting('notifications', e.target.checked)}
            />
            Enable Notifications
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => updateSetting('autoSave', e.target.checked)}
            />
            Auto Save
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Theme:
            <select 
              value={settings.theme} 
              onChange={(e) => updateSetting('theme', e.target.value)}
              style={{ padding: '4px' }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="blue">Blue</option>
            </select>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Language:
            <select 
              value={settings.language} 
              onChange={(e) => updateSetting('language', e.target.value)}
              style={{ padding: '4px' }}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="zh">中文</option>
            </select>
          </label>
        </div>
      </div>
    );
  }
});

// Export all plugins for easy use
export const allPatternPlugins = [
  SimplePlugin,
  StatefulPlugin,
  DependentPlugin,
  LazyPlugin,
  ErrorBoundaryPlugin,
  CommunicationPlugin,
  DataFetchingPlugin,
  FormPlugin,
  ChartPlugin,
  SettingsPlugin
];

// Example of how to register all plugins
export const registerAllPatternPlugins = async (sdk: any) => {
  for (const plugin of allPatternPlugins) {
    try {
      await sdk.plugins.register(plugin);
      console.log(`✅ Registered plugin: ${plugin.name}`);
    } catch (error) {
      console.error(`❌ Failed to register plugin ${plugin.name}:`, error);
    }
  }
}; 