'use client';

import {
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
  Description,
} from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Dialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}: DialogProps) => {
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw] min-h-[95vh]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <HeadlessDialog
          static
          open={isOpen}
          onClose={onClose}
          className="relative z-50"
        >
          {/* Backdrop */}
          <DialogBackdrop
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Full-screen container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
              className={cn(
                'relative w-full rounded-2xl glass-heavy p-6',
                'shadow-2xl',
                sizeStyles[size],
                className
              )}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className={cn(
                  'absolute right-4 top-4 rounded-full p-2',
                  'hover:bg-[var(--bg-secondary)] transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-from)]'
                )}
              >
                <svg
                  className="h-5 w-5 text-[var(--text-secondary)]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Header */}
              {(title || description) && (
                <div className="mb-6">
                  {title && (
                    <DialogTitle className="text-2xl font-bold text-[var(--text-primary)]">
                      {title}
                    </DialogTitle>
                  )}
                  {description && (
                    <Description className="mt-2 text-sm text-[var(--text-secondary)]">
                      {description}
                    </Description>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-8rem)]">
                {children}
              </div>
            </DialogPanel>
          </div>
        </HeadlessDialog>
      )}
    </AnimatePresence>
  );
};

Dialog.displayName = 'Dialog';
