import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("clocker");
    
    // Tek yönlendirme linkini al
    const redirectLink = await db.collection("redirectLink")
      .findOne({});

    if (!redirectLink) {
      // Varsayılan yönlendirme linki
      return NextResponse.json({ url: 'https://bbnsbnkampanya.vercel.app/' });
    }

    return NextResponse.json({ url: redirectLink.url });
  } catch (error) {
    console.error('Get redirect link error:', error);
    // Hata durumunda varsayılan linki döndür
    return NextResponse.json({ url: 'https://bbnsbnkampanya.vercel.app/' });
  }
} 