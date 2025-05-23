import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("clocker");
    
    // Get the first pixel ID
    const pixelId = await db.collection("pixelId")
      .findOne({});

    if (!pixelId) {
      return NextResponse.json({ pixelId: '' });
    }

    return NextResponse.json({ pixelId: pixelId.pixelId });
  } catch (error) {
    console.error('Get pixel ID error:', error);
    return NextResponse.json({ pixelId: '' });
  }
} 