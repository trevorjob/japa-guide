'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { roadmapService } from '@/lib/services';
import type { Roadmap } from '@/types';
import { Spinner } from '@/components/ui/Loading';
import RoadmapView from '@/components/features/roadmap/RoadmapView';

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId = parseInt(params.id as string);
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const data = await roadmapService.getById(roadmapId);
        setRoadmap(data);
      } catch (err) {
        console.error('Failed to load roadmap:', err);
        setError('Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    };

    if (roadmapId) {
      fetchRoadmap();
    }
  }, [roadmapId]);

  const handleStepComplete = async (stepId: number) => {
    if (!roadmap) return;
    
    try {
      await roadmapService.markStepComplete(roadmapId, stepId);
      // Refetch to get updated data
      const updated = await roadmapService.getById(roadmapId);
      setRoadmap(updated);
    } catch (err) {
      console.error('Failed to mark step complete:', err);
    }
  };

  const handleStepIncomplete = async (stepId: number) => {
    if (!roadmap) return;
    
    try {
      await roadmapService.markStepIncomplete(roadmapId, stepId);
      const updated = await roadmapService.getById(roadmapId);
      setRoadmap(updated);
    } catch (err) {
      console.error('Failed to mark step incomplete:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Roadmap Not Found</h1>
          <p className="text-text-secondary mb-6">{error || 'The roadmap you&apos;re looking for doesn&apos;t exist.'}</p>
          <button
            onClick={() => router.push('/explore')}
            className="px-6 py-3 bg-accent-primary text-white font-semibold rounded-full hover:bg-accent-primary/90 transition-colors"
          >
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary">
      <RoadmapView
        roadmap={roadmap}
        onStepComplete={handleStepComplete}
        onStepIncomplete={handleStepIncomplete}
      />
    </div>
  );
}
