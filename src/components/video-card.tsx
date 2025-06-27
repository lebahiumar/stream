import Link from 'next/link';
import Image from 'next/image';
import { Video } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Eye } from 'lucide-react';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/watch/${video.id}`} className="group">
      <Card className="overflow-hidden border-0 bg-transparent shadow-none transition-all duration-300 hover:bg-accent/50">
        <CardContent className="p-0">
          <div className="relative aspect-video">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
            />
             <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
              {video.duration}
            </div>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={video.authorAvatar} alt={video.author} />
              <AvatarFallback>{video.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="font-semibold leading-tight group-hover:text-primary">{video.title}</h3>
              <p className="text-sm text-muted-foreground">{video.author}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{video.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{video.uploadedAt}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
