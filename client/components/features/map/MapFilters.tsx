'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  region?: string;
  difficulty_min?: number;
  difficulty_max?: number;
  search?: string;
}

export default function MapFilters({ onFilterChange }: MapFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const regions = [
    { value: '', label: 'All Regions' },
    { value: 'Europe', label: 'Europe' },
    { value: 'Asia', label: 'Asia' },
    { value: 'North America', label: 'North America' },
    { value: 'South America', label: 'South America' },
    { value: 'Oceania', label: 'Oceania' },
    { value: 'Africa', label: 'Africa' },
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels', min: undefined, max: undefined },
    { value: 'easy', label: 'Easy (1-3)', min: 1, max: 3 },
    { value: 'medium', label: 'Medium (4-6)', min: 4, max: 6 },
    { value: 'hard', label: 'Hard (7-10)', min: 7, max: 10 },
  ];

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    const difficulty = difficulties.find(d => d.value === selectedDifficulty);
    onFilterChange({
      region: region || undefined,
      difficulty_min: difficulty?.min,
      difficulty_max: difficulty?.max,
      search: searchQuery || undefined,
    });
  };

  const handleDifficultyChange = (difficultyValue: string) => {
    setSelectedDifficulty(difficultyValue);
    const difficulty = difficulties.find(d => d.value === difficultyValue);
    onFilterChange({
      region: selectedRegion || undefined,
      difficulty_min: difficulty?.min,
      difficulty_max: difficulty?.max,
      search: searchQuery || undefined,
    });
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    const difficulty = difficulties.find(d => d.value === selectedDifficulty);
    onFilterChange({
      region: selectedRegion || undefined,
      difficulty_min: difficulty?.min,
      difficulty_max: difficulty?.max,
      search: search || undefined,
    });
  };

  const handleReset = () => {
    setSelectedRegion('');
    setSelectedDifficulty('all');
    setSearchQuery('');
    onFilterChange({});
  };

  const activeFiltersCount = (selectedRegion ? 1 : 0) + (selectedDifficulty !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="fixed bottom-6 left-6 z-30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl shadow-float overflow-hidden"
        style={{ minWidth: '280px', maxWidth: '320px' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent-primary)] text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Search Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Search Country</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Type country name..."
                      className="w-full px-3 py-2 pl-9 pr-9 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all placeholder:text-white/40"
                    />
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchQuery && (
                      <button
                        onClick={() => handleSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        aria-label="Clear search"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Region</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all"
                  >
                    {regions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <div className="space-y-2">
                    {difficulties.map((difficulty) => (
                      <label
                        key={difficulty.value}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="difficulty"
                          value={difficulty.value}
                          checked={selectedDifficulty === difficulty.value}
                          onChange={(e) => handleDifficultyChange(e.target.value)}
                          className="w-4 h-4 accent-[var(--accent-primary)]"
                        />
                        <span className="text-sm">{difficulty.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="w-full py-2 px-4 text-sm font-medium text-[var(--accent-primary)] border border-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary)]/10 transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
