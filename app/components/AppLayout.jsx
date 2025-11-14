'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NewsNavigation from './NewsNavigation';

export default function AppLayout({ children }) {
  const pathname = usePathname();

  return (
    <div>
      <header>
        <div className="container header-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">📰</span>
            <span className="brand-title">News Aggregator</span>
          </Link>
          <nav>
            <Link 
              href="/" 
              className={pathname === '/' ? 'active' : ''}
            >
              Home
            </Link>
            <Link 
              href="/external-news" 
              className={pathname === '/external-news' ? 'active' : ''}
            >
              External News
            </Link>
            <Link 
              href="/legacy/news" 
              className={pathname?.startsWith('/legacy') ? 'active' : ''}
            >
              Legacy News
            </Link>
          </nav>
        </div>
      </header>
      <NewsNavigation />
      <main className="container">
        {children}
      </main>
      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} News Aggregator · <span className="muted">Powered by Next.js</span></p>
        </div>
      </footer>
    </div>
  );
}

