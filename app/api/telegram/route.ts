import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Telegram bot bilgileri
const TELEGRAM_BOT_TOKEN = '7912995479:AAEPt_DSZ5nZyAHvTuLG_QerZjGqyZ2xTaw';
const TELEGRAM_CHAT_ID = '-1002590961123';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ip, userAgent, timezone, isTurkishTimezone, platform, language, screenResolution } = body;

    const message = `
🔔 Yeni Ziyaret!

📍 IP: ${ip}
🌍 Timezone: ${timezone}
🇹🇷 Türkiye: ${isTurkishTimezone ? 'Evet' : 'Hayır'}
💻 Platform: ${platform}
🌐 Dil: ${language}
📱 Ekran: ${screenResolution}
🔍 User Agent: ${userAgent}
⏰ Zaman: ${new Date().toLocaleString('tr-TR')}
    `.trim();

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send Telegram message');
    }

    return NextResponse.json({ 
      status: 'success',
      message: 'Telegram notification sent'
    });
  } catch (error) {
    console.error('Telegram notification error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to send Telegram notification'
    }, { status: 500 });
  }
} 