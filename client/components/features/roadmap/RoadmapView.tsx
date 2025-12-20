'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Roadmap, RoadmapStep } from '@/types';

interface RoadmapViewProps {
  roadmap: Roadmap;
  onStepComplete: (stepId: number) => void;
  onStepIncomplete: (stepId: number) => void;
}

export default function RoadmapView({ roadmap, onStepComplete, onStepIncomplete }: RoadmapViewProps) {
  const router = useRouter();
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepId: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const completedSteps = roadmap.steps.filter(
    (step) => step.status?.is_complete
  ).length;
  const totalSteps = roadmap.steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const getAIPersonalityEmoji = (tone: string) => {
    const emojis: Record<string, string> = {
      helpful: '🤝',
      uncle_japa: '👴',
      bestie: '👯',
      strict_officer: '👮',
      hype_man: '🎉',
      therapist: '🧘',
    };
    return emojis[tone] || '🤖';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/explore')}
          className="text-text-secondary hover:text-text-primary mb-4 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Map
        </button>

        <div className="glass-heavy rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-text-primary mb-2">{roadmap.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-sm font-medium rounded-full">
                  {roadmap.goal}
                </span>
                <span className="px-3 py-1 bg-bg-tertiary dark:bg-dark-bg-tertiary text-text-secondary text-sm font-medium rounded-full">
                  {getAIPersonalityEmoji(roadmap.ai_tone)} {roadmap.ai_tone.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-text-secondary mb-2">
              <span>Progress</span>
              <span>
                {completedSteps} / {totalSteps} steps completed
              </span>
            </div>
            <div className="h-3 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-accent-primary to-accent-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">
                {roadmap.country}
              </div>
              <div className="text-sm text-text-secondary">Destination</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">{totalSteps}</div>
              <div className="text-sm text-text-secondary">Total Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">{Math.round(progress)}%</div>
              <div className="text-sm text-text-secondary">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {roadmap.steps
          .sort((a, b) => a.order - b.order)
          .map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              totalSteps={totalSteps}
              isExpanded={expandedSteps.has(step.id)}
              onToggle={() => toggleStep(step.id)}
              onComplete={() => onStepComplete(step.id)}
              onIncomplete={() => onStepIncomplete(step.id)}
            />
          ))}
      </div>

      {/* Save Roadmap CTA (for anonymous users) */}
      {roadmap.is_anonymous && (
        <div className="mt-8 glass-heavy rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-text-primary mb-2">Save Your Progress</h3>
          <p className="text-text-secondary mb-4">
            Create a free account to save your roadmap and track progress across devices.
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-6 py-3 bg-linear-to-r from-accent-primary to-accent-secondary text-white font-semibold rounded-full shadow-card hover:shadow-card-hover transition-shadow"
          >
            Create Free Account
          </button>
        </div>
      )}
    </div>
  );
}

interface StepCardProps {
  step: RoadmapStep;
  index: number;
  totalSteps: number;
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
  onIncomplete: () => void;
}

function StepCard({ step, index, totalSteps, isExpanded, onToggle, onComplete, onIncomplete }: StepCardProps) {
  const isComplete = step.status?.is_complete || false;
  const isBlocked = step.status?.is_blocked || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Connector Line */}
      {index < totalSteps - 1 && (
        <div className="absolute left-6 top-16 w-0.5 h-full bg-bg-tertiary dark:bg-dark-bg-tertiary -z-10" />
      )}

      <div
        className={`glass-heavy rounded-2xl p-6 transition-all ${
          isExpanded ? 'shadow-card' : 'hover:shadow-card-hover'
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="flex-shrink-0 pt-1">
            <button
              onClick={isComplete ? onIncomplete : onComplete}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                isComplete
                  ? 'bg-accent-primary border-accent-primary text-white'
                  : 'border-bg-tertiary dark:border-dark-bg-tertiary hover:border-accent-primary'
              }`}
            >
              {isComplete ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-text-tertiary font-semibold">{index + 1}</span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3
                className={`text-xl font-semibold cursor-pointer ${
                  isComplete ? 'text-text-secondary line-through' : 'text-text-primary'
                }`}
                onClick={onToggle}
              >
                {step.title}
              </h3>
              <button
                onClick={onToggle}
                className="flex-shrink-0 p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <p className="text-text-secondary mb-3">{step.description}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 text-sm">
              {step.estimated_time && (
                <div className="flex items-center gap-1 text-text-tertiary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {step.estimated_time}
                </div>
              )}
              {step.estimated_cost && (
                <div className="flex items-center gap-1 text-text-tertiary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  ${step.estimated_cost}
                </div>
              )}
              {isBlocked && (
                <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
                  ⚠️ Blocked
                </span>
              )}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4 border-t border-glass-border pt-4"
              >
                {/* Tips */}
                {step.tips && step.tips.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                      💡 Tips
                    </h4>
                    <ul className="space-y-1">
                      {step.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-text-secondary pl-4 before:content-['•'] before:mr-2">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pitfalls */}
                {step.pitfalls && step.pitfalls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                      ⚠️ Watch Out For
                    </h4>
                    <ul className="space-y-1">
                      {step.pitfalls.map((pitfall, i) => (
                        <li key={i} className="text-sm text-text-secondary pl-4 before:content-['•'] before:mr-2">
                          {pitfall}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Advice */}
                {step.ai_advice && (
                  <div className="bg-accent-primary/5 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-accent-primary mb-2 flex items-center gap-2">
                      🤖 AI Advice
                    </h4>
                    <p className="text-sm text-text-secondary whitespace-pre-line">{step.ai_advice}</p>
                  </div>
                )}

                {/* Documents Needed */}
                {step.documents_needed && step.documents_needed.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                      📄 Documents Needed
                    </h4>
                    <ul className="space-y-1">
                      {step.documents_needed.map((doc, i) => (
                        <li key={i} className="text-sm text-text-secondary pl-4 before:content-['•'] before:mr-2">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
