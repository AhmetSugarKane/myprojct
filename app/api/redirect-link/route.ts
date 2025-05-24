import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

// Helper function to read links file
const readLinksFile = (): RedirectLinks => {
  const dataDir = path.join(process.cwd(), 'data');
  const linksPath = path.join(dataDir, 'redirect-links.json');
  
  if (!fs.existsSync(linksPath)) {
    return {};
  }

  const fileContent = fs.readFileSync(linksPath, 'utf-8');
  return JSON.parse(fileContent);
};

// Helper function to write links file
const writeLinksFile = (links: RedirectLinks) => {
  const dataDir = path.join(process.cwd(), 'data');
  const linksPath = path.join(dataDir, 'redirect-links.json');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(linksPath, JSON.stringify(links, null, 2));
};

export async function GET() {
  try {
    // Check cache first
    const now = Date.now();
    if (cachedUrl && (now - lastCacheTime) < CACHE_DURATION) {
      return NextResponse.json({ 
        url: cachedUrl,
        status: 'success',
        message: 'Using cached URL'
      });
    }

    const links = readLinksFile();
    
    // Get the first available URL
    const firstLink = Object.values(links)[0] as RedirectLink | undefined;
    cachedUrl = firstLink?.url || 'https://bbnsbnkampanya.vercel.app/';
    lastCacheTime = now;

    return NextResponse.json({ 
      url: cachedUrl,
      status: 'success',
      message: 'Redirect URL found in JSON file'
    });
  } catch (error) {
    console.error('Error reading redirect link:', error);
    return NextResponse.json({ 
      url: 'https://bbnsbnkampanya.vercel.app/',
      status: 'error',
      message: 'Error reading redirect URL, using default'
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ 
        status: 'error',
        message: 'URL is required'
      }, { status: 400 });
    }

    // Read existing links
    const links = readLinksFile();

    // Generate a unique key for the new link
    const linkKey = `link_${Date.now()}`;

    // Add new link
    links[linkKey] = {
      url,
      updatedAt: new Date().toISOString()
    };

    // Write back to file
    writeLinksFile(links);

    // Clear cache
    cachedUrl = null;
    lastCacheTime = 0;

    return NextResponse.json({ 
      status: 'success',
      message: 'Redirect link added successfully',
      link: links[linkKey]
    });
  } catch (error) {
    console.error('Error adding redirect link:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Error adding redirect link'
    }, { status: 500 });
  }
} 