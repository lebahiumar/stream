import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { parseISO, isValid } from "date-fns"

interface VideoCardProps {
  video: {
    id: string
    playback_ids?: Array<{ id: string }>
    duration?: number
    created_at: string
    passthrough?: string
  }
}

export function VideoCard({ video }: VideoCardProps) {
  const playbackId = video.playback_ids?.[0]?.id
  const thumbnailUrl = playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&fit_mode=pad`
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

  return (
    <Link href={`/video/${video.id}`} className="group">
      <div className="space-y-3">
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image
            src={thumbnailUrl || "/placeholder.svg"}
            alt={metadata.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium line-clamp-2 group-hover:text-primary">{metadata.title}</h3>
          {/* Upload time */}
          <p className="text-sm text-muted-foreground">
            {(() => {
              if (!video.created_at) return "Unknown upload date"
              const d = parseISO(video.created_at)
              return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "Unknown upload date"
            })()}
          </p>
        </div>
      </div>
    </Link>
  )
}
