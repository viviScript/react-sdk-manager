/**
 * TypeScript Advanced Usage Examples for React SDK Manager
 * 
 * This file demonstrates advanced TypeScript patterns and type-safe usage
 * of the React SDK Manager, including generic types, strict typing, and
 * advanced plugin architectures.
 */

import React from 'react';
import { createPlugin, useSDKState, useSDK, Plugin, SDKManager } from '../src';

// ===== ADVANCED TYPE DEFINITIONS =====

// Define strict application state interface
interface StrictAppState {
  user: UserState | null;
  ui: UIState;
  data: DataState;
  settings: SettingsState;
  analytics: AnalyticsState;
}

interface UserState {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  preferences: UserPreferences;
  sessionInfo: SessionInfo;
}

interface UIState {
  theme: Theme;
  layout: Layout;
  sidebar: SidebarState;
  modals: ModalState[];
  notifications: NotificationState[];
}

interface DataState {
  entities: EntityCache;
  loading: LoadingState;
  errors: ErrorState;
  lastSync: Date | null;
}

interface SettingsState {
  general: GeneralSettings;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  advanced: AdvancedSettings;
}

interface AnalyticsState {
  events: AnalyticsEvent[];
  metrics: MetricsData;
  reports: ReportData[];
  realTime: RealTimeData;
}

// ===== ENUM TYPES =====

enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

enum Permission {
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  DELETE_USERS = 'delete:users',
  MANAGE_SYSTEM = 'manage:system',
  VIEW_ANALYTICS = 'view:analytics'
}

enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  HIGH_CONTRAST = 'high_contrast',
  CUSTOM = 'custom'
}

enum Layout {
  GRID = 'grid',
  LIST = 'list',
  KANBAN = 'kanban',
  CALENDAR = 'calendar'
}

// ===== PLUGIN CONFIGURATION TYPES =====

interface PluginConfig<T = any> {
  name: string;
  version: string;
  dependencies?: string[];
  permissions?: Permission[];
  settings?: T;
  metadata?: PluginMetadata;
}

interface PluginMetadata {
  author: string;
  description: string;
  category: PluginCategory;
  tags: string[];
  documentation?: string;
  repository?: string;
}

enum PluginCategory {
  CORE = 'core',
  UI = 'ui',
  DATA = 'data',
  ANALYTICS = 'analytics',
  INTEGRATION = 'integration',
  UTILITY = 'utility'
}

// ===== GENERIC PLUGIN CREATOR =====

/**
 * Creates a type-safe plugin with strict typing
 */
function createTypedPlugin<
  TState extends StrictAppState = StrictAppState,
  TConfig = any,
  TProps = any
>(config: {
  name: string;
  version: string;
  category?: PluginCategory;
  dependencies?: string[];
  permissions?: Permission[];
  component: React.ComponentType<{
    sdk: SDKManager;
    state: TState;
    config?: TConfig;
  } & TProps>;
  initialize?: (sdk: SDKManager) => Promise<void>;
  destroy?: (sdk: SDKManager) => Promise<void>;
  hooks?: {
    onMount?: () => void;
    onUnmount?: () => void;
    onStateChange?: (newState: TState, prevState: TState) => void;
    onError?: (error: Error, context?: string) => void;
  };
  settings?: TConfig;
}): Plugin {
  return createPlugin({
    name: config.name,
    version: config.version,
    dependencies: config.dependencies,
    component: (props) => {
      const [state] = useSDKState<TState>();
      return React.createElement(config.component, {
        ...props,
        state,
        config: config.settings
      });
    },
    initialize: config.initialize,
    destroy: config.destroy,
    hooks: config.hooks
  });
}

// ===== TYPED HOOKS =====

/**
 * Type-safe hook for accessing specific state slices
 */
function useTypedState<T extends keyof StrictAppState>(
  slice: T
): [StrictAppState[T], (updater: Partial<StrictAppState[T]> | ((prev: StrictAppState[T]) => StrictAppState[T])) => void] {
  const [state, setState] = useSDKState<StrictAppState>();
  
  const sliceState = state[slice];
  const setSliceState = React.useCallback((updater: any) => {
    setState(prev => ({
      ...prev,
      [slice]: typeof updater === 'function' ? updater(prev[slice]) : { ...prev[slice], ...updater }
    }));
  }, [setState, slice]);

  return [sliceState, setSliceState];
}

