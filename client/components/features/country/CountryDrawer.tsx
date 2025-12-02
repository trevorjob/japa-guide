'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface CountryDrawerProps {
  countryCode: string;
  isOpen: boolean;
}

export default function CountryDrawer({ countryCode, isOpen }: CountryDrawerProps) {
  const router = useRouter();

  const handleClose = () => {
    router.push('/');
  };

  const handleAction = (action: string) => {
    router.push(`/?country=${countryCode}&action=${action}`);
  };

  // Mock data - will be replaced with API call
  const countryData = {
    name: countryCode.toUpperCase(),
    flag: '🇨🇦',
    stats: {
      difficulty: '6/10',
      cost: '$$$$',
      processingTime: '6-12 months'
    },
    visaRoutes: [
      'Express Entry',
      'Provincial Nominee',
      'Study Permit'
    ]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-overlay-dim z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-bg-primary dark:bg-dark-bg-primary shadow-float z-30 overflow-y-auto"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 glass-heavy border-b border-glass-border p-6 flex items-center justify-between">
              <button
                onClick={handleClose}
                className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-3xl">{countryData.flag}</span>
                <h2 className="text-xl font-bold text-text-primary">{countryData.name}</h2>
              </div>

              <button
                onClick={handleClose}
                className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Quick Stats */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-3">Quick Stats</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4">
                    <div className="text-xs text-text-tertiary mb-1">Difficulty</div>
                    <div className="text-2xl font-bold text-text-primary">{countryData.stats.difficulty}</div>
                  </div>
                  <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4">
                    <div className="text-xs text-text-tertiary mb-1">Cost</div>
                    <div className="text-2xl font-bold text-text-primary">{countryData.stats.cost}</div>
                  </div>
                  <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4">
                    <div className="text-xs text-text-tertiary mb-1">PR Time</div>
                    <div className="text-xl font-bold text-text-primary">{countryData.stats.processingTime}</div>
                  </div>
                </div>
              </div>

              {/* Popular Visa Routes */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-3">Popular Visa Routes</h3>
                <div className="space-y-2">
                  {countryData.visaRoutes.map((route, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-3 rounded-lg border border-bg-tertiary dark:border-dark-bg-tertiary hover:border-accent-primary hover:bg-accent-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent-primary"></div>
                        <span className="text-text-primary">{route}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-3">Actions</h3>
                <div className="space-y-3">
                  <motion.button
                    onClick={() => handleAction('calculate')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold rounded-full shadow-card hover:shadow-card-hover transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Calculate Full Costs
                  </motion.button>

                  <motion.button
                    onClick={() => handleAction('roadmap')}
                    className="w-full px-6 py-3 bg-bg-secondary dark:bg-dark-bg-secondary border-2 border-accent-primary text-text-primary font-semibold rounded-full hover:bg-accent-primary hover:text-white transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Generate Roadmap
                  </motion.button>

                  <motion.button
                    onClick={() => router.push(`/?country=${countryCode}&chat=true`)}
                    className="w-full px-6 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary font-medium rounded-full hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Ask AI About {countryData.name}
                  </motion.button>

                  <button className="w-full px-6 py-3 text-text-secondary font-medium rounded-full hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors">
                    View Success Stories
                  </button>
                </div>
              </div>

              {/* Additional Info Placeholder */}
              <div className="pt-6 border-t border-bg-tertiary dark:border-dark-bg-tertiary">
                <p className="text-sm text-text-tertiary text-center">
                  Scroll for more details ↓
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
