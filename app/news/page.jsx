'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function NewsPage() {
  const [data, setData] = useState({ articles: [], articlesByCategory: null });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const resp = await axios.get('/api/news');
        if (!mounted) return;
        setData({
          articles: resp.data?.articles || resp.data || [],
          articlesByCategory: resp.data?.articlesByCategory || null
        });
      } catch (_) {
        setData({ articles: [], articlesByCategory: null });
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  const filtered = data.articles.filter(a => {
    if (!q) return true;
    const t = (a.title || '').toLowerCase();
    const s = (a.snippet || '').toLowerCase();
    const needle = q.toLowerCase().trim();
    return t.includes(needle) || s.includes(needle);
  });

  return (
    <section className="section">
      <h2 className="page-title">News</h2>
      <p className="subtitle"><small>Latest headlines · refreshed from the last 24 hours</small></p>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input 
          value={q} 
          onChange={e => setQ(e.target.value)} 
          type="text" 
          placeholder="Search headlines..." 
          style={{ flex: 1, padding: 10, border: '1px solid var(--border)', borderRadius: 10 }} 
        />
        <button className="btn" onClick={() => setQ(q)}>Search</button>
      </div>

      {loading ? (
        <div className="news-card" style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"><div className="spinner-dot"></div><div className="spinner-dot"></div><div className="spinner-dot"></div></div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="muted">No news found.</p>
      ) : (
        <div className="news-container" style={{ marginTop: 16 }}>
          {filtered.map((a, i) => (
            <article className="news-card" key={i}>
              {a.image_url ? (
                <img src={a.image_url} alt="News image" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              ) : null}
              <h3><a href={a.url} target="_blank" rel="noreferrer">{a.title}</a></h3>
              <p>{a.snippet}</p>
              <small>Published: {a.published_at} {a.category ? ` | Category: ${a.category}` : ''}</small>
              <Link 
                className="btn" 
                href={`/analysis?title=${encodeURIComponent(a.title)}&snippet=${encodeURIComponent(a.snippet || '')}&image_url=${encodeURIComponent(a.image_url || '')}`}
              >
                Read Analysis
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

