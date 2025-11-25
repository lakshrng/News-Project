'use client';

export default function PremiumPage() {
  return (
    <section className="section">
      <h1 className="page-title">IO+ Premium</h1>
      <p className="subtitle">Unlock exclusive content and features</p>

      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        background: 'var(--dim-gray)',
        borderRadius: '4px',
        marginTop: '24px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>⭐</div>
        <h2 style={{ marginBottom: '12px' }}>Upgrade to IO+</h2>
        <p className="muted" style={{ marginBottom: '24px' }}>
          Get access to exclusive articles, ad-free experience, and premium features.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '32px',
          textAlign: 'left'
        }}>
          <div style={{ padding: '20px', background: 'white', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>✓ Ad-Free</h3>
            <p style={{ fontSize: '14px', color: 'var(--slate-gray)' }}>Browse without interruptions</p>
          </div>
          <div style={{ padding: '20px', background: 'white', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>✓ Exclusive Content</h3>
            <p style={{ fontSize: '14px', color: 'var(--slate-gray)' }}>Access premium articles</p>
          </div>
          <div style={{ padding: '20px', background: 'white', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>✓ Early Access</h3>
            <p style={{ fontSize: '14px', color: 'var(--slate-gray)' }}>Get news before others</p>
          </div>
        </div>
        <button className="btn" style={{ marginTop: '32px', padding: '14px 32px', fontSize: '16px' }}>
          Subscribe Now
        </button>
      </div>
    </section>
  );
}

