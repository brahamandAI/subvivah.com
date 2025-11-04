import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';

interface ModernInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  success?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  showCharCount?: boolean;
  maxLength?: number;
  skipOption?: boolean;
  onSkip?: () => void;
  helpText?: string;
  variant?: 'default' | 'minimal' | 'glass';
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  value,
  onChange,
  error,
  success,
  loading,
  icon,
  suggestions = [],
  onSuggestionClick,
  showCharCount,
  maxLength,
  skipOption,
  onSkip,
  helpText,
  variant = 'glass',
  type = 'text',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPasswordType = type === 'password';
  const hasValue = value.length > 0;
  const shouldFloat = isFocused || hasValue;

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-indigo-900/40 border-b-2 border-purple-500/50 rounded-none focus:border-pink-500 shadow-sm';
      case 'default':
        return 'bg-indigo-900/50 border border-purple-500/50 rounded-lg focus:border-pink-500 shadow-md';
      case 'glass':
      default:
        return 'bg-indigo-900/40 border border-purple-500/60 rounded-xl focus:border-pink-500 shadow-lg shadow-purple-500/10';
    }
  };

  useEffect(() => {
    if (suggestions.length > 0 && value.length > 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions, value]);

  return (
    <div className="relative w-full">
      {/* Input Container */}
      <div className="relative group">
        <input
          ref={inputRef}
          type={isPasswordType && !showPassword ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 pt-6 pb-2 pr-12 text-white placeholder-transparent
            transition-all duration-300 ease-in-out
            focus:ring-2 focus:ring-pink-500/50 focus:outline-none
            ${getVariantStyles()}
            ${error ? 'border-red-400 focus:border-red-400 bg-red-500/10' : ''}
            ${success ? 'border-green-400 focus:border-green-400 bg-green-500/10' : ''}
            ${icon ? 'pl-12' : ''}
            group-hover:shadow-xl group-hover:shadow-purple-500/20 group-hover:bg-indigo-900/50
          `}
          placeholder=" "
          maxLength={maxLength}
          {...props}
        />

        {/* Floating Label */}
        <motion.label
          initial={false}
          animate={{
            top: shouldFloat ? '0.5rem' : '50%',
            y: shouldFloat ? '0' : '-50%',
            fontSize: shouldFloat ? '0.75rem' : '1rem',
            color: isFocused 
              ? '#ec4899'  // pink-500
              : error 
                ? '#f87171'  // red-400
                : success 
                  ? '#4ade80'  // green-400
                  : shouldFloat 
                    ? '#d8b4fe'  // purple-300 when floated
                    : '#a1a1aa'  // zinc-400 when placeholder
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={`absolute pointer-events-none font-medium select-none ${icon ? 'left-12' : 'left-4'}`}
          style={{ transformOrigin: 'left center' }}
        >
          {label}
        </motion.label>

        {/* Left Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300">
            {icon}
          </div>
        )}

        {/* Right Icons */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {loading && <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />}
          {success && !loading && <Check className="w-5 h-5 text-green-400" />}
          {error && !loading && <AlertCircle className="w-5 h-5 text-red-400" />}
          {isPasswordType && !loading && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-purple-300 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Focus Ring Animation */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-pink-500 opacity-0 pointer-events-none"
          animate={{ opacity: isFocused ? 0.5 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Character Count */}
      {showCharCount && maxLength && (
        <div className="flex justify-between mt-1 text-xs">
          <span></span>
          <span className={`${value.length > maxLength * 0.9 ? 'text-yellow-400' : 'text-purple-300'}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <p className="mt-1 text-sm text-purple-300/80">{helpText}</p>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-400 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Skip Option */}
      {skipOption && (
        <motion.button
          type="button"
          onClick={onSkip}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-2 text-sm text-purple-300 hover:text-white transition-colors underline"
        >
          Skip for now
        </motion.button>
      )}

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 w-full mt-1 bg-indigo-900/95 backdrop-blur-sm border border-purple-500/70 rounded-lg shadow-2xl shadow-black/50 max-h-40 overflow-y-auto"
          >
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onSuggestionClick?.(suggestion);
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ModernSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  skipOption?: boolean;
  onSkip?: () => void;
  placeholder?: string;
  variant?: 'default' | 'minimal' | 'glass';
  required?: boolean;
}

export const ModernSelect: React.FC<ModernSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  success,
  icon,
  skipOption,
  onSkip,
  placeholder = 'Select option',
  variant = 'glass',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasValue = value.length > 0;

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-indigo-900/40 border-b-2 border-purple-500/50 rounded-none focus:border-pink-500 shadow-sm';
      case 'default':
        return 'bg-indigo-900/50 border border-purple-500/50 rounded-lg focus:border-pink-500 shadow-md';
      case 'glass':
      default:
        return 'bg-indigo-900/40 border border-purple-500/60 rounded-xl focus:border-pink-500 shadow-lg shadow-purple-500/10';
    }
  };

  return (
    <div className="relative w-full">
      {/* Select Container */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-4 pt-6 pb-2 pr-12 text-left text-white
            transition-all duration-300 ease-in-out
            focus:ring-2 focus:ring-pink-500/50 focus:outline-none
            ${getVariantStyles()}
            ${error ? 'border-red-400 focus:border-red-400 bg-red-500/10' : ''}
            ${success ? 'border-green-400 focus:border-green-400 bg-green-500/10' : ''}
            ${icon ? 'pl-12' : ''}
            hover:shadow-xl hover:shadow-purple-500/20 hover:bg-indigo-900/50
          `}
        >
          {hasValue ? options.find(opt => opt.value === value)?.label : ''}
        </button>

        {/* Floating Label */}
        <motion.label
          initial={false}
          animate={{
            top: hasValue || isOpen ? '0.5rem' : '50%',
            y: hasValue || isOpen ? '0' : '-50%',
            fontSize: hasValue || isOpen ? '0.75rem' : '1rem',
            color: isOpen 
              ? '#ec4899'  // pink-500
              : error 
                ? '#f87171'  // red-400
                : success 
                  ? '#4ade80'  // green-400
                  : hasValue || isOpen
                    ? '#d8b4fe'  // purple-300 when floated
                    : '#a1a1aa'  // zinc-400 when placeholder
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={`absolute pointer-events-none font-medium select-none ${icon ? 'left-12' : 'left-4'}`}
          style={{ transformOrigin: 'left center' }}
        >
          {label}
        </motion.label>

        {/* Left Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300">
            {icon}
          </div>
        )}

        {/* Dropdown Icon */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Dropdown Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 w-full mt-1 bg-indigo-950/95 backdrop-blur-sm border border-purple-500/70 rounded-lg shadow-2xl shadow-black/50 max-h-48 overflow-y-auto"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-3 text-left text-white hover:bg-purple-700/30 transition-colors
                  first:rounded-t-lg last:rounded-b-lg
                  ${value === option.value ? 'bg-purple-600/50 text-white' : ''}
                `}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-400 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Skip Option */}
      {skipOption && (
        <motion.button
          type="button"
          onClick={onSkip}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-2 text-sm text-purple-300 hover:text-white transition-colors underline"
        >
          Skip for now
        </motion.button>
      )}
    </div>
  );
}; 