"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Share, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
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
  const { toast } = useToast()

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

  const handleShare = async () => {
    const videoUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: metadata.title,
          url: videoUrl,
        })
        toast({
          title: "Video shared!",
          description: "The video link has been shared.",
        })
      } catch (error) {
        console.error("Error sharing:", error)
        toast({
          title: "Sharing failed",
          description: "Could not share the video.",
          variant: "destructive",
        })
      }
    } else {
      try {
        await navigator.clipboard.writeText(videoUrl)
        toast({
          title: "Link copied!",
          description: "The video link has been copied to your clipboard.",
        })
      } catch (err) {
        console.error("Failed to copy:", err)
        toast({
          title: "Copy failed",
          description: "Could not copy the video link to clipboard.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDownload = () => {
    if (video?.id) {
      const downloadUrl = `https://stream.mux.com/${video.id}.mp4`
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${metadata.title || 'video'}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: "Download started!",
        description: "Your video download should begin shortly.",
      })
    } else {
      toast({
        title: "Download failed",
        description: "Could not find video ID for download.",
        variant: "destructive",
      })
    }
  }

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
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
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
