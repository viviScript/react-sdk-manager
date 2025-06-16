import React from 'react';
import {
  SDKProvider,
  useSDK,
  useSDKState,
  createPlugin,
  PluginRenderer,
  PluginManagerComponent
} from '../src';

/**
 * 🚀 React SDK Manager 基础示例
 * 
 * 这个示例展示了如何快速上手使用 React SDK Manager：
 * 1. 设置 SDK 提供器
 * 2. 创建简单的插件
 * 3. 管理全局状态
 * 4. 渲染插件组件
 */

// 1️⃣ 创建一个简单的计数器插件
const 简单计数器插件 = createPlugin({
  name: 'simple-counter',
  version: '1.0.0',
  component: () => {
    const [state, setState] = useSDKState();
    const count = state.count || 0;

    // 增加计数
    const 增加 = () => {
      setState(prev => ({ ...prev, count: (prev.count || 0) + 1 }));
    };

    // 减少计数
    const 减少 = () => {
      setState(prev => ({ ...prev, count: Math.max(0, (prev.count || 0) - 1) }));
    };

    return (
      <div style={{
        padding: '20px',
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
      }}>
        <h3 style={{ color: '#1e40af', margin: '0 0 15px 0' }}>
          🔢 智能计数器
        </h3>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          margin: '20px 0',
          color: '#1e3a8a'
        }}>
          {count}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={减少}
            disabled={count <= 0}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '8px',
              background: count <= 0 ? '#e5e7eb' : '#ef4444',
              color: 'white',
              cursor: count <= 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ➖ 减少
          </button>
          <button
            onClick={增加}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '8px',
              background: '#10b981',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ➕ 增加
          </button>
        </div>
        <p style={{ 
          marginTop: '15px', 
          color: '#64748b', 
          fontSize: '14px' 
        }}>
          {count === 0 && '👋 点击按钮开始计数'}
          {count > 0 && count < 10 && '🌟 做得不错！'}
          {count >= 10 && count < 50 && '🎯 越来越厉害了！'}
          {count >= 50 && '🏆 你太棒了！'}
        </p>
      </div>
    );
  },
  // 插件生命周期钩子
  hooks: {
    onMount: () => {
      console.log('🎉 计数器插件已挂载！');
    },
         onStateChange: (state) => {
       console.log('📊 状态已更新:', state);
     }
  }
});

// 2️⃣ 创建一个问候语插件
const 问候语插件 = createPlugin({
  name: 'greeting',
  version: '1.0.0',
  component: () => {
    const [state, setState] = useSDKState();
    const userName = state.userName || '';

    const 更新姓名 = (event) => {
      setState(prev => ({ ...prev, userName: event.target.value }));
    };

    const 获取问候语 = () => {
      if (!userName) return '👋 请输入您的姓名';
      const hour = new Date().getHours();
      if (hour < 12) return `🌅 早上好，${userName}！`;
      if (hour < 18) return `☀️ 下午好，${userName}！`;
      return `🌙 晚上好，${userName}！`;
    };

    return (
      <div style={{
        padding: '20px',
        border: '2px solid #10b981',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
      }}>
        <h3 style={{ color: '#059669', margin: '0 0 15px 0' }}>
          👋 智能问候
        </h3>
        <div style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          margin: '15px 0',
          color: '#065f46',
          textAlign: 'center'
        }}>
          {获取问候语()}
        </div>
        <div style={{ marginTop: '15px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#374151',
            fontWeight: '500'
          }}>
            请输入您的姓名：
          </label>
          <input
            type="text"
            value={userName}
            onChange={更新姓名}
            placeholder="在这里输入您的姓名..."
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              transition: 'border-color 0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#10b981'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>
      </div>
    );
  }
});

// 3️⃣ 主应用组件
const MyApp = () => {
  const sdk = useSDK();
  const [state] = useSDKState();

  // 注册插件
  React.useEffect(() => {
    const 初始化插件 = async () => {
      try {
        await sdk.plugins.register(简单计数器插件);
        await sdk.plugins.register(问候语插件);
        console.log('✅ 所有插件注册成功！');
      } catch (error) {
        console.error('❌ 插件注册失败:', error);
      }
    };

    初始化插件();
  }, [sdk]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* 头部 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '40px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            margin: '0', 
            fontSize: '2.5rem', 
            fontWeight: '800' 
          }}>
            🚀 React SDK Manager
          </h1>
          <p style={{ 
            margin: '10px 0 0 0', 
            fontSize: '1.2rem', 
            opacity: 0.9 
          }}>
            基础示例演示
          </p>
        </div>

        {/* 内容区域 */}
        <div style={{ padding: '30px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '25px'
          }}>
            <PluginRenderer pluginName="greeting" />
            <PluginRenderer pluginName="simple-counter" />
          </div>

          {/* 状态信息 */}
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ 
              margin: '0 0 15px 0', 
              color: '#374151' 
            }}>
              📊 当前状态信息
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px'
            }}>
              <div>
                <strong>用户姓名:</strong> {state.userName || '未设置'}
              </div>
              <div>
                <strong>计数值:</strong> {state.count || 0}
              </div>
              <div>
                <strong>插件数量:</strong> {sdk.plugins?.getAll()?.length || 0}
              </div>
            </div>
          </div>

          {/* 使用提示 */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #f59e0b'
          }}>
            <p style={{ 
              margin: '0', 
              color: '#92400e',
              fontSize: '14px'
            }}>
              💡 <strong>提示:</strong> 打开浏览器控制台可以看到插件的生命周期日志。
              这个示例展示了基本的插件创建、状态管理和组件渲染功能。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4️⃣ 应用入口
const BasicExample = () => {
  // SDK 配置
  const sdkConfig = {
    name: 'React SDK Manager 基础示例',
    version: '1.0.0',
    debug: true, // 启用调试模式
    initialState: {
      count: 0,
      userName: ''
    },
    persist: true, // 启用状态持久化
    persistKey: 'basic-example-state'
  };

  return (
    <SDKProvider 
      config={sdkConfig}
      onError={(error) => {
        console.error('💥 SDK 错误:', error);
        // 在实际应用中，这里可以集成错误监控服务
      }}
      onInitialized={(sdk) => {
        console.log('🎉 SDK 初始化完成!', sdk.getInfo());
      }}
    >
      <MyApp />
    </SDKProvider>
  );
};

export default BasicExample;

/**
 * 🎓 学习要点:
 * 
 * 1. **插件创建**: 使用 createPlugin() 创建功能插件
 * 2. **状态管理**: 使用 useSDKState() 管理全局状态
 * 3. **插件注册**: 在组件中注册和管理插件
 * 4. **生命周期**: 利用插件钩子监听状态变化
 * 5. **渲染插件**: 使用 PluginRenderer 渲染插件组件
 * 
 * 📚 下一步学习:
 * - 查看 complete-demo.tsx 了解更高级的功能
 * - 研究 plugin-patterns.tsx 学习不同的插件模式
 * - 参考 advanced-usage.md 了解企业级用法
 */ 