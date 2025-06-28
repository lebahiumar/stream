"use client"

import { useEffect, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

// Dynamically import MuxPlayer to avoid SSR issues
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-muted rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading player...</p>
      </div>
    </div>
  ),
})

interface VideoPlayerProps {
  videoId: string
}

interface VideoAsset {
  id: string
  status: "ready" | "errored" | "preparing" | string
  playback_ids?: Array<{ id: string; policy: "public" | "signed" }>
  duration?: number
  passthrough?: string
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [asset, setAsset] = useState<VideoAsset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  /* ------------------------------------------------------------ */
  /* 1. Fetch asset info                                          */
  /* ------------------------------------------------------------ */
  const fetchAsset = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/videos/${videoId}`)
      const json = await res.json()

      if (json.error) throw new Error(json.error)
      if (json.warning) console.warn(json.warning)

      setAsset(json.data)
    } catch (e) {
      console.error("Asset fetch failed:", e)
      setError("Could not load video metadata.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAsset()
  }, [videoId, retryCount])

  /* ------------------------------------------------------------ */
  /* 2. Auto-retry for processing videos                          */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    if (!asset || asset.status === "ready") return

    const timer = setTimeout(() => {
      console.log(`Video status: ${asset.status}, retrying...`)
      setRetryCount((c) => c + 1)
    }, 10000) // Retry every 10 seconds for processing videos

    return () => clearTimeout(timer)
  }, [asset])

  /* ------------------------------------------------------------ */
  /* 3. Retry functionality                                       */
  /* ------------------------------------------------------------ */
  const handleRetry = () => {
    setRetryCount((c) => c + 1)
    setError(null)
  }

  /* ------------------------------------------------------------ */
  /* 4. Render states                                             */
  /* ------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="aspect-video bg-muted rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <div>
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
          <p className="text-muted-foreground">Video not found</p>
        </div>
      </div>
    )
  }

  if (asset.status !== "ready") {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Video is processing...</p>
          <p className="text-sm text-muted-foreground">Status: {asset.status}</p>
          <p className="text-xs text-muted-foreground">This usually takes 1-2 minutes</p>
        </div>
      </div>
    )
  }

  if (!asset.playback_ids?.length) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
          <p className="text-muted-foreground">No playback ID available</p>
        </div>
      </div>
    )
  }

  // Parse video metadata
  let metadata = { title: "Untitled Video", description: "" }
  try {
    if (asset.passthrough) {
      metadata = JSON.parse(asset.passthrough)
    }
  } catch (e) {
    console.warn("Failed to parse video metadata")
  }

  const playbackId = asset.playback_ids[0].id

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <MuxPlayer
        playbackId={playbackId}
        accentColor="#ea580c"
        metadata={{
          video_title: metadata.title,
          video_id: asset.id,
          viewer_user_id: "anonymous-user", // You can replace this with actual user ID
        }}
        streamType="on-demand"
        autoPlay={false}
        muted={false}
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: "16/9",
        }}
        onError={(error) => {
          console.error("Mux Player error:", error)
          setError("Video playback failed")
        }}
        onLoadStart={() => {
          console.log("Video loading started")
        }}
        onCanPlay={() => {
          console.log("Video can play")
        }}
      />
    </div>
  )
}