/**
 * Hook for accessing user permissions
 */
function usePermissions(): {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  userRole: UserRole | null;
} {
  const [userState] = useTypedState('user');

  return React.useMemo(() => ({
    hasPermission: (permission: Permission) => 
      userState?.permissions.includes(permission) ?? false,
    
    hasAnyPermission: (permissions: Permission[]) =>
      permissions.some(p => userState?.permissions.includes(p)) ?? false,
    
    hasAllPermissions: (permissions: Permission[]) =>
      permissions.every(p => userState?.permissions.includes(p)) ?? false,
    
    userRole: userState?.role ?? null
  }), [userState]);
}

// ===== EXAMPLE TYPED PLUGINS =====

// User Management Plugin with strict typing
const UserManagementPlugin = createTypedPlugin<StrictAppState, UserManagementConfig>({
  name: 'user-management-plugin',
  version: '2.0.0',
  category: PluginCategory.CORE,
  permissions: [Permission.READ_USERS, Permission.WRITE_USERS],
  component: ({ sdk, state, config }) => {
    const permissions = usePermissions();
    const [users, setUsers] = React.useState<UserState[]>([]);
    const [loading, setLoading] = React.useState(false);

    if (!permissions.hasPermission(Permission.READ_USERS)) {
      return React.createElement('div', { style: { color: 'red' } }, 
        'Access denied: Insufficient permissions'
      );
    }

    const createUser = async (userData: CreateUserRequest) => {
      if (!permissions.hasPermission(Permission.WRITE_USERS)) {
        throw new Error('Insufficient permissions to create user');
      }

      setLoading(true);
      try {
        const newUser = await userService.createUser(userData);
        setUsers(prev => [...prev, newUser]);
        
        // Update global state
        sdk.state.setState(prev => ({
          ...prev,
          analytics: {
            ...prev.analytics,
            events: [...prev.analytics.events, {
              type: 'user_created',
              userId: newUser.id,
              timestamp: new Date(),
              metadata: { createdBy: state.user?.id }
            }]
          }
        }));
      } finally {
        setLoading(false);
      }
    };

    return React.createElement('div', null,
      React.createElement('h3', null, 'User Management'),
      React.createElement('div', null, `Total Users: ${users.length}`),
      React.createElement('div', null, `Loading: ${loading ? 'Yes' : 'No'}`)
    );
  },
  settings: {
    maxUsers: 1000,
    autoRefresh: true,
    refreshInterval: 30000
  } as UserManagementConfig
});

// Analytics Plugin with advanced typing
const AnalyticsPlugin = createTypedPlugin<StrictAppState, AnalyticsConfig>({
  name: 'analytics-plugin',
  version: '1.5.0',
  category: PluginCategory.ANALYTICS,
  permissions: [Permission.VIEW_ANALYTICS],
  component: ({ sdk, state, config }) => {
    const [metrics, setMetrics] = React.useState<ComputedMetrics>({
      userActivity: 0,
      pageViews: 0,
      conversions: 0,
      retention: 0
    });

    React.useEffect(() => {
      const computeMetrics = (): ComputedMetrics => {
        const events = state.analytics.events;
        return {
          userActivity: events.filter(e => e.type === 'user_action').length,
          pageViews: events.filter(e => e.type === 'page_view').length,
          conversions: events.filter(e => e.type === 'conversion').length,
          retention: calculateRetention(events)
        };
      };

      setMetrics(computeMetrics());
    }, [state.analytics.events]);

    return React.createElement('div', null,
      React.createElement('h3', null, 'Analytics Dashboard'),
      Object.entries(metrics).map(([key, value]) =>
        React.createElement('div', { key }, `${key}: ${value}`)
      )
    );
  },
  hooks: {
    onStateChange: (newState, prevState) => {
      if (newState.analytics.events.length !== prevState.analytics.events.length) {
        console.log('New analytics event recorded');
      }
    }
  }
});

