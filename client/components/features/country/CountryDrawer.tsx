'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { countryService, visaService } from '@/lib/services';
import type { Country, VisaType } from '@/types';
import { Spinner } from '@/components/ui/Loading';

interface CountryDrawerProps {
  countryCode: string;
  isOpen: boolean;
}

export default function CountryDrawer({ countryCode, isOpen }: CountryDrawerProps) {
  const router = useRouter();
  const [countryData, setCountryData] = useState<Country | null>(null);
  const [visaRoutes, setVisaRoutes] = useState<VisaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && countryCode) {
      fetchCountryData();
    }
  }, [countryCode, isOpen]);

  const fetchCountryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch country details
      const country = await countryService.getByCode(countryCode.toUpperCase());
      setCountryData(country);
      
      // Fetch visa routes for this country
      try {
        const visas = await visaService.getByCountry(country.id);
        setVisaRoutes(visas);
      } catch (visaError) {
        console.warn('Could not fetch visa routes:', visaError);
        setVisaRoutes([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching country data:', err);
      setError('Failed to load country data');
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push('/explore');
  };

  const handleAction = (action: string) => {
    router.push(`/explore?country=${countryCode}&action=${action}`);
  };

  const getDifficultyLabel = (score: number | null) => {
    if (!score) return 'N/A';
    if (score <= 3) return 'Easy';
    if (score <= 6) return 'Medium';
    return 'Hard';
  };

  const getCostLabel = (index: number | null) => {
    if (!index) return 'N/A';
    if (index < 40) return '$';
    if (index < 60) return '$$';
    if (index < 80) return '$$$';
    return '$$$$';
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
                {countryData?.flag_image && (
                  <img src={countryData.flag_image} alt={`${countryData.name} flag`} className="w-8 h-6 object-cover rounded" />
                )}
                <h2 className="text-xl font-bold text-text-primary">
                  {loading ? 'Loading...' : countryData?.name || countryCode.toUpperCase()}
                </h2>
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

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center h-64">
                <Spinner className="w-12 h-12" />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="p-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={fetchCountryData}
                    className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            {!loading && !error && countryData && (
              <div className="p-6 space-y-6">
                {/* Hero Image (if available) */}
                {countryData.hero_image && (
                  <div className="relative h-48 -mx-6 -mt-6 mb-6">
                    <img
                      src={countryData.hero_image}
                      alt={countryData.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary dark:from-dark-bg-primary to-transparent"></div>
                  </div>
                )}

                {/* Summary */}
                {countryData.summary && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-2">Overview</h3>
                    <p className="text-sm text-text-primary leading-relaxed">{countryData.summary}</p>
                  </div>
                )}

                {/* Quick Stats */}
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary mb-3">Quick Stats</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4">
                      <div className="text-xs text-text-tertiary mb-1">Difficulty</div>
                      <div className="text-lg font-bold text-text-primary">
                        {countryData.difficulty_score ? `${countryData.difficulty_score}/10` : 'N/A'}
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        {getDifficultyLabel(countryData.difficulty_score)}
                      </div>
                    </div>
                    <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4">
                      <div className="text-xs text-text-tertiary mb-1">Cost</div>
                      <div className="text-2xl font-bold text-text-primary">
                        {getCostLabel(countryData.cost_of_living_index)}
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        Index: {countryData.cost_of_living_index?.toFixed(0) || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4">
                      <div className="text-xs text-text-tertiary mb-1">Region</div>
                      <div className="text-sm font-bold text-text-primary">{countryData.region}</div>
                      <div className="text-xs text-text-tertiary mt-1">
                        {countryData.currency}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                {(countryData.avg_rent_monthly_usd || countryData.avg_meal_cost_usd || countryData.healthcare_monthly_usd) && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">Monthly Costs (USD)</h3>
                    <div className="space-y-2">
                      {countryData.avg_rent_monthly_usd && (
                        <div className="flex justify-between items-center p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                          <span className="text-sm text-text-tertiary">Average Rent</span>
                          <span className="text-sm font-semibold text-text-primary">${countryData.avg_rent_monthly_usd}</span>
                        </div>
                      )}
                      {countryData.avg_meal_cost_usd && (
                        <div className="flex justify-between items-center p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                          <span className="text-sm text-text-tertiary">Average Meal</span>
                          <span className="text-sm font-semibold text-text-primary">${countryData.avg_meal_cost_usd}</span>
                        </div>
                      )}
                      {countryData.healthcare_monthly_usd && (
                        <div className="flex justify-between items-center p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                          <span className="text-sm text-text-tertiary">Healthcare</span>
                          <span className="text-sm font-semibold text-text-primary">
                            {countryData.healthcare_monthly_usd === '0.00' ? 'Free (Public)' : `$${countryData.healthcare_monthly_usd}`}
                          </span>
                        </div>
                      )}
                      {countryData.population && (
                        <div className="flex justify-between items-center p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                          <span className="text-sm text-text-tertiary">Population</span>
                          <span className="text-sm font-semibold text-text-primary">
                            {(countryData.population / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Popular Visa Routes */}
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary mb-3">
                    Popular Visa Routes {visaRoutes.length > 0 && `(${visaRoutes.length})`}
                  </h3>
                  {visaRoutes.length > 0 ? (
                    <div className="space-y-2">
                      {visaRoutes.slice(0, 5).map((visa) => (
                        <button
                          key={visa.id}
                          className="w-full text-left p-3 rounded-lg border border-bg-tertiary dark:border-dark-bg-tertiary hover:border-accent-primary hover:bg-accent-primary/5 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1">
                              <div className="w-2 h-2 rounded-full bg-accent-primary mt-1.5"></div>
                              <div>
                                <span className="text-sm font-medium text-text-primary block">{visa.name}</span>
                                {visa.processing_time_min && (
                                  <span className="text-xs text-text-tertiary">
                                    {visa.processing_time_min}-{visa.processing_time_max} months
                                  </span>
                                )}
                              </div>
                            </div>
                            {visa.success_rate && (
                              <span className="text-xs font-medium text-green-500">
                                {visa.success_rate}% success
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-tertiary italic">No visa routes available yet</p>
                  )}
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
                    onClick={() => router.push(`/explore?country=${countryCode}&chat=true`)}
                    className="w-full px-6 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary font-medium rounded-full hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Ask AI About {countryData.name}
                  </motion.button>
                </div>
              </div>
            </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
