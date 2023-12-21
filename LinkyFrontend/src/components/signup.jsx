import React, { useState } from 'react';
import Tooltip from './tooltip';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigateTo = useNavigate();


  const signup = async (username, password) => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    const response = await axios.post(`${SERVER_URL}/auth/signup`, {
      "username": username,
      "password": password,
    }, {
      "headers": {
        "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
      },
      "withCredentials": "true",
    });

    return response.data;
  }

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (username.length < 4) {
      setError('Username must be at least 4 characters long');
      return;
    }
    if (password.length > 64 || username.length > 20) {
      setError('Username or password is too long');
      return;
    }
    signup(username, password)
      .then((data) => {
        setError('');
        navigateTo('/');
      })
      .catch((err) => {
        setError(err.response.data.detail);
      });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-800">
      <form onSubmit={handleSubmit} className="p-10 bg-gray-700 rounded flex flex-col shadow-md">
        <p className="mb-5 text-3xl text-white">Sign Up</p>
        <Tooltip text="Username must be at least 4 characters long">
            <input 
                type="text" 
                name="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-5 p-3 w-80 focus:border-purple-700 rounded border-2 outline-none bg-gray-600 text-white transition duration-300 ease-in-out"
                placeholder="Username" 
                required 
            />
        </Tooltip>

        <Tooltip text="Password must be at least 8 characters long">
            <input 
                type="password" 
                name="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-5 p-3 w-80 focus:border-purple-700 rounded border-2 outline-none bg-gray-600 text-white transition duration-300 ease-in-out"
                placeholder="Password" 
                required 
            />
        </Tooltip>

        <Tooltip text="Confirm password must match password">
            <input 
                type="password" 
                name="confirmPassword" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mb-5 p-3 w-80 focus:border-purple-700 rounded border-2 outline-none bg-gray-600 text-white transition duration-300 ease-in-out"
                placeholder="Confirm Password" 
                required 
            />
        </Tooltip>
        <button className="bg-purple-600 hover:bg-purple-900 text-white font-bold p-2 rounded w-80 transition duration-300 ease-in-out" type="submit"><span>Sign Up</span></button>
        <p className="mt-4 text-white text-center text-xs">
          Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-700">Login instead</Link>
        </p>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </form>
    </div>
  );
}

export default Signup;
