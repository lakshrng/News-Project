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

      const resp = await axios.get('/api/news?limit=20');
      if (resp.data?.success) {
        setArticles(resp.data.articles || []);
        setLastUpdated(resp.data.timestamp ? new Date(resp.data.timestamp) : new Date());
      } else {
        setArticles([]);
        setError(resp.data?.error || 'Failed to fetch news');
      }
    } catch (err) {
      console.error('Error loading news:', err);
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        gap: 16, 
        flexWrap: 'wrap', 
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--ink-black)'
      }}>
        <div>
          <h1 className="page-title">Latest News</h1>
          <p className="subtitle">
            Live headlines · Summarized with Gemini AI
            {lastUpdated && (
              <span style={{ marginLeft: 8, color: 'var(--slate-gray)', fontSize: 12 }}>
                · Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button className="btn" onClick={() => fetchNews(true)} disabled={refreshing || loading}>
          {refreshing ? 'Refreshing...' : loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: '24px' 
      }}>
        <input 
          value={q} 
          onChange={e => setQ(e.target.value)} 
          type="search" 
          placeholder="Search headlines..." 
          style={{ 
            flex: 1, 
            padding: '12px 16px', 
            border: '1px solid #E0E0E0', 
            borderRadius: '4px',
            fontFamily: 'Roboto, Arial, sans-serif',
            fontSize: '14px'
          }} 
        />
      </div>

      {error ? (
        <div style={{ 
          padding: '24px', 
          background: '#FEE', 
          border: '2px solid var(--observer-red)', 
          borderRadius: '4px',
          marginBottom: '24px'
        }}>
          <strong style={{ color: 'var(--observer-red)' }}>Error:</strong> {error}
          <div style={{ marginTop: '12px' }}>
            <button className="btn" onClick={() => fetchNews(true)}>
              Try Again
            </button>
          </div>
        </div>
      ) : loading && !refreshing ? (
        <div style={{ 
          minHeight: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div className="spinner">
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="muted" style={{ textAlign: 'center', padding: '40px' }}>
          No news found.
        </p>
      ) : (
        <div className="news-container">
          {filtered.map((a, i) => (
            <article className="news-card" key={i}>
              {a.image_url && (
                <img 
                  src={a.image_url} 
                  alt="News image" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
              )}
              <span className="category-label">NEWS</span>
              <h3>
                <a href={a.url || a.link} target="_blank" rel="noreferrer">
                  {a.title}
                </a>
              </h3>
              <p>{a.summary || a.snippet}</p>
              <small>
                Source: {a.source || 'Google News'} 
                {a.published_at && ` · ${a.published_at}`}
              </small>
              <div style={{ marginTop: '12px' }}>
                <Link 
                  className="btn" 
                  href={`/analysis?title=${encodeURIComponent(a.title)}&snippet=${encodeURIComponent(a.summary || a.snippet || '')}&image_url=${encodeURIComponent(a.image_url || '')}`}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
                >
                  Read Analysis
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
