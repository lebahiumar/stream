"use client"

import { useEffect, useRef } from "react"

interface MuxVideoPlayerProps {
  playbackId: string
  poster?: string
  className?: string
}

export function MuxVideoPlayer({ playbackId, poster, className = "" }: MuxVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!playbackId || !videoRef.current) return

    const video = videoRef.current
    const hlsUrl = `https://stream.mux.com/${playbackId}.m3u8`
    const mp4Url = `https://stream.mux.com/${playbackId}/high.mp4`

    // Check if browser supports HLS natively (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl
      return
    }

    // For other browsers, try to load HLS.js
    const loadHLS = async () => {
      try {
        const Hls = (await import("hls.js")).default

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: false,
            lowLatencyMode: false,
          })

          hls.loadSource(hlsUrl)
          hls.attachMedia(video)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("HLS manifest loaded")
          })

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("HLS error:", data)
            if (data.fatal) {
              // Fallback to MP4
              video.src = mp4Url
            }
          })

          // Cleanup function
          return () => {
            hls.destroy()
          }
        } else {
          // HLS not supported, use MP4 fallback
          video.src = mp4Url
        }
      } catch (error) {
        console.error("Failed to load HLS.js:", error)
        // Fallback to MP4
        video.src = mp4Url
      }
    }

    const cleanup = loadHLS()

    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then((fn) => fn && fn())
      }
    }
  }, [playbackId])

  return (
    <video
      ref={videoRef}
      controls
      className={`w-full h-full ${className}`}
      poster={poster}
      preload="metadata"
      crossOrigin="anonymous"
      playsInline
    >
      <source src={`https://stream.mux.com/${playbackId}/high.mp4`} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}
