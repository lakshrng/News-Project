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

  const handleManualRefresh = () => {
    fetchTrendingNews(true);
  };

  return (
    <section className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 className="page-title">🔥 Trending News</h2>
          <p className="subtitle">
            Top trending topics in India
            {lastUpdated && (
              <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                · Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button 
          className="btn" 
          onClick={handleManualRefresh}
          disabled={refreshing || loading}
          style={{ minWidth: '120px' }}
        >
          {refreshing ? 'Refreshing...' : loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading && !refreshing ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading trending news...</p>
        </div>
      ) : error ? (
        <div style={{ 
          padding: '20px', 
          background: '#fee', 
          border: '1px solid #fcc', 
          borderRadius: '8px',
          color: '#c33'
        }}>
          <p><strong>Error:</strong> {error}</p>
          <button className="btn" onClick={handleManualRefresh} style={{ marginTop: '10px' }}>
            Try Again
          </button>
        </div>
      ) : trends.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No trending topics found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {trends.map((item, index) => (
            <div 
              key={index}
              style={{
                padding: '20px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                background: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{
                  minWidth: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    {item.topic}
                  </h3>
                  <p style={{ 
                    margin: '0',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: '#555'
                  }}>
                    {item.summary}
                  </p>
                  {item.timestamp && (
                    <p style={{ 
                      margin: '10px 0 0 0',
                      fontSize: '12px',
                      color: '#999'
                    }}>
                      Updated: {new Date(item.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        background: '#f5f5f5', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <p style={{ margin: '0' }}>
          <strong>Note:</strong> Trending news refreshes when you load this page or press Refresh.
          This manual flow helps us stay within Gemini rate limits.
        </p>
      </div>
    </section>
  );
}

