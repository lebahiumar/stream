import { Suspense } from "react"
import { VideoPlayer } from "@/components/video-player"
import { VideoDetails } from "@/components/video-details"
import { VideoSidebar } from "@/components/video-sidebar"
import { Header } from "@/components/header"

interface VideoPageProps {
  params: {
    id: string
  }
}

export default function VideoPage({ params }: VideoPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Suspense fallback={<div className="aspect-video bg-muted rounded-lg animate-pulse" />}>
              <VideoPlayer videoId={params.id} />
            </Suspense>
            <Suspense fallback={<div>Loading video details...</div>}>
              <VideoDetails videoId={params.id} />
            </Suspense>
          </div>
          <div className="lg:col-span-1">
            <Suspense fallback={<div>Loading related videos...</div>}>
              <VideoSidebar currentVideoId={params.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
