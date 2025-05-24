import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() || 'Unknown';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isTurkishTimezone = timezone === 'Europe/Istanbul' || timezone.includes('Turkey');

    // Log the access
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip,
        userAgent,
        timezone,
        isTurkishTimezone,
        timestamp: new Date().toISOString()
      }),
    });

    return NextResponse.json({
      status: 'success',
      isTurkishTimezone,
      timezone,
      ip,
      userAgent
    });
  } catch (error) {
    console.error('Timezone check error:', error);
    return NextResponse.json({
      status: 'error',
      isTurkishTimezone: false,
      timezone: 'Unknown',
      ip: 'Unknown',
      userAgent: 'Unknown'
    });
  }
} 