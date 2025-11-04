'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

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
    setNewPassword(value);
    validatePassword(value);
  };

  // Timer for resend functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendCode = async () => {
    setLoading(true);
    setMessage('');
    setCanResend(false);
    setResendTimer(60); // 60 seconds cooldown

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ New verification code sent! Check your email (including spam folder)');
        setIsSuccess(true);
      } else {
        setMessage(data.error || 'Failed to send verification code');
        setIsSuccess(false);
        setCanResend(true);
        setResendTimer(0);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setIsSuccess(false);
      setCanResend(true);
      setResendTimer(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Verification code sent! Check your email (including spam folder)');
        setIsSuccess(true);
        setStep('otp');
        setResendTimer(60); // Start 60-second timer
        setCanResend(false);
      } else {
        setMessage(data.error || 'Failed to send verification code');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password requirements
    if (!validatePassword(newPassword)) {
      setMessage('Password must be at least 8 characters long and contain at least one letter, one number, and one special character');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password has been reset successfully!');
        setStep('success');
        // Show login popup after 3 seconds
        setTimeout(() => {
          if (typeof window !== 'undefined' && typeof (window as any).showLoginPopup === 'function') {
            (window as any).showLoginPopup();
          }
        }, 3000);
      } else {
        setMessage(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-purple-600/30 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-purple-200" />
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm sm:text-base text-purple-200">
          {step === 'email' 
            ? "Enter your email address and we'll send you a verification code."
            : step === 'otp'
            ? 'Enter the verification code sent to your email and set your new password.'
            : 'Password reset successful!'}
        </p>
        
        {/* Spam Check Reminder */}
        {step === 'otp' && (
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-200 mb-1">
                  Can't find the email?
                </h4>
                <div className="text-xs text-yellow-300 space-y-1">
                  <p>• Check your <strong>spam/junk folder</strong></p>
                  <p>• Look for emails from <strong>subvivah.com@gmail.com</strong></p>
                  <p>• The email might take a few minutes to arrive</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 w-full max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-sm py-6 sm:py-8 px-4 sm:px-10 shadow rounded-lg">
          {step === 'email' ? (
            <form className="space-y-5 sm:space-y-6" onSubmit={handleEmailSubmit}>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2.5 sm:py-3 border border-purple-500/30 rounded-lg bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your email"
                  />
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
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>

              <div className="text-center">
                <Link 
                  href="/"
                  className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </form>
          ) : step === 'otp' ? (
            <form className="space-y-5 sm:space-y-6" onSubmit={handleOtpSubmit}>
              <div>
                <label htmlFor="otp" className="block text-sm sm:text-base font-medium text-purple-200">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none block w-full px-3 py-2.5 sm:py-3 border border-purple-500/30 rounded-lg bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base text-center tracking-[0.5em]"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                
                {/* Email Delivery Help */}
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs text-blue-300">
                      <p>📧 Check your <strong>inbox, spam, and junk folders</strong></p>
                      <p>⏱️ Email may take 2-5 minutes to arrive</p>
                      <p>🔍 Look for emails from <strong>subvivah.com@gmail.com</strong></p>
                    </div>
                  </div>
                </div>
              </div>

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
                    required
                    value={newPassword}
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
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

              <div className="text-center space-y-3">
                <Link 
                  href="/"
                  className="block text-sm text-purple-300 hover:text-purple-200 transition-colors"
                >
                  Back to Home
                </Link>
                
                {/* Resend Code Button */}
                <div className="flex flex-col items-center space-y-2">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loading}
                      className="flex items-center space-x-2 text-sm text-purple-300 hover:text-purple-200 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend code</span>
                    </button>
                  ) : (
                    <div className="text-xs text-purple-400">
                      Resend available in {resendTimer}s
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setMessage('');
                      setOtp('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setResendTimer(0);
                      setCanResend(false);
                    }}
                    className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    Use different email
                  </button>
                </div>
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
                  href="/"
                  className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 