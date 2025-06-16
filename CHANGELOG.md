# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-01-01

### Added
- Initial release of React SDK Manager
- Plugin management system with dependency resolution
- State management with persistence support
- Lifecycle hooks system
- React components and hooks integration
- TypeScript support with comprehensive type definitions
- Plugin registration and lifecycle management
- State persistence with localStorage
- Error handling and debugging support
- Higher-order components (HOCs) for easy integration
- Comprehensive test suite
- Full documentation and examples

### Features
- **PluginManager**: Register, enable/disable, and manage plugins with dependency resolution
- **StateManager**: Built-in state management with optional persistence
- **LifecycleManager**: Comprehensive lifecycle hooks system
- **SDKProvider**: React context provider for SDK access
- **PluginRenderer**: Component for rendering individual plugins
- **PluginList**: Component for rendering multiple plugins
- **React Hooks**: 
  - `useSDK()` - Access SDK instance
  - `usePlugins()` - Access plugin manager
  - `useSDKState()` - Access state management
  - `useLifecycle()` - Access lifecycle manager
  - `useSDKInfo()` - Get SDK information
- **Higher-Order Components**:
  - `withSDK()` - Inject SDK into components
  - `withPlugins()` - Inject plugin manager
  - `withState()` - Inject state management
  - `withLifecycle()` - Inject lifecycle manager
  - `withPluginGuard()` - Conditional rendering based on plugin availability
- **Utilities**:
  - `createPlugin()` - Helper for creating plugins
  - `createSDKManager()` - Factory for SDK instances
  - Plugin validation and compatibility checking
  - Dependency resolution and sorting

### Technical Details
- Full TypeScript support
- ES5 and ES2015+ compatibility
- Tree-shaking support
- Rollup-based build system
- Jest testing framework
- ESLint code quality checks
- Comprehensive error handling
- Debugging and development tools 