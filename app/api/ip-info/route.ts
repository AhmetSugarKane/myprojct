import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[DEBUG v0.002] IP API isteği başlatılıyor...');

    // IP API'ye istek yap
    const response = await fetch('https://ip-api.com/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });

    console.log('[DEBUG v0.002] IP API yanıt durumu:', response.status);

    if (!response.ok) {
      console.error('[DEBUG v0.002] IP API yanıt hatası:', response.status);
      throw new Error(`IP API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[DEBUG v0.002] IP API yanıtı alındı:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[DEBUG v0.002] IP API Error:', error);
    
    // Hata durumunda varsayılan yanıt
    return NextResponse.json({
      status: 'success',
      country: 'TR',
      countryCode: 'TR',
      region: 'Unknown',
      regionName: 'Unknown',
      city: 'Unknown',
      isp: 'Unknown',
      org: 'Unknown',
      as: 'Unknown',
      query: 'Unknown'
    });
  }
} 