'use client';

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/Loading';

// Lazy load heavy components
const MapCanvas = dynamic(() => import('@/components/features/map/MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="w-12 h-12" />
    </div>
  ),
});

const MapFilters = dynamic(() => import('@/components/features/map/MapFilters'), {
  ssr: false,
});

const CountryDrawer = dynamic(() => import('@/components/features/country/CountryDrawer'), {
  ssr: false,
});

const CostCalculator = dynamic(() => import('@/components/features/calculator/CostCalculator'), {
  ssr: false,
});

const ChatPanel = dynamic(() => import('@/components/features/chat/ChatPanel'), {
  ssr: false,
});

function MapPageContent() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [mapFilters, setMapFilters] = useState<{
    region?: string;
    difficulty_min?: number;
    difficulty_max?: number;
    search?: string;
  }>({});
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Update URL without page reload
  const updateURL = (params: { country?: string | null; chat?: boolean }) => {
    const url = new URL(window.location.href);
    
    if (params.country) {
      url.searchParams.set('country', params.country);
    } else if (params.country === null) {
      url.searchParams.delete('country');
    }
    
    if (params.chat === true) {
      url.searchParams.set('chat', 'true');
    } else if (params.chat === false) {
      url.searchParams.delete('chat');
    }
    
    window.history.pushState({}, '', url.toString());
  };

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    updateURL({ country: countryCode });
  };

  const handleCountryClose = () => {
    setSelectedCountry(null);
    updateURL({ country: null });
    
    // Clear filters if we auto-selected from a single search result
    // This prevents the drawer from immediately reopening
    if (mapFilters.search) {
      setMapFilters({});
      setSelectedRegion(null);
    }
  };

  const handleChatOpen = () => {
    setChatOpen(true);
    updateURL({ chat: true });
  };

  const handleChatClose = () => {
    setChatOpen(false);
    updateURL({ chat: false });
  };

  const handleResultsUpdate = (count: number, countries: string[]) => {
    // Auto-select if only one result
    if (count === 1 && countries.length === 1) {
      handleCountrySelect(countries[0]);
    }
  };

  const handleFilterChange = (filters: typeof mapFilters) => {
    setMapFilters(filters);
    // Sync selectedRegion with filter region to trigger zoom
    setSelectedRegion(filters.region || null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Layer 0: Map Canvas (Always visible) */}
      <MapCanvas 
        selectedCountry={selectedCountry} 
        filters={mapFilters}
        selectedRegion={selectedRegion}
        onCountrySelect={handleCountrySelect}
        onResultsUpdate={handleResultsUpdate}
      />
      
      {/* Map Filters Panel */}
      <MapFilters 
        onFilterChange={handleFilterChange}
      />

      {/* Layer 1: Country Drawer */}
      <CountryDrawer
        countryCode={selectedCountry}
        isOpen={!!selectedCountry}
        onClose={handleCountryClose}
        onChatOpen={handleChatOpen}
      />

      {/* Floating Chat Panel */}
      {chatOpen && <ChatPanel onClose={handleChatClose} />}

      {/* Floating Chat Bubble (when not open) */}
      {!chatOpen && (
        <button
          onClick={handleChatOpen}
          className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-linear-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full shadow-float flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform"
        >
          💬
        </button>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <Spinner className="w-12 h-12" />
          </div>
        }
      >
        <MapPageContent />
      </Suspense>
    </div>
  );
}
  