'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { RadioGroup, Button, Input } from '@/components/ui';

interface CostCalculatorProps {
  countryCode: string;
}

export default function CostCalculator({ countryCode }: CostCalculatorProps) {
  const router = useRouter();
  const [duration, setDuration] = useState(24);
  const [budget, setBudget] = useState('15000');
  const [purpose, setPurpose] = useState('study');

  const handleClose = () => {
    router.push(`/?country=${countryCode}`);
  };

  // Mock calculations
  const calculations = {
    total: 52340,
    breakdown: {
      visa: 1350,
      tuition: 30000,
      housing: 28800,
      living: 19200,
      buffer: 10400
    },
    hidden: [
      { item: 'Deposit', cost: 2400 },
      { item: 'Furniture', cost: 1500 },
      { item: 'Winter gear', cost: 500 }
    ],
    savingsPlan: 4333
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-overlay-dim backdrop-blur-xl" 
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-4xl h-[600px] glass-heavy rounded-2xl shadow-float overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glass-border">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-xl font-bold">Cost Calculator: {countryCode.toUpperCase()}</h2>
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
        <div className="flex h-[calc(100%-80px)]">
          {/* Left: Inputs */}
          <div className="w-1/3 p-6 border-r border-glass-border overflow-y-auto">
            <h3 className="font-semibold mb-4">Inputs</h3>

            <div className="space-y-6">
              <div>
                <label className="text-sm text-text-secondary block mb-2">Duration (months)</label>
                <input
                  type="range"
                  min="6"
                  max="48"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-accent-primary"
                />
                <div className="text-right text-sm font-semibold mt-1">{duration} months</div>
              </div>

              <div>
                <label className="text-sm text-text-secondary block mb-3">Purpose</label>
                <RadioGroup
                  value={purpose}
                  onChange={setPurpose}
                  options={[
                    { value: 'work', label: 'Work', icon: '💼' },
                    { value: 'study', label: 'Study', icon: '🎓' },
                    { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
                  ]}
                />
              </div>

              <Input
                label="Current Budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="15000"
              />

              <Button variant="primary" className="w-full">
                Calculate
              </Button>
            </div>
          </div>

          {/* Right: Results */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Total */}
              <div>
                <div className="text-sm text-text-tertiary mb-1">Estimated Total</div>
                <div className="text-4xl font-bold text-accent-primary">
                  ${calculations.total.toLocaleString()}
                </div>
              </div>

              {/* Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-text-secondary mb-3">Cost Breakdown</h4>
                <div className="space-y-3">
                  {Object.entries(calculations.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="capitalize">{key}:</span>
                      <span className="font-semibold">${value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Costs */}
              <div className="p-4 bg-accent-primary/10 rounded-xl">
                <h4 className="text-sm font-semibold mb-2">💡 Hidden Costs</h4>
                <ul className="space-y-1 text-sm">
                  {calculations.hidden.map((item) => (
                    <li key={item.item}>
                      • {item.item}: ${item.cost.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Savings Plan */}
              <div className="p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl">
                <h4 className="text-sm font-semibold mb-2">Your Savings Plan</h4>
                <p className="text-2xl font-bold text-accent-primary">
                  ${calculations.savingsPlan.toLocaleString()}/month
                </p>
                <p className="text-sm text-text-tertiary mt-1">for 12 months</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
