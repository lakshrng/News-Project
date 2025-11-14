import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import NewsGenerator from './NewsGenerator';
import ApiKeyNotice from './ApiKeyNotice';

const NewsManager = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchArticles();
  }, [currentPage, statusFilter]);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`http://localhost:5000/api/admin/news?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
        setTotalPages(data.totalPages);
      } else if (response.status === 401) {
        logout();
        navigate('/admin/login');
      } else {
        toast.error('Failed to fetch articles');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/news/${id}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Article published successfully!');
        fetchArticles();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to publish article');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Article deleted successfully!');
        fetchArticles();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete article');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/admin/login');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* API Key Notice */}
        <ApiKeyNotice />
        
        {/* News Generator */}
        <div className="mb-8">
          <NewsGenerator onNewsGenerated={fetchArticles} />
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Filter by status:
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Articles ({articles.length})
            </h3>
            
            {articles.length > 0 ? (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            article.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : article.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {article.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {article.category}
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {article.title}
                        </h4>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {article.summary}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>by {article.author?.username}</span>
                          <span>{formatDate(article.createdAt)}</span>
                          {article.publishedAt && (
                            <span>Published: {formatDate(article.publishedAt)}</span>
                          )}
                          <span>{article.views} views</span>
                          <span>{article.likes} likes</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => navigate(`/admin/news/${article._id}`)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        
                        {article.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(article._id)}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                          >
                            Publish
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No articles found.</p>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium ${
                    page === currentPage
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
};

export default NewsManager;
