import React from 'react';
import Copy from '../assets/copy.svg';

function UrlList({ urls, onEdit, onDelete, setMessage }) {
  let copyToClipboard = (url) => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    navigator.clipboard.writeText(`${SERVER_URL}/${url}`).then(() => {
      // You can add some feedback for the user here if you want
      setMessage('Copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  }
  return (
    urls.length !== 0 && (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg pr-3">
        <ul className="divide-y divide-gray-600 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-cyan-600 pr-3">
          {urls.map((urlEntry) => (
            <li key={urlEntry.id} className="py-4 flex justify-between items-center">
              <div className="flex items-center">
                {/* Copy Icon Button */}
                <button onClick={() => copyToClipboard(urlEntry.urlName)} className="text-white mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-copy stroke-cyan-600 h-6 md:h-10 hover:stroke-cyan-400" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
                    <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
                  </svg>
                </button>
                <div>
                  <p className="text-white font-semibold hidden sm:block">
                    {urlEntry.urlName || 'Unnamed URL'}
                  </p>
                  <a
                    href={urlEntry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500 block sm:hidden font-semibold"
                  >
                    {urlEntry.urlName}
                  </a>
                  <a
                    href={urlEntry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500 hidden sm:block"
                  >
                    {urlEntry.url.length >= 15 ? `${urlEntry.url.substring(0, 15)}...` : urlEntry.url}
                  </a>
                </div>
              </div>
              <div>
                <button
                  onClick={() => onEdit(urlEntry.urlName, urlEntry.url)}
                  className="text-yellow-500 hover:text-yellow-600 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(urlEntry.urlName)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  );
}

export default UrlList;

