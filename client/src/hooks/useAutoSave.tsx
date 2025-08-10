import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AutoSaveOptions {
  intakeFormId?: string;
  data: any;
  section: string;
  debounceMs?: number;
  intervalMs?: number;
  enabled?: boolean;
}

interface AutoSaveState {
  isDirty: boolean;
  isAutoSaving: boolean;
  lastSavedAt: string | null;
  hasUnsavedChanges: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  error: string | null;
}

export function useAutoSave({
  intakeFormId,
  data,
  section,
  debounceMs = 2000,
  intervalMs = 30000,
  enabled = true,
}: AutoSaveOptions) {
  const [state, setState] = useState<AutoSaveState>({
    isDirty: false,
    isAutoSaving: false,
    lastSavedAt: null,
    hasUnsavedChanges: false,
    saveStatus: 'idle',
    error: null,
  });

  const dataRef = useRef(data);
  const lastSavedDataRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const isOnlineRef = useRef(navigator.onLine);

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async ({ data: saveData, section: saveSection }: { data: any; section: string }) => {
      if (!intakeFormId) throw new Error('No intake form ID');
      
      return apiRequest('POST', `/api/intake-forms/${intakeFormId}/save`, {
        section: saveSection,
        data: saveData,
      });
    },
    onMutate: () => {
      setState(prev => ({
        ...prev,
        isAutoSaving: true,
        saveStatus: 'saving',
        error: null,
      }));
    },
    onSuccess: () => {
      lastSavedDataRef.current = { ...dataRef.current };
      setState(prev => ({
        ...prev,
        isDirty: false,
        isAutoSaving: false,
        hasUnsavedChanges: false,
        lastSavedAt: new Date().toISOString(),
        saveStatus: 'saved',
        error: null,
      }));
    },
    onError: (error: any) => {
      setState(prev => ({
        ...prev,
        isAutoSaving: false,
        saveStatus: isOnlineRef.current ? 'error' : 'offline',
        error: error.message || 'Failed to auto-save',
      }));
    },
  });

  // Check if data has changed
  const isDirty = useCallback(() => {
    if (!lastSavedDataRef.current) return true;
    return JSON.stringify(dataRef.current) !== JSON.stringify(lastSavedDataRef.current);
  }, []);

  // Perform auto-save
  const performAutoSave = useCallback(() => {
    if (!enabled || !intakeFormId || !isOnlineRef.current) return;
    
    if (isDirty() && !autoSaveMutation.isPending) {
      autoSaveMutation.mutate({ data: dataRef.current, section });
    }
  }, [enabled, intakeFormId, section, isDirty, autoSaveMutation]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, debounceMs);
  }, [performAutoSave, debounceMs]);

  // Manual save function
  const manualSave = useCallback(async () => {
    if (!enabled || !intakeFormId) return;
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    return autoSaveMutation.mutateAsync({ data: dataRef.current, section });
  }, [enabled, intakeFormId, section, autoSaveMutation]);

  // Update data ref and trigger dirty state check
  useEffect(() => {
    const previousData = dataRef.current;
    const dataString = JSON.stringify(data);
    const prevDataString = JSON.stringify(previousData);
    
    // Only update if data actually changed
    if (dataString !== prevDataString) {
      dataRef.current = data;
      
      const currentlyDirty = !lastSavedDataRef.current || 
        JSON.stringify(data) !== JSON.stringify(lastSavedDataRef.current);
      
      setState(prev => ({
        ...prev,
        isDirty: currentlyDirty,
        hasUnsavedChanges: currentlyDirty,
      }));

      // Trigger debounced auto-save if data changed and is dirty
      if (currentlyDirty && enabled) {
        debouncedAutoSave();
      }
    }
  }, [data, enabled, debouncedAutoSave]);

  // Set up interval-based auto-save
  useEffect(() => {
    if (!enabled || !intakeFormId) return;

    intervalRef.current = setInterval(() => {
      performAutoSave();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intakeFormId, performAutoSave, intervalMs]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      setState(prev => ({
        ...prev,
        saveStatus: prev.saveStatus === 'offline' ? 'idle' : prev.saveStatus,
      }));
      
      // Attempt to save when coming back online
      if (isDirty()) {
        performAutoSave();
      }
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      setState(prev => ({
        ...prev,
        saveStatus: 'offline',
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isDirty, performAutoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    manualSave,
    isOnline: isOnlineRef.current,
  };
}