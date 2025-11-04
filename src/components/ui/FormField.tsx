import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  icon?: ReactNode;
  hint?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type,
  placeholder,
  required = false,
  icon,
  hint
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-purple-200 flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full p-3 rounded-lg bg-indigo-800/50 border border-purple-500/40 text-white placeholder:text-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-colors duration-200 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100 [&::-webkit-datetime-edit]:text-white [&::-webkit-datetime-edit-fields-wrapper]:text-white [&::-webkit-datetime-edit-text]:text-purple-300"
      />
      {hint && (
        <p className="text-xs text-purple-300/70 mt-1">{hint}</p>
      )}
    </div>
  );
};

export default FormField;