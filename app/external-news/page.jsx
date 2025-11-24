'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function ExternalNewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setError(null);
      const resp = await axios.get('/api/news?limit=10');
      if (resp.data?.error) {
        console.error('API Error:', resp.data.error);
        setError(resp.data.error);
        setArticles([]);
        return;
      }
      setArticles(resp.data?.articles || []);
    } catch (err) {
      console.error('Failed to load news:', err);
      setArticles([]);
      setError(err.response?.data?.error || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const filtered = articles.filter(a => {
    if (!q) return true;
    const t = (a.title || '').toLowerCase();
    const s = (a.summary || a.snippet || '').toLowerCase();
    const needle = q.toLowerCase().trim();
    return t.includes(needle) || s.includes(needle);
  });

  return (
    <section className="section">
      <h2 className="page-title">External News</h2>
      <p className="subtitle"><small>Latest headlines from external sources</small></p>

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

      {error ? (
        <div className="news-card" style={{ minHeight: 120, padding: 24, background: '#fee', border: '1px solid #fcc', borderRadius: 12 }}>
          <strong>Error:</strong> {error}
        </div>
      ) : loading ? (
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
              <h3><a href={a.url || a.link} target="_blank" rel="noreferrer">{a.title}</a></h3>
              <p>{a.summary || a.snippet}</p>
              <small>
                Source: {a.source || 'Google News'} {a.published_at ? ` · ${a.published_at}` : ''}
              </small>
              <Link 
                className="btn" 
                href={`/analysis?title=${encodeURIComponent(a.title)}&snippet=${encodeURIComponent(a.summary || a.snippet || '')}&image_url=${encodeURIComponent(a.image_url || '')}`}
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

