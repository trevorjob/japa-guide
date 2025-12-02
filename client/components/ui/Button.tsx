'use client';

import { Button as HeadlessButton } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  magnetic?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  magnetic = false,
  disabled = false,
  className,
  children,
  onClick,
  type = 'button',
}: ButtonProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-white shadow-glow-primary hover:shadow-glow-primary',
    secondary: 'glass border-2 border-[var(--primary-from)] hover:bg-[var(--primary-from)]/10',
    ghost: 'hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--primary-from)]',
    accent:
      'bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] text-white shadow-glow-accent',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <HeadlessButton
      disabled={disabled}
      onClick={onClick}
      type={type}
      className="relative"
    >
      <motion.div
        className={cn(
          'relative overflow-hidden rounded-full font-semibold transition-all duration-300',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-from)] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'group',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        animate={{ x: magnetic ? position.x : 0, y: magnetic ? position.y : 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      >
        {/* Shine effect on hover */}
        {variant === 'primary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Content */}
        <span className="relative z-10">{children}</span>
      </motion.div>
    </HeadlessButton>
  );
};

Button.displayName = 'Button';
