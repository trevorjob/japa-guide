'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface RoadmapWizardProps {
  countryCode: string;
}

export default function RoadmapWizard({ countryCode }: RoadmapWizardProps) {
  const router = useRouter();

  const handleClose = () => {
    router.push(`/?country=${countryCode}`);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary dark:bg-dark-bg-primary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="fixed top-6 right-6 p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress Bar */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-md">
        <div className="text-sm text-center text-text-tertiary mb-2">Step 1 of 5</div>
        <div className="h-1 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
            initial={{ width: '0%' }}
            animate={{ width: '20%' }}
          />
        </div>
      </div>

      {/* Content */}
      <motion.div
        className="max-w-2xl mx-auto text-center space-y-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-4xl font-bold mb-4">
            You selected 🇨🇦 {countryCode.toUpperCase()}
          </h1>
          <p className="text-xl text-text-secondary">What's your goal?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '💼', label: 'Work' },
            { icon: '🎓', label: 'Study' },
            { icon: '👨‍👩‍👧', label: 'Family' }
          ].map((option) => (
            <motion.button
              key={option.label}
              className="p-8 rounded-2xl bg-bg-secondary dark:bg-dark-bg-secondary border-2 border-transparent hover:border-accent-primary transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-5xl mb-4">{option.icon}</div>
              <div className="text-lg font-semibold">{option.label}</div>
            </motion.button>
          ))}
        </div>

        <button className="px-8 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold rounded-full text-lg hover:shadow-card-hover transition-shadow">
          Continue →
        </button>
      </motion.div>
    </motion.div>
  );
}
