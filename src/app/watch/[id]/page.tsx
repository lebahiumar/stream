import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share2, ListPlus } from 'lucide-react';
import { VideoCard } from '@/components/video-card';
import { Separator } from '@/components/ui/separator';
import { getVideo, getVideos } from '@/app/actions/mux';

export default async function WatchPage({ params }: { params: { id: string } }) {
  const video = await getVideo(params.id);

  if (!video) {
    notFound();
  }
  
  const allVideos = await getVideos();
  const relatedVideos = allVideos.filter(v => v.category === video.category && v.id !== video.id).slice(0, 5);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">
      <div className="flex-grow lg:w-2/3">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <VideoPlayer playbackId={video.playbackId} autoPlay />
        </div>
        <div className="mt-4 space-y-4">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={video.authorAvatar} alt={video.author} />
                        <AvatarFallback>{video.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{video.author}</p>
                        <p className="text-sm text-muted-foreground">{video.views} views · {video.uploadedAt}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary">
                        <ThumbsUp className="mr-2 h-4 w-4"/> Like
                    </Button>
                     <Button variant="secondary">
                        <ThumbsDown className="mr-2 h-4 w-4"/>
                    </Button>
                    <Button variant="secondary">
                        <Share2 className="mr-2 h-4 w-4"/> Share
                    </Button>
                    <Button variant="secondary">
                        <ListPlus className="mr-2 h-4 w-4"/> Save
                    </Button>
                </div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm">{video.description}</p>
            </div>
        </div>
         <Separator className="my-8" />
        <div>
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            {/* Comments section placeholder */}
            <p className="text-muted-foreground">Comments are coming soon!</p>
        </div>
      </div>
      <div className="lg:w-1/3 lg:max-w-md space-y-4">
        <h2 className="text-xl font-bold">Up Next</h2>
        {relatedVideos.map(relatedVideo => (
            <VideoCard key={relatedVideo.id} video={relatedVideo} />
        ))}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
    const videos = await getVideos();
    return videos.map(video => ({
        id: video.id,
    }));
}
