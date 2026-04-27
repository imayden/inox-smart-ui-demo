import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App.jsx';
import './styles/index.css';

// React 入口：BrowserRouter 让 demo 可以用真实 URL 表达 UI 版本、物业和功能模块。
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
