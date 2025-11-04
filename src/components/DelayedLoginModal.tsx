'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AuthModal from './AuthModal';
import GoogleLoginButton from './GoogleLoginButton';

// Define the showLoginPopup and showRegisterPopup function types globally
declare global {
  interface Window {
    showLoginPopup?: () => void;
    showRegisterPopup?: () => void;
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function DelayedLoginModal() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);
  const pathname = usePathname();

  // Don't show the modal on auth-related pages
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  // Initialize Google Sign-In
  useEffect(() => {
    if (isAuthenticated || isAuthPage) return;
    
    // Load Google SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-client-script';
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && !isAuthenticated) {
        setShowGoogleLogin(true);
      }
    };

    return () => {
      // Cleanup
      const existingScript = document.getElementById('google-client-script');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, [isAuthenticated, isAuthPage]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (response.ok && data.isAuthenticated && data.user) {
          setIsAuthenticated(true);
          // Clear any existing popup functions
          if (window.showLoginPopup) {
            window.showLoginPopup = undefined;
          }
          if (window.showRegisterPopup) {
            window.showRegisterPopup = undefined;
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Only proceed if auth check is complete and user is not authenticated
    if (!authChecked || isAuthenticated || isAuthPage) {
      return;
    }

    // Initialize showLoginPopup function
    window.showLoginPopup = () => {
      setAuthMode('login');
      setShowAuthModal(true);
    };

    // Initialize showRegisterPopup function
    window.showRegisterPopup = () => {
      setAuthMode('register');
      setShowAuthModal(true);
    };

    return () => {
      // Cleanup
      if (window.showLoginPopup) {
        window.showLoginPopup = undefined;
      }
      if (window.showRegisterPopup) {
        window.showRegisterPopup = undefined;
      }
    };
  }, [isAuthenticated, authChecked, isAuthPage]);

  // Don't render anything if authenticated or on auth pages
  if (isAuthenticated || !authChecked || isAuthPage) {
    return null;
  }

  return (
    <>
    <AuthModal 
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      initialMode={authMode}
    />
    </>
  );
} 