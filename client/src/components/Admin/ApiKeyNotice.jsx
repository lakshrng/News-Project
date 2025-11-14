import React, { useState, useEffect } from 'react';

const ApiKeyNotice = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/debug');
      if (response.ok) {
        const data = await response.json();
        setApiStatus(data);
      }
    } catch (error) {
      console.error('Failed to check API status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  // If API key is configured, don't show the notice
  if (apiStatus?.env?.googleApiKey === 'Set') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Google AI API Key Configured
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                ✅ AI-powered news generation is enabled. You can now generate high-quality articles using Google's Gemini AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show warning if API key is not configured
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Google AI API Key Not Configured
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              To enable AI-powered news generation, please:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Get a Google AI API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
              <li>Add it to your <code className="bg-yellow-100 px-1 rounded">server/.env</code> file as <code className="bg-yellow-100 px-1 rounded">GOOGLE_API_KEY=your-key-here</code></li>
              <li>Restart the server</li>
            </ol>
            <p className="mt-2">
              <strong>Note:</strong> The system will use template articles until the API key is configured.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyNotice;
