import React from 'react';
import { cn } from '@/utils/cn';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  className,
  children,
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children || (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(error && 'border-red-500 focus-visible:ring-red-500')}
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  error?: string;
  className?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  error,
  className,
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={cn(
          'flex w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          error && 'border-red-500 focus-visible:ring-red-500'
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
