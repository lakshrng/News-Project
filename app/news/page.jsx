'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  const fetchNews = async (showRefreshing = false) => {
    try {
      setError(null);
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const resp = await axios.get('/api/news?limit=10');
      if (resp.data?.success) {
        setArticles(resp.data.articles || []);
        setLastUpdated(resp.data.timestamp ? new Date(resp.data.timestamp) : new Date());
      } else {
        setArticles([]);
        setError(resp.data?.error || 'Failed to fetch news');
      }
    } catch (err) {
      console.error('Error loading SerpAPI news:', err);
      setArticles([]);
      setError(err.response?.data?.error || 'Failed to fetch news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filtered = articles.filter((a) => {
    if (!q) return true;
    const t = (a.title || '').toLowerCase();
    const s = (a.summary || a.snippet || '').toLowerCase();
    const needle = q.toLowerCase().trim();
    return t.includes(needle) || s.includes(needle);
  });

  return (
    <section className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">News</h2>
          <p className="subtitle">
            <small>Live headlines · summarized with Gemini</small>
            {lastUpdated && (
              <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 12 }}>
                · Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button className="btn" onClick={() => fetchNews(true)} disabled={refreshing || loading}>
          {refreshing ? 'Refreshing...' : loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

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
          <div>
            <button className="btn" style={{ marginTop: 12 }} onClick={() => fetchNews(true)}>
              Try Again
            </button>
          </div>
        </div>
      ) : loading && !refreshing ? (
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

