import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 设置默认用户 ID（简化版，实际应使用 OAuth）
if (!localStorage.getItem('userId')) {
  localStorage.setItem('userId', 'demo-user-' + Date.now());
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

