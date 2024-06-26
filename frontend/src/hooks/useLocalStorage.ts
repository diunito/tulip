import { useState } from 'react';
import { Settings } from '../types';

export function useLocalStorage<K extends keyof Settings>(key: K, initialValue: Settings[K]) {
  const [storedValue, setStoredValue] = useState<Settings[K]>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: Settings[K]) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}