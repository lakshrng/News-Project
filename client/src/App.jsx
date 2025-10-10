import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import './index.css'

function Layout({ children }) {
  return (
    <div>
      <header>
        <div className="container header-inner">
          <Link className="brand" to="/">
            <span className="brand-mark">📰</span>
            <span className="brand-title">News Aggregator</span>
          </Link>
          <nav>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/news">Latest News</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        {children}
      </main>
      <footer>
        <div className="container">
          <p>© {new Date().getFullYear()} News Aggregator · <span className="muted">Powered by Express & React</span></p>
        </div>
      </footer>
    </div>
  )
}

function HomePage() {
  return (
    <section className="section">
      <h2 className="page-title">AI News Generator</h2>
      <p className="subtitle">Generate synthetic headlines and snippets by category.</p>
      <form action="/news" method="post" onSubmit={(e)=>e.preventDefault()}>
        <select aria-label="Category" defaultValue="general">
          <option value="general">General</option>
          <option value="business">Business</option>
          <option value="sports">Sports</option>
          <option value="politics">Politics</option>
          <option value="technology">Technology</option>
          <option value="entertainment">Entertainment</option>
          <option value="science">Science</option>
          <option value="health">Health</option>
        </select>
        <input type="text" placeholder="Language (e.g. en, es)" />
        <input type="text" placeholder="Country code (optional)" />
        <Link className="btn" to="/news">Generate</Link>
      </form>
    </section>
  )
}

import { useEffect, useState } from 'react'
import axios from 'axios'

function NewsPage() {
  const [data, setData] = useState({ articles: [], articlesByCategory: null })
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const resp = await axios.get('/api/news')
        if (!mounted) return
        setData({
          articles: resp.data?.articles || resp.data || [],
          articlesByCategory: resp.data?.articlesByCategory || null
        })
      } catch (_) {
        setData({ articles: [], articlesByCategory: null })
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = data.articles.filter(a => {
    if (!q) return true
    const t = (a.title || '').toLowerCase()
    const s = (a.snippet || '').toLowerCase()
    const needle = q.toLowerCase().trim()
    return t.includes(needle) || s.includes(needle)
  })

  return (
    <section className="section">
      <h2 className="page-title">News</h2>
      <p className="subtitle"><small>Latest headlines · refreshed from the last 24 hours</small></p>

      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} type="text" placeholder="Search headlines..." style={{ flex:1, padding:10, border:'1px solid var(--border)', borderRadius:10 }} />
        <button className="btn" onClick={()=>setQ(q)}>Search</button>
      </div>

      {loading ? (
        <div className="news-card" style={{ minHeight:120, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="spinner"><div className="spinner-dot"></div><div className="spinner-dot"></div><div className="spinner-dot"></div></div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="muted">No news found.</p>
      ) : (
        <div className="news-container" style={{ marginTop:16 }}>
          {filtered.map((a, i) => (
            <article className="news-card" key={i}>
              {a.image_url ? (
                <img src={a.image_url} alt="News image" onError={(e)=>{ e.currentTarget.style.display='none' }} />
              ) : null}
              <h3><a href={a.url} target="_blank" rel="noreferrer">{a.title}</a></h3>
              <p>{a.snippet}</p>
              <small>Published: {a.published_at} {a.category ? ` | Category: ${a.category}` : ''}</small>
              <Link className="btn" to={`/analysis?title=${encodeURIComponent(a.title)}&snippet=${encodeURIComponent(a.snippet||'')}&image_url=${encodeURIComponent(a.image_url||'')}`}>Read Analysis</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function useQuery() {
  return new URLSearchParams(window.location.search)
}

function AnalysisPage() {
  const params = useQuery()
  const title = params.get('title') || ''
  const snippet = params.get('snippet') || ''
  const image_url = params.get('image_url') || ''
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const resp = await axios.post('/api/analysis', { title, snippet })
        if (!mounted) return
        setHtml(resp.data?.analysis || '')
      } catch (_) {
        setHtml('')
      } finally {
        setLoading(false)
      }
    }
    if (title) load()
    return () => { mounted = false }
  }, [title, snippet])

  return (
    <section className="section">
      <h2 className="page-title">AI Analysis</h2>
      <p className="subtitle">For: <strong>{title}</strong></p>
      {image_url ? (
        <div className="news-card" style={{ padding:0, overflow:'hidden', marginBottom:16, maxWidth:340 }}>
          <img src={image_url} alt="Article image" style={{ display:'block', width:320, height:180, objectFit:'cover', background:'#eee', margin:'auto' }} onError={(e)=>{ e.currentTarget.style.display='none' }} />
        </div>
      ) : null}
      <div className="news-card" style={{ minHeight:140, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {loading ? (
          <div className="spinner"><div className="spinner-dot"></div><div className="spinner-dot"></div><div className="spinner-dot"></div></div>
        ) : html ? (
          <div className="analysis-text animate-fade-in" dangerouslySetInnerHTML={{ __html: html.replace(/\n/g,'<br>') }} />
        ) : (
          <div className="muted">No analysis returned.</div>
        )}
      </div>
      <div className="spacer" />
      <Link className="btn" to="/news">← Back to news</Link>
    </section>
  )
}

function NotFound() {
  return (
    <section className="section">
      <h2 className="page-title">Something went wrong</h2>
      <p className="muted">Page not found!</p>
      <div className="spacer" />
      <Link className="btn" to="/">Go back home</Link>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
