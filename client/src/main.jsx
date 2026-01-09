import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import './i18n/i18n';
import './styles/global.css';

// Wrapper component to handle idle timeout
function IdleTimeoutWrapper({ children }) {
  useIdleTimeout();
  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <IdleTimeoutWrapper>
            <App />
          </IdleTimeoutWrapper>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
