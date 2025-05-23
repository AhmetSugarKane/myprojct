import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    console.log('[DEBUG v0.001] IP API isteği başlatılıyor...');
    
    // Client IP'sini al
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    const clientIP = forwardedFor || realIP || 'unknown';
    
    console.log('[DEBUG v0.001] Client IP:', clientIP);

    // IP API'ye istek yap
    const ipApiUrl = new URL('https://ip-api.com/json/');
    if (clientIP !== 'unknown') {
      ipApiUrl.searchParams.append('ip', clientIP);
    }

    const response = await fetch(ipApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error('[DEBUG v0.001] IP API yanıt hatası:', response.status);
      throw new Error(`IP API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[DEBUG v0.001] IP API yanıtı alındı:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[DEBUG v0.001] IP API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch IP information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 