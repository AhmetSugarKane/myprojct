import { NextResponse } from 'next/server';

// Varsayılan yönlendirme URL'si
let redirectUrl = process.env.REDIRECT_URL || 'https://example.com';

export async function GET() {
  return NextResponse.json({ redirectUrl });
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

    // URL'yi güncelle
    redirectUrl = url;
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Yönlendirme URL\'si güncellendi',
      redirectUrl 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: 'URL güncellenirken bir hata oluştu'
    }, { status: 500 });
  }
} 