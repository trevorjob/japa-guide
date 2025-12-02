'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui';

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
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass py-3 shadow-elevation'
          : 'bg-transparent py-6'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="text-2xl"
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              ✈️
            </motion.div>
            <span className="text-2xl font-bold gradient-text">Japaguide</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className="relative px-4 py-2 group">
                  <span
                    className={cn(
                      'relative z-10 transition-colors',
                      isActive
                        ? 'text-[var(--primary-from)]'
                        : 'text-[var(--text-primary)] group-hover:text-[var(--primary-from)]'
                    )}
                  >
                    {link.label}
                  </span>

                  {/* Hover background blob */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] rounded-full opacity-0 group-hover:opacity-10 blur-xl"
                    layoutId={`nav-hover-${link.href}`}
                  />

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side - Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-[var(--text-secondary)]">
                  Hi, {user?.first_name || 'User'}
                </span>
                <Button size="sm" variant="ghost" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button size="sm" variant="ghost">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <motion.span
                className="w-full h-0.5 bg-[var(--text-primary)] rounded"
                animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 8 : 0 }}
              />
              <motion.span
                className="w-full h-0.5 bg-[var(--text-primary)] rounded"
                animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
              />
              <motion.span
                className="w-full h-0.5 bg-[var(--text-primary)] rounded"
                animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -8 : 0 }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden glass mt-4 rounded-3xl mx-4 p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-xl transition-colors',
                    pathname === link.href
                      ? 'bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-white'
                      : 'hover:bg-[var(--bg-secondary)]'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-[var(--bg-tertiary)] pt-4">
                {isAuthenticated ? (
                  <Button variant="ghost" className="w-full" onClick={logout}>
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full mb-2">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
