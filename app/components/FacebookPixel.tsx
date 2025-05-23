'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function FacebookPixel() {
  const [pixelId, setPixelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPixelId = async () => {
      try {
        const response = await fetch('/api/pixel', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.pixelId) {
          setPixelId(data.pixelId);
        }
      } catch (error) {
        console.error('Error fetching pixel ID:', error);
        setError(error instanceof Error ? error.message : 'Failed to load pixel ID');
      }
    };

    fetchPixelId();
  }, []);

  if (error) {
    console.error('Facebook Pixel Error:', error);
    return null;
  }

  if (!pixelId) return null;

  return (
    <>
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
} 