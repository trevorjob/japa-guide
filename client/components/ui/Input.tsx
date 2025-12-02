'use client';

import { Input as HeadlessInput, Field, Label, Description } from '@headlessui/react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps {
  label?: string;
  error?: string;
  description?: string;
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, description, className, ...props }, ref) => {
    return (
      <Field className="w-full">
        <div className="relative">
          <HeadlessInput
            ref={ref}
            className={cn(
              'peer w-full px-4 py-3 pt-6 border-2 rounded-xl',
              'bg-white dark:bg-[var(--bg-secondary)]',
              'border-[var(--bg-tertiary)] focus:border-[var(--primary-from)]',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-from)] focus-visible:ring-offset-2',
              'placeholder-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:border-red-500',
              className
            )}
            placeholder={label || ' '}
            {...props}
          />
          {label && (
            <Label
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2',
                'text-[var(--text-secondary)] transition-all duration-200',
                'pointer-events-none',
                'peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base',
                'peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--primary-from)]',
                'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs',
                error && 'peer-focus:text-red-500'
              )}
            >
              {label}
            </Label>
          )}
        </div>
        {description && !error && (
          <Description className="mt-1 text-sm text-[var(--text-secondary)]">
            {description}
          </Description>
        )}
        {error && <Description className="mt-1 text-sm text-red-500">{error}</Description>}
      </Field>
    );
  }
);

Input.displayName = 'Input';

export default Input;
