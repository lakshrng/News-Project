import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NewsNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Published News', description: 'Admin-generated articles' },
    { path: '/external-news', label: 'External News', description: 'Real-time news from external sources' },
    { path: '/legacy/news', label: 'Legacy News', description: 'Original EJS news system' }
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                location.pathname === item.path
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-400">{item.description}</div>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NewsNavigation;
