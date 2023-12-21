import React from 'react';

function Panel({ side, children, cssClasses }) {
  return (
    <div className={`p-4 ${side === 'left' ? 'bg-gray-700' : 'bg-gray-600'} text-white ${cssClasses}`}>
      {children}
    </div>
  );
}

export default Panel;
