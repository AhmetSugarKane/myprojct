import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('admin_token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json(
        { message: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    return NextResponse.json({ 
      message: 'Yetkilendirme başarılı',
      user: decoded 
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Geçersiz token' },
      { status: 401 }
    );
  }
} 