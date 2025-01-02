import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    
    // Override console.error to suppress ResizeObserver errors
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
  }

  static getDerivedStateFromError(error) {
    // If the error is a ResizeObserver error, don't update state
    if (error.message && error.message.includes('ResizeObserver')) {
      return null;
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Only log non-ResizeObserver errors
    if (!error.message?.includes('ResizeObserver')) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#666'
        }}>
          Something went wrong. Please try refreshing the page.
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
