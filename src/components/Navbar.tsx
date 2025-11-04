"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from '@/context/LanguageContext';
import '@/utils/debugUtils'; // Import debug utilities

export default function Navbar() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
      console.log('🔍 Auth check result:', data.isAuthenticated);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      // 1. Immediately update UI state
      setIsAuthenticated(false);
      setMobileMenuOpen(false);
      setLoading(true);  // Show loading state
      
      // 2. Clear client-side storage immediately
      localStorage.clear();
      sessionStorage.clear();
      
      // 3. Call server logout and wait for it
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      // 4. Clear all cookies on client side
      const allCookies = document.cookie.split(';');
      for (const cookie of allCookies) {
        const cookieName = cookie.split('=')[0].trim();
        if (cookieName) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
        }
      }
      
      // 5. Force clear authentication state
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      
      console.log('✅ Logout successful');
      
      // 6. Redirect to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error, redirect to home
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const handleMobileMenuClick = () => {
    setMobileMenuOpen(false);
  };

  // Navigation text based on language
  const navText = {
    hi: {
      home: 'होम',
      search: 'खोज',
      dating: 'डेटिंग',
      matches: 'मैच',
      personalizedMatches: 'व्यक्तिगत मैच',
      messages: 'संदेश',
      kundli: 'कुंडली जनरेटर',
      manageProfile: 'प्रोफाइल प्रबंधन',
      login: 'लॉगिन',
      register: 'रजिस्टर',
      logout: 'लॉगआउट',
      switchToEnglish: 'अंग्रेजी में बदलें',
      switchToHindi: 'हिंदी में बदलें'
    },
    en: {
      home: 'Home',
      search: 'Search',
      dating: 'Dating',
      matches: 'Matches',
      personalizedMatches: 'Personalized Matches',
      messages: 'Messages',
      kundli: 'Kundli Generator',
      manageProfile: 'Manage Profile',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      switchToEnglish: 'Switch to English',
      switchToHindi: 'हिंदी में बदलें'
    }
  };

  const t = navText[language];

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white" onClick={handleMobileMenuClick}>
              शुभ विवाह
            </Link>
          </div>
          <div className="flex md:hidden">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-purple-700 focus:outline-none"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Open main menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">{t.home}</Link>
              <Link href="/search" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">{t.search}</Link>
              <Link href="/dating" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">{t.dating}</Link>
              <Link href="/matches" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">{t.matches}</Link>
              <Link href="/personalized-matches" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">{t.personalizedMatches}</Link>
              <Link href="/messages" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">{t.messages}</Link>
              <Link href="/kundli" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">{t.kundli}</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Global Language Switcher - Toggle Button Design */}
            <button
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-white/20 transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-purple-600"
              title={language === 'hi' ? t.switchToEnglish : t.switchToHindi}
            >
              <span className="sr-only">{language === 'hi' ? t.switchToEnglish : t.switchToHindi}</span>
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                  language === 'hi' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
              <span className="absolute left-1 text-xs font-bold text-white">हिं</span>
              <span className="absolute right-1 text-xs font-bold text-white">EN</span>
            </button>
            
            {!loading && (
              isAuthenticated ? (
                <>
                  <Link href="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
                    {t.manageProfile}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-purple-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-50"
                  >
                    {t.logout}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (typeof window !== 'undefined' && typeof (window as any).showLoginPopup === 'function') {
                        (window as any).showLoginPopup();
                      }
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (typeof window !== 'undefined' && typeof (window as any).showRegisterPopup === 'function') {
                        (window as any).showRegisterPopup();
                      }
                    }}
                    className="bg-white text-purple-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-50"
                  >
                    {t.register}
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
          {/* Mobile Language Switcher */}
          <button
            onClick={() => {
              setLanguage(language === 'hi' ? 'en' : 'hi');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-purple-700 block"
          >
            {language === 'hi' ? t.switchToEnglish : t.switchToHindi}
          </button>
          <Link href="/" onClick={handleMobileMenuClick} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 block">{t.home}</Link>
          <Link href="/search" onClick={handleMobileMenuClick} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 block">{t.search}</Link>
          <Link href="/dating" onClick={handleMobileMenuClick} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 block">{t.dating}</Link>
          <Link href="/matches" onClick={handleMobileMenuClick} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 block">{t.matches}</Link>
          <Link href="/personalized-matches" onClick={handleMobileMenuClick} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 block">{t.personalizedMatches}</Link>
          <Link href="/messages" onClick={handleMobileMenuClick} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 block">{t.messages}</Link>
          <Link href="/kundli" onClick={handleMobileMenuClick} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 block">{t.kundli}</Link>
          {isAuthenticated ? (
            <>
              <Link href="/profile" onClick={handleMobileMenuClick} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 block">
                {t.manageProfile}
              </Link>
              <button
                onClick={() => {
                  handleMobileMenuClick();
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-purple-700"
              >
                {t.logout}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  handleMobileMenuClick();
                  if (typeof window !== 'undefined' && typeof (window as any).showLoginPopup === 'function') {
                    (window as any).showLoginPopup();
                  }
                }}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 block"
              >
                {t.login}
              </button>
              <button
                onClick={() => {
                  handleMobileMenuClick();
                  if (typeof window !== 'undefined' && typeof (window as any).showRegisterPopup === 'function') {
                    (window as any).showRegisterPopup();
                  }
                }}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 block"
              >
                {t.register}
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
} 