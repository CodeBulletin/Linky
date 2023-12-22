// 404Page.jsx
import React from 'react';

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl mb-4">Page Not Found</p>
        <a href="/" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">Go Home</a>
      </div>
    </div>
  );
}

export default NotFoundPage;