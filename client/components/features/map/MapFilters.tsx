'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  region?: string;
  search?: string;
  // Note: difficulty_min and difficulty_max removed - difficulty scores are unreliable
}

export default function MapFilters({ onFilterChange }: MapFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mapFiltersExpanded');
      return saved === 'true';
    }
    return false;
  });
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Save expanded state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mapFiltersExpanded', String(isExpanded));
    }
  }, [isExpanded]);

  // Save expanded state to localStorage
  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('mapFiltersExpanded', String(newState));
  };

  const regions = [
    { value: '', label: 'All Regions' },
    { value: 'Africa', label: 'Africa' },
    { value: 'Americas', label: 'Americas' },
    { value: 'Asia', label: 'Asia' },
    { value: 'Europe', label: 'Europe' },
    { value: 'Oceania', label: 'Oceania' },
  ];

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    onFilterChange({
      region: region || undefined,
      search: searchQuery || undefined,
    });
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    onFilterChange({
      region: selectedRegion || undefined,
      search: search || undefined,
    });
  };

  const handleReset = () => {
    setSelectedRegion('');
    setSearchQuery('');
    onFilterChange({});
  };

  const activeFiltersCount = (selectedRegion ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-background/60 backdrop-blur-lg rounded-2xl shadow-float overflow-hidden fixed bottom-6 left-6 z-30 border border-white/10"
        style={{maxWidth:"280px",  minWidth: '240px', padding: isExpanded ? '12px' : '8px' }}
      >
        {/* Header */}
        {/* <div className="border-b border-white/10"> */}
          <div className="flex items-center justify-between" style={{ marginBottom: isExpanded ? '12px' : '0' }}>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-semibold">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-accent-primary text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button
              onClick={toggleExpanded}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        {/* </div> */}

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
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Country</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Type country name..."
                      className="w-full px-3 py-1 pl-9 pr-9 bg-white/5 border border-white/10 rounded-lg placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors"
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Region</label>
                  <div className="relative">
                    <select
                      value={selectedRegion}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className="w-full px-3 py-2 pr-8 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-sm cursor-pointer hover:bg-white/10 appearance-none"
                    >
                      {regions.map((region) => (
                        <option key={region.value} value={region.value} className="bg-bg-secondary text-white">
                          {region.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="w-full py-2 px-4 text-sm font-medium text-accent-primary border border-accent-primary/50 rounded-lg hover:bg-accent-primary/10 hover:border-accent-primary transition-all hover:scale-[1.02] focus:outline-none"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Filters
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    // </div>
  );
}
