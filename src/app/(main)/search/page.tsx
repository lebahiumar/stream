import { getVideos } from '@/app/actions/mux';
import { VideoCard } from '@/components/video-card'
import type { Video } from '@/types'
import { SearchX } from 'lucide-react'

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const query = searchParams?.q || ''
  
  let filteredVideos: Video[] = [];

  if (query) {
    const allVideos = await getVideos();
    filteredVideos = allVideos.filter(
        (video) =>
          video.title.toLowerCase().includes(query.toLowerCase()) ||
          video.description.toLowerCase().includes(query.toLowerCase())
      );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold px-2 sm:px-0">
        {query ? `Search results for "${query}"` : 'Search for a video'}
      </h1>
      {query && filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
      {query && filteredVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground h-64 px-2">
          <SearchX className="h-16 w-16" />
          <p className="text-lg">No videos found for "{query}".</p>
          <p>Try searching for something else.</p>
        </div>
      )}
      {!query && (
         <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground h-64 px-2">
            <p className="text-lg">Use the search bar above to find amazing videos.</p>
        </div>
      )}
    </div>
  )
}
