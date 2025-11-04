'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Loader2, AlertCircle } from 'lucide-react';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface ModernLocationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  success?: boolean;
  helpText?: string;
  variant?: 'default' | 'minimal' | 'glass';
  required?: boolean;
  placeholder?: string;
  countryFilter?: string;
}

export const ModernLocationInput: React.FC<ModernLocationInputProps> = ({
  label,
  value,
  onChange,
  error,
  success,
  helpText,
  variant = 'glass',
  required,
  placeholder = 'Enter location',
  countryFilter = 'in' // Default to India
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const fetchLocationSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '8',
        countrycodes: countryFilter,
        featuretype: 'city'
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      const data: LocationSuggestion[] = await response.json();
      
      // Filter and sort suggestions
      const filteredSuggestions = data
        .filter(item => item.display_name && item.type)
        .sort((a, b) => (b.importance || 0) - (a.importance || 0))
        .slice(0, 6);

      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce API calls
    timeoutRef.current = setTimeout(() => {
      fetchLocationSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    onChange(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const formatSuggestionText = (displayName: string) => {
    // Split by comma and take first 3 parts for cleaner display
    const parts = displayName.split(', ');
    return parts.slice(0, 3).join(', ');
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'city':
      case 'town':
      case 'village':
        return '🏙️';
      case 'state':
      case 'administrative':
        return '🗺️';
      case 'country':
        return '🌍';
      default:
        return '📍';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Container */}
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (value.length >= 2) {
              fetchLocationSuggestions(value);
            }
          }}
          onBlur={() => setIsFocused(false)}
          placeholder=" "
          className={`
            w-full px-4 pt-6 pb-2 pr-12 pl-12 text-white placeholder-transparent
            transition-all duration-300 ease-in-out
            focus:ring-2 focus:ring-pink-500/50 focus:outline-none
            ${getVariantStyles()}
            ${error ? 'border-red-400 focus:border-red-400 bg-red-500/10' : ''}
            ${success ? 'border-green-400 focus:border-green-400 bg-green-500/10' : ''}
            hover:shadow-xl hover:shadow-purple-500/20 hover:bg-indigo-900/50
          `}
          required={required}
          autoComplete="off"
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
          className="absolute left-12 pointer-events-none font-medium select-none"
          style={{ transformOrigin: 'left center' }}
        >
          {label}
        </motion.label>

        {/* Map Pin Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300">
          <MapPin className="w-5 h-5" />
        </div>

        {/* Right Icons */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {loading && <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />}
          {error && !loading && <AlertCircle className="w-5 h-5 text-red-400" />}
          {!loading && !error && showSuggestions && (
            <Search className="w-5 h-5 text-purple-300" />
          )}
        </div>

        {/* Focus Ring Animation */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-pink-500 opacity-0 pointer-events-none"
          animate={{ opacity: isFocused ? 0.5 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-indigo-950/95 backdrop-blur-sm border border-purple-500/70 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Solid background overlay for complete coverage */}
            <div className="absolute inset-0 bg-indigo-950/80 rounded-xl"></div>
            <div className="relative z-10 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={`${suggestion.lat}-${suggestion.lon}`}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  className={`
                    w-full px-4 py-3 text-left transition-colors flex items-center gap-3
                    ${selectedIndex === index 
                      ? 'bg-purple-600/50 text-white' 
                      : 'text-white hover:bg-purple-700/30'
                    }
                    ${index === 0 ? '' : 'border-t border-purple-500/30'}
                  `}
                >
                  <span className="text-lg">
                    {getSuggestionIcon(suggestion.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-white">
                      {formatSuggestionText(suggestion.display_name)}
                    </div>
                    <div className="text-xs text-purple-200 capitalize">
                      {suggestion.type}
                    </div>
                  </div>
                </motion.button>
                              ))}
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="relative z-10 px-4 py-3 text-center text-white text-sm border-t border-purple-500/30">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                  Searching locations...
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}; 