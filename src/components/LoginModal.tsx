'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, X, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Login successful
      onClose();
      if (onSuccess) {
        onSuccess();
      }
      
      // Wait a moment for the cookie to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refresh the page to update auth state
      window.location.reload();
      
      // After reload, redirect to profile
      setTimeout(() => {
        window.location.href = '/profile';
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      alert(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Animated Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative transform overflow-hidden rounded-xl bg-white px-4 sm:px-6 pb-6 pt-5 text-left shadow-xl transition-all w-[95%] sm:w-full sm:max-w-md z-[60] login-modal">
          {/* Close Button */}
            <button
              onClick={onClose}
            className="absolute top-3 right-3 sm:top-2 sm:right-2 bg-white rounded-full p-2 sm:p-1.5 shadow-lg text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-110 hover:rotate-90 hover:bg-pink-50 z-10 border border-gray-200"
            >
            <X size={20} strokeWidth={2.5} />
            </button>

          {/* Header */}
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="relative">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-pink-600" />
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              Continue your journey to find your perfect match
            </p>
          </div>

          <div className="bg-white py-6 px-4 sm:rounded-lg sm:px-8">
            <div className="space-y-5">
              {/* Login Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="appearance-none block w-full pl-10 px-3 py-2 border border-black/50 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="appearance-none block w-full pl-10 px-3 py-2 border border-black/50 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-black/50 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <button
                      onClick={() => {
                        onClose();
                        window.location.href = '/forgot-password';
                      }}
                      className="font-medium text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-purple-900 transform hover:scale-[1.02] transition-all duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>

              {/* Register Link */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      onClose();
                      if (typeof window !== 'undefined' && typeof (window as any).showRegisterPopup === 'function') {
                        (window as any).showRegisterPopup();
                      }
                    }}
                    className="font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Create one now
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 