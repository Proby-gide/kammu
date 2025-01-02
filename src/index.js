import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Suppress ResizeObserver errors globally
const originalError = console.error;
console.error = (...args) => {
  if (
    args.length > 0 &&
    typeof args[0] === 'string' &&
    (args[0].includes('ResizeObserver loop') ||
     args[0].includes('ResizeObserver loop completed with undelivered notifications.'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
