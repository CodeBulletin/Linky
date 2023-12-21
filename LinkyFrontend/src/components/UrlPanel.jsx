import React, { useState, useEffect } from 'react';
import UrlList from './UrlList';
import axios from 'axios';

function UrlPanel(props) {
    const max_urls_per_page = props.max_urls_per_page;

    useEffect(() => {
        on_load();
    }, []);

    let on_load = async () => {
        await fetch_pages();
        await fetch_urls();
    }

    let fetch_pages = async () => {
        const SERVER_URL = import.meta.env.VITE_SERVER_URL;

        const response = await axios.get(`${SERVER_URL}/url/count`, {
            "headers": {
                "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
            },
            "withCredentials": "true",
        });

        if (response.status === 200) {
            props.setNumUrls(response.data);
        }
    }


    let fetch_urls = async () => {
        const SERVER_URL = import.meta.env.VITE_SERVER_URL;
        try {
            const response = await axios.get(`${SERVER_URL}/url/all?page_no=${props.page}&items_per_page=${max_urls_per_page}`, {
                "headers": {
                    "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
                },
                "withCredentials": "true",
            });
            let urls_list = []
            if (response.data.length === 0) {
                props.setPage(1);
            }
            for (let i = 0; i < response.data.length; i++) {
                urls_list.push({
                    id: i,
                    urlName: response.data[i].urlID,
                    url: response.data[i].url
                });
            }
            if (response.status === 200) {
                props.setUrls(prev =>
                    urls_list
                );
            }
        }
        catch (err) {
            // console.log(err);
        }
    }

    let incrPage = () => {
        if (props.page < Math.ceil(props.numUrls / max_urls_per_page))
            props.setPage(props.page + 1);

        if (props.page === Math.ceil(props.numUrls / max_urls_per_page))
            props.setPage(1);
    };

    let decrPage = () => {
        if (props.page > 1)
            props.setPage(props.page - 1);

        if (props.page === 1)
            props.setPage(Math.ceil(props.numUrls / max_urls_per_page));
    };


    const handleEdit = (urlName, url) => {
        props.setUrlName(urlName);
        props.setOpenEditModal(true);
    };

    const handleDelete = async (urlName) => {

        try {
            const SERVER_URL = import.meta.env.VITE_SERVER_URL;
            await axios(
                `${SERVER_URL}/url/delete/${urlName}`,
                {
                    "headers": {
                        "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
                    },
                    "withCredentials": "true",
                    "method": "DELETE",
                }
            );

            props.setNumUrls(Math.max(props.numUrls - 1, 1));

            props.setMessage("URL Deleted!");

            await fetch_urls();
        }
        catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <h2 className="text-lg text-white mb-4">Your Linkies</h2>
            <UrlList urls={props.urls} onEdit={handleEdit} onDelete={handleDelete} setMessage={props.setMessage} />

            <div className="flex justify-center items-center">
                {props.urls.length === 0 ? <div className="bg-gray-800 text-white font-bold py-2 px-4 rounded">Create Linkies</div> : null}
                {
                    props.urls.length > 0 ?
                    (
                        <>
                            <button onClick={decrPage} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-l">
                                Prev
                            </button>
                            <div className="bg-gray-800 text-white font-bold py-2 px-4">
                                {props.page}/{Math.ceil(props.numUrls / max_urls_per_page)}
                            </div>
                            <button onClick={incrPage} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-r">
                                Next
                            </button>
                        </>
                    ) : null
                }
            </div>
        </>
    );
}

export default UrlPanel;
