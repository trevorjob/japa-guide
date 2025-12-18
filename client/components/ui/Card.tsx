'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  variant?: 'glass' | 'elevated' | 'feature';
  hover?: boolean;
  tilt?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card = ({
  variant = 'elevated',
  hover = true,
  tilt = false,
  className,
  children,
  onClick,
}: CardProps) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((y - centerY) / centerY) * -10);
    setRotateY(((x - centerX) / centerX) * 10);
  };

  const handleMouseLeave = () => {
    if (tilt) {
      setRotateX(0);
      setRotateY(0);
    }
  };

  const variantStyles = {
    glass: 'glass',
    elevated: 'bg-bg-secondary shadow-elevation',
    feature: 'bg-bg-secondary relative',
  };

  const hoverAnimation = hover
    ? {
        y: -8,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
      }
    : {};

  return (
    <div className={cn('relative', variant === 'feature' && 'group', className)}>
      {variant === 'feature' && (
        <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
      )}

      <motion.div
        className={cn('rounded-3xl p-6 transition-shadow duration-300', variantStyles[variant])}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={hoverAnimation}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Card;
