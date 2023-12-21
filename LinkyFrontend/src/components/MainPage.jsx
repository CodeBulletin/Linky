import Navbar from './navbar';
import Panel from './panel';
import UrlForm from './UrlForm';
import UrlPanel from './UrlPanel';
import Tooltip from './tooltip';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './modal';


function MainPage() {
  const [urls, setUrls] = useState([ ]);
  const [page, setPage] = useState(1);
  const [numUrls, setNumUrls] = useState(0);
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openNewUrlModal, setOpenNewUrlModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [message, setMessage] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [urlName, setUrlName] = useState('');

  useEffect(() => {
    if (localStorage.getItem('firstTime') === null) {
      setOpenNewModal(true);
      localStorage.setItem('firstTime', 'false');
      setMessage('');
    }

  }, []);

  useEffect(() => {
    if (message !== '' && message !== false) {
      setShowMessage(message);
      setMessageModal(true);
    }
  }, [message]);

  let handleChangeUrl = (e) => {
    setUrl(e.target.value);
  }

  let submitNewPassword = async () => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    try {
      let response = await axios (
        `${SERVER_URL}/url/patch`,
        {
          "headers": {
            "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
          },
          "withCredentials": "true",
          "method": "PATCH",
          "data": {
            "urlID": urlName,
            "url": url,
          }
        }
      )

      if (response.status === 200) {
        setOpenEditModal(false);

        // reload url panel
        const response2 = await axios.get(`${SERVER_URL}/url/all?page_no=${page}&items_per_page=10`, {
          "headers": {
            "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
          },
          "withCredentials": "true",
        });
        let urls_list = []
        for (let i = 0; i < response2.data.length; i++) {
          urls_list.push({
            id: i,
            urlName: response2.data[i].urlID,
            url: response2.data[i].url
          });
        }
        if (response2.status === 200) {
          setUrls(prev =>
            urls_list
          );
        }
        setMessage("URL Updated!");
        setUrl('');
      }
      if (response.status === 422) {
        setError("Invalid URL");
      }
    }
    catch (err) {
      setError("Invalid URL");
    }
  }

  let copyToClipboard = (url) => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    navigator.clipboard.writeText(`${SERVER_URL}/${url}`).then(() => {
      setMessage('Copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  }

  let onClose = () => {
    setMessageModal(false);
    setMessage(false);
  }


  const max_urls_per_page = 10;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-300">
      <Navbar UserName=''/>
      <div className="flex flex-grow">
        <div className="flex flex-col md:flex-row w-full">
          <Panel side="left" cssClasses="w-full order-1">
            <div className="p-4">
              <UrlForm setUrls={setUrls} max_urls_per_page={max_urls_per_page} urls={urls} numUrls={numUrls} setNumUrls={setNumUrls} setOpenNewUrlModal={setOpenNewUrlModal} />
            </div>
          </Panel>
          <Panel side="right" cssClasses="w-full order-2">
            <div className="p-4">
              <UrlPanel urls={urls} setUrls={setUrls} max_urls_per_page={max_urls_per_page} page={page} setPage={setPage} numUrls={numUrls} setNumUrls={setNumUrls} setOpenEditModal={setOpenEditModal} setUrlName={setUrlName} setMessage={setMessage} />
            </div>
          </Panel>
        </div>
      </div>
      <Modal isOpen={openNewModal} onClose={() => setOpenNewModal(false)}>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Linky!</h1>
          <p className="text-lg mb-4">Linky is a simple URL shortener that allows you to create short links for your long URLs.</p>
          <p className="text-lg mb-4">To get started, create your first Linky!</p>
          <p className="text-lg mb-4">Linky is an open source project. You can find the source code <a href="https://github.com/CodeBulletin/Linky" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">here</a>.</p>
          <p className='text-lg mb-4'>If you have any questions, feel free to create an issue on the GitHub repository.</p>
          <p className='text-lg mb-4'>If you like this project, please consider giving it a star on GitHub!</p>
          <p className='text-lg mb-4'>Happy Linkying!</p>
        </div>
      </Modal>
      { urls.length !== 0 && (
        <Modal isOpen={openNewUrlModal} onClose={() => setOpenNewUrlModal(false)} onBackdropClick={() => setOpenNewUrlModal(false)}>
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">
              Your new Linky is ready: 
              <button onClick={() => copyToClipboard(urls[urls.length - 1].urlName)} className="text-white inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-copy stroke-cyan-600 h-6 md:h-10 hover:stroke-cyan-400 inline-block" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
                  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
                </svg>
              </button>
              <a href={import.meta.env.VITE_SERVER_URL + '/' + urls[urls.length - 1].urlName} className="text-blue-400 hover:text-blue-500 inline-block ml-2" target="_blank" rel="noopener noreferrer">
                {import.meta.env.VITE_SERVER_URL + '/' + urls[urls.length - 1].urlName}
              </a>  
            </h1>
          </div>
        </Modal>
      )}
      <Modal isOpen={openEditModal} onClose={() => setOpenEditModal(false)}>
        <h2 className="text-lg font-semibold mb-4">Edit URL: {urlName}</h2>
        {error && <p className="text-red-400">{error}</p>}
        <div className="space-y-3">
          <Tooltip text="Enter new url">
            <input type="enterNewUrl" name="enterNewUrl" placeholder='url' onChange={handleChangeUrl} className="shadow rounded w-full px-3 py-2 border border-gray-500 bg-gray-700 focus:border-purple-700 transition duration-300 ease-in-out focus:outline-none focus:shadow-outline" />
          </Tooltip>
        </div>
        <button onClick={submitNewPassword} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
          Submit
        </button>
      </Modal>
      <Modal isOpen={messageModal} onClose={() => onClose()} onBackdropClick={() => onClose()}>
        <h2 className="text-lg font-semibold">{showMessage}</h2>
      </Modal>
    </div>
  );
}

export default MainPage;
