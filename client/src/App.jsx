import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'
import './index.css'

// Import contexts and components
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import NewsList from './components/Public/NewsList'
import NewsDetail from './components/Public/NewsDetail'
import ExternalNews from './components/Public/ExternalNews'
import NewsNavigation from './components/Public/NewsNavigation'
import AdminLogin from './components/Admin/AdminLogin'
import AdminDashboard from './components/Admin/AdminDashboard'
import NewsEditor from './components/Admin/NewsEditor'
import NewsManager from './components/Admin/NewsManager'

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
            <NavLink to="/external-news">External News</NavLink>
            <NavLink to="/legacy/news">Legacy News</NavLink>
          </nav>
        </div>
      </header>
      <NewsNavigation />
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
  const navigate = useNavigate()
  const [locale, setLocale] = useState('')
  const [language, setLanguage] = useState('')
  const [date, setDate] = useState('')
  return (
    <section className="section">
      <h2 className="page-title">AI News Generator</h2>
      <p className="subtitle">Generate synthetic headlines and snippets by category.</p>
      <form onSubmit={(e)=>{ e.preventDefault(); const params = new URLSearchParams(); if (locale) params.set('locale', locale); if (language) params.set('language', language); if (date) params.set('published_on', date); navigate(`/legacy/news${params.toString() ? `?${params.toString()}` : ''}`) }}>
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
        <input value={language} onChange={(e)=>setLanguage(e.target.value)} type="text" placeholder="Language (e.g. en, es)" />
        <input value={locale} onChange={(e)=>setLocale(e.target.value)} type="text" placeholder="Country code (optional)" />
        <input value={date} onChange={(e)=>setDate(e.target.value)} type="date" />
        <button className="btn" type="submit">Generate</button>
      </form>
    </section>
  )
}

function NewsPage() {
  const [data, setData] = useState({ articles: [], articlesByCategory: null })
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const params = new URLSearchParams(window.location.search)
  const locale = params.get('locale') || ''
  const language = params.get('language') || ''
  const published_on = params.get('published_on') || ''

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const resp = await axios.get('http://localhost:5000/api/external-news', { params: { locale, language, published_on } })
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
  }, [locale, language, published_on])

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
        const resp = await axios.post('http://localhost:5000/api/analysis', { title, snippet })
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
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<NewsList />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/external-news" element={<ExternalNews />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/news" element={
              <ProtectedRoute requireAdmin={true}>
                <NewsManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/news/:id" element={
              <ProtectedRoute requireAdmin={true}>
                <NewsEditor />
              </ProtectedRoute>
            } />
            
            {/* Legacy Routes */}
            <Route path="/legacy" element={<HomePage />} />
            <Route path="/legacy/news" element={<NewsPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}
