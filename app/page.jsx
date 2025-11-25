'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { extractCategory, getCategoryAbbr } from '../helpers/extractCategory';

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [briefs, setBriefs] = useState([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const resp = await axios.get('/api/news?limit=15');
      if (resp.data?.success) {
        const allArticles = resp.data.articles || [];
        setArticles(allArticles);
        // Use first 8 articles for briefs sidebar
        setBriefs(allArticles.slice(0, 8));
      }
    } catch (err) {
      console.error('Error loading news:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get hero article (first article)
  const heroArticle = articles[0];
  // Get sub-stories (next 2 articles)
  const subStories = articles.slice(1, 3);
  // Get remaining articles for briefs
  const remainingBriefs = articles.slice(3, 11);

  return (
    <div className="three-column-layout">
      {/* Column 1: Top Briefs Sidebar */}
      <aside className="briefs-sidebar">
        <h2 className="briefs-header">Top Briefs</h2>
        {loading ? (
          <div className="spinner">
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        ) : (
          <>
            {remainingBriefs.map((article, index) => {
              const category = extractCategory(article.title + ' ' + (article.summary || article.snippet || ''));
              const categoryAbbr = getCategoryAbbr(category);
              return (
                <div key={index} className="brief-item">
                  <span className="brief-category">{categoryAbbr}</span>
                  <h3 className="brief-headline">
                    <a href={article.url || article.link} target="_blank" rel="noreferrer">
                      {article.title}
                    </a>
                  </h3>
                </div>
              );
            })}
          </>
        )}
      </aside>

      {/* Column 2: Cover Story (Center) */}
      <main className="cover-story">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner">
              <div className="spinner-dot"></div>
              <div className="spinner-dot"></div>
              <div className="spinner-dot"></div>
            </div>
          </div>
        ) : heroArticle ? (
          <>
            <article className="hero-article">
              <h1 className="hero-headline">
                <a href={heroArticle.url || heroArticle.link} target="_blank" rel="noreferrer">
                  {heroArticle.title}
                </a>
              </h1>
              {heroArticle.image_url && (
                <img 
                  src={heroArticle.image_url} 
                  alt={heroArticle.title}
                  className="hero-image"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <p className="hero-summary">
                {heroArticle.summary || heroArticle.snippet}
              </p>
              <small className="muted">
                Source: {heroArticle.source || 'Google News'} 
                {heroArticle.published_at && ` · ${heroArticle.published_at}`}
              </small>
            </article>

            {/* Sub-stories */}
            <div className="sub-stories">
              {subStories.map((article, index) => (
                <article key={index} className="sub-story">
                  <h3 className="sub-story-headline">
                    <a href={article.url || article.link} target="_blank" rel="noreferrer">
                      {article.title}
                    </a>
                  </h3>
                  <p style={{ 
                    fontFamily: 'Roboto, Arial, sans-serif', 
                    fontSize: '13px', 
                    color: 'var(--slate-gray)', 
                    marginTop: '8px',
                    lineHeight: '1.5'
                  }}>
                    {article.summary || article.snippet}
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className="muted">No articles available.</p>
        )}
      </main>

      {/* Column 3: Observer Watch (Right) */}
      <aside className="observer-watch">
        <div className="watch-header">
          <h3>Featured Videos</h3>
          <span className="watch-chevron">›</span>
        </div>
        
        <div className="video-thumbnail" style={{ cursor: 'pointer' }} onClick={() => window.open('https://www.youtube.com', '_blank')}>
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, var(--ink-black) 0%, var(--observer-red) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
            padding: '20px'
          }}>
            Observer Watch<br />Video Content
          </div>
          <div className="play-button">▶</div>
        </div>

        <ul className="video-list">
          {articles.slice(0, 4).map((article, index) => (
            <li key={index} className="video-list-item">
              <a href={article.url || article.link} target="_blank" rel="noreferrer">
                {article.title}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
