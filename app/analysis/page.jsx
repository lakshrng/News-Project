'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || '';
  const snippet = searchParams.get('snippet') || '';
  const image_url = searchParams.get('image_url') || '';
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const resp = await axios.post('/api/analysis', { title, snippet });
        if (!mounted) return;
        setHtml(resp.data?.analysis || '');
      } catch (_) {
        setHtml('');
      } finally {
        setLoading(false);
      }
    }
    if (title) load();
    return () => { mounted = false };
  }, [title, snippet]);

  return (
    <section className="section">
      <h2 className="page-title">AI Analysis</h2>
      <p className="subtitle">For: <strong>{title}</strong></p>
      {image_url ? (
        <div className="news-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16, maxWidth: 340 }}>
          <img src={image_url} alt="Article image" style={{ display: 'block', width: 320, height: 180, objectFit: 'cover', background: '#eee', margin: 'auto' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>
      ) : null}
      <div className="news-card" style={{ minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <div className="spinner"><div className="spinner-dot"></div><div className="spinner-dot"></div><div className="spinner-dot"></div></div>
        ) : html ? (
          <div className="analysis-text animate-fade-in" dangerouslySetInnerHTML={{ __html: html.replace(/\n/g, '<br>') }} />
        ) : (
          <div className="muted">No analysis returned.</div>
        )}
      </div>
      <div className="spacer" />
      <Link className="btn" href="/news">← Back to news</Link>
    </section>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="spinner"><div className="spinner-dot"></div><div className="spinner-dot"></div><div className="spinner-dot"></div></div>}>
      <AnalysisContent />
    </Suspense>
  );
}

