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
      'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-lg hover:shadow-xl hover:brightness-110',
    secondary: 'glass-card border border-accent-primary/30 text-text-primary hover:border-accent-primary/50 hover:bg-accent-primary/5',
    ghost: 'hover:bg-bg-tertiary border border-transparent hover:border-glass-border text-text-primary',
    accent:
      'bg-gradient-to-r from-accent-warm to-amber-500 text-white shadow-lg hover:shadow-xl',
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
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2',
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
