'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Animated Loading Spinner
export const Spinner = ({ className }: { className?: string }) => {
  return (
    <motion.div
      className={cn('w-8 h-8', className)}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
    >
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="url(#gradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="100%" stopColor="var(--accent-secondary)" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};

// Passport Flipping Loader
export const PassportLoader = () => {
  return (
    <motion.div
      className="text-6xl"
      animate={{ rotateY: [0, 180, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      📖
    </motion.div>
  );
};

// Plane Flying Loader
export const PlaneLoader = () => {
  return (
    <motion.div
      className="text-4xl"
      animate={{ x: [-20, 20], y: [-5, 5] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    >
      ✈️
    </motion.div>
  );
};

// Skeleton Loader with Shimmer
export const Skeleton = ({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'text' | 'circle';
}) => {
  const variantStyles = {
    default: 'rounded-lg',
    text: 'rounded h-4',
    circle: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[var(--bg-tertiary)]',
        variantStyles[variant],
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
};

// Card Skeleton
export const CardSkeleton = () => {
  return (
    <div className="rounded-3xl p-6 bg-white dark:bg-[var(--bg-secondary)]">
      <Skeleton className="w-full h-48 mb-4" />
      <Skeleton variant="text" className="w-3/4 mb-2" />
      <Skeleton variant="text" className="w-full mb-2" />
      <Skeleton variant="text" className="w-2/3" />
    </div>
  );
};

// Progress Bar
interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar = ({ progress, showLabel = true, className }: ProgressBarProps) => {
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">Progress</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{progress}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// Full Page Loading
export const FullPageLoader = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)]">
      <PassportLoader />
      <p className="mt-4 text-lg text-[var(--text-secondary)] animate-pulse">{message}</p>
    </div>
  );
};

// Loading Dots
export const LoadingDots = () => {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-accent-primary"
          animate={{ y: [0, -10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default {
  Spinner,
  PassportLoader,
  PlaneLoader,
  Skeleton,
  CardSkeleton,
  ProgressBar,
  FullPageLoader,
  LoadingDots,
};
