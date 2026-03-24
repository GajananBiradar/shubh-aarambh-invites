import { useEffect } from 'react';

interface UseFormPersistenceProps {
  storageKey: string;
  data: Record<string, any>;
  onRestore: (data: Record<string, any>) => void;
}

/**
 * Hook to persist form data to localStorage and restore it on mount
 */
export const useFormPersistence = ({
  storageKey,
  data,
  onRestore,
}: UseFormPersistenceProps) => {
  // Restore data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        onRestore(parsedData);
      } catch (error) {
        console.error('Failed to parse persisted form data:', error);
      }
    }
  }, [storageKey, onRestore]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [storageKey, data]);
};

/**
 * Clear persisted form data
 */
export const clearFormPersistence = (storageKey: string) => {
  localStorage.removeItem(storageKey);
};
