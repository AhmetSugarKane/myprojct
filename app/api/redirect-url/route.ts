import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REDIRECT_URL_FILE = path.join(process.cwd(), 'redirect-url.txt');

// Varsayılan yönlendirme URL'si
let redirectUrl = 'https://example.com';

// URL'yi dosyadan oku
try {
  if (fs.existsSync(REDIRECT_URL_FILE)) {
    redirectUrl = fs.readFileSync(REDIRECT_URL_FILE, 'utf-8').trim();
  }
} catch (error) {
  console.error('Error reading redirect URL file:', error);
}

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
    
    // URL'yi dosyaya kaydet
    try {
      fs.writeFileSync(REDIRECT_URL_FILE, url);
    } catch (error) {
      console.error('Error writing redirect URL file:', error);
      return NextResponse.json({ 
        status: 'error',
        message: 'URL kaydedilirken bir hata oluştu'
      }, { status: 500 });
    }
    
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