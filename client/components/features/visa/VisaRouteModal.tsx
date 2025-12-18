'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { VisaType } from '@/types';

interface VisaRouteModalProps {
  visa: VisaType | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateRoadmap?: (visa: VisaType) => void;
}

export default function VisaRouteModal({ visa, isOpen, onClose, onGenerateRoadmap }: VisaRouteModalProps) {
  if (!visa) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="visa-modal-backdrop"
            className="fixed inset-0 bg-overlay-dim z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="visa-modal"
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
                      {visa.name}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {visa.category && (
                        <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-xs font-medium rounded-full">
                          {visa.category}
                        </span>
                      )}
                      {visa.success_rate && (
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full">
                          {visa.success_rate}% Success Rate
                        </span>
                      )}
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
              <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6 space-y-6">
                {/* Description */}
                {visa.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-2">Overview</h3>
                    <p className="text-sm text-text-primary leading-relaxed">{visa.description}</p>
                  </div>
                )}

                {/* Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Processing Time */}
                  {visa.processing_time_min && (
                    <div className="p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="text-sm font-semibold text-text-secondary">Processing Time</h4>
                      </div>
                      <p className="text-lg font-bold text-text-primary">
                        {visa.processing_time_min}-{visa.processing_time_max} weeks
                      </p>
                    </div>
                  )}

                  {/* Duration of Stay */}
                  {(visa.duration_months || visa.duration_months === null) && (
                    <div className="p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h4 className="text-sm font-semibold text-text-secondary">Duration</h4>
                      </div>
                      <p className="text-lg font-bold text-text-primary">
                        {visa.duration_months === null ? 'Permanent' : `${visa.duration_months} ${visa.duration_months === 1 ? 'month' : 'months'}`}
                      </p>
                    </div>
                  )}

                  {/* Cost */}
                  {(visa.cost_estimate_min || visa.cost_estimate_max) && (
                    <div className="p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="text-sm font-semibold text-text-secondary">Application Fee</h4>
                      </div>
                      <p className="text-lg font-bold text-text-primary">
                        {visa.cost_estimate_min === visa.cost_estimate_max
                          ? `$${visa.cost_estimate_min?.toLocaleString()}`
                          : `$${visa.cost_estimate_min?.toLocaleString()} - $${visa.cost_estimate_max?.toLocaleString()}`}
                      </p>
                    </div>
                  )}

                  {/* Renewable */}
                  <div className="p-4 bg-bg-secondary dark:bg-dark-bg-secondary rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <h4 className="text-sm font-semibold text-text-secondary">Renewable</h4>
                    </div>
                    <p className="text-lg font-bold text-text-primary">
                      {visa.is_renewable ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                {visa.requirements && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">Requirements</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {Array.isArray(visa.requirements) ? (
                        <ul className="space-y-2">
                          {visa.requirements.map((req, idx) => (
                            <li key={idx} className="text-sm text-text-primary flex items-start gap-2">
                              <span className="text-accent-primary mt-1">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
                          {visa.requirements}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {visa.benefits && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">Benefits</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {Array.isArray(visa.benefits) ? (
                        <ul className="space-y-2">
                          {visa.benefits.map((benefit, idx) => (
                            <li key={idx} className="text-sm text-text-primary flex items-start gap-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
                          {visa.benefits}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Restrictions */}
                {visa.restrictions && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">Restrictions</h3>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      {Array.isArray(visa.restrictions) ? (
                        <ul className="space-y-2">
                          {visa.restrictions.map((restriction, idx) => (
                            <li key={idx} className="text-sm text-text-primary flex items-start gap-2">
                              <span className="text-yellow-500 mt-1">⚠</span>
                              <span>{restriction}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
                          {visa.restrictions}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 glass-heavy border-t border-glass-border p-6">
                <div className="flex gap-3">
                  <motion.button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary font-medium rounded-full hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      if (onGenerateRoadmap && visa) {
                        onGenerateRoadmap(visa);
                        onClose();
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-accent-primary to-accent-secondary text-white font-semibold rounded-full shadow-card hover:shadow-card-hover transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Roadmap
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
