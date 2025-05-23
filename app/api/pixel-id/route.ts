import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("clocker");
    
    // Tek pixel ID'yi al
    const pixelId = await db.collection("pixelId")
      .findOne({});

    if (!pixelId) {
      return NextResponse.json({ id: '' });
    }

    return NextResponse.json({ id: pixelId.id });
  } catch (error) {
    console.error('Get pixel ID error:', error);
    return NextResponse.json({ id: '' });
  }
} 