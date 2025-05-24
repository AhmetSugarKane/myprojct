import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const LOG_FILE_PATH = 'data/logs.json';

async function updateLogFile(logData: any) {
  try {
    // Mevcut dosyayı al
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${LOG_FILE_PATH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    let currentContent = '[]';
    let sha = '';

    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      currentContent = Buffer.from(fileData.content, 'base64').toString();
      sha = fileData.sha;
    }

    // Yeni log'u ekle
    const logs = JSON.parse(currentContent);
    logs.push({
      ...logData,
      timestamp: new Date().toISOString()
    });

    // Son 1000 log'u tut
    const recentLogs = logs.slice(-1000);

    // Dosyayı güncelle
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${LOG_FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update access logs',
          content: Buffer.from(JSON.stringify(recentLogs, null, 2)).toString('base64'),
          sha: sha
        })
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to update log file');
    }

    return true;
  } catch (error) {
    console.error('Error updating log file:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ip, userAgent, timezone, isTurkishTimezone, platform, language, screenResolution, browserInfo } = body;

    // Log verisini hazırla
    const logData = {
      ip,
      userAgent,
      timezone,
      isTurkishTimezone,
      platform,
      language,
      screenResolution,
      browserInfo
    };

    // GitHub'a kaydet
    const success = await updateLogFile(logData);

    if (!success) {
      throw new Error('Failed to save log');
    }

    return NextResponse.json({ 
      status: 'success',
      message: 'Log kaydedildi'
    });
  } catch (error) {
    console.error('Log kayıt hatası:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Log kaydedilemedi'
    }, { status: 500 });
  }
} 