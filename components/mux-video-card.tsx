"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { parseISO, isValid } from "date-fns"
import { Play, Clock } from "lucide-react"

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
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&fit_mode=pad&time=2`
    : "/placeholder.svg?height=360&width=640"

  // Enhanced metadata parsing with debug logging
  let metadata = {
    title: "Untitled Video",
    description: "",
    channel: "Unknown Channel",
  }

  console.log(`Video ${video.id} - Raw passthrough:`, video.passthrough)

  try {
    if (video.passthrough) {
      const parsed = JSON.parse(video.passthrough)
      console.log(`Video ${video.id} - Parsed passthrough:`, parsed)

      metadata = {
        title: parsed.title || parsed.video_title || parsed.name || `Video ${video.id.slice(0, 8)}`,
        description: parsed.description || parsed.video_description || parsed.desc || "",
        channel: parsed.channel || parsed.uploader || parsed.creator || parsed.author || "Unknown Channel",
      }
    } else {
      console.log(`Video ${video.id} - No passthrough data, using fallback`)
      // Use video ID as fallback title
      metadata.title = `Video ${video.id.slice(0, 8)}`
    }
  } catch (e) {
    console.warn(`Video ${video.id} - Failed to parse passthrough:`, e)
    // Use video ID as fallback title
    metadata.title = `Video ${video.id.slice(0, 8)}`
  }

  console.log(`Video ${video.id} - Final metadata:`, metadata)

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00"
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isVideoReady = video.status === "ready" && playbackId

  return (
    <Link href={`/video/${video.id}`} className="group block">
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
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=360&width=640"
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/80 rounded-full p-3">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
              </div>
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(video.duration)}</span>
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

        <div className="space-y-2">
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {metadata.channel.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium line-clamp-2 group-hover:text-primary leading-tight">{metadata.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{metadata.channel}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                <span>
                  {(() => {
                    if (!video.created_at) return "Unknown date"
                    const d = parseISO(video.created_at)
                    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "Unknown date"
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
        </div>
      </div>
    </Link>
  )
}
