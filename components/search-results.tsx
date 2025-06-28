"use client"

import { useEffect, useState } from "react"
import { MuxVideoCard } from "./mux-video-card"

interface SearchResultsProps {
  query: string
}

interface Video {
  id: string
  playback_ids?: Array<{ id: string }>
  duration?: number
  created_at: string
  passthrough?: string
  status: string
}

export function SearchResults({ query }: SearchResultsProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // For now, we'll fetch all videos and filter client-side
        // In a real app, you'd implement server-side search
        const response = await fetch("/api/videos")
        const data = await response.json()

        const videosWithStatus = (data.data || []).map((video: any) => ({
          ...video,
          status: video.status || "ready",
        }))

        const filteredVideos = videosWithStatus.filter((video: Video) => {
          if (!video.passthrough) return false
          try {
            const metadata = JSON.parse(video.passthrough)
            const title = metadata.title || metadata.video_title || ""
            const description = metadata.description || metadata.video_description || ""
            const channel = metadata.channel || metadata.uploader || ""

            return (
              title.toLowerCase().includes(query.toLowerCase()) ||
              description.toLowerCase().includes(query.toLowerCase()) ||
              channel.toLowerCase().includes(query.toLowerCase())
            )
          } catch {
            return false
          }
        })

        setVideos(filteredVideos)
      } catch (error) {
        console.error("Error searching videos:", error)
      } finally {
        setLoading(false)
      }
    }

    if (query) {
      fetchVideos()
    } else {
      setLoading(false)
    }
  }, [query])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
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
        <p className="text-muted-foreground">No videos found for "{query}"</p>
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
