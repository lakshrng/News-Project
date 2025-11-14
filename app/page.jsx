'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="section">
      <h2 className="page-title">AI News Generator</h2>
      <p className="subtitle">Generate synthetic headlines and snippets by category.</p>
      <form action="/news" method="get">
        <select aria-label="Category" name="category" defaultValue="general">
          <option value="general">General</option>
          <option value="business">Business</option>
          <option value="sports">Sports</option>
          <option value="politics">Politics</option>
          <option value="technology">Technology</option>
          <option value="entertainment">Entertainment</option>
          <option value="science">Science</option>
          <option value="health">Health</option>
        </select>
        <input type="text" name="language" placeholder="Language (e.g. en, es)" />
        <input type="text" name="locale" placeholder="Country code (optional)" />
        <Link className="btn" href="/news">Generate</Link>
      </form>
    </section>
  );
}

