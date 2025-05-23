import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface RedirectLink {
  url: string;
  updatedAt: string;
}

interface RedirectLinks {
  [key: string]: RedirectLink;
}

export async function PUT(request: NextRequest) {
  try {
    const { url } = await request.json();
    const id = request.url.split('/').pop();

    if (!url || !id) {
      return NextResponse.json({ error: 'URL and ID are required' }, { status: 400 });
    }

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Read existing links
    const linksPath = path.join(dataDir, 'redirect-links.json');
    let links: RedirectLinks = {};
    
    if (fs.existsSync(linksPath)) {
      const fileContent = fs.readFileSync(linksPath, 'utf-8');
      links = JSON.parse(fileContent);
    }

    // Update the link
    links[id] = {
      url,
      updatedAt: new Date().toISOString()
    };

    // Save back to file
    fs.writeFileSync(linksPath, JSON.stringify(links, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
