import fs from 'fs';
import path from 'path';

interface LogData {
  ip: string;
  country: string;
  city: string;
  isp: string;
  os: string;
  redirectStatus: boolean;
}

export async function logSuccessRedirect(data: LogData) {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Log writing error:', error);
  }
} 