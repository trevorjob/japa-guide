'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SearchOverlayProps {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleCountryClick = (countryCode: string) => {
    router.push(`/?country=${countryCode.toLowerCase()}`);
    onClose();
  };

  // Mock data - will be replaced with API call
  const recentCountries = [
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  ];

  const popularCountries = [
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
  ];

  const regions = ['Europe', 'North America', 'Asia', 'Africa', 'Oceania', 'South America'];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-overlay-dim backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Search Panel */}
      <motion.div
        className="relative w-full max-w-2xl mx-4 glass-heavy rounded-2xl shadow-float overflow-hidden"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-glass-border">
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <input
            type="text"
            placeholder="Search countries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-lg text-text-primary placeholder:text-text-tertiary"
            autoFocus
          />

          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {!query && (
            <>
              {/* Recent */}
              {recentCountries.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary mb-3">Recent</h3>
                  <div className="space-y-1">
                    {recentCountries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => handleCountryClick(country.code)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors text-left"
                      >
                        <span className="text-2xl">{country.flag}</span>
                        <span className="text-text-primary">{country.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-3">Popular</h3>
                <div className="space-y-1">
                  {popularCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountryClick(country.code)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors text-left"
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <span className="text-text-primary">{country.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Regions */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-3">Browse by Region</h3>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <button
                      key={region}
                      className="px-4 py-2 rounded-full bg-bg-secondary dark:bg-dark-bg-secondary hover:bg-accent-primary hover:text-white transition-colors text-sm"
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {query && (
            <div className="text-center text-text-tertiary py-8">
              Search results will appear here...
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
