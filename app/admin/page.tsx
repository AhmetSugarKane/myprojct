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
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/redirect-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: redirectUrl })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('URL başarıyla güncellendi');
      } else {
        setMessage(data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      setMessage('Bir hata oluştu');
    }
  };

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
        <h1 className="text-2xl font-bold mb-6 text-center">Yönlendirme URL'si Yönetimi</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="redirectUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Yönlendirme URL'si
            </label>
            <input
              type="url"
              id="redirectUrl"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Güncelle
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${message.includes('başarıyla') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
} 