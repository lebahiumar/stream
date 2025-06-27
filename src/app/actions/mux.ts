'use server';

import Mux from '@mux/mux-node';
import type { Video } from '@/types';
import { formatDistanceToNow } from 'date-fns';

if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
  console.warn('Mux credentials not set in .env, Mux features will fail.');
}

const mux = (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET) 
  ? new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
    })
  : null;

function muxAssetToVideo(asset: Mux.Video.Asset): Video {
    let meta = { t: '', c: '' };
    if (asset.passthrough) {
        try {
            meta = JSON.parse(asset.passthrough);
        } catch (e) {
            console.error('Could not parse passthrough for asset:', asset.id);
        }
    }

    const playbackId = asset.playback_ids?.[0]?.id;
    if (!playbackId) {
        console.warn(`Asset ${asset.id} has no playback ID.`);
    }

    return {
        id: asset.id,
        title: meta.t || `Untitled Video ${asset.id}`,
        description: `This video is about ${meta.c || 'amazing content'}. Uploaded ${formatDistanceToNow(new Date(asset.created_at))} ago.`,
        playbackId: playbackId || '',
        thumbnailUrl: `https://image.mux.com/${playbackId}/thumbnail.png?width=600&height=400&fit_mode=crop`,
        category: meta.c || 'General',
        duration: new Date(asset.duration * 1000).toISOString().substr(14, 5),
        author: 'StreamVerse User',
        authorAvatar: 'https://placehold.co/40x40.png',
        views: '0',
        uploadedAt: formatDistanceToNow(new Date(asset.created_at)) + ' ago',
    };
}


export async function createUploadUrl({ title, category }: { title: string, category: string }) {
  if (!mux) {
    return { error: 'Mux is not configured. Please add credentials to your .env file.' };
  }

  try {
    const passthrough = JSON.stringify({ t: title, c: category });
    if (passthrough.length > 255) {
        return { error: 'Title and category are too long. Please shorten them.' };
    }

    const upload = await mux.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        passthrough,
        playback_policy: ['public'],
        mp4_support: 'standard',
      },
    });

    if (upload.error) {
      throw new Error(upload.error.message);
    }
    
    return { url: upload.url };
  } catch (e) {
    console.error('Error creating Mux upload URL:', e);
    if (e instanceof Error) {
        return { error: e.message };
    }
    return { error: 'An unknown error occurred during upload creation.' };
  }
}

export async function getVideos(): Promise<Video[]> {
    if (!mux) {
        console.error('Mux is not configured.');
        return [];
    }

    try {
        const assets = await mux.video.assets.list({ limit: 100 });
        
        const readyAssets = assets
            .filter(asset => asset.status === 'ready' && asset.playback_ids && asset.playback_ids.length > 0);

        if (readyAssets.length === 0 && assets.length > 0) {
            console.log(`getVideos: Found ${assets.length} total assets, but none are 'ready'. This might be because they are still processing. Mux will send a webhook when they are ready.`);
        }
        
        return readyAssets.map(muxAssetToVideo);
    } catch (e) {
        console.error('Error fetching videos from Mux:', e);
        return [];
    }
}


export async function getVideo(id: string): Promise<Video | null> {
    if (!mux) {
        console.error('Mux is not configured.');
        return null;
    }

    try {
        const asset = await mux.video.assets.get(id);
        if (!asset || asset.status !== 'ready' || !asset.playback_ids?.length) {
            console.log(`getVideo: Asset ${id} found but not in 'ready' state. Status: ${asset?.status}`);
            return null;
        }
        return muxAssetToVideo(asset);
    } catch (e) {
        console.error(`Error fetching video ${id} from Mux:`, e);
        return null;
    }
}