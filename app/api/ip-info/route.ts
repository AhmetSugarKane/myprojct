import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() || 'Unknown';

    return NextResponse.json({
      status: 'success',
      ip,
      userAgent
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      status: 'error',
      ip: 'Unknown',
      userAgent: 'Unknown'
    });
  }
} 