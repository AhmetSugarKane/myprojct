import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { ip, userAgent, timezone, isTurkishTimezone, timestamp } = data;
    
    // Log formatı: ip:userAgent:timezone:isTurkishTimezone:timestamp
    const logEntry = `${ip}:${userAgent}:${timezone}:${isTurkishTimezone}:${timestamp}\n`;
    
    const filePath = path.join(
      process.cwd(),
      isTurkishTimezone ? 'success.txt' : 'invalid.txt'
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