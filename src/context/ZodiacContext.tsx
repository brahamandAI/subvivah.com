'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type KundliResult = any | null;

interface ZodiacContextType {
  result: KundliResult;
  loading: boolean;
  error: string | null;
  setResult: (result: KundliResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearResult: () => void;
}

const ZodiacContext = createContext<ZodiacContextType | undefined>(undefined);

export const ZodiacProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [result, setResult] = useState<KundliResult>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => setResult(null);

  return (
    <ZodiacContext.Provider 
      value={{ 
        result, 
        loading, 
        error, 
        setResult, 
        setLoading, 
        setError, 
        clearResult 
      }}
    >
      {children}
    </ZodiacContext.Provider>
  );
};

export const useZodiac = (): ZodiacContextType => {
  const context = useContext(ZodiacContext);
  if (context === undefined) {
    throw new Error('useZodiac must be used within a ZodiacProvider');
  }
  return context;
};