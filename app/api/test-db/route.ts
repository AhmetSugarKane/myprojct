import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("clocker");
    
    // Test bağlantısı
    await db.command({ ping: 1 });
    
    // Admin kullanıcısını kontrol et
    const admin = await db.collection("admins").findOne({ username: process.env.ADMIN_USERNAME });
    
    if (!admin) {
      // Admin kullanıcısı yoksa oluştur
      await db.collection("admins").insertOne({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        role: "admin",
        createdAt: new Date()
      });
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'MongoDB bağlantısı başarılı',
      adminExists: !!admin
    });
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'MongoDB bağlantısı başarısız',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 