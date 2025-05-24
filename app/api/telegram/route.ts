import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Telegram bot bilgileri
const TELEGRAM_BOT_TOKEN = '7912995479:AAEPt_DSZ5nZyAHvTuLG_QerZjGqyZ2xTaw';
const TELEGRAM_CHAT_ID = '-4831817916';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ip, userAgent, timezone, isTurkishTimezone, platform, language, screenResolution } = body;

    // HTML karakterlerini temizle ve mesajı düzenle
    const cleanMessage = `
🔔 Yeni Ziyaret!

📍 IP: ${ip?.replace(/[<>]/g, '') || 'Bilinmiyor'}
🌍 Timezone: ${timezone?.replace(/[<>]/g, '') || 'Bilinmiyor'}
🇹🇷 Türkiye: ${isTurkishTimezone ? 'Evet' : 'Hayır'}
💻 Platform: ${platform?.replace(/[<>]/g, '') || 'Bilinmiyor'}
🌐 Dil: ${language?.replace(/[<>]/g, '') || 'Bilinmiyor'}
📱 Ekran: ${screenResolution?.replace(/[<>]/g, '') || 'Bilinmiyor'}
🔍 User Agent: ${userAgent?.replace(/[<>]/g, '') || 'Bilinmiyor'}
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
          text: cleanMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Telegram API Error:', responseData);
      throw new Error(`Failed to send Telegram message: ${responseData.description || 'Unknown error'}`);
    }

    return NextResponse.json({ 
      status: 'success',
      message: 'Telegram notification sent'
    });
  } catch (error) {
    console.error('Telegram notification error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to send Telegram notification'
    }, { status: 500 });
  }
} 