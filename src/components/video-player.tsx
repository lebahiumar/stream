'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Skeleton } from './ui/skeleton';
import { Maximize2, Pause, Play, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
  playbackId: string;
}

export function VideoPlayer({ playbackId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTime = () => setCurrent(video.currentTime);
    const handleDuration = () => setDuration(video.duration);
    video.addEventListener('timeupdate', handleTime);
    video.addEventListener('durationchange', handleDuration);
    return () => {
      video.removeEventListener('timeupdate', handleTime);
      video.removeEventListener('durationchange', handleDuration);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const handleSeek = (val: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    setCurrent(val[0]);
    video.currentTime = val[0];
  };

  const handleVolume = (val: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    setVolume(val[0]);
    video.volume = val[0];
    setMuted(val[0] === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!fullscreen) {
      if (video.requestFullscreen) video.requestFullscreen();
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'ArrowLeft') {
      videoRef.current!.currentTime = Math.max(0, current - 5);
    } else if (e.code === 'ArrowRight') {
      videoRef.current!.currentTime = Math.min(duration, current + 5);
    }
  };

  const format = (s: number) => {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  if (!playbackId) {
    return <Skeleton className="w-full aspect-video" />;
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group" tabIndex={0} onKeyDown={handleKeyDown}>
      <video
        ref={videoRef}
        src={`https://stream.mux.com/${playbackId}.m3u8`}
        className="w-full h-full object-contain bg-black"
        poster={`https://image.mux.com/${playbackId}/thumbnail.jpg?width=800&fit_mode=pad&time=1"}`}
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onVolumeChange={e => setMuted((e.target as HTMLVideoElement).muted)}
        controls={false}
        preload="metadata"
        tabIndex={-1}
      />
      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-100 group-hover:opacity-100 transition-opacity">
        {/* Seek bar */}
        <Slider
          min={0}
          max={duration || 1}
          value={[seeking ? current : current]}
          step={0.1}
          onValueChange={val => handleSeek(val)}
          className="w-full"
        />
        <div className="flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white">
              {playing ? <Pause /> : <Play />}
            </Button>
            <span className="text-xs text-white tabular-nums min-w-[48px]">{format(current)} / {format(duration)}</span>
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white">
              {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
            </Button>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[volume]}
              onValueChange={handleVolume}
              className="w-20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => { videoRef.current!.currentTime = 0; }} className="text-white">
              <RotateCcw />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleFullscreen} className="text-white">
              <Maximize2 />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
