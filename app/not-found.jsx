import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section">
      <h2 className="page-title">Something went wrong</h2>
      <p className="muted">Page not found!</p>
      <div className="spacer" />
      <Link className="btn" href="/">Go back home</Link>
    </section>
  );
}

