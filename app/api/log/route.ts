import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { ip, country, city, isp, os, redirectStatus } = data;
    
    // Şu anki tarih ve saati al
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
    
    // Log formatı: ip:country:city:isp:os:status:timestamp
    const logEntry = `${ip}:${country}:${city}:${isp}:${os}:${redirectStatus}:${timestamp}\n`;
    
    const filePath = path.join(
      process.cwd(),
      redirectStatus ? 'success.txt' : 'invalid.txt'
    );
    
    // Dosyaya ekle
    fs.appendFileSync(filePath, logEntry);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing log:', error);
    return NextResponse.json(
      { error: 'Failed to write log' },
      { status: 500 }
    );
  }
} 