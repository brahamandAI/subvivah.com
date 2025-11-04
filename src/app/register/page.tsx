'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Heart, Sparkles, User, Phone, Calendar, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { validatePassword } from '@/lib/validation';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formStep, setFormStep] = useState(1);

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  useEffect(() => {
    const strength = getPasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const passwordValidationError = validatePassword(formData.password);
      if (passwordValidationError) {
        setError(passwordValidationError);
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

      // Show success message and redirect
      router.push('/profile');
    } catch (error) {
      console.error('Registration/Login error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (formData.firstName && formData.lastName && formData.email) {
      setFormStep(2);
    }
  };

  const prevStep = () => {
    setFormStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 via-pink-900 to-indigo-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
        <div className="w-full max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <div className="relative">
                <Heart className="w-10 h-10 text-white" />
                <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Join शुभ विवाह
            </h1>
            <p className="text-lg text-purple-200">
          Begin your journey to find your perfect match
        </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-200">Step {formStep} of 2</span>
              <span className="text-sm text-purple-200">{formStep === 1 ? 'Basic Info' : 'Account Details'}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${formStep * 50}%` }}
              ></div>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
          {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                <XCircle className="w-5 h-5" />
              {error}
            </div>
          )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Information */}
              {formStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-white mb-2">Basic Information</h2>
                    <p className="text-purple-200">Tell us about yourself</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-purple-200 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="appearance-none block w-full pl-10 px-4 py-3 border border-purple-500/30 placeholder-purple-400/50 text-white rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="First Name"
                  />
                </div>
              </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-purple-200 mb-2">
                        Last Name
                      </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="appearance-none block w-full pl-10 px-4 py-3 border border-purple-500/30 placeholder-purple-400/50 text-white rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </div>

            <div>
                    <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                      Email Address
                    </label>
              <div className="relative">
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
                        className="appearance-none block w-full pl-10 px-4 py-3 border border-purple-500/30 placeholder-purple-400/50 text-white rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-purple-200 mb-2">
                      Date of Birth
                    </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="appearance-none block w-full pl-10 px-4 py-3 border border-purple-500/30 placeholder-purple-400/50 text-white rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.firstName || !formData.lastName || !formData.email}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Account Details */}
              {formStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-white mb-2">Account Details</h2>
                    <p className="text-purple-200">Secure your account</p>
                  </div>

            <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-purple-200 mb-2">
                      Phone Number (Optional)
                    </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="appearance-none block w-full pl-10 px-4 py-3 border border-purple-500/30 placeholder-purple-400/50 text-white rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Phone Number"
                />
              </div>
            </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-purple-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={(e) => {
                          const newPassword = e.target.value;
                          setFormData({ ...formData, password: newPassword });
                          setPasswordError(validatePassword(newPassword) || '');
                        }}
                        className="appearance-none block w-full pl-10 pr-10 px-4 py-3 border border-purple-500/30 placeholder-purple-400/50 text-white rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Create a strong password"
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
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-purple-200">Password Strength:</span>
                          <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordStrength).replace('bg-', 'text-')}`}>
                            {getPasswordStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
          </div>

          <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
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
                        className="appearance-none block w-full pl-10 pr-10 px-4 py-3 border border-purple-500/30 placeholder-purple-400/50 text-white rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Confirm your password"
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
                    
                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        {formData.password === formData.confirmPassword ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-xs ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                          {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 py-3 px-4 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || passwordError !== '' || formData.password !== formData.confirmPassword}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-white/20"></div>
              <span className="px-4 text-sm text-purple-200">or</span>
              <div className="flex-1 border-t border-white/20"></div>
            </div>

            {/* Google Sign-In */}
            <div className="mb-6">
              <GoogleLoginButton />
          </div>

          {/* Login Link */}
            <div className="text-center">
            <p className="text-sm text-purple-200">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-purple-300 hover:text-purple-200 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
} 