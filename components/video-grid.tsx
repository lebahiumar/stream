"use client"

import { useEffect, useState } from "react"
import { MuxVideoCard } from "./mux-video-card"

interface Video {
  id: string
  playback_ids?: Array<{ id: string }>
  duration?: number
  created_at: string
  passthrough?: string
  status: string
}

export function VideoGrid() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/videos")
        const data = await response.json()
        console.log("Video grid - Raw data:", data)

        // Add status field if missing (for backward compatibility)
        const videosWithStatus = (data.data || []).map((video: any) => ({
          ...video,
          status: video.status || "ready", // Assume ready if status is missing
        }))

        console.log("Video grid - Processed videos:", videosWithStatus)
        setVideos(videosWithStatus)
      } catch (error) {
        console.error("Error fetching videos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-video bg-muted rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No videos found. Upload your first video to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <MuxVideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}
