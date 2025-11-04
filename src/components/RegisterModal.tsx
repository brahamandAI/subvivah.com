'use client';

import { useState } from 'react';
import { X, Heart, Sparkles, Eye, EyeOff } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    letter: false,
    number: false,
    special: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      const error = validatePassword(value);
      setPasswordError(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      const passwordValidationError = validatePassword(formData.password);
      if (passwordValidationError) {
        alert(passwordValidationError);
        return;
      }

      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.error || 'Registration failed');
      }

      // Auto-login after successful registration
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.error || 'Auto-login failed');
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
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative transform overflow-hidden rounded-xl bg-white px-4 sm:px-6 pb-6 pt-5 text-left shadow-xl transition-all w-[95%] sm:w-full sm:max-w-md z-[60] register-modal text-black">
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
              Join शुभ विवाह
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              Start your journey to find your perfect match
            </p>
          </div>

          <div className="bg-white py-6 px-4 sm:rounded-lg sm:px-8 text-black">
            <div className="space-y-5">
              {/* Registration Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1 text-black">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-black/50 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1 text-black">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-black/50 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-black">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-black/50 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1 text-black">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-black/50 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 text-black">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-black/50 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-black">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        passwordError ? 'border-red-500' : 'border-black/50'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {(!passwordRequirements.length || !passwordRequirements.letter || 
                    !passwordRequirements.number || !passwordRequirements.special) && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600 text-black">Password must contain:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {!passwordRequirements.length && (
                          <div className="flex items-center gap-1 text-red-500">
                            <span>•</span>
                            At least 8 characters
                          </div>
                        )}
                        {!passwordRequirements.letter && (
                          <div className="flex items-center gap-1 text-red-500">
                            <span>•</span>
                            At least one letter
                          </div>
                        )}
                        {!passwordRequirements.number && (
                          <div className="flex items-center gap-1 text-red-500">
                            <span>•</span>
                            At least one number
                          </div>
                        )}
                        {!passwordRequirements.special && (
                          <div className="flex items-center gap-1 text-red-500">
                            <span>•</span>
                            At least one special character
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 text-black">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 pr-10 border border-black/50 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || passwordError !== ''}
                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-purple-900 transform hover:scale-[1.02] transition-all duration-200 ${
                      loading || passwordError !== ''
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </form>

              {/* Login Link */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 text-black">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      onClose();
                      if (typeof window !== 'undefined' && typeof (window as any).showLoginPopup === 'function') {
                        (window as any).showLoginPopup();
                      }
                    }}
                    className="font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Sign in here
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