'use client';

import { motion } from 'framer-motion';
import GlassSurface from '@/components/GlassSurface';
import { cn } from '@/lib/utils';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
}

export default function GlassButton({
  children,
  onClick,
  className = '',
  href,
}: GlassButtonProps) {
  const button = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{ width: 'auto' , height: 'auto' }}
    >
      <GlassSurface
        displace={15}
        distortionScale={-150}
        redOffset={5}
        greenOffset={15}
        blueOffset={25}
        brightness={60}
        opacity={0.4}
        mixBlendMode="screen"
        className={cn(
          'cursor-pointer transition-all duration-300 px-5 py-1.5',
          'hover:shadow-glow-primary flex items-center justify-center',
          'border border-white/30',
          className
        )}
      >
        <button
          onClick={onClick}
          className="font-medium text-white focus:outline-none whitespace-nowrap cursor-pointer"
        >
          {children}
        </button>
      </GlassSurface>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {button}
      </a>
    );
  }

  return button;
}
