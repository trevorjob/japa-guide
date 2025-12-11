'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataSource {
  name: string;
  type: 'official' | 'aggregator' | 'index';
  lastSynced?: string | null;
}

interface DataTransparencyBadgeProps {
  /** Data confidence level */
  confidence: 'low' | 'medium' | 'high';
  /** Whether this data needs review */
  needsReview?: boolean;
  /** Last updated timestamp */
  lastUpdated?: string | null;
  /** Data sources used */
  sources?: DataSource[];
  /** Whether this is a Tier-1 country with verified data */
  isTier1?: boolean;
  /** Compact mode for inline display */
  compact?: boolean;
}

const confidenceConfig = {
  high: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    label: 'Verified',
    icon: '✓',
    description: 'Data from official sources, recently verified',
  },
  medium: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    label: 'Estimated',
    icon: '~',
    description: 'Data from reputable sources, may need verification',
  },
  low: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    label: 'Unverified',
    icon: '?',
    description: 'Limited data available, treat as rough estimates',
  },
};

const sourceTypeLabels = {
  official: 'Official Government',
  aggregator: 'Data Aggregator',
  index: 'Research Index',
};

export default function DataTransparencyBadge({
  confidence,
  needsReview = false,
  lastUpdated,
  sources = [],
  isTier1 = false,
  compact = false,
}: DataTransparencyBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = confidenceConfig[confidence];

  // Format the last updated date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  // Compact inline badge
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color} ${config.borderColor} border`}
        title={config.description}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
        {needsReview && <span className="text-orange-500">•</span>}
      </span>
    );
  }

  return (
    <div className="relative">
      {/* Main Badge - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${config.bgColor} ${config.borderColor} hover:opacity-80`}
      >
        {/* Confidence Indicator */}
        <div className={`flex items-center gap-1.5 ${config.color}`}>
          <span className="text-sm font-bold">{config.icon}</span>
          <span className="text-xs font-medium">{config.label}</span>
        </div>

        {/* Tier-1 Badge */}
        {isTier1 && (
          <span className="px-1.5 py-0.5 bg-accent-primary/20 text-accent-primary text-xs font-medium rounded">
            Tier-1
          </span>
        )}

        {/* Needs Review Flag */}
        {needsReview && (
          <span className="text-orange-500 text-xs">⚠</span>
        )}

        {/* Expand Icon */}
        <svg
          className={`w-3 h-3 text-text-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Details Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 min-w-[280px]"
          >
            <div className="bg-bg-primary dark:bg-dark-bg-primary rounded-xl shadow-float border border-glass-border p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Data Transparency</h4>
                  <p className="text-xs text-text-tertiary mt-0.5">{config.description}</p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-bg-tertiary rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Confidence */}
                <div className="p-2 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                  <div className="text-xs text-text-tertiary">Confidence</div>
                  <div className={`text-sm font-medium ${config.color}`}>
                    {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
                  </div>
                </div>

                {/* Last Updated */}
                <div className="p-2 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                  <div className="text-xs text-text-tertiary">Last Updated</div>
                  <div className="text-sm font-medium text-text-primary">
                    {formatDate(lastUpdated)}
                  </div>
                </div>
              </div>

              {/* Data Sources */}
              {sources.length > 0 && (
                <div>
                  <div className="text-xs text-text-tertiary mb-2">Data Sources</div>
                  <div className="space-y-1.5">
                    {sources.map((source, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-bg-secondary dark:bg-dark-bg-secondary rounded-lg"
                      >
                        <div>
                          <div className="text-xs font-medium text-text-primary">{source.name}</div>
                          <div className="text-xs text-text-tertiary">
                            {sourceTypeLabels[source.type]}
                          </div>
                        </div>
                        {source.lastSynced && (
                          <div className="text-xs text-text-tertiary">
                            {formatDate(source.lastSynced)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Needs Review Warning */}
              {needsReview && (
                <div className="flex items-start gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <span className="text-orange-500">⚠</span>
                  <div>
                    <div className="text-xs font-medium text-orange-500">Needs Review</div>
                    <div className="text-xs text-text-tertiary">
                      This data is pending verification. Use for planning only.
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-text-tertiary italic">
                Always verify critical information with official government sources.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Helper to build sources array from Country data
 */
export function buildSourcesFromCountry(country: {
  basic_data_source?: string;
  basic_data_last_synced?: string | null;
  migration_data_source?: string;
  migration_data_last_synced?: string | null;
  economic_data_source?: string;
  economic_data_last_synced?: string | null;
}): DataSource[] {
  const sources: DataSource[] = [];

  const sourceTypeMap: Record<string, 'official' | 'aggregator' | 'index'> = {
    rest_countries: 'aggregator',
    unhcr: 'official',
    world_bank: 'aggregator',
    'World Bank': 'aggregator',
  };

  const sourceNameMap: Record<string, string> = {
    rest_countries: 'REST Countries API',
    unhcr: 'UNHCR',
    world_bank: 'World Bank',
    'World Bank': 'World Bank',
  };

  if (country.basic_data_source) {
    sources.push({
      name: sourceNameMap[country.basic_data_source] || country.basic_data_source,
      type: sourceTypeMap[country.basic_data_source] || 'aggregator',
      lastSynced: country.basic_data_last_synced,
    });
  }

  if (country.economic_data_source && country.economic_data_source !== country.basic_data_source) {
    sources.push({
      name: sourceNameMap[country.economic_data_source] || country.economic_data_source,
      type: sourceTypeMap[country.economic_data_source] || 'aggregator',
      lastSynced: country.economic_data_last_synced,
    });
  }

  if (country.migration_data_source && 
      country.migration_data_source !== country.basic_data_source &&
      country.migration_data_source !== country.economic_data_source) {
    sources.push({
      name: sourceNameMap[country.migration_data_source] || country.migration_data_source,
      type: sourceTypeMap[country.migration_data_source] || 'official',
      lastSynced: country.migration_data_last_synced,
    });
  }

  return sources;
}

/**
 * Tier-1 country codes for quick lookup
 */
export const TIER_1_COUNTRIES = new Set([
  'CAN', 'USA', 'GBR', 'AUS', 'IRL', 'NZL', 'DEU', 'NLD', 'FRA', 'PRT',  // Phase 1
  'ARE', 'QAT', 'SAU', 'KWT', 'BHR',  // Phase 2: Gulf
  'ESP', 'ITA', 'BEL', 'SWE', 'POL',  // Phase 3: EU
  'ZAF', 'GHA', 'RWA', 'KEN', 'MUS',  // Phase 4: Africa
  'SGP', 'JPN', 'MLT', 'CYP', 'CHE',  // Phase 5: Other
]);
