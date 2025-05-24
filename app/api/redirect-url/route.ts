import { NextResponse } from 'next/server';

// Sabit yönlendirme URL'si
const REDIRECT_URL = 'https://bbnsbnkampanya.vercel.app/';

export async function GET() {
  return NextResponse.json({ redirectUrl: REDIRECT_URL });
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    // URL formatını kontrol et
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ 
        status: 'error',
        message: 'Geçersiz URL formatı'
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Yönlendirme URL\'si güncellendi',
      redirectUrl: REDIRECT_URL
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: 'URL güncellenirken bir hata oluştu'
    }, { status: 500 });
  }
} 