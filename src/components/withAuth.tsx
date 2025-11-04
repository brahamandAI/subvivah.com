'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/user';

export default function withAuth<P extends { user?: User }>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuth(props: Omit<P, 'user'>) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/auth/me');
          const data = await response.json();
          
          if (response.ok && data.isAuthenticated && data.user) {
            setIsAuthenticated(true);
            setUser(data.user);
          } else {
            setIsAuthenticated(false);
            setUser(null);
            // Show register popup first instead of login popup
            if (typeof window !== 'undefined' && window.showRegisterPopup) {
              window.showRegisterPopup();
            }
          }
        } catch (error) {
          console.error('Auth check error:', error);
          setIsAuthenticated(false);
          setUser(null);
          // Show register popup first instead of login popup
          if (typeof window !== 'undefined' && window.showRegisterPopup) {
            window.showRegisterPopup();
          }
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...(props as P)} user={user as User} />;
  };
} 