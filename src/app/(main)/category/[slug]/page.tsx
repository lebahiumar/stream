import { VideoCard } from '@/components/video-card'
import type { Video } from '@/types'
import { getVideos } from '@/app/actions/mux';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = decodeURIComponent(params.slug);
  const allVideos = await getVideos();
  const filteredVideos: Video[] = allVideos.filter(
    (video) => video.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold capitalize">{category}</h1>
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <p>No videos found in this category.</p>
      )}
    </div>
  )
}

export async function generateStaticParams() {
    const allVideos = await getVideos();
    const categories = [...new Set(allVideos.map(v => v.category.toLowerCase()))];
    return categories.map(slug => ({ slug }));
}
