'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RedirectLink {
  _id: string;
  url: string;
  createdAt: string;
}

interface ClickLog {
  ip: string;
  country: string;
  city: string;
  isp: string;
  os: string;
  redirectStatus: boolean;
  timestamp: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [redirectLinks, setRedirectLinks] = useState<RedirectLink[]>([]);
  const [newRedirectUrl, setNewRedirectUrl] = useState('');
  const [stats, setStats] = useState({
    totalRedirects: 0,
    successfulRedirects: 0,
    failedRedirects: 0
  });
  const [recentClicks, setRecentClicks] = useState<ClickLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const ITEMS_PER_PAGE = 50;
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [filteredClicks, setFilteredClicks] = useState<ClickLog[]>([]);

  useEffect(() => {
    checkAuth();
    fetchData();
    const fetchStats = async () => {
      try {
        console.log('Fetching stats...');
        const response = await fetch('/api/stats');
        console.log('Response:', response);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        console.log('Data:', data);
        setStats(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    const fetchRecentClicks = async () => {
      try {
        const response = await fetch('/api/stats/recent');
        if (!response.ok) {
          throw new Error('Failed to fetch recent clicks');
        }
        const data = await response.json();
        setRecentClicks(data);
      } catch (err) {
        console.error('Error fetching recent clicks:', err);
      }
    };

    fetchStats();
    fetchRecentClicks();
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentClicks();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Zaman filtresine göre tıklamaları filtrele
    const now = new Date();
    const filtered = recentClicks.filter(click => {
      const clickDate = new Date(click.timestamp);
      switch (timeFilter) {
        case 'today':
          return clickDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return clickDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return clickDate >= monthAgo;
        default:
          return true;
      }
    });
    setFilteredClicks(filtered);
  }, [recentClicks, timeFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify');
      if (!response.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [redirectResponse] = await Promise.all([
        fetch('/api/admin/redirect-links')
      ]);

      if (redirectResponse.ok) {
        const data = await redirectResponse.json();
        setRedirectLinks(data);
      }

      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRedirectLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/redirect-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newRedirectUrl })
      });

      if (response.ok) {
        setNewRedirectUrl('');
        fetchData();
      }
    } catch (error) {
      console.error('Add redirect link error:', error);
    }
  };

  const handleDeleteRedirectLink = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/redirect-links/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Delete redirect link error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAllLogs = async () => {
    if (!confirm('Tüm logları silmek istediğinizden emin misiniz?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/stats/clear', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setRecentClicks([]);
        setStats({
          totalRedirects: 0,
          successfulRedirects: 0,
          failedRedirects: 0
        });
      }
    } catch (error) {
      console.error('Error deleting logs:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#58A6FF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="bg-[#161B22] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#58A6FF] text-white px-4 py-2 rounded hover:bg-[#1F6FEB]"
          >
            Yenile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <nav className="bg-[#161B22] border-b border-[#30363D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-[#58A6FF]">Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="text-[#58A6FF] hover:text-[#1F6FEB] px-3 py-2 rounded-md text-sm font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#161B22] rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Toplam Giriş</h2>
            <p className="text-3xl font-bold text-[#58A6FF]">{stats.totalRedirects}</p>
          </div>
          
          <div className="bg-[#161B22] rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Başarılı Giriş</h2>
            <p className="text-3xl font-bold text-green-500">{stats.successfulRedirects}</p>
          </div>
          
          <div className="bg-[#161B22] rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Başarısız Giriş</h2>
            <p className="text-3xl font-bold text-red-500">{stats.failedRedirects}</p>
          </div>
        </div>

        {/* Pixel ID ve Yönlendirme Linki Yönetimi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pixel ID Yönetimi */}
          <div className="bg-[#161B22] rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-[#58A6FF] mb-4">Pixel ID Yönetimi</h2>
            <form onSubmit={handleAddRedirectLink} className="mb-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newRedirectUrl}
                  onChange={(e) => setNewRedirectUrl(e.target.value)}
                  placeholder="Yeni Yönlendirme Linki"
                  className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-md px-4 py-2 text-gray-300"
                />
                <button
                  type="submit"
                  className="bg-[#58A6FF] text-white px-4 py-2 rounded-md hover:bg-[#1F6FEB]"
                >
                  Ekle
                </button>
              </div>
            </form>
            <div className="space-y-2">
              {redirectLinks.map((link) => (
                <div
                  key={link._id}
                  className="flex justify-between items-center bg-[#0D1117] p-4 rounded-md"
                >
                  <span className="text-gray-300">{link.url}</span>
                  <button
                    onClick={() => handleDeleteRedirectLink(link._id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Son Tıklamalar Tablosu */}
        <div className="bg-[#161B22] rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-[#58A6FF]">Son Tıklamalar</h2>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-1 text-gray-300"
              >
                <option value="all">Tüm Zamanlar</option>
                <option value="today">Bugün</option>
                <option value="week">Son 7 Gün</option>
                <option value="month">Son 30 Gün</option>
              </select>
            </div>
            <button
              onClick={handleDeleteAllLogs}
              disabled={isDeleting}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Siliniyor...' : 'Tümünü Sil'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#30363D]">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ülke</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ISP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">İşletim Sistemi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Zaman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]">
                {filteredClicks
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((click, index) => (
                    <tr key={index} className="hover:bg-[#1C2128]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{click.ip}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          {click.country === 'Turkey' && (
                            <img 
                              src="https://flagcdn.com/w20/tr.png"
                              alt="Türk Bayrağı"
                              className="w-5 h-3"
                            />
                          )}
                          {click.country === 'United States' && (
                            <img 
                              src="https://flagcdn.com/w20/us.png"
                              alt="Amerika Bayrağı"
                              className="w-5 h-3"
                            />
                          )}
                          {click.country !== 'Turkey' && click.country !== 'United States' && (
                            <img 
                              src="https://flagcdn.com/w20/un.png"
                              alt="Bilinmeyen Bayrak"
                              className="w-5 h-3"
                            />
                          )}
                          {click.country === 'Turkey' ? `Türkiye/${click.city}` : 
                           click.country === 'United States' ? 'Amerika' : click.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{click.isp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{click.os}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          click.redirectStatus 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {click.redirectStatus ? 'Başarılı' : 'Başarısız'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {click.timestamp || 'N/A'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          
          {/* Sayfalama Kontrolleri */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Toplam {filteredClicks.length} kayıt
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-[#1C2128] text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              <span className="px-3 py-1 text-gray-300">
                Sayfa {currentPage} / {Math.ceil(filteredClicks.length / ITEMS_PER_PAGE)}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(filteredClicks.length / ITEMS_PER_PAGE)}
                className="px-3 py-1 rounded-md bg-[#1C2128] text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 