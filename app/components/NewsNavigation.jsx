'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NewsNavigation() {
  const pathname = usePathname();

  return (
    <nav style={{ 
      background: 'var(--card)', 
      borderBottom: '1px solid var(--border)',
      padding: '12px 0'
    }}>
      <div className="container" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Link 
          href="/" 
          style={{ 
            color: pathname === '/' ? 'var(--red)' : 'var(--muted)',
            textDecoration: 'none',
            fontWeight: pathname === '/' ? 600 : 400
          }}
        >
          Published News
        </Link>
        <Link 
          href="/trending" 
          style={{ 
            color: pathname === '/trending' ? 'var(--red)' : 'var(--muted)',
            textDecoration: 'none',
            fontWeight: pathname === '/trending' ? 600 : 400
          }}
        >
          🔥 Trending News
        </Link>
        <Link 
          href="/external-news" 
          style={{ 
            color: pathname === '/external-news' ? 'var(--red)' : 'var(--muted)',
            textDecoration: 'none',
            fontWeight: pathname === '/external-news' ? 600 : 400
          }}
        >
          External News
        </Link>
        <Link 
          href="/legacy/news" 
          style={{ 
            color: pathname?.startsWith('/legacy') ? 'var(--red)' : 'var(--muted)',
            textDecoration: 'none',
            fontWeight: pathname?.startsWith('/legacy') ? 600 : 400
          }}
        >
          Legacy News
        </Link>
      </div>
    </nav>
  );
}

