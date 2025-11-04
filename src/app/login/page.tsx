'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Heart, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
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

      // Login successful - redirect to profile
      router.push('/profile');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-purple-600/30 rounded-full flex items-center justify-center">
          <div className="relative">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-purple-200" />
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm sm:text-base text-purple-200">
          Continue your journey to find your perfect match
        </p>
      </div>

      <div className="mt-8 w-full max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-sm py-6 sm:py-8 px-4 sm:px-10 shadow rounded-lg">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm sm:text-base font-medium text-purple-200">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 sm:py-3 border border-purple-500/30 rounded-lg bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm sm:text-base font-medium text-purple-200">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 sm:py-3 border border-purple-500/30 rounded-lg bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm sm:text-base text-center text-pink-400">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-500/30 rounded bg-white/5"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-purple-200">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  href="/forgot-password" 
                  className="font-medium text-purple-300 hover:text-purple-200 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-purple-900 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-purple-200">
              Don't have an account?{" "}
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined' && typeof (window as any).showRegisterPopup === 'function') {
                    (window as any).showRegisterPopup();
                  }
                }}
                className="font-medium text-purple-300 hover:text-purple-200 transition-colors"
              >
                Create one now
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <Link 
              href="/" 
              className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 