'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resp = await axios.post('/api/auth/login', { email, password });
      if (resp.data.token) {
        localStorage.setItem('token', resp.data.token);
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h1 className="page-title">Sign In</h1>
      <p className="subtitle">Access your account</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #E0E0E0',
              borderRadius: '4px',
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #E0E0E0',
              borderRadius: '4px',
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: '14px'
            }}
          />
        </div>

        {error && (
          <div style={{
            padding: '12px',
            background: '#FEE',
            border: '1px solid var(--observer-red)',
            borderRadius: '4px',
            marginBottom: '16px',
            color: 'var(--observer-red)',
            fontSize: '14px'
          }}>
            {error.replace(/'/g, '&apos;')}
          </div>
        )}

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--slate-gray)' }}>
        Don&apos;t have an account? <Link href="/register" style={{ color: 'var(--observer-red)' }}>Register</Link>
      </p>
    </section>
  );
}

