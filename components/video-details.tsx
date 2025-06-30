"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ThumbsUp, ThumbsDown, Share, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { parseISO, isValid } from "date-fns"

interface VideoDetailsProps {
  videoId: string
}

interface VideoData {
  id: string
  created_at: string
  passthrough?: string
  duration?: number
}

export function VideoDetails({ videoId }: VideoDetailsProps) {
  const [video, setVideo] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}`)
        const data = await response.json()
        setVideo(data.data)
      } catch (error) {
        console.error("Error fetching video:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [videoId])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    )
  }

  if (!video) {
    return <div>Video not found</div>
  }

  let metadata = { title: "Untitled Video", description: "" }
  try {
    if (video.passthrough) {
      metadata = JSON.parse(video.passthrough)
    }
  } catch (e) {
    // Use default metadata
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{metadata.title}</h1>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Uploaded {(() => {
            if (!video.created_at) return "unknown date"
            const d = parseISO(video.created_at)
            return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "unknown date"
          })()}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Share className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {metadata.description && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm whitespace-pre-wrap">{metadata.description}</p>
        </div>
      )}
    </div>
  )
}
