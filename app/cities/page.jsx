'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { extractCategory, getCategoryAbbr } from '../../helpers/extractCategory';

export default function CitiesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCityNews();
  }, []);

  const fetchCityNews = async () => {
    try {
      setLoading(true);
      const resp = await axios.get('/api/news?q=city news India&limit=20');
      if (resp.data?.success) {
        setArticles(resp.data.articles || []);
      }
    } catch (err) {
      console.error('Error loading city news:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <h1 className="page-title">Cities</h1>
      <p className="subtitle">Local news from cities across India</p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner">
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <p className="muted" style={{ textAlign: 'center', padding: '40px' }}>
          No city news available.
        </p>
      ) : (
        <div className="news-container">
          {articles.map((article, i) => {
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
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

