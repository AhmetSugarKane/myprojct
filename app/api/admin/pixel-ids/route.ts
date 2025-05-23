import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: Tüm pixel ID'leri getir
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("clocker");
    
    const pixelIds = await db.collection("pixelId")
      .find({})
      .toArray();

    return NextResponse.json(pixelIds);
  } catch (error) {
    console.error('Get pixel IDs error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Yeni pixel ID ekle
export async function POST(request: Request) {
  try {
    const { pixelId } = await request.json();

    if (!pixelId) {
      return NextResponse.json({ error: 'Pixel ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("clocker");
    
    const result = await db.collection("pixelId").insertOne({
      pixelId,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      _id: result.insertedId,
      pixelId,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Add pixel ID error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Pixel ID'yi sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("clocker");
    
    await db.collection("pixelId").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete pixel ID error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 