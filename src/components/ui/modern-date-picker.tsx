import React from 'react';

interface ModernDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  placeholder?: string;
  error?: string;
  variant?: 'default' | 'minimal' | 'glass';
  helpText?: string;
}

export const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  required = false,
  placeholder = 'Select date',
  error,
  variant = 'glass',
  helpText,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-indigo-900/40 border-b-2 border-purple-500/50 rounded-none focus:border-pink-500 shadow-sm';
      case 'default':
        return 'bg-indigo-900/50 border border-purple-500/50 rounded-lg focus:border-pink-500 shadow-md';
      case 'glass':
      default:
        return 'bg-indigo-900/40 border border-purple-500/60 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100 [&::-webkit-datetime-edit]:text-white [&::-webkit-datetime-edit-fields-wrapper]:text-white [&::-webkit-datetime-edit-text]:text-purple-300';
    }
  };

  return (
    <div className="w-full">
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={minDate ? minDate.toISOString().slice(0, 10) : undefined}
        max={maxDate ? maxDate.toISOString().slice(0, 10) : undefined}
        required={required}
        placeholder={placeholder}
        className={`w-full px-4 py-2 text-lg text-white placeholder-purple-300 ${getVariantStyles()} ${error ? 'border-red-400 focus:border-red-400 bg-red-500/10' : ''}`}
      />
      {helpText && !error && (
        <p className="mt-1 text-sm text-purple-300/80">{helpText}</p>
      )}
    </div>
  );
}; 