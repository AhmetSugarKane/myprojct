import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE() {
  try {
    const successPath = path.join(process.cwd(), 'success.txt');
    const invalidPath = path.join(process.cwd(), 'invalid.txt');
    
    // Dosyaları temizle
    if (fs.existsSync(successPath)) {
      fs.writeFileSync(successPath, '');
    }
    
    if (fs.existsSync(invalidPath)) {
      fs.writeFileSync(invalidPath, '');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing logs:', error);
    return NextResponse.json(
      { error: 'Failed to clear logs' },
      { status: 500 }
    );
  }
} 