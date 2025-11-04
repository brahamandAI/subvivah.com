'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    if (!token) {
      setMessage('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      letter: /[a-zA-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordRequirements(requirements);
    return Object.values(requirements).every(Boolean);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, newPassword: value }));
    validatePassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!token) {
      setMessage('Invalid reset link. Please request a new password reset.');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password requirements
    if (!validatePassword(formData.newPassword)) {
      setMessage('Password must be at least 8 characters long and contain at least one letter, one number, and one special character');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password has been reset successfully!');
        setIsSuccess(true);
        // Show login popup after 3 seconds
        setTimeout(() => {
          if (typeof window !== 'undefined' && typeof (window as any).showLoginPopup === 'function') {
            (window as any).showLoginPopup();
          }
        }, 3000);
      } else {
        setMessage(data.error || 'Failed to reset password');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-red-600/30 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-red-200" />
          </div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white">
            Invalid Reset Link
          </h2>
          <p className="mt-2 text-center text-sm sm:text-base text-purple-200">
            This password reset link is invalid or has expired.
          </p>
          
          <div className="mt-8 w-full max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-sm py-6 sm:py-8 px-4 sm:px-10 shadow rounded-lg text-center">
              <p className="text-purple-200 mb-6">
                Please request a new password reset link.
              </p>
              <Link 
                href="/forgot-password"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-purple-600/30 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-purple-200" />
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm sm:text-base text-purple-200">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 w-full max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-sm py-6 sm:py-8 px-4 sm:px-10 shadow rounded-lg">
          {!isSuccess ? (
            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="newPassword" className="block text-sm sm:text-base font-medium text-purple-200">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-purple-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.newPassword}
                    onChange={handlePasswordChange}
                    className="appearance-none block w-full pl-10 pr-10 py-2.5 sm:py-3 border border-purple-500/30 rounded-lg bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-purple-400" />
                    )}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {(!passwordRequirements.length || !passwordRequirements.letter || 
                  !passwordRequirements.number || !passwordRequirements.special) && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-purple-300">Password must contain:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {!passwordRequirements.length && (
                        <div className="flex items-center gap-1 text-pink-400">
                          <span>•</span>
                          At least 8 characters
                        </div>
                      )}
                      {!passwordRequirements.letter && (
                        <div className="flex items-center gap-1 text-pink-400">
                          <span>•</span>
                          At least one letter
                        </div>
                      )}
                      {!passwordRequirements.number && (
                        <div className="flex items-center gap-1 text-pink-400">
                          <span>•</span>
                          At least one number
                        </div>
                      )}
                      {!passwordRequirements.special && (
                        <div className="flex items-center gap-1 text-pink-400">
                          <span>•</span>
                          At least one special character
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm sm:text-base font-medium text-purple-200">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-purple-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-10 py-2.5 sm:py-3 border border-purple-500/30 rounded-lg bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-purple-400" />
                    )}
                  </button>
                </div>
              </div>

              {message && (
                <div 
                  className={`text-sm sm:text-base text-center ${
                    isSuccess ? 'text-green-400' : 'text-pink-400'
                  }`}
                >
                  {message}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-purple-900 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 sm:space-y-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-600/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Password Reset Successful!</h3>
                <p className="text-purple-200 text-sm">
                  Your password has been updated successfully. You will be redirected to the login page shortly.
                </p>
              </div>

              <div className="text-center">
                <Link 
                  href="/login" 
                  className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
                >
                  Go to login now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 