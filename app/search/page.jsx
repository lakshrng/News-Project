'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { extractCategory, getCategoryAbbr } from '../../helpers/extractCategory';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const resp = await axios.get(`/api/news?q=${encodeURIComponent(query)}&limit=20`);
      if (resp.data?.success) {
        setResults(resp.data.articles || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <h1 className="page-title">Search News</h1>
      <p className="subtitle">Find articles by keywords, topics, or phrases</p>

      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for news..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #E0E0E0',
              borderRadius: '4px',
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: '14px'
            }}
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner">
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        </div>
      ) : searched && results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p className="muted">No results found for &quot;{query}&quot;</p>
          <p style={{ fontSize: '14px', color: 'var(--slate-gray)', marginTop: '8px' }}>
            Try different keywords or check your spelling
          </p>
        </div>
      ) : results.length > 0 ? (
        <>
          <p style={{ marginBottom: '16px', color: 'var(--slate-gray)' }}>
            Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          </p>
          <div className="news-container">
            {results.map((article, i) => {
              const category = extractCategory(article.title + ' ' + (article.summary || article.snippet || ''));
              return (
                <article className="news-card" key={i}>
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt="News image"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <span className="category-label">{getCategoryAbbr(category)}</span>
                  <h3>
                    <a href={article.url || article.link} target="_blank" rel="noreferrer">
                      {article.title}
                    </a>
                  </h3>
                  <p>{article.summary || article.snippet}</p>
                  <small>
                    Source: {article.source || 'Google News'}
                    {article.published_at && ` · ${article.published_at}`}
                  </small>
                  <div style={{ marginTop: '12px' }}>
                    <Link
                      className="btn"
                      href={`/analysis?title=${encodeURIComponent(article.title)}&snippet=${encodeURIComponent(article.summary || article.snippet || '')}&image_url=${encodeURIComponent(article.image_url || '')}`}
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      Read Analysis
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}

