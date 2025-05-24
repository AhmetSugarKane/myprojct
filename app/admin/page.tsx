'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [redirectUrl, setRedirectUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mevcut URL'yi al
    fetch('/api/redirect-url')
      .then(res => res.json())
      .then(data => {
        setRedirectUrl(data.redirectUrl);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching redirect URL:', error);
        setMessage('URL alınırken bir hata oluştu');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Yönlendirme URL'si</h1>
        
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
          <p className="text-sm">
            Yönlendirme URL'si: <strong>{redirectUrl}</strong>
          </p>
        </div>

        <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-md">
          <p className="text-sm">
            Not: Yönlendirme URL'si kodda sabit olarak tanımlanmıştır. 
            Değiştirmek için kodda güncelleme yapmanız gerekmektedir.
          </p>
        </div>
      </div>
    </div>
  );
} 