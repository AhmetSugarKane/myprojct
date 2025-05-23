import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type Context = {
  params: {
    id: string;
  };
};

export async function PUT(
  request: NextRequest,
  context: Context
) {
  const id = context.params.id;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("clocker");

    const result = await db.collection("redirectLink").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          url,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
