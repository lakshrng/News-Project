'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function TrendingNewsPage() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrendingNews = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await axios.get('/api/public/trending?geo=IN&limit=10');
      
      if (response.data.success) {
        setTrends(response.data.trends || []);
        setLastUpdated(new Date(response.data.timestamp));
      } else {
        setError('Failed to fetch trending news');
      }
    } catch (err) {
      console.error('Error fetching trending news:', err);
      setError(err.response?.data?.error || 'Failed to load trending news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrendingNews();
  }, []);

  return (
    <section className="section">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--ink-black)'
      }}>
        <div>
          <h1 className="page-title">
            <span className="breaking-tag">TRENDING</span>
            Observer Trends
          </h1>
          <p className="subtitle">
            Top trending topics in India · AI-powered summaries
            {lastUpdated && (
              <span style={{ marginLeft: 8, color: 'var(--slate-gray)', fontSize: 12 }}>
                · Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button 
          className="btn" 
          onClick={() => fetchTrendingNews(true)}
          disabled={refreshing || loading}
        >
          {refreshing ? 'Refreshing...' : loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading && !refreshing ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div className="spinner">
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        </div>
      ) : error ? (
        <div style={{ 
          padding: '24px', 
          background: '#FEE', 
          border: '2px solid var(--observer-red)', 
          borderRadius: '4px',
          marginBottom: '24px'
        }}>
          <p style={{ margin: '0 0 12px 0', color: 'var(--observer-red)', fontWeight: '600' }}>
            <strong>Error:</strong> {error}
          </p>
          <button className="btn" onClick={() => fetchTrendingNews(true)}>
            Try Again
          </button>
        </div>
      ) : trends.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p className="muted">No trending topics found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {trends.map((item, index) => (
            <article 
              key={index}
              className="news-card"
              style={{
                borderLeft: '4px solid var(--observer-red)',
                paddingLeft: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  minWidth: '36px',
                  height: '36px',
                  borderRadius: '4px',
                  background: 'var(--observer-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontFamily: 'Roboto, Arial, sans-serif',
                  fontWeight: '700',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    fontFamily: 'Georgia, serif',
                    fontSize: '22px',
                    fontWeight: '700',
                    color: 'var(--ink-black)',
                    lineHeight: '1.3'
                  }}>
                    {item.topic}
                  </h3>
                  <p style={{ 
                    margin: '0 0 8px 0',
                    fontFamily: 'Roboto, Arial, sans-serif',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: 'var(--slate-gray)'
                  }}>
                    {item.summary}
                  </p>
                  {item.timestamp && (
                    <small style={{ 
                      fontFamily: 'Roboto, Arial, sans-serif',
                      fontSize: '12px',
                      color: 'var(--slate-gray)'
                    }}>
                      Updated: {new Date(item.timestamp).toLocaleString()}
                    </small>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '32px', 
        padding: '16px', 
        background: 'var(--dim-gray)', 
        borderRadius: '4px',
        fontFamily: 'Roboto, Arial, sans-serif',
        fontSize: '13px',
        color: 'var(--slate-gray)',
        borderLeft: '4px solid var(--observer-red)'
      }}>
        <p style={{ margin: '0' }}>
          <strong style={{ color: 'var(--ink-black)' }}>Note:</strong> Trending news refreshes when you load this page or press Refresh.
          This manual flow helps us stay within Gemini rate limits.
        </p>
      </div>
    </section>
  );
}
