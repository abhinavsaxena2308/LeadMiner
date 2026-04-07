import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { validateApifyKey } from '../services/apify';

interface ApiKeyContextType {
  apiKey: string | null;
  isValidating: boolean;
  error: string | null;
  saveApiKey: (key: string) => Promise<boolean>;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('apify_api_key');
    if (storedKey) {
      setApiKeyState(storedKey);
    }
    setIsInitialized(true);
  }, []);

  const saveApiKey = async (key: string): Promise<boolean> => {
    setIsValidating(true);
    setError(null);
    try {
      const isValid = await validateApifyKey(key);
      if (isValid) {
        localStorage.setItem('apify_api_key', key);
        setApiKeyState(key);
        setIsValidating(false);
        return true;
      } else {
        setError('Invalid API Key. Please check and try again.');
        setIsValidating(false);
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate API Key');
      setIsValidating(false);
      return false;
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('apify_api_key');
    setApiKeyState(null);
  };

  if (!isInitialized) return null;

  return (
    <ApiKeyContext.Provider value={{ apiKey, isValidating, error, saveApiKey, clearApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
