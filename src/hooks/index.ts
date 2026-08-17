/**
 * Custom Hooks
 * 
 * This file contains reusable React hooks for common functionality
 * like fetching data, managing local storage, and handling effects.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from '@/utils/helpers';

/**
 * Hook for managing local storage
 * @param key - Storage key
 * @param initialValue - Initial value
 * @returns [value, setValue]
 */
export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading from localStorage for key "${key}":`, error);
      }
      isInitialized.current = true;
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error writing to localStorage for key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
};

/**
 * Hook for handling window resize
 * @param callback - Callback function
 * @param delay - Debounce delay
 */
export const useWindowResize = (callback: () => void, delay: number = 200) => {
  useEffect(() => {
    const debouncedCallback = debounce(callback, delay);

    window.addEventListener('resize', debouncedCallback);
    return () => window.removeEventListener('resize', debouncedCallback);
  }, [callback, delay]);
};

/**
 * Hook for handling outside clicks
 * @param ref - Ref to element
 * @param callback - Callback function
 */
export const useOutsideClick = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
};

/**
 * Hook for managing focus trap
 * @param ref - Ref to element
 */
export const useFocusTrap = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        ref.current?.dispatchEvent(new KeyboardEvent('escape'));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ref]);
};

/**
 * Hook for managing async state
 * @param asyncFunction - Async function to execute
 * @param immediate - Execute immediately
 */
export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err as E);
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};

/**
 * Hook for debounced value
 * @param value - Value to debounce
 * @param delay - Debounce delay
 */
export const useDebouncedValue = <T,>(value: T, delay: number = 500) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for previous value
 * @param value - Current value
 */
export const usePrevious = <T,>(value: T) => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // eslint-disable-next-line react-hooks/refs
  return ref.current;
};

/**
 * Hook for toggle state
 * @param initialValue - Initial value
 */
export const useToggle = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle] as const;
};
