"use client"

import { useEffect, useState } from "react"
import { MuxVideoCard } from "./mux-video-card"

interface VideoSidebarProps {
  currentVideoId: string
}

interface Video {
  id: string
  playback_ids?: Array<{ id: string }>
  duration?: number
  created_at: string
  passthrough?: string
  status: string
}

export function VideoSidebar({ currentVideoId }: VideoSidebarProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/videos?limit=10")
        const data = await response.json()
        // Filter out current video and only show ready videos
        const filteredVideos = (data.data || [])
          .filter((video: Video) => video.id !== currentVideoId && video.status === "ready")
          .slice(0, 8)
        setVideos(filteredVideos)
      } catch (error) {
        console.error("Error fetching videos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [currentVideoId])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex space-x-3">
            <div className="w-40 aspect-video bg-muted rounded animate-pulse" />
            <div className="flex-1 space-y-2">
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
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No related videos available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Related Videos</h2>
      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="flex space-x-3">
            <div className="w-40 flex-shrink-0">
              <MuxVideoCard video={video} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
