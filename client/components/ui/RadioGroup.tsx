'use client';

import {
  RadioGroup as HeadlessRadioGroup,
  Radio,
  Field,
  Label,
  Description,
} from '@headlessui/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const RadioGroup = ({
  value,
  onChange,
  options,
  label,
  disabled = false,
  className,
}: RadioGroupProps) => {
  return (
    <Field className={cn('w-full', className)}>
      {label && (
        <Label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
          {label}
        </Label>
      )}
      
      <HeadlessRadioGroup value={value} onChange={onChange} disabled={disabled}>
        <div className="space-y-2">
          {options.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              className={({ checked, focus }) =>
                cn(
                  'relative flex cursor-pointer rounded-xl px-5 py-4',
                  'transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  checked
                    ? 'glass-heavy ring-2 ring-accent-primary shadow-lg'
                    : 'glass hover:ring-1 hover:ring-accent-primary/30'
                )
              }
            >
              {({ checked }) => (
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    {option.icon && (
                      <div className="mr-3 text-xl">{option.icon}</div>
                    )}
                    <div className="flex flex-col">
                      <Label
                        as="span"
                        className={cn(
                          'text-sm font-medium',
                          checked ? 'text-accent-primary' : 'text-text-primary'
                        )}
                      >
                        {option.label}
                      </Label>
                      {option.description && (
                        <Description
                          as="span"
                          className="text-sm text-[var(--text-secondary)]"
                        >
                          {option.description}
                        </Description>
                      )}
                    </div>
                  </div>

                  <motion.div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2',
                      'transition-colors duration-200',
                      checked
                        ? 'border-accent-primary bg-accent-primary'
                        : 'border-glass-border'
                    )}
                    animate={{ scale: checked ? 1 : 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    {checked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-2 w-2 rounded-full bg-white"
                      />
                    )}
                  </motion.div>
                </div>
              )}
            </Radio>
          ))}
        </div>
      </HeadlessRadioGroup>
    </Field>
  );
};

RadioGroup.displayName = 'RadioGroup';
