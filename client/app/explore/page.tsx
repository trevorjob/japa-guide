'use client';

import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const selectedCountry = searchParams.get('country');
  const action = searchParams.get('action');
  const chatOpen = searchParams.get('chat') === 'true';
  
  const [mapFilters, setMapFilters] = useState<{
    region?: string;
    difficulty_min?: number;
    difficulty_max?: number;
    search?: string;
  }>({});

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Layer 0: Map Canvas (Always visible) */}
      <MapCanvas selectedCountry={selectedCountry} filters={mapFilters} />
      
      {/* Map Filters Panel */}
      <MapFilters onFilterChange={setMapFilters} />

      {/* Layer 1: Country Drawer */}
      {selectedCountry && (
        <CountryDrawer
          countryCode={selectedCountry}
          isOpen={!!selectedCountry}
        />
      )}

      {/* Floating Chat Panel */}
      {chatOpen && <ChatPanel />}

      {/* Floating Chat Bubble (when not open) */}
      {!chatOpen && (
        <a
          href="?chat=true"
          className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-linear-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full shadow-float flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform"
        >
          💬
        </a>
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
