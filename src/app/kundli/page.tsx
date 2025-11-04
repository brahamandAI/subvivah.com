'use client';

import { useState, useEffect } from 'react';
import StaticKundli from '@/components/StaticKundli';
import KundliGenerator from '@/components/KundliGenerator';
import { ZodiacProvider } from '@/context/ZodiacContext';

export default function KundliPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ZodiacProvider>
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950">
        {isAuthenticated ? <KundliGenerator /> : <StaticKundli />}
      </div>
    </ZodiacProvider>
  );
}