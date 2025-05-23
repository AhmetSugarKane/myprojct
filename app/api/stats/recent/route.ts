import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const successPath = path.join(process.cwd(), 'success.txt');
    const invalidPath = path.join(process.cwd(), 'invalid.txt');
    
    let successLogs: string[] = [];
    let invalidLogs: string[] = [];
    
    if (fs.existsSync(successPath)) {
      successLogs = fs.readFileSync(successPath, 'utf-8').split('\n').filter(Boolean);
    }
    
    if (fs.existsSync(invalidPath)) {
      invalidLogs = fs.readFileSync(invalidPath, 'utf-8').split('\n').filter(Boolean);
    }
    
    // Tüm logları birleştir
    const allLogs = [...successLogs, ...invalidLogs]
      .map(line => {
        const parts = line.split(':');
        const ip = parts[0] || '';
        const country = parts[1] || '';
        const city = parts[2] || '';
        const isp = parts[3] || '';
        const os = parts[4] || '';
        const status = parts[5] || 'false';
        const timestamp = parts[6] || '';
        
        return {
          ip,
          country,
          city,
          isp,
          os,
          redirectStatus: status === 'true',
          timestamp
        };
      })
      .sort((a, b) => {
        // Timestamp'e göre sırala (en yeni en üstte)
        return b.timestamp.localeCompare(a.timestamp);
      });
    
    return NextResponse.json(allLogs);
  } catch (error) {
    console.error('Error reading logs:', error);
    return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 });
  }
} 