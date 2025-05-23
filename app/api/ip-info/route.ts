import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('[DEBUG v0.007] IP API isteği başlatılıyor...');

    // Get client IP from headers
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

    if (!ip) {
      console.error('[DEBUG v0.007] IP adresi bulunamadı');
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

    // Get location data from ipapi.com
    const geoResponse = await fetch(`https://ipapi.com/ip_api.php?ip=${ip}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 }
    });

    if (!geoResponse.ok) {
      console.error('[DEBUG v0.007] Geo API yanıt hatası:', geoResponse.status);
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
        query: ip
      });
    }

    const geoData = await geoResponse.json();
    console.log('[DEBUG v0.007] Geo API yanıtı alındı:', geoData);

    // Format the response
    const formattedData = {
      status: 'success',
      country: geoData.country_name || 'Unknown',
      countryCode: geoData.country_code || 'Unknown',
      region: geoData.region_code || 'Unknown',
      regionName: geoData.region_name || 'Unknown',
      city: geoData.city || 'Unknown',
      isp: geoData.connection?.isp || 'Unknown',
      org: geoData.connection?.organization || 'Unknown',
      as: geoData.connection?.asn || 'Unknown',
      query: ip
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('[DEBUG v0.007] IP API Error:', error);
    
    // Default response in case of error
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