'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { countryService, visaService } from '@/lib/services';
import type { Country, VisaType } from '@/types';
import { Spinner } from '@/components/ui/Loading';
import DataTransparencyBadge, { buildSourcesFromCountry, TIER_1_COUNTRIES } from '@/components/features/country/DataTransparencyBadge';
import VisaRouteModal from '@/components/features/visa/VisaRouteModal';
import CostCalculator from '@/components/features/calculator/CostCalculator';
import RoadmapWizard from '@/components/features/roadmap/RoadmapWizard';

interface CountryDrawerProps {
  countryCode: string | null;
  isOpen: boolean;
  onClose: () => void;
  onChatOpen?: () => void;
}

export default function CountryDrawer({ countryCode, isOpen, onClose, onChatOpen }: CountryDrawerProps) {
  const router = useRouter();
  const [countryData, setCountryData] = useState<Country | null>(null);
  const [visaRoutes, setVisaRoutes] = useState<VisaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [visaLoading, setVisaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);
  const [isVisaModalOpen, setIsVisaModalOpen] = useState(false);
  const [isCostCalculatorOpen, setIsCostCalculatorOpen] = useState(false);
  const [isRoadmapWizardOpen, setIsRoadmapWizardOpen] = useState(false);

  const fetchCountryData = useCallback(async () => {
    if (!countryCode) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only country details first for fast drawer opening
      const country = await countryService.getByCode(countryCode.toUpperCase());
      setCountryData(country);
      setLoading(false);
      
      // Load visa routes in background after drawer is shown
      setVisaLoading(true);
      try {
        const visas = await visaService.getByCountry(country.id);
        setVisaRoutes(visas);
      } catch (visaError) {
        console.warn('Could not fetch visa routes:', visaError);
        setVisaRoutes([]);
      } finally {
        setVisaLoading(false);
      }
      
    } catch (err) {
      console.error('Error fetching country data:', err);
      setError('Failed to load country data');
      setLoading(false);
    }
  }, [countryCode]);

  useEffect(() => {
    if (isOpen && countryCode) {
      fetchCountryData();
    }
  }, [countryCode, isOpen, fetchCountryData]);

  const handleClose = () => {
    onClose();
  };

  const handleAction = (action: string) => {
    if (action === 'calculate') {
      setIsCostCalculatorOpen(true);
    } else if (action === 'roadmap') {
      setIsRoadmapWizardOpen(true);
    } else {
      router.push(`/explore?country=${countryCode}&action=${action}`);
    }
  };

  const handleVisaClick = (visa: VisaType) => {
    setSelectedVisa(visa);
    setIsVisaModalOpen(true);
  };

  const handleVisaRoadmap = (visa: VisaType) => {
    setSelectedVisa(visa);
    setIsRoadmapWizardOpen(true);
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
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          /* Backdrop */
          <motion.div
            key="country-drawer-backdrop"
            className="fixed inset-0 bg-overlay-dim z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isOpen && (
          /* Drawer */
          <motion.div
            key="country-drawer"
            className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-bg-primary/5 md:backdrop-blur-xl shadow-float z-30 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
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
                {(countryData?.flag_svg_url || countryData?.flag_image) && (
                  <img 
                    src={countryData.flag_svg_url || countryData.flag_image || ''} 
                    alt={`${countryData.name} flag`} 
                    className="w-8 h-6 object-cover rounded" 
                  />
                )}
                <h2 className="text-xl font-bold text-text-primary">
                  {loading
                    ? 'Loading...'
                    : countryData?.name || (countryCode ? countryCode.toUpperCase() : '')}
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
              <motion.div 
                className="p-6 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.2,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              >
                {/* Hero Image (if available) */}
                {countryData.hero_image && (
                  <motion.div 
                    className="relative h-48 -mx-6 -mt-6 mb-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <img
                      src={countryData.hero_image}
                      alt={countryData.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary dark:from-dark-bg-primary to-transparent"></div>
                  </motion.div>
                )}

                {/* Summary */}
                {countryData.summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <h3 className="text-sm font-semibold text-text-secondary mb-2">Overview</h3>
                    <p className="text-sm text-text-primary leading-relaxed">{countryData.summary}</p>
                  </motion.div>
                )}

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
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
                  
                  {/* Data Transparency Badge */}
                  <div className="mt-4">
                    <DataTransparencyBadge 
                      confidence={countryData.data_confidence || 'low'}
                      needsReview={countryData.needs_review}
                      lastUpdated={countryData.updated_at}
                      sources={buildSourcesFromCountry(countryData)}
                      isTier1={TIER_1_COUNTRIES.has(countryData.code)}
                    />
                  </div>
                  
                  {/* Official Immigration Site Link */}
                  {countryData.immigration_url && (
                    <div className="mt-3">
                      <a
                        href={countryData.immigration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 rounded-lg transition-colors group"
                      >
                        <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <span className="text-sm font-medium text-accent-primary">
                          Official Immigration Website
                        </span>
                        <svg className="w-4 h-4 text-accent-primary ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </motion.div>

                {/* Cost Breakdown */}
                {(countryData.avg_rent_monthly_usd || countryData.avg_meal_cost_usd || countryData.healthcare_monthly_usd) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
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
                    </div>
                    </motion.div>
                )}

                {/* Key Statistics */}
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary mb-3">Key Statistics</h3>
                  <div className="space-y-2">
                    {countryData.population && (
                      <div className="flex justify-between items-center p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                        <span className="text-sm text-text-tertiary">Population</span>
                        <span className="text-sm font-semibold text-text-primary">
                          {(countryData.population / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    )}
                    {countryData.area_sq_km && (
                      <div className="flex justify-between items-center p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                        <span className="text-sm text-text-tertiary">Area</span>
                        <span className="text-sm font-semibold text-text-primary">
                          {(countryData.area_sq_km / 1000).toFixed(0)}K km²
                        </span>
                      </div>
                    )}
                    {countryData.gdp_per_capita_usd && (
                      <div className="flex justify-between items-center p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                        <span className="text-sm text-text-tertiary">GDP per Capita</span>
                        <span className="text-sm font-semibold text-text-primary">
                          ${(countryData.gdp_per_capita_usd / 1000).toFixed(1)}K
                        </span>
                      </div>
                    )}
                    {countryData.life_expectancy && (
                      <div className="flex justify-between items-center p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                        <span className="text-sm text-text-tertiary">Life Expectancy</span>
                        <span className="text-sm font-semibold text-text-primary">
                          {countryData.life_expectancy.toFixed(1)} years
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Migration Data */}
                {(countryData.refugees_in || countryData.asylum_seekers) && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">
                      Migration Statistics
                      {countryData.migration_data_last_synced && (
                        <span className="ml-2 text-xs text-text-tertiary font-normal">
                          (2023)
                        </span>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {countryData.refugees_in !== null && countryData.refugees_in > 0 && (
                        <div className="flex justify-between items-center p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                          <span className="text-sm text-text-tertiary">Refugees Hosted</span>
                          <span className="text-sm font-semibold text-text-primary">
                            {countryData.refugees_in.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {countryData.asylum_seekers !== null && countryData.asylum_seekers > 0 && (
                        <div className="flex justify-between items-center p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                          <span className="text-sm text-text-tertiary">Asylum Seekers</span>
                          <span className="text-sm font-semibold text-text-primary">
                            {countryData.asylum_seekers.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {countryData.net_migration !== null && countryData.net_migration !== 0 && (
                        <div className="flex justify-between items-center p-3 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                          <span className="text-sm text-text-tertiary">Net Migration</span>
                          <span className={`text-sm font-semibold ${countryData.net_migration > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {countryData.net_migration > 0 ? '+' : ''}{countryData.net_migration.toLocaleString()}
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
                  {visaLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-full p-3 rounded-lg border border-bg-tertiary dark:border-dark-bg-tertiary animate-pulse">
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-bg-tertiary dark:bg-dark-bg-tertiary mt-1.5"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded w-2/3"></div>
                              <div className="h-3 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded w-1/3"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : visaRoutes.length > 0 ? (
                    <div className="space-y-2">
                      {visaRoutes.slice(0, 5).map((visa) => (
                        <button
                          key={visa.id}
                          onClick={() => handleVisaClick(visa)}
                          className="w-full text-left p-3 rounded-lg border border-bg-tertiary dark:border-dark-bg-tertiary hover:border-accent-primary hover:bg-accent-primary/5 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1">
                              <div className="w-2 h-2 rounded-full bg-accent-primary mt-1.5"></div>
                              <div>
                                <span className="text-sm font-medium text-text-primary block">{visa.name}</span>
                                {visa.processing_time_min && (
                                  <span className="text-xs text-text-tertiary">
                                    {visa.processing_time_min}-{visa.processing_time_max} weeks
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {visa.success_rate && (
                                <span className="text-xs font-medium text-green-500">
                                  {visa.success_rate}% success
                                </span>
                              )}
                              <svg className="w-4 h-4 text-text-tertiary group-hover:text-accent-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
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
                    onClick={() => onChatOpen && onChatOpen()}
                    className="w-full px-6 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary font-medium rounded-full hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Ask AI About {countryData.name}
                  </motion.button>
                </div>
              </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visa Route Modal */}
      <VisaRouteModal
        key="visa-route-modal"
        visa={selectedVisa}
        isOpen={isVisaModalOpen}
        onClose={() => setIsVisaModalOpen(false)}
        onGenerateRoadmap={handleVisaRoadmap}
      />

      {/* Cost Calculator */}
      {countryData && (
        <CostCalculator
          key="cost-calculator"
          country={countryData}
          isOpen={isCostCalculatorOpen}
          onClose={() => setIsCostCalculatorOpen(false)}
        />
      )}

      {/* Roadmap Wizard */}
      {countryData && (
        <RoadmapWizard
          key="roadmap-wizard"
          country={countryData}
          visa={selectedVisa}
          isOpen={isRoadmapWizardOpen}
          onClose={() => setIsRoadmapWizardOpen(false)}
        />
      )}
    </>
  );
}