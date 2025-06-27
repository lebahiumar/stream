'use client';

import MuxPlayer from "@mux/mux-player-react";
import type { MuxPlayerProps } from "@mux/mux-player-react";
import { Skeleton } from "./ui/skeleton";

interface VideoPlayerProps extends MuxPlayerProps {
  playbackId: string;
}

export function VideoPlayer({ playbackId, ...props }: VideoPlayerProps) {
  if (!playbackId) {
    return (
      <Skeleton className="w-full aspect-video" />
    );
  }
  
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      className="w-full h-full"
      {...props}
    />
  );
}
