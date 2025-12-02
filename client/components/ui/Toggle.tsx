'use client';

import { Switch, Field, Label, Description } from '@headlessui/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle = ({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleProps) => {
  return (
    <Field className={cn('flex items-center justify-between', className)}>
      <div className="flex-1">
        {label && (
          <Label className="text-sm font-medium text-[var(--text-primary)]">
            {label}
          </Label>
        )}
        {description && (
          <Description className="text-sm text-[var(--text-secondary)]">
            {description}
          </Description>
        )}
      </div>
      
      <Switch
        checked={enabled}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-from)] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          enabled
            ? 'bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)]'
            : 'bg-[var(--bg-tertiary)]'
        )}
      >
        <motion.span
          layout
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow-lg',
            'transition-transform duration-200'
          )}
          animate={{ x: enabled ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </Switch>
    </Field>
  );
};

Toggle.displayName = 'Toggle';
