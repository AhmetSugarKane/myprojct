'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Giriş başarısız');
      }
    } catch (error) {
      setError('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D1117]">
      <nav className="bg-[#161B22] border-b border-[#30363D]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#58A6FF]">Clocker</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center">
        <div className="bg-[#161B22] rounded-lg border border-[#30363D] p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#58A6FF]">Admin Girişi</h2>
            <p className="text-[#8B949E] mt-2">Yönetim paneline erişmek için giriş yapın</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#8B949E]">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md bg-[#0D1117] border-[#30363D] text-[#C9D1D9] shadow-sm focus:border-[#58A6FF] focus:ring-[#58A6FF]"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#8B949E]">
                Şifre
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md bg-[#0D1117] border-[#30363D] text-[#C9D1D9] shadow-sm focus:border-[#58A6FF] focus:ring-[#58A6FF]"
                required
              />
            </div>

            {error && (
              <div className="text-[#F85149] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#58A6FF] hover:bg-[#1F6FEB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#58A6FF] ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="bg-[#161B22] border-t border-[#30363D]">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-[#8B949E]">
            <p>&copy; 2024 Clocker. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 