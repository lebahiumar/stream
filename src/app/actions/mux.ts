'use server';

import Mux from '@mux/mux-node';
import type { Video } from '@/types';
import { formatDistanceToNow } from 'date-fns';

if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
  throw new Error('Mux credentials MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set in .env');
}

const mux = new Mux(
  process.env.MUX_TOKEN_ID,
  process.env.MUX_TOKEN_SECRET,
);

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

    // Mux 'created_at' is a Unix timestamp string. We need to parse it to a number and multiply by 1000 for JavaScript's Date object.
    const createdAtTimestamp = parseInt(asset.created_at, 10);
    const uploadedAtDate = !isNaN(createdAtTimestamp) ? new Date(createdAtTimestamp * 1000) : new Date();

    return {
        id: asset.id,
        title: meta.t || `Untitled Video ${asset.id}`,
        description: `This video is about ${meta.c || 'amazing content'}.`,
        playbackId: playbackId || '',
        thumbnailUrl: `https://image.mux.com/${playbackId}/thumbnail.png?width=600&height=400&fit_mode=crop`,
        category: meta.c || 'General',
        duration: asset.duration ? new Date(asset.duration * 1000).toISOString().substr(14, 5) : 'N/A',
        author: 'StreamVerse User',
        authorAvatar: 'https://placehold.co/40x40.png',
        views: '0',
        uploadedAt: formatDistanceToNow(uploadedAtDate) + ' ago',
    };
}


export async function createUploadUrl({ title, category }: { title: string, category: string }) {
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
    try {
        const assetIterator = await mux.video.assets.list({ limit: 100 });
        
        const allAssets = [];
        for await (const asset of assetIterator) {
            allAssets.push(asset);
        }

        const readyAssets = allAssets
            .filter(asset => asset.status === 'ready' && asset.playback_ids && asset.playback_ids.length > 0);

        if (readyAssets.length === 0 && allAssets.length > 0) {
            console.log(`getVideos: Found ${allAssets.length} total assets, but none are 'ready'. This might be because they are still processing. Mux will send a webhook when they are ready.`);
        }
        
        return readyAssets.map(muxAssetToVideo);
    } catch (e) {
        console.error('Error fetching videos from Mux:', e);
        return [];
    }
}


export async function getVideo(id: string): Promise<Video | null> {
    try {
        const asset = await mux.video.assets.retrieve(id);
        
        if (!asset) {
            return null;
        }

        if (asset.status !== 'ready' || !asset.playback_ids?.length) {
            console.log(`getVideo: Asset ${id} found but not in 'ready' state. Status: ${asset?.status}`);
            return null;
        }
        return muxAssetToVideo(asset);
    } catch (e) {
        // This will throw if the ID is not a valid asset ID format, or not found.
        // This is expected if a playback ID is passed, so we don't log an error.
        return null;
    }
}

export async function getAssetIdByPlaybackId(playbackId: string): Promise<string | null> {
    try {
        const playbackIdInfo = await mux.video.playbackIds.retrieve(playbackId);
        if (playbackIdInfo && playbackIdInfo.object?.type === 'asset') {
            return playbackIdInfo.object.id;
        }
        return null;
    } catch (e) {
        // This can fail if the ID is not a valid playback ID, which is expected.
        return null;
    }
}
