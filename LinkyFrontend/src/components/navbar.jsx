import {React, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.svg';
import axios from 'axios';

function Navbar(props) {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const [username, setUsername] = useState('');

    const navigateTo = useNavigate();

    useEffect(() => {
        if (props.UserName === '')
            getUsername();
        else
            setUsername(props.UserName);
    }, []);

    const getUsername = async () => {
        try {
            const response = await axios.get(`${SERVER_URL}/auth/user`, {"headers": {
                "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
            },
            "withCredentials": "true"});
            if (response.status === 200) {
                setUsername(response.data.username);
            } else {
                navigateTo('/login');
            }
        }
        catch (err) {
            navigateTo('/login');
        }
    }

    const logout = async () => {
        try {
            const response = await axios.get(`${SERVER_URL}/auth/logout`, {"headers": {
                "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
            },
            "withCredentials": "true"});
            if (response.status === 200) {
                navigateTo('/login');
            }
        }
        catch (err) {
        }

        navigateTo('/login');
    }


    return (
        <nav className="bg-gray-800 text-white p-4 shadow-md">
            <div className="flex items-center justify-between w-full px-4">
                <div className="font-bold">
                    <a href="/" className="inline-block">
                        <img src={Logo} alt="Linky" className="inline-block h-6 mr-2" />
                        Linky
                    </a>
                </div>
                <ul className="flex space-x-4">
                    <li>
                        <span className='hidden sm:inline-block mr-2'> Welcome </span> 
                        <button className="text-green-400 hover:text-green-500" onClick={() => navigateTo('/profile')}>{username}</button>
                    </li>
                    <li>
                        <button className="text-blue-400 hover:text-blue-500" onClick={logout}>Logout</button>
                    </li>
                    {/* ... add more menu items as needed ... */}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
