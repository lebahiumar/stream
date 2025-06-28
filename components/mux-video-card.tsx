"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { parseISO, isValid } from "date-fns"
import { Play } from "lucide-react"

interface MuxVideoCardProps {
  video: {
    id: string
    playback_ids?: Array<{ id: string }>
    duration?: number
    created_at: string
    passthrough?: string
    status: string
  }
}

export function MuxVideoCard({ video }: MuxVideoCardProps) {
  const playbackId = video.playback_ids?.[0]?.id
  const thumbnailUrl = playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&fit_mode=pad&time=0`
    : "/placeholder.svg?height=360&width=640"

  let metadata = { title: "Untitled Video", description: "" }
  try {
    if (video.passthrough) {
      metadata = JSON.parse(video.passthrough)
    }
  } catch (e) {
    // Use default metadata
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isVideoReady = video.status === "ready" && playbackId

  return (
    <Link href={`/video/${video.id}`} className="group">
      <div className="space-y-3">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          {isVideoReady ? (
            <>
              <Image
                src={thumbnailUrl || "/placeholder.svg"}
                alt={metadata.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/80 rounded-full p-3">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
              </div>
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                  {formatDuration(video.duration)}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {video.status === "preparing" ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-xs text-muted-foreground">Processing...</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Video unavailable</p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium line-clamp-2 group-hover:text-primary">{metadata.title}</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
              {(() => {
                if (!video.created_at) return "Unknown upload date"
                const d = parseISO(video.created_at)
                return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "Unknown upload date"
              })()}
            </span>
            {video.status !== "ready" && (
              <>
                <span>•</span>
                <span className="text-yellow-600 capitalize">{video.status}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
