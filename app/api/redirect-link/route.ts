import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface RedirectLink {
  url: string;
  updatedAt: string;
}

interface RedirectLinks {
  [key: string]: RedirectLink;
}

// Cache the redirect URL
let cachedUrl: string | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  try {
    // Log request details
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    console.log('Redirect Request:', {
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      url: request.url
    });

    // Check cache first
    const now = Date.now();
    if (cachedUrl && (now - lastCacheTime) < CACHE_DURATION) {
      console.log('Using cached URL:', cachedUrl);
      return NextResponse.json({ url: cachedUrl });
    }

    // Read from file
    const dataDir = path.join(process.cwd(), 'data');
    const linksPath = path.join(dataDir, 'redirect-links.json');
    
    console.log('Checking file path:', linksPath);
    
    if (!fs.existsSync(linksPath)) {
      console.log('No redirect file found, using default URL');
      cachedUrl = 'https://bbnsbnkampanya.vercel.app/';
      lastCacheTime = now;
      return NextResponse.json({ url: cachedUrl });
    }

    const fileContent = fs.readFileSync(linksPath, 'utf-8');
    const links: RedirectLinks = JSON.parse(fileContent);
    
    console.log('Available redirect links:', Object.keys(links).length);
    
    // Get the first available URL
    const firstLink = Object.values(links)[0] as RedirectLink | undefined;
    cachedUrl = firstLink?.url || 'https://bbnsbnkampanya.vercel.app/';
    lastCacheTime = now;

    console.log('Selected redirect URL:', cachedUrl);
    return NextResponse.json({ url: cachedUrl });
  } catch (error) {
    console.error('Redirect Error Details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ url: 'https://bbnsbnkampanya.vercel.app/' });
  }
} 