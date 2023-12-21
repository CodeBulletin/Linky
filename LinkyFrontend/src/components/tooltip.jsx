import React from 'react';

const Tooltip = ({ children, text }) => {
  return (
    <div className="relative flex flex-col items-center group">
      {children}
      <div className="absolute bottom-full mb-2 flex-col items-center flex disabled">
        <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-800 rounded shadow-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100 disabled">{text}</span>

        <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

export default Tooltip;
