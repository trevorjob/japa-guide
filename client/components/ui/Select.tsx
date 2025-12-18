'use client';

import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Field,
  Label,
  Description,
} from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Select = ({
  value,
  onChange,
  options,
  label,
  description,
  placeholder = 'Select an option',
  disabled = false,
  className,
}: SelectProps) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Field className={cn('w-full', className)}>
      {label && (
        <Label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          {label}
        </Label>
      )}
      
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <div className="relative">
            <ListboxButton
              className={cn(
                'relative w-full cursor-pointer rounded-xl border-2 bg-bg-secondary',
                'border-glass-border py-3 pl-4 pr-10 text-left',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors duration-200',
                open && 'border-accent-primary'
              )}
            >
              <span className="flex items-center gap-2">
                {selectedOption?.icon}
                <span className="block truncate">
                  {selectedOption?.label || placeholder}
                </span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <motion.svg
                  className="h-5 w-5 text-[var(--text-secondary)]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              </span>
            </ListboxButton>

            <AnimatePresence>
              {open && (
                <ListboxOptions
                  static
                  as={motion.ul}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    'absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl',
                    'glass-heavy',
                    'py-1 shadow-xl',
                    'focus:outline-none'
                  )}
                >
                  {options.map((option) => (
                    <ListboxOption
                      key={option.value}
                      value={option.value}
                      className={({ focus, selected }) =>
                        cn(
                          'relative cursor-pointer select-none py-3 pl-4 pr-10',
                          'transition-colors duration-150',
                          focus && 'bg-accent-primary/10',
                          selected && 'bg-accent-primary/20'
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <span
                              className={cn(
                                'block truncate',
                                selected ? 'font-semibold' : 'font-normal'
                              )}
                            >
                              {option.label}
                            </span>
                          </div>
                          {selected && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-accent-primary">
                              <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              )}
            </AnimatePresence>
          </div>
        )}
      </Listbox>

      {description && (
        <Description className="mt-2 text-sm text-[var(--text-secondary)]">
          {description}
        </Description>
      )}
    </Field>
  );
};

Select.displayName = 'Select';
