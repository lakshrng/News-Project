'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="section">
      <h2 className="page-title">Gemini-Powered News Hub</h2>
      <p className="subtitle">
        Choose the experience you need: live Google News headlines or Google Trends summaries.
      </p>

      <div
        style={{
          display: 'grid',
          gap: '20px',
          marginTop: '30px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}
      >
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            background: 'var(--card)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          }}
        >
          <h3 style={{ marginBottom: '10px' }}>Normal News</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
            Pulls the latest Google News search results via SerpAPI and distills every headline with Gemini.
          </p>
          <Link className="btn" href="/news">
            View Headlines
          </Link>
        </div>

        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            background: 'var(--card)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          }}
        >
          <h3 style={{ marginBottom: '10px' }}>Trending News</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
            Tracks the hottest Google Trends topics in India, runs a deep search, and summarizes each story.
          </p>
          <Link className="btn" href="/trending">
            View Trending Topics
          </Link>
        </div>
      </div>
    </section>
  );
}

