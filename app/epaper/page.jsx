'use client';

export default function EPaperPage() {
  return (
    <section className="section">
      <h1 className="page-title">E-Paper</h1>
      <p className="subtitle">Digital edition of The Indian Observer</p>

      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        background: 'var(--dim-gray)',
        borderRadius: '4px',
        marginTop: '24px'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--ink-black)' }}>
          📰 E-Paper Coming Soon
        </p>
        <p className="muted">
          The digital edition of The Indian Observer will be available here soon.
          Check back later for the latest print edition online.
        </p>
      </div>
    </section>
  );
}

