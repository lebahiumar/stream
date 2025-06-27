import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import Mux from '@mux/mux-node';

export async function POST(req: NextRequest) {
  const signingSecret = process.env.MUX_WEBHOOK_SECRET;
  if (!signingSecret) {
    console.error('MUX_WEBHOOK_SECRET is not set. Cannot verify webhook.');
    return NextResponse.json({ message: 'Webhook secret not configured' }, { status: 500 });
  }

  const signature = headers().get('mux-signature');
  if (!signature) {
    console.warn('Webhook received without mux-signature.');
    return NextResponse.json({ message: 'Missing mux-signature' }, { status: 400 });
  }
  
  const body = await req.text();

  try {
    // The Mux SDK's verifySignature method returns the event, or throws an error if verification fails.
    const event = Mux.Webhooks.verifySignature(body, signature, signingSecret);

    if (event.type === 'video.asset.ready') {
      const assetId = event.data.id;
      console.log(`Mux Webhook: Asset ${assetId} is ready. Revalidating cache.`);
      
      // Revalidate the entire site to reflect the new video everywhere
      revalidatePath('/', 'layout');
    } else {
      console.log(`Mux Webhook: Received event '${event.type}', no action taken.`);
    }

    return NextResponse.json({ received: true });

  } catch (err)
 {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ message: 'Signature verification failed' }, { status: 400 });
  }
}
