import React from 'react';
import { createRoot } from 'react-dom/client';
import { App as AntApp, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import elderlyCareTheme from './theme/elderlyCareTheme';
import './theme/elderlyCare.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <ConfigProvider theme={elderlyCareTheme} componentSize="large">
    <AntApp><AuthProvider><App /></AuthProvider></AntApp>
  </ConfigProvider>
);
