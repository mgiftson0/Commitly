'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

const toastListeners = new Set<(toast: Toast) => void>();

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...props, id };
    
    toastListeners.forEach(listener => listener(newToast));
    
    return id;
  }, []);

  return { toast, toasts };
}
