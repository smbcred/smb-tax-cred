import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  data: any;
  progress?: number;
}

export interface UseLoadingStatesOptions {
  initialLoading?: boolean;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export function useLoadingStates(options: UseLoadingStatesOptions = {}) {
  const {
    initialLoading = false,
    timeout = 30000,
    retries = 2,
    retryDelay = 1000
  } = options;

  const [states, setStates] = useState<Record<string, LoadingState>>({});
  const timeoutRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const retryCounters = useRef<Record<string, number>>({});

  // Set loading state for a specific key
  const setLoading = useCallback((key: string, loading: boolean, progress?: number) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: loading,
        progress,
        error: loading ? null : prev[key]?.error || null
      }
    }));

    // Clear timeout when loading starts
    if (loading && timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
    }

    // Set timeout for loading operations
    if (loading && timeout > 0) {
      timeoutRefs.current[key] = setTimeout(() => {
        setError(key, new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    }
  }, [timeout]);

  // Set error state for a specific key
  const setError = useCallback((key: string, error: Error | null) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        error,
        progress: undefined
      }
    }));

    // Clear timeout
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }
  }, []);

  // Set data and clear loading state
  const setData = useCallback((key: string, data: any) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        error: null,
        data,
        progress: undefined
      }
    }));

    // Clear timeout and retry counter
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }
    delete retryCounters.current[key];
  }, []);

  // Execute async operation with loading state management
  const execute = useCallback(async <T>(
    key: string,
    operation: () => Promise<T>,
    options?: {
      onProgress?: (progress: number) => void;
      onRetry?: (attempt: number) => void;
    }
  ): Promise<T> => {
    const { onProgress, onRetry } = options || {};
    
    setLoading(key, true);
    retryCounters.current[key] = retryCounters.current[key] || 0;

    try {
      // Handle progress updates
      if (onProgress) {
        onProgress(0);
        setStates(prev => ({
          ...prev,
          [key]: { ...prev[key], progress: 0 }
        }));
      }

      const result = await operation();
      setData(key, result);
      return result;
    } catch (error) {
      const currentRetries = retryCounters.current[key] || 0;
      
      if (currentRetries < retries) {
        retryCounters.current[key] = currentRetries + 1;
        onRetry?.(currentRetries + 1);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * (currentRetries + 1)));
        
        // Recursive retry
        return execute(key, operation, options);
      } else {
        setError(key, error as Error);
        throw error;
      }
    }
  }, [setLoading, setData, setError, retries, retryDelay]);

  // Get loading state for a specific key
  const getState = useCallback((key: string): LoadingState => {
    return states[key] || {
      isLoading: initialLoading,
      error: null,
      data: null
    };
  }, [states, initialLoading]);

  // Check if any operation is loading
  const isAnyLoading = useCallback(() => {
    return Object.values(states).some(state => state.isLoading);
  }, [states]);

  // Clear all states
  const clearAll = useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};
    retryCounters.current = {};
    setStates({});
  }, []);

  // Clear specific state
  const clear = useCallback((key: string) => {
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }
    delete retryCounters.current[key];
    
    setStates(prev => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  return {
    execute,
    setLoading,
    setError,
    setData,
    getState,
    isAnyLoading,
    clear,
    clearAll,
    states
  };
}

// Specific hooks for common loading scenarios
export function useApiCall<T = any>() {
  const { execute, getState } = useLoadingStates();
  
  const call = useCallback(async (
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    return execute(endpoint, async () => {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    });
  }, [execute]);

  return { call, getState };
}

export function useFormSubmission() {
  const { execute, getState } = useLoadingStates();
  
  const submit = useCallback(async <T = any>(
    formId: string,
    submitFn: () => Promise<T>
  ): Promise<T> => {
    return execute(`form_${formId}`, submitFn);
  }, [execute]);

  return { submit, getState };
}

export function useFileUpload() {
  const { execute, getState, setLoading } = useLoadingStates();
  
  const upload = useCallback(async (
    file: File,
    uploadFn: (file: File, onProgress: (progress: number) => void) => Promise<any>
  ) => {
    const key = `upload_${file.name}`;
    
    return execute(key, () => uploadFn(file, (progress) => {
      setLoading(key, true, progress);
    }), {
      onProgress: (progress) => {
        setLoading(key, true, progress);
      }
    });
  }, [execute, setLoading]);

  return { upload, getState };
}

export function useCalculation() {
  const { execute, getState } = useLoadingStates();
  
  const calculate = useCallback(async <T = any>(
    calculationType: string,
    calculationFn: () => Promise<T>
  ): Promise<T> => {
    return execute(`calc_${calculationType}`, calculationFn);
  }, [execute]);

  return { calculate, getState };
}

export function usePayment() {
  const { execute, getState } = useLoadingStates();
  
  const processPayment = useCallback(async <T = any>(
    paymentId: string,
    paymentFn: () => Promise<T>
  ): Promise<T> => {
    return execute(`payment_${paymentId}`, paymentFn, {
      onRetry: (attempt) => {
        if (import.meta.env.DEV) console.debug(`Payment retry attempt ${attempt} for ${paymentId}`);
      }
    });
  }, [execute]);

  return { processPayment, getState };
}

// Global loading state manager for app-wide loading indicators
class GlobalLoadingManager {
  private listeners: Set<(loading: boolean) => void> = new Set();
  private loadingOperations: Set<string> = new Set();

  subscribe(listener: (loading: boolean) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  startLoading(operationId: string) {
    this.loadingOperations.add(operationId);
    this.notifyListeners();
  }

  stopLoading(operationId: string) {
    this.loadingOperations.delete(operationId);
    this.notifyListeners();
  }

  isLoading() {
    return this.loadingOperations.size > 0;
  }

  private notifyListeners() {
    const isLoading = this.isLoading();
    this.listeners.forEach(listener => listener(isLoading));
  }
}

export const globalLoadingManager = new GlobalLoadingManager();

export function useGlobalLoading() {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const unsubscribe = globalLoadingManager.subscribe(setIsLoading);
    return unsubscribe;
  }, []);

  const startGlobalLoading = useCallback((operationId: string) => {
    globalLoadingManager.startLoading(operationId);
  }, []);

  const stopGlobalLoading = useCallback((operationId: string) => {
    globalLoadingManager.stopLoading(operationId);
  }, []);

  return {
    isLoading,
    startGlobalLoading,
    stopGlobalLoading
  };
}