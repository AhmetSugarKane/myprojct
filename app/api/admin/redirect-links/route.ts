import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: Tüm yönlendirme linklerini getir
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("clocker");
    
    const redirectLinks = await db.collection("redirectLink")
      .find({})
      .toArray();

    return NextResponse.json(redirectLinks);
  } catch (error) {
    console.error('Get redirect links error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Yeni yönlendirme linki ekle
export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("clocker");
    
    const result = await db.collection("redirectLink").insertOne({
      url,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      _id: result.insertedId,
      url,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Add redirect link error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Yönlendirme linkini sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("clocker");
    
    await db.collection("redirectLink").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete redirect link error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 