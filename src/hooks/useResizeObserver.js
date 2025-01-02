import { useEffect } from 'react';

export const useResizeObserver = () => {
  useEffect(() => {
    // Store the original console.error
    const originalError = console.error;

    // Create a custom error handler
    const customErrorHandler = (...args) => {
      // Check if any argument contains the ResizeObserver error
      const isResizeObserverError = args.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('ResizeObserver') || 
         arg.includes('ResizeObserver loop completed with undelivered notifications'))
      );

      // Only call original error if it's not a ResizeObserver error
      if (!isResizeObserverError) {
        originalError.apply(console, args);
      }
    };

    // Override console.error
    console.error = customErrorHandler;

    // Cleanup
    return () => {
      console.error = originalError;
    };
  }, []);
};
