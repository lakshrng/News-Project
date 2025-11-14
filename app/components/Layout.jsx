'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
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
              href="/news" 
              className={pathname === '/news' ? 'active' : ''}
            >
              Latest News
            </Link>
          </nav>
        </div>
      </header>
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

