'use client'

import { useState, useEffect } from 'react';
import { VideoCard } from './video-card';
import { getVideoSuggestions } from '@/ai/flows/video-suggestion';
import { getVideos } from '@/app/actions/mux';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { Video } from '@/types';

function RecommendationSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    )
}

export function AiRecommendations() {
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const allVideos = await getVideos();
        
        if (allVideos.length === 0) {
            setRecommendations([]);
            return;
        }

        const viewingHistory = 'Funny Cat Videos, How to Cook Pasta, Best Action Movies';
        const result = await getVideoSuggestions({ viewingHistory });
        
        const suggestedTitles = result.suggestions.split(',').map(t => t.trim().toLowerCase());
        
        const matchedVideos = allVideos.filter(video => suggestedTitles.includes(video.title.toLowerCase()));

        const additionalVideosNeeded = 5 - matchedVideos.length;
        if (additionalVideosNeeded > 0) {
            const availableVideos = allVideos.filter(v => !matchedVideos.find(mv => mv.id === v.id));
            const randomVideos = availableVideos.sort(() => 0.5 - Math.random()).slice(0, additionalVideosNeeded);
            setRecommendations([...matchedVideos, ...randomVideos]);
        } else {
            setRecommendations(matchedVideos.slice(0, 5));
        }

      } catch (error) {
        console.error("Failed to fetch AI recommendations:", error);
        const allVideos = await getVideos();
        const randomVideos = allVideos.sort(() => 0.5 - Math.random()).slice(0, 5);
        setRecommendations(randomVideos);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recommended For You</h2>
             <div className="flex space-x-4 overflow-x-auto pb-4">
                {[...Array(5)].map((_, i) => <RecommendationSkeleton key={i} />)}
            </div>
        </div>
    )
  }

  if (recommendations.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recommended For You</h2>
      <Carousel opts={{ align: "start", loop: true }}>
        <CarouselContent>
            {recommendations.map((video) => (
                <CarouselItem key={video.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <VideoCard video={video} />
                </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
