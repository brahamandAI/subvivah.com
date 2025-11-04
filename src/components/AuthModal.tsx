'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, X, Sparkles, Eye, EyeOff, User, Calendar, Phone } from 'lucide-react';
import styles from './AuthModal.module.css';
import GoogleLoginButton from './GoogleLoginButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    letter: false,
    number: false,
    special: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Update mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phone: '',
  });

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      letter: /[a-zA-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setPasswordRequirements(requirements);

    const missingRequirements = [];
    if (!requirements.length) {
      missingRequirements.push('At least 8 characters');
    }
    if (!requirements.letter) {
      missingRequirements.push('At least one letter');
    }
    if (!requirements.number) {
      missingRequirements.push('At least one number');
    }
    if (!requirements.special) {
      missingRequirements.push('At least one special character');
    }
    
    return missingRequirements.length > 0 ? missingRequirements.join(', ') : '';
  };

  const handleModeSwitch = () => {
    setIsFlipping(true);
    setShowContent(false);
    setTimeout(() => {
      setMode(mode === 'login' ? 'register' : 'login');
      setShowContent(true);
      setIsFlipping(false);
    }, 300);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (registerData.password !== registerData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      const passwordValidationError = validatePassword(registerData.password);
      if (passwordValidationError) {
        alert(passwordValidationError);
        return;
      }

      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const registerDataResponse = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerDataResponse.error || 'Registration failed');
      }

      // Auto-login after successful registration
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const loginDataResponse = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginDataResponse.error || 'Auto-login failed');
      }

      alert('Registration successful! Welcome to शुभ विवाह!');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
      window.location.reload();
    } catch (error) {
      console.error('Registration/Login error:', error);
      alert(error instanceof Error ? error.message : 'Registration failed. Please try again.');
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

        {/* Modal Content with Flip Animation */}
        <div className={`relative transform overflow-hidden shadow-xl transition-all w-[95%] sm:w-full sm:max-w-md z-[60] ${styles['auth-modal']} ${isFlipping ? styles['animate-flip'] : ''}`}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-2 sm:right-2 bg-transparent rounded-full p-2 sm:p-1.5 shadow-lg text-gray-200 hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-90 hover:bg-pink-50 z-10 border border-purple-900/30"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          {/* Header */}
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="relative">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-pink-400" />
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {mode === 'login' ? 'Welcome Back' : 'Join शुभ विवाह'}
            </h2>
            <p className="mt-2 text-purple-200 text-sm">
              {mode === 'login' 
                ? 'Continue your journey to find your perfect match'
                : 'Start your journey to find your perfect match'
              }
            </p>
          </div>

          <div className="py-6 px-4 sm:rounded-2xl sm:px-8">
            <div className="space-y-5">
              {showContent ? (
                <>
                  {/* Login Form */}
                  {mode === 'login' && (
                    <form className="space-y-4" onSubmit={handleLoginSubmit}>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-purple-100 mb-1">
                          Email address
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-purple-300" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            className="appearance-none block w-full pl-10 px-3 py-2 border border-purple-700/40 rounded-lg bg-transparent text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-purple-100 mb-1">
                          Password
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-purple-300" />
                          </div>
                          <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            className="appearance-none block w-full pl-10 px-3 py-2 border border-purple-700/40 rounded-lg bg-transparent text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
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
                            className="h-4 w-4 text-pink-400 focus:ring-pink-400 border-purple-700/40 rounded"
                          />
                          <label htmlFor="remember-me" className="ml-2 block text-sm text-purple-200">
                            Remember me
                          </label>
                        </div>

                        <div className="text-sm">
                          <button
                            onClick={() => {
                              onClose();
                              window.location.href = '/forgot-password';
                            }}
                            className="font-medium text-pink-300 hover:text-pink-200 transition-colors"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium gradient-btn ${styles['gradient-btn']} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                      </div>
                      
                      <div className="mt-6">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-purple-400/30"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gradient-to-br from-purple-900 to-purple-800 text-purple-200">
                              Or continue with
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <GoogleLoginButton />
                        </div>
                      </div>
                    </form>
                  )}
                  {/* Register Form */}
                  {mode === 'register' && (
                    <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-purple-100 mb-1">
                            First Name *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-purple-300" />
                            </div>
                            <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              value={registerData.firstName}
                              onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                              className="appearance-none block w-full pl-10 px-3 py-2 border border-purple-700/40 rounded-lg bg-transparent text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-purple-100 mb-1">
                            Last Name *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-purple-300" />
                            </div>
                            <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              value={registerData.lastName}
                              onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                              className="appearance-none block w-full pl-10 px-3 py-2 border border-purple-700/40 rounded-lg bg-transparent text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="registerEmail" className="block text-sm font-medium text-purple-100 mb-1">
                          Email *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-purple-300" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="registerEmail"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            className="appearance-none block w-full pl-10 px-3 py-2 border border-purple-700/40 rounded-lg bg-transparent text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-purple-100 mb-1">
                            Date of Birth *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Calendar className="h-5 w-5 text-purple-300" />
                            </div>
                            <input
                              type="date"
                              name="dateOfBirth"
                              id="dateOfBirth"
                              value={registerData.dateOfBirth}
                              onChange={(e) => setRegisterData({ ...registerData, dateOfBirth: e.target.value })}
                              className="appearance-none block w-full pl-10 px-3 py-2 border border-purple-700/40 rounded-lg bg-transparent text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-purple-100 mb-1">
                            Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-5 w-5 text-purple-300" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              value={registerData.phone}
                              onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                              className="appearance-none block w-full pl-10 px-3 py-2 border border-purple-700/40 rounded-lg bg-transparent text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="registerPassword" className="block text-sm font-medium text-purple-100 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-purple-300" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            id="registerPassword"
                            value={registerData.password}
                            onChange={(e) => {
                              setRegisterData({ ...registerData, password: e.target.value });
                              const error = validatePassword(e.target.value);
                              setPasswordError(error);
                            }}
                            className="appearance-none block w-full pl-10 pr-10 py-2 border border-purple-700/40 rounded-lg bg-transparent text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-purple-300" />
                            ) : (
                              <Eye className="h-5 w-5 text-purple-300" />
                            )}
                          </button>
                        </div>
                        {passwordError && (
                          <p className="text-pink-400 text-xs mt-1">{passwordError}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-100 mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-purple-300" />
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            id="confirmPassword"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            className="appearance-none block w-full pl-10 pr-10 py-2 border border-purple-700/40 rounded-lg bg-transparent text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-purple-300" />
                            ) : (
                              <Eye className="h-5 w-5 text-purple-300" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={isLoading || passwordError !== ''}
                          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium gradient-btn ${styles['gradient-btn']} ${
                            isLoading || passwordError !== ''
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                      </div>
                      
                      <div className="mt-6">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-purple-400/30"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gradient-to-br from-purple-900 to-purple-800 text-purple-200">
                              Or sign up with
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <GoogleLoginButton />
                        </div>
                      </div>
                    </form>
                  )}
                  {/* Mode Switch */}
                  <div className="text-center mt-4">
                    <p className="text-sm text-purple-200">
                      {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{" "}
                      <button
                        onClick={handleModeSwitch}
                        className="font-medium text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        {mode === 'login' ? 'Create one now' : 'Sign in here'}
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[340px]">
                  <span className="relative flex items-center justify-center">
                    <Heart className="w-16 h-16 text-pink-400 animate-pulse drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 16px #f472b6)' }} />
                    <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-3 -right-3 animate-bounce" />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 