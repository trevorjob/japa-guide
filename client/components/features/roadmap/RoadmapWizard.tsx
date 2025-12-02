'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Country, VisaType } from '@/types';
import { roadmapService } from '@/lib/services';

interface RoadmapWizardProps {
  country: Country;
  visa?: VisaType | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  goal: 'study' | 'work' | 'business' | 'family' | 'other';
  ai_tone: 'helpful' | 'uncle_japa' | 'bestie' | 'strict_officer' | 'hype_man' | 'therapist';
  budget: number;
  target_date: string;
  profile: {
    age?: number;
    education?: string;
    experience_years?: number;
  };
}

export default function RoadmapWizard({ country, visa, isOpen, onClose }: RoadmapWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    goal: 'work',
    ai_tone: 'helpful',
    budget: 10000,
    target_date: '',
    profile: {},
  });

  const handleGenerate = async () => {
    setGenerating(true);
    
    try {
      const roadmap = await roadmapService.generate({
        country: country.code,
        visa_type_id: visa?.id,
        goal: formData.goal,
        ai_tone: formData.ai_tone,
        budget: formData.budget,
        target_date: formData.target_date || null,
        profile: formData.profile,
      });
      
      // Redirect to roadmap detail page
      router.push(`/roadmap/${roadmap.id}`);
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
      alert('Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleGenerate();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-overlay-dim z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="relative w-full max-w-3xl max-h-[90vh] bg-bg-primary dark:bg-dark-bg-primary rounded-2xl shadow-float overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 glass-heavy border-b border-glass-border p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                      Create Your Roadmap
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {country.name} {visa && `• ${visa.name}`}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            s <= step ? 'bg-accent-primary' : 'bg-bg-tertiary dark:bg-dark-bg-tertiary'
                          }`}
                        />
                      ))}
                    </div>
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
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                {/* Step 1: Goal & Purpose */}
                {step === 1 && !generating && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">What&apos;s your goal?</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { value: 'work' as const, label: 'Work', emoji: '💼', desc: 'Employment visa' },
                          { value: 'study' as const, label: 'Study', emoji: '🎓', desc: 'Student visa' },
                          { value: 'business' as const, label: 'Business', emoji: '🚀', desc: 'Entrepreneur visa' },
                          { value: 'family' as const, label: 'Family', emoji: '👨‍👩‍👧‍👦', desc: 'Family reunion' },
                          { value: 'other' as const, label: 'Other', emoji: '✨', desc: 'Other purposes' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setFormData({ ...formData, goal: option.value })}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.goal === option.value
                                ? 'border-accent-primary bg-accent-primary/10'
                                : 'border-bg-tertiary dark:border-dark-bg-tertiary hover:border-accent-primary/50'
                            }`}
                          >
                            <div className="text-3xl mb-2">{option.emoji}</div>
                            <div className="text-sm font-semibold text-text-primary">{option.label}</div>
                            <div className="text-xs text-text-tertiary mt-1">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        Budget (USD): ${formData.budget.toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="5000"
                        max="100000"
                        step="5000"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                        className="w-full h-2 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                      />
                      <div className="flex justify-between text-xs text-text-tertiary mt-1">
                        <span>$5,000</span>
                        <span>$100,000</span>
                      </div>
                    </div>

                    {/* Target Date */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Target Move Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.target_date}
                        onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-secondary dark:bg-dark-bg-secondary border border-bg-tertiary dark:border-dark-bg-tertiary rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Profile Information */}
                {step === 2 && !generating && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Tell us about yourself</h3>
                      <p className="text-sm text-text-secondary mb-6">
                        This helps us personalize your roadmap (all fields optional)
                      </p>

                      {/* Age */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Age</label>
                        <input
                          type="number"
                          placeholder="25"
                          value={formData.profile.age || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              profile: { ...formData.profile, age: parseInt(e.target.value) || undefined },
                            })
                          }
                          className="w-full px-4 py-3 bg-bg-secondary dark:bg-dark-bg-secondary border border-bg-tertiary dark:border-dark-bg-tertiary rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                        />
                      </div>

                      {/* Education */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Highest Education
                        </label>
                        <select
                          value={formData.profile.education || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              profile: { ...formData.profile, education: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 bg-bg-secondary dark:bg-dark-bg-secondary border border-bg-tertiary dark:border-dark-bg-tertiary rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                        >
                          <option value="">Select...</option>
                          <option value="high_school">High School</option>
                          <option value="bachelors">Bachelor&apos;s Degree</option>
                          <option value="masters">Master&apos;s Degree</option>
                          <option value="phd">PhD</option>
                        </select>
                      </div>

                      {/* Work Experience */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Years of Work Experience
                        </label>
                        <input
                          type="number"
                          placeholder="3"
                          value={formData.profile.experience_years || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              profile: {
                                ...formData.profile,
                                experience_years: parseInt(e.target.value) || undefined,
                              },
                            })
                          }
                          className="w-full px-4 py-3 bg-bg-secondary dark:bg-dark-bg-secondary border border-bg-tertiary dark:border-dark-bg-tertiary rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: AI Personality */}
                {step === 3 && !generating && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Choose your AI guide</h3>
                      <p className="text-sm text-text-secondary mb-6">
                        Select the personality style for your AI-enhanced roadmap tips
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          {
                            value: 'helpful' as const,
                            label: 'Helpful Assistant',
                            emoji: '🤝',
                            desc: 'Professional and informative',
                          },
                          {
                            value: 'uncle_japa' as const,
                            label: 'Uncle Japa',
                            emoji: '👴',
                            desc: 'Wise elder with stories',
                          },
                          { value: 'bestie' as const, label: 'Bestie', emoji: '👯', desc: 'Casual and encouraging' },
                          {
                            value: 'strict_officer' as const,
                            label: 'Strict Officer',
                            emoji: '👮',
                            desc: 'Direct and no-nonsense',
                          },
                          { value: 'hype_man' as const, label: 'Hype Man', emoji: '🎉', desc: 'Super enthusiastic' },
                          {
                            value: 'therapist' as const,
                            label: 'Therapist',
                            emoji: '🧘',
                            desc: 'Calm and supportive',
                          },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setFormData({ ...formData, ai_tone: option.value })}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.ai_tone === option.value
                                ? 'border-accent-primary bg-accent-primary/10'
                                : 'border-bg-tertiary dark:border-dark-bg-tertiary hover:border-accent-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{option.emoji}</span>
                              <div>
                                <div className="text-sm font-semibold text-text-primary">{option.label}</div>
                                <div className="text-xs text-text-tertiary mt-0.5">{option.desc}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Generating State */}
                {generating && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-text-primary font-medium mb-1">Generating your roadmap...</p>
                    <p className="text-sm text-text-secondary">This may take a few seconds</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!generating && (
                <div className="sticky bottom-0 glass-heavy border-t border-glass-border p-6">
                  <div className="flex gap-3">
                    {step > 1 && (
                      <motion.button
                        onClick={handleBack}
                        className="px-6 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary font-medium rounded-full hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Back
                      </motion.button>
                    )}

                    <motion.button
                      onClick={handleNext}
                      className="flex-1 px-6 py-3 bg-linear-to-r from-accent-primary to-accent-secondary text-white font-semibold rounded-full shadow-card hover:shadow-card-hover transition-shadow"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {step === 3 ? '✨ Generate Roadmap' : 'Next'}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
