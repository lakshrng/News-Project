'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Layout({ children }) {
  const pathname = usePathname();
  const [tickerItems, setTickerItems] = useState([
    'Budget 2025: Key highlights announced',
    'Election dates announced for 3 states',
    'Tech sector sees record growth',
    'Sports: National team wins championship'
  ]);

  // Fetch trending headlines for ticker
  useEffect(() => {
    const fetchTickerNews = async () => {
      try {
        const resp = await axios.get('/api/news?limit=5');
        if (resp.data?.success && resp.data.articles?.length > 0) {
          const headlines = resp.data.articles
            .slice(0, 5)
            .map(a => a.title)
            .filter(Boolean);
          if (headlines.length > 0) {
            setTickerItems(headlines);
          }
        }
      } catch (err) {
        console.error('Error fetching ticker news:', err);
        // Keep default items on error
      }
    };
    
    fetchTickerNews();
    // Update every 5 minutes
    const interval = setInterval(fetchTickerNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <header>
        {/* Top Row: Logo and Icons */}
        <div className="container header-top">
          <div className="logo-container">
            <h1 className="logo-text">The Indian Observer</h1>
            <p className="logo-tagline">Unbiased. Unbroken.</p>
          </div>
          <div className="header-icons">
            <Link href="/search">🔍 Search</Link>
            <Link href="/epaper">📰 E-Paper</Link>
            <Link href="/signin">👤 Sign In</Link>
          </div>
        </div>

        {/* Navigation Row: Sticky */}
        <div className="container nav-row">
          <Link href="/premium" className="io-plus-badge">IO+</Link>
          <nav>
            <ul className="nav-links">
              <li>
                <Link 
                  href="/" 
                  className={pathname === '/' ? 'active' : ''}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/news" 
                  className={pathname === '/news' ? 'active' : ''}
                >
                  India
                </Link>
              </li>
              <li>
                <Link 
                  href="/trending" 
                  className={pathname === '/trending' ? 'active' : ''}
                >
                  World
                </Link>
              </li>
              <li>
                <Link 
                  href="/cities" 
                  className={pathname === '/cities' ? 'active' : ''}
                >
                  Cities
                </Link>
              </li>
              <li>
                <Link 
                  href="/opinion" 
                  className={pathname === '/opinion' ? 'active' : ''}
                >
                  Opinion
                </Link>
              </li>
              <li>
                <Link 
                  href="/sports" 
                  className={pathname === '/sports' ? 'active' : ''}
                >
                  Sports
                </Link>
              </li>
              <li>
                <Link 
                  href="/tech" 
                  className={pathname === '/tech' ? 'active' : ''}
                >
                  Tech
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Ticker Bar */}
        <div className="ticker-bar">
          <div className="container">
            <span className="ticker-label">OBSERVER TRENDS</span>
            <div className="ticker-content">
              {tickerItems.map((item, index) => (
                <span key={index} className="ticker-item">
                  {item}
                  {index < tickerItems.length - 1 && (
                    <span className="ticker-separator">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        {children}
      </main>

      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} The Indian Observer · <span className="muted">Unbiased. Unbroken.</span></p>
        </div>
      </footer>
    </div>
  );
}
