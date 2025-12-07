'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui';
import GlassButton from '@/components/ui/GlassButton';
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/countries', label: 'Countries' },
  { href: '/roadmap', label: 'Roadmaps' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/stories', label: 'Stories' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, logout } = useAuthStore();

  // Hide navbar when drawer or chat is open
  const selectedCountry = searchParams?.get('country');
  const chatOpen = searchParams?.get('chat') === 'true';
  const shouldHide = selectedCountry || chatOpen;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (shouldHide) return null;

  return (
    // <motion.div
    //   className="fixed top-6 right-6 z-10"
    //   initial={{ opacity: 0, y: -20 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   exit={{ opacity: 0, y: -20 }}
    //   transition={{ duration: 0.5 }}
    // >
    //   {isAuthenticated ? (
    //     <div className="flex items-center gap-3">
    //       <span className="text-sm text-text-secondary hidden md:block">
    //         {user?.username}
    //       </span>
    //       <GlassButton onClick={logout} className="md:px-5 md:py-1.5 px-3 py-1 text-sm md:text-base">
    //         <span className="hidden md:inline">Logout</span>
    //         <span className="md:hidden">↪</span>
    //       </GlassButton>
    //     </div>
    //   ) : (
    //     <GlassButton href="/login" className="md:px-5 md:py-1.5 px-3 py-1 text-sm md:text-base">
    //       <span className="hidden md:inline">Get Started</span>
    //       <span className="md:hidden">→</span>
    //     </GlassButton>
    //   )}
      
    // </motion.div>
    <></>

  );
}
