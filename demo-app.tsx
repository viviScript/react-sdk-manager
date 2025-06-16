import React from 'react';
import { createRoot } from 'react-dom/client';
import CompleteDemoApp from './examples/complete-demo';

// Demo应用入口
const DemoApp: React.FC = () => {
  return (
    <div>
      <CompleteDemoApp />
    </div>
  );
};

// 仅在浏览器环境中运行
if (typeof window !== 'undefined') {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<DemoApp />);
  }
}

export default DemoApp; 