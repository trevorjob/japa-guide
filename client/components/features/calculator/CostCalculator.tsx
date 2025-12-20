'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Country, CostCalculation, CostCalculatorFormData } from '@/types';
import { countryService } from '@/lib/services';

interface CostCalculatorProps {
  country: Country;
  isOpen: boolean;
  onClose: () => void;
}

export default function CostCalculator({ country, isOpen, onClose }: CostCalculatorProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<CostCalculation | null>(null);

  const [formData, setFormData] = useState<CostCalculatorFormData>({
    lifestyle: 'moderate',
    accommodation: 'studio',
    dining: 'mix',
    transportation: 'public',
    duration_months: 12,
    dependents: 0,
  });

  const calculateCosts = async () => {
    setCalculating(true);

    try {
      // Try to use backend calculation endpoint
      const result = await countryService.calculateCost(country.code, formData);
      setResults(result);
      setStep(3);
    } catch (err) {
      console.error('Backend calculation failed, using frontend fallback:', err);

      // Fallback to frontend calculation
      const baseRent = parseFloat(country.avg_rent_monthly_usd || '1000');
      const baseMeal = parseFloat(country.avg_meal_cost_usd || '15');
      const baseHealthcare = parseFloat(country.healthcare_monthly_usd || '100');

      const lifestyleMultipliers = { budget: 0.7, moderate: 1.0, comfortable: 1.4, luxury: 2.0 };
      const accommodationMultipliers = { shared: 0.5, studio: 1.0, one_bed: 1.3, two_bed: 1.7 };
      const diningMultipliers = { cook_home: 0.6, mix: 1.0, eat_out: 1.8 };
      const transportMultipliers = { public: 0.3, mix: 0.6, car: 1.2 };

      const lifestyleFactor = lifestyleMultipliers[formData.lifestyle];

      const housing = baseRent * accommodationMultipliers[formData.accommodation] * lifestyleFactor;
      const food = baseMeal * 30 * diningMultipliers[formData.dining] * lifestyleFactor * (1 + formData.dependents * 0.5);
      const transportation = 100 * transportMultipliers[formData.transportation] * lifestyleFactor;
      const utilities = 150 * lifestyleFactor;
      const healthcare = baseHealthcare * (1 + formData.dependents);
      const entertainment = 200 * lifestyleFactor;
      const visa_fees = 500;

      const total_monthly = housing + food + transportation + utilities + healthcare + entertainment;
      const total_cost = (total_monthly * formData.duration_months) + visa_fees;

      setResults({
        country: {
          code: country.code,
          name: country.name,
          currency: country.currency,
        },
        input: formData,
        breakdown: {
          housing,
          food,
          transportation,
          utilities,
          healthcare,
          entertainment,
          visa_fees,
        },
        totals: {
          monthly: total_monthly,
          total: total_cost,
          currency: country.currency,
        },
        savings_plan: {
          monthly_savings_needed: total_cost / 12,
          description: `Save $${(total_cost / 12).toFixed(2)}/month for 12 months to reach your goal`,
        },
      });
      setStep(3);
    } finally {
      setCalculating(false);
    }
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) calculateCosts();
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setResults(null);
    } else if (step === 2) setStep(1);
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
    setFormData({
      lifestyle: 'moderate',
      accommodation: 'studio',
      dining: 'mix',
      transportation: 'public',
      duration_months: 12,
      dependents: 0,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cost-calculator-backdrop"
            className="fixed inset-0 bg-overlay-dim z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="cost-calculator-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="relative w-full max-h-[100vh] bg-bg-primary dark:bg-dark-bg-primary rounded-2xl shadow-float overflow-hidden flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 glass-heavy border-b border-glass-border p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                      Cost Calculator - {country.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-accent-primary' : 'bg-bg-tertiary dark:bg-dark-bg-tertiary'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                {/* Step 1: Lifestyle & Accommodation */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Lifestyle Preferences</h3>

                      {/* Lifestyle */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-text-secondary mb-3">Lifestyle</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { value: 'budget', label: 'Budget', emoji: '💰' },
                            { value: 'moderate', label: 'Moderate', emoji: '🏠' },
                            { value: 'comfortable', label: 'Comfortable', emoji: '✨' },
                            { value: 'luxury', label: 'Luxury', emoji: '👑' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setFormData({ ...formData, lifestyle: option.value as CostCalculatorFormData['lifestyle'] })}
                              className={`p-4 rounded-xl border-2 transition-all ${formData.lifestyle === option.value
                                  ? 'border-accent-primary bg-accent-primary/10'
                                  : 'border-bg-tertiary dark:border-dark-bg-tertiary hover:border-accent-primary/50'
                                }`}
                            >
                              <div className="text-2xl mb-1">{option.emoji}</div>
                              <div className="text-sm font-medium text-text-primary">{option.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Accommodation */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-text-secondary mb-3">Accommodation</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { value: 'shared', label: 'Shared Room', emoji: '🚪' },
                            { value: 'studio', label: 'Studio', emoji: '🏢' },
                            { value: 'one_bed', label: '1 Bedroom', emoji: '🏡' },
                            { value: 'two_bed', label: '2 Bedroom', emoji: '🏘️' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setFormData({ ...formData, accommodation: option.value as CostCalculatorFormData['accommodation'] })}
                              className={`p-4 rounded-xl border-2 transition-all ${formData.accommodation === option.value
                                  ? 'border-accent-primary bg-accent-primary/10'
                                  : 'border-bg-tertiary dark:border-dark-bg-tertiary hover:border-accent-primary/50'
                                }`}
                            >
                              <div className="text-2xl mb-1">{option.emoji}</div>
                              <div className="text-sm font-medium text-text-primary">{option.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Daily Life & Duration */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Dining */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">Dining Habits</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'cook_home', label: 'Cook at Home', emoji: '🍳' },
                          { value: 'mix', label: 'Mix', emoji: '🥘' },
                          { value: 'eat_out', label: 'Eat Out', emoji: '🍽️' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setFormData({ ...formData, dining: option.value as CostCalculatorFormData['dining'] })}
                            className={`p-4 rounded-xl border-2 transition-all ${formData.dining === option.value
                                ? 'border-accent-primary bg-accent-primary/10'
                                : 'border-bg-tertiary dark:border-dark-bg-tertiary hover:border-accent-primary/50'
                              }`}
                          >
                            <div className="text-2xl mb-1">{option.emoji}</div>
                            <div className="text-sm font-medium text-text-primary">{option.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transportation */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">Transportation</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'public', label: 'Public Transit', emoji: '🚇' },
                          { value: 'mix', label: 'Mix', emoji: '🚗' },
                          { value: 'car', label: 'Own Car', emoji: '🚘' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setFormData({ ...formData, transportation: option.value as CostCalculatorFormData['transportation'] })}
                            className={`p-4 rounded-xl border-2 transition-all ${formData.transportation === option.value
                                ? 'border-accent-primary bg-accent-primary/10'
                                : 'border-bg-tertiary dark:border-dark-bg-tertiary hover:border-accent-primary/50'
                              }`}
                          >
                            <div className="text-2xl mb-1">{option.emoji}</div>
                            <div className="text-sm font-medium text-text-primary">{option.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        Duration (months): {formData.duration_months}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="60"
                        value={formData.duration_months}
                        onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                        className="w-full h-2 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                      />
                      <div className="flex justify-between text-xs text-text-tertiary mt-1">
                        <span>1 month</span>
                        <span>60 months</span>
                      </div>
                    </div>

                    {/* Dependents */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        Dependents: {formData.dependents}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={formData.dependents}
                        onChange={(e) => setFormData({ ...formData, dependents: parseInt(e.target.value) })}
                        className="w-full h-2 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                      />
                      <div className="flex justify-between text-xs text-text-tertiary mt-1">
                        <span>0</span>
                        <span>5</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Results */}
                {step === 3 && results && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {/* Total Cost Highlight */}
                    <div className="bg-gradient-to-r from-accent-primary to-accent-secondary p-6 rounded-2xl text-white">
                      <div className="text-sm font-medium opacity-90 mb-1">Estimated Total Cost</div>
                      <div className="text-4xl font-bold mb-2">${results.totals.total.toLocaleString()}</div>
                      <div className="text-sm opacity-90">
                        ${results.totals.monthly.toLocaleString()}/month × {formData.duration_months} months
                      </div>
                      <div className="text-xs opacity-75 mt-1">Currency: {results.totals.currency}</div>
                    </div>

                    {/* Monthly Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Breakdown</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Housing', amount: results.breakdown.housing, icon: '🏠' },
                          { label: 'Food', amount: results.breakdown.food, icon: '🍽️' },
                          { label: 'Transportation', amount: results.breakdown.transportation, icon: '🚗' },
                          { label: 'Utilities', amount: results.breakdown.utilities, icon: '💡' },
                          { label: 'Healthcare', amount: results.breakdown.healthcare, icon: '🏥' },
                          { label: 'Entertainment', amount: results.breakdown.entertainment, icon: '🎬' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{item.icon}</span>
                              <span className="font-medium text-text-primary">{item.label}</span>
                            </div>
                            <span className="text-lg font-bold text-text-primary">${item.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* One-time Costs */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">One-time Costs</h3>
                      <div className="p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <span className="font-medium text-text-primary">Visa Application Fees</span>
                        </div>
                        <span className="text-lg font-bold text-text-primary">${results.breakdown.visa_fees.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Savings Plan */}
                    <div className="p-4 bg-accent-primary/10 rounded-xl border border-accent-primary/20">
                      <h3 className="text-lg font-semibold text-text-primary mb-2">💡 Savings Plan</h3>
                      <p className="text-2xl font-bold text-accent-primary mb-1">
                        ${results.savings_plan.monthly_savings_needed.toLocaleString()}/month
                      </p>
                      <p className="text-sm text-text-secondary">{results.savings_plan.description}</p>
                    </div>

                    {/* Disclaimer */}
                    <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">⚠️</span>
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-1">Important Disclaimer</h4>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            These are rough estimates based on available data and may not reflect current prices.
                            Actual costs vary significantly based on lifestyle, exact location, exchange rates, and timing.
                            We recommend adding a 20-30% buffer for unexpected expenses. Always verify costs with
                            recent sources before making financial decisions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Calculating State */}
                {calculating && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-text-secondary">Calculating your costs...</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 glass-heavy border-t border-glass-border p-6">
                <div className="flex gap-3">
                  {step > 1 && !calculating && (
                    <motion.button
                      onClick={handleBack}
                      className="px-6 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary font-medium rounded-full hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                  )}

                  {step < 3 && !calculating && (
                    <motion.button
                      onClick={handleNext}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold rounded-full shadow-card hover:shadow-card-hover transition-shadow"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {step === 2 ? 'Calculate' : 'Next'}
                    </motion.button>
                  )}

                  {step === 3 && (
                    <>
                      {/* <motion.button
                        onClick={handleReset}
                        className="flex-1 px-6 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary font-medium rounded-full hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Recalculate
                      </motion.button> */}
                      <motion.button
                        onClick={() => router.push(`/explore?country=${country.code}&action=roadmap`)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold rounded-full shadow-card hover:shadow-card-hover transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Generate Roadmap
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
