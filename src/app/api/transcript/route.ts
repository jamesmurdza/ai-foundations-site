export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');
  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return NextResponse.json({ transcript });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch transcript' }, { status: 500 });
  }
} 