import './globals.css'
import Layout from './components/Layout'

export const metadata = {
  title: 'The Indian Observer - Unbiased. Unbroken.',
  description: 'The Indian Observer: Unbiased news coverage with AI-powered analysis. Stay informed with the latest headlines from India and around the world.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Merriweather:wght@400;700&family=Noto+Serif:wght@400;700&family=Roboto:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}

