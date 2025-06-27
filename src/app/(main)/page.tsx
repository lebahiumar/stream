import { VideoCard } from '@/components/video-card';
import { AiRecommendations } from '@/components/ai-recommendations';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getVideos } from '@/app/actions/mux';
import type { Category, Video } from '@/types';

async function getCategories(): Promise<Category[]> {
  const videos = await getVideos();
  const categoryMap = new Map<string, Video[]>();

  videos.forEach(video => {
    if (!categoryMap.has(video.category)) {
      categoryMap.set(video.category, []);
    }
    categoryMap.get(video.category)!.push(video);
  });

  return Array.from(categoryMap.entries()).map(([name, videos]) => ({ name, videos }));
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="space-y-12">
      <AiRecommendations />
      
      {categories.map((category) => (
        <div key={category.name} className="space-y-4">
          <h2 className="text-2xl font-bold">{category.name}</h2>
          <Carousel opts={{ align: "start" }}>
            <CarouselContent>
              {category.videos.map((video) => (
                <CarouselItem key={video.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <VideoCard video={video} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      ))}
    </div>
  );
}