// ===== SERVICE LAYER WITH TYPES =====

class TypedUserService {
  async createUser(userData: CreateUserRequest): Promise<UserState> {
    // Type-safe API call
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return response.json() as Promise<UserState>;
  }

  async updateUser(id: number, updates: Partial<UserState>): Promise<UserState> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return response.json() as Promise<UserState>;
  }

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  }
}

// ===== TYPE GUARDS =====

function isUserState(obj: any): obj is UserState {
  return obj && 
    typeof obj.id === 'number' &&
    typeof obj.username === 'string' &&
    typeof obj.email === 'string' &&
    Object.values(UserRole).includes(obj.role);
}

function hasRequiredPermissions(user: UserState | null, required: Permission[]): boolean {
  if (!user) return false;
  return required.every(permission => user.permissions.includes(permission));
}

// ===== UTILITY TYPES =====

type CreateUserRequest = Omit<UserState, 'id' | 'sessionInfo'> & {
  password: string;
};

type UpdateUserRequest = Partial<Omit<UserState, 'id'>>;

interface UserManagementConfig {
  maxUsers: number;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface AnalyticsConfig {
  realTime: boolean;
  retention: number;
  sampling: number;
}

interface ComputedMetrics {
  userActivity: number;
  pageViews: number;
  conversions: number;
  retention: number;
}

// ===== HELPER FUNCTIONS =====

function calculateRetention(events: AnalyticsEvent[]): number {
  // Implementation for retention calculation
  return events.length > 0 ? 0.85 : 0;
}

// ===== ADDITIONAL TYPE DEFINITIONS =====

interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface SessionInfo {
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

interface SidebarState {
  collapsed: boolean;
  pinned: boolean;
  activeSection: string;
}

interface ModalState {
  id: string;
  type: string;
  props: any;
  visible: boolean;
}

interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface EntityCache {
  users: Record<number, UserState>;
  posts: Record<number, any>;
  comments: Record<number, any>;
}

interface LoadingState {
  global: boolean;
  users: boolean;
  posts: boolean;
  analytics: boolean;
}

interface ErrorState {
  global: Error | null;
  users: Error | null;
  posts: Error | null;
  analytics: Error | null;
}

interface GeneralSettings {
  appName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
}

interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  cookies: boolean;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
}

interface AdvancedSettings {
  debugMode: boolean;
  cacheSize: number;
  apiTimeout: number;
}

interface AnalyticsEvent {
  id: string;
  type: string;
  userId?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface MetricsData {
  daily: Record<string, number>;
  weekly: Record<string, number>;
  monthly: Record<string, number>;
}

interface ReportData {
  id: string;
  name: string;
  type: string;
  data: any;
  generated: Date;
}

interface RealTimeData {
  activeUsers: number;
  currentSessions: number;
  recentEvents: AnalyticsEvent[];
}

// ===== EXPORT INSTANCES =====

const userService = new TypedUserService();

export {
  // Types
  StrictAppState,
  UserRole,
  Permission,
  Theme,
  Layout,
  PluginCategory,
  UserManagementConfig,
  AnalyticsConfig,
  ComputedMetrics,
  CreateUserRequest,
  UpdateUserRequest,

  // Functions
  createTypedPlugin,
  useTypedState,
  usePermissions,
  isUserState,
  hasRequiredPermissions,
  calculateRetention,

  // Plugins
  UserManagementPlugin,
  AnalyticsPlugin,

  // Services
  userService
};

/**
 * Usage Example:
 * 
 * ```tsx
 * import { UserManagementPlugin, useTypedState, usePermissions } from './typescript-examples';
 * 
 * const MyApp = () => {
 *   const [userState, setUserState] = useTypedState('user');
 *   const permissions = usePermissions();
 *   
 *   return (
 *     <div>
 *       {permissions.hasPermission(Permission.READ_USERS) && (
 *         <PluginRenderer pluginName="user-management-plugin" />
 *       )}
 *     </div>
 *   );
 * };
 * ```
 */ 