import React, { useState } from 'react';
import Tooltip from './tooltip';
import axios from 'axios';

function UrlForm(props) {
  const [urlName, setUrlName] = useState('');
  const [url, setUrl] = useState('');
  const [urlID, setUrlID] = useState(props.max_urls_per_page);
  const [error, setError] = useState('');

  const max_urls_per_page = props.max_urls_per_page;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    try {
        let response = await axios (
            `${SERVER_URL}/url/new`,
            {
                "headers": {
                    "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
                },
                "withCredentials": "true",
                "method": "POST",
                "data": {
                    "urlID": urlName,
                    "url": url,
                }
            }
        )

        if (response.status === 201) {
          if (props.urls.length >= max_urls_per_page) {
              // remove the last element and add the new one at index 0
              setUrlID(urlID + 1);
              props.setUrls((prevUrls) => {
                return [
                  {
                    id: urlID,
                    urlName: response.data.urlID,
                    url: response.data.url,
                  },
                  ...prevUrls.slice(0, prevUrls.length - 1),
                ];
              });
          } else {
            props.setUrls((prevUrls) => {
              return [
                {
                  id: prevUrls.length,
                  urlName: response.data.urlID,
                  url: response.data.url,
                },
                ...prevUrls,
              ];
            });
          }
          props.setNumUrls(props.numUrls + 1);
          setError('');
          props.setOpenNewUrlModal(true);
        } else {
            setError(response.data.detail.msg);
        }
    } catch (err) {
      if (err.response.status === 422) {
        // Merge all the error messages into one string
        let error_msg = '';
        for (const key in err.response.data.detail) {
          error_msg += err.response.data.detail[key].msg + ' | ';
        }
        error_msg = error_msg.slice(0, -3);
        setError(error_msg);
        return;
      }
      if (err.response.status === 400) {
        setError('URL Name already exists')
        return;
      }
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 pt-4 rounded-md">

      <h2 className="text-lg text-white mb-4">Create New Linky</h2>

        <div className="mb-4">
            <label htmlFor="urlName" className="block text-white text-sm font-bold mb-2">
                Url Name (Optional)
            </label>
            <Tooltip text="Enter the short name for your linky">
                <input
                    type="text"
                    id="urlName"
                    className="shadow rounded w-full px-3 py-2 border border-gray-500 bg-gray-700 focus:border-purple-700 transition duration-300 ease-in-out focus:outline-none focus:shadow-outline"
                    value={urlName}
                    onChange={(e) => setUrlName(e.target.value)}
                />
            </Tooltip>
      </div>

      <div className="mb-6">
        <label htmlFor="url" className="block text-white text-sm font-bold mb-2">
          Url (Required)
        </label>
        <Tooltip text="Enter the url you want to shorten">
            <input
                type="text"
                id="url"
                className="shadow rounded w-full px-3 py-2 border border-gray-500 bg-gray-700 focus:border-purple-700 transition duration-300 ease-in-out focus:outline-none focus:shadow-outline"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
            />
        </Tooltip>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </div>
      {error && <p className="text-red-400 mt-2">{error}</p>}
    </form>
  );
}

export default UrlForm;
