import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('[DEBUG v0.005] IP API isteği başlatılıyor...');

    // Önce IP adresini al
    const ipResponse = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 }
    });

    if (!ipResponse.ok) {
      throw new Error('IP adresi alınamadı');
    }

    const ipData = await ipResponse.json();
    console.log('[DEBUG v0.005] IP adresi alındı:', ipData);

    // IP adresine göre ülke bilgisini al
    const countryResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 }
    });

    if (!countryResponse.ok) {
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
        query: ipData.ip
      });
    }

    const countryData = await countryResponse.json();
    console.log('[DEBUG v0.005] Ülke bilgisi alındı:', countryData);

    // Yanıtı formatla
    const formattedData = {
      status: 'success',
      country: countryData.country_name || 'Unknown',
      countryCode: countryData.country_code || 'Unknown',
      region: countryData.region || 'Unknown',
      regionName: countryData.region_name || 'Unknown',
      city: countryData.city || 'Unknown',
      isp: countryData.org || 'Unknown',
      org: countryData.org || 'Unknown',
      as: countryData.asn || 'Unknown',
      query: ipData.ip
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('[DEBUG v0.005] IP API Error:', error);
    
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