import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import ExternalNewsNotice from './ExternalNewsNotice';

const ExternalNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState({});
  const [filters, setFilters] = useState({
    locale: 'us',
    language: 'en',
    published_on: ''
  });
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchExternalNews();
  }, [filters]);

  const fetchExternalNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        locale: filters.locale,
        language: filters.language,
        ...(filters.published_on && { published_on: filters.published_on })
      });

      const response = await fetch(`http://localhost:5000/api/external-news?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      } else {
        toast.error('Failed to fetch external news');
      }
    } catch (error) {
      toast.error('Network error while fetching news');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleAnalysis = async (article) => {
    try {
      const response = await fetch('http://localhost:5000/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: article.title,
          snippet: article.snippet
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Open analysis in a new window
        const analysisWindow = window.open('', '_blank', 'width=800,height=600');
        analysisWindow.document.write(`
          <html>
            <head>
              <title>Analysis: ${article.title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                .analysis { line-height: 1.6; }
                .back-btn { 
                  background: #4F46E5; 
                  color: white; 
                  padding: 10px 20px; 
                  text-decoration: none; 
                  border-radius: 5px; 
                  display: inline-block; 
                  margin: 20px 0;
                }
              </style>
            </head>
            <body>
              <h1>AI Analysis</h1>
              <h2>${article.title}</h2>
              <p><strong>Original Article:</strong> ${article.snippet}</p>
              <div class="analysis">${data.analysis}</div>
              <a href="#" class="back-btn" onclick="window.close()">Close</a>
            </body>
          </html>
        `);
      } else {
        toast.error('Failed to generate analysis');
      }
    } catch (error) {
      toast.error('Network error while generating analysis');
    }
  };

  const handlePublishToHomepage = async (article) => {
    if (!user || !isAdmin()) {
      toast.error('Admin login required to publish articles');
      return;
    }

    setPublishing(prev => ({ ...prev, [article.title]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/public/publish-external-news', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: article.title,
          snippet: article.snippet,
          url: article.url,
          image_url: article.image_url,
          published_at: article.published_at,
          category: article.category || 'General'
        }),
      });

      if (response.ok) {
        toast.success('Article published to homepage successfully!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to publish article');
      }
    } catch (error) {
      toast.error('Network error while publishing article');
    } finally {
      setPublishing(prev => ({ ...prev, [article.title]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading external news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">External News</h1>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Back to Home
              </a>
              <a
                href="/admin/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Admin Login
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* API Notice */}
        <ExternalNewsNotice />
        
        {/* Admin Notice */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Admin Login Required for Publishing
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    To publish external news articles to the homepage, please login as an admin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter News</h3>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                id="locale"
                name="locale"
                value={filters.locale}
                onChange={handleFilterChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
                <option value="in">India</option>
                <option value="de">Germany</option>
                <option value="fr">France</option>
                <option value="jp">Japan</option>
              </select>
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                id="language"
                name="language"
                value={filters.language}
                onChange={handleFilterChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
            <div>
              <label htmlFor="published_on" className="block text-sm font-medium text-gray-700">
                Date (Optional)
              </label>
              <input
                type="date"
                id="published_on"
                name="published_on"
                value={filters.published_on}
                onChange={handleFilterChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </form>
        </div>

        {/* News Articles */}
        <div className="space-y-6">
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {article.image_url && (
                        <img
                          src={article.image_url}
                          alt="News"
                          className="w-full h-48 object-cover rounded-lg mb-4"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-600"
                        >
                          {article.title}
                        </a>
                      </h2>
                      
                      <p className="text-gray-600 mb-4">{article.snippet}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{article.published_at}</span>
                          {article.category && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {article.category}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Read Full Article →
                          </a>
                          <button
                            onClick={() => handleAnalysis(article)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            AI Analysis
                          </button>
                          {user && isAdmin() && (
                            <button
                              onClick={() => handlePublishToHomepage(article)}
                              disabled={publishing[article.title]}
                              className="text-blue-600 hover:text-blue-900 font-medium disabled:opacity-50"
                            >
                              {publishing[article.title] ? 'Publishing...' : '📰 Publish to Homepage'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No external news found. Please check your API configuration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExternalNews;
