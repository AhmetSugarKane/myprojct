import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://ip-api.com/json/', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`IP API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('IP API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IP information' },
      { status: 500 }
    );
  }
} 