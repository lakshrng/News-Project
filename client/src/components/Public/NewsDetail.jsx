import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    content: '',
    author: {
      name: '',
      email: ''
    }
  });
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/public/news/${id}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data.article);
        setComments(data.comments);
      } else {
        toast.error('Article not found');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('author.')) {
      setCommentForm({
        ...commentForm,
        author: {
          ...commentForm.author,
          [name.split('.')[1]]: value
        }
      });
    } else {
      setCommentForm({
        ...commentForm,
        [name]: value
      });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setSubmittingComment(true);

    try {
      const response = await fetch(`http://localhost:5000/api/public/news/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentForm),
      });

      if (response.ok) {
        toast.success('Comment submitted successfully! It will be reviewed before being published.');
        setCommentForm({
          content: '',
          author: {
            name: '',
            email: ''
          }
        });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit comment');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/public/news/${id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setArticle(prev => ({
          ...prev,
          likes: data.likes
        }));
        toast.success('Article liked!');
      }
    } catch (error) {
      toast.error('Failed to like article');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-900"
          >
            ← Back to News
          </Link>
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
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-900"
            >
              ← Back to News
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/external-news"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                External News
              </Link>
              <Link
                to="/admin/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <article className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-8">
            {/* Article Meta */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {article.category}
                </span>
                <span className="text-sm text-gray-500">
                  by {article.author?.username}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(article.publishedAt)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {article.views} views
                </span>
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span>{article.likes} likes</span>
                </button>
              </div>
            </div>

            {/* Article Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {/* Article Summary */}
            <p className="text-lg text-gray-600 mb-8">
              {article.summary}
            </p>

            {/* Article Content */}
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {article.content}
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="author.name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="author.name"
                    name="author.name"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={commentForm.author.name}
                    onChange={handleCommentChange}
                  />
                </div>
                <div>
                  <label htmlFor="author.email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="author.email"
                    name="author.email"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={commentForm.author.email}
                    onChange={handleCommentChange}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Comment
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={commentForm.content}
                  onChange={handleCommentChange}
                />
              </div>
              <button
                type="submit"
                disabled={submittingComment}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {submittingComment ? 'Submitting...' : 'Submit Comment'}
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-800">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewsDetail;
