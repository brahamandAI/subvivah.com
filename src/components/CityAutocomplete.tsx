import React, { useState, useRef } from 'react';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ value, onChange, required }) => {
  const [suggestions, setSuggestions] = useState<{ display_name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCities = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10`);
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (val.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      fetchCities(val);
      setShowSuggestions(true);
    }, 300);
  };

  const handleSuggestionMouseDown = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        required={required}
        placeholder="City, Area, Country"
        className="w-full p-3 rounded-lg bg-indigo-800/50 border border-purple-500/40 text-white placeholder:text-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
        onFocus={() => value.length > 1 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 bg-indigo-900 border border-purple-500/40 rounded-lg mt-1 max-h-56 overflow-y-auto shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2 cursor-pointer hover:bg-purple-800/60 text-white"
              onMouseDown={() => handleSuggestionMouseDown(s.display_name)}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
      {loading && <div className="absolute right-3 top-3 text-purple-300 text-xs">Loading...</div>}
    </div>
  );
};

export default CityAutocomplete; 