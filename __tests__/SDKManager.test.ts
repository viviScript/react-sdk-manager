import { createSDKManager, createPlugin } from '../src';

describe('SDKManager', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = createSDKManager({
      name: 'Test SDK',
      version: '1.0.0',
      debug: false,
      initialState: { count: 0 }
    });
  });

  afterEach(async () => {
    if (sdk) {
      await sdk.destroy();
    }
  });

  test('should create SDK manager with correct config', () => {
    const config = sdk.getConfig();
    expect(config.name).toBe('Test SDK');
    expect(config.version).toBe('1.0.0');
    expect(config.debug).toBe(false);
  });

  test('should initialize SDK', async () => {
    await sdk.initialize();
    const info = sdk.getInfo();
    expect(info.isInitialized).toBe(true);
    expect(info.isDestroyed).toBe(false);
  });

  test('should manage state', () => {
    const initialState = sdk.state.getState();
    expect(initialState.count).toBe(0);

    sdk.state.setState({ count: 5 });
    const newState = sdk.state.getState();
    expect(newState.count).toBe(5);
  });

  test('should register and manage plugins', async () => {
    const testPlugin = createPlugin({
      name: 'test-plugin',
      version: '1.0.0',
      enabled: true
    });

    await sdk.plugins.register(testPlugin);
    
    const plugin = sdk.plugins.get('test-plugin');
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('test-plugin');
    expect(plugin.enabled).toBe(true);

    const allPlugins = sdk.plugins.getAll();
    expect(allPlugins).toHaveLength(1);

    const enabledPlugins = sdk.plugins.getEnabled();
    expect(enabledPlugins).toHaveLength(1);
  });

  test('should handle plugin dependencies', async () => {
    const basePlugin = createPlugin({
      name: 'base-plugin',
      version: '1.0.0',
      enabled: true
    });

    const dependentPlugin = createPlugin({
      name: 'dependent-plugin',
      version: '1.0.0',
      enabled: true,
      dependencies: ['base-plugin']
    });

    await sdk.plugins.register(basePlugin);
    await sdk.plugins.register(dependentPlugin);

    const plugins = sdk.plugins.getAll();
    expect(plugins).toHaveLength(2);
  });

  test('should handle lifecycle hooks', async () => {
    const mockCallback = jest.fn();
    
    sdk.lifecycle.on('beforeMount', mockCallback);
    await sdk.initialize();
    
    expect(mockCallback).toHaveBeenCalled();
  });

  test('should handle state changes with lifecycle hooks', () => {
    const mockCallback = jest.fn();
    
    sdk.lifecycle.on('stateChange', mockCallback);
    sdk.state.setState({ count: 10 });
    
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({ count: 10 }),
      expect.objectContaining({ count: 0 })
    );
  });

  test('should throw error when initializing twice', async () => {
    await sdk.initialize();
    await expect(sdk.initialize()).rejects.toThrow('SDK is already initialized');
  });

  test('should reset SDK state', async () => {
    await sdk.initialize();
    
    sdk.state.setState({ count: 99 });
    expect(sdk.state.getState().count).toBe(99);
    
    await sdk.reset();
    expect(sdk.state.getState().count).toBe(0);
  });
}); 