'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    FB: any;
  }
}

export default function FacebookLoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Facebook SDK
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v12.0',
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFacebookLogin = () => {
    setIsLoading(true);
    window.FB.login(
      async (response: any) => {
        if (response.authResponse) {
          try {
            const res = await fetch('/api/auth/facebook', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ accessToken: response.authResponse.accessToken }),
            });

            if (res.ok) {
              alert('Login successful! Redirecting to your profile...');
              window.location.href = '/profile';
            } else {
              console.error('Facebook login failed');
              alert('Failed to login with Facebook. Please try again.');
            }
          } catch (error) {
            console.error('Error during Facebook login:', error);
            alert('An error occurred during login. Please try again.');
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
          console.error('User cancelled login or did not fully authorize.');
        }
      },
      { 
        scope: 'public_profile,email',
        return_scopes: true
      }
    );
  };

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
      ) : (
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      )}
      {isLoading ? 'Connecting...' : 'Continue with Facebook'}
    </button>
  );
} 