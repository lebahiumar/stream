export type Video = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  playbackId: string;
  category: string;
  duration: string;
  author: string;
  authorAvatar: string;
  views: string;
  uploadedAt: string;
};

export type Category = {
  name: string;
  videos: Video[];
};
