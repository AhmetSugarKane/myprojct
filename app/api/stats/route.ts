import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const successPath = path.join(process.cwd(), 'success.txt');
    const invalidPath = path.join(process.cwd(), 'invalid.txt');

    let successCount = 0;
    let invalidCount = 0;

    try {
      if (fs.existsSync(successPath)) {
        const content = fs.readFileSync(successPath, 'utf-8');
        successCount = content.split('\n').filter(line => line.trim()).length;
      }
    } catch (error) {
      console.error('Error reading success.txt:', error);
    }

    try {
      if (fs.existsSync(invalidPath)) {
        const content = fs.readFileSync(invalidPath, 'utf-8');
        invalidCount = content.split('\n').filter(line => line.trim()).length;
      }
    } catch (error) {
      console.error('Error reading invalid.txt:', error);
    }

    const totalCount = successCount + invalidCount;

    const response = {
      totalRedirects: totalCount,
      successfulRedirects: successCount,
      failedRedirects: invalidCount
    };

    console.log('Stats response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate statistics' },
      { status: 500 }
    );
  }
} 