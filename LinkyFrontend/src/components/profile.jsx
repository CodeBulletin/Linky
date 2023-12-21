import Navbar from './navbar';
import Modal from './modal';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function Profile() {
  // check if user is logged in by sending request to server at /auth else redirect to login pa

  const [userData, setUserData] = useState({
    username: '',
    lastLogout: '',
    lastPasswordChange: ''
  });
  const [error, setError] = useState('');

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAccountData, setDeleteAccountData] = useState({
    username: '',
    password: ''
  });

  const navigateTo = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    try {
      const response = await axios.get(`${SERVER_URL}/auth/user`, {
        "headers": {
          "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
        },
        "withCredentials": "true"
      });
      if (response.status === 200) {
        // time_logout = new Date(response.data.last_complete_logout);
        // time_password = new Date(response.data.last_password_change);
        setUserData({
          username: response.data.username,
          lastLogout: convertTimestampToDate(response.data.last_complete_logout),
          lastPasswordChange: convertTimestampToDate(response.data.last_password_change)
        });
      } else {
        navigateTo('/login');
      }
    }
    catch (err) {
      navigateTo('/login');
    }
  }

  const handleChangePassword = async (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const submitNewPassword = async () => {
    // Implement the logic to submit the new password to the server

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (passwordData.newPassword.length > 64) {
      setError('Password is too long');
      return;
    }

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    try {
      const response = await axios(
        `${SERVER_URL}/auth/update_password`,
        {
          "headers": {
            "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
          },
          "withCredentials": "true",
          "method": "PATCH",
          "data": {
            "last_password": passwordData.oldPassword,
            "password": passwordData.newPassword
          }
        }
      );

      if (response.status === 200) {
        setError('');
      }

    }
    catch (err) {
      setError(err.response.data.detail);
    }

    setIsPasswordModalOpen(false); // Close the modal on successful submission
    fetchUserData();
  };

  const handleLogoutFromAllDevices = async () => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    try {
      const response = await axios(
        `${SERVER_URL}/auth/logout_all`,
        {
          "headers": {
            "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
          },
          "withCredentials": "true",
          "method": "POST"
        }
      )
      if (response.status === 200) {
        setError('');
        navigateTo('/login');
      }
    }
    catch (err) {
    }
  };

  const handleDeleteAccount = async (e) => {
    // Implement account deletion logic
    setDeleteAccountData({ ...deleteAccountData, [e.target.name]: e.target.value });
  };

  const submitAccountDeletion = async () => {

    if (deleteAccountData.username !== userData.username) {
      setError('Username does not match');
      return;
    }

    if (deleteAccountData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (deleteAccountData.password.length > 64) {
      setError('Password is too long');
      return;
    }

    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    try {
      const response = await axios(
        `${SERVER_URL}/auth/delete_user`,
        {
          "headers": {
            "Access-Control-Allow-Origin": import.meta.env.VITE_URL,
          },
          "withCredentials": "true",
          "method": "POST",
          "data": {
            "username": deleteAccountData.username,
            "password": deleteAccountData.password
          }
        }
      );

      if (response.status === 200) {
        setError('');

        navigateTo('/login');
        setIsDeleteModalOpen(false); // Close the modal on successful submission or handling error
      }
    }
    catch (err) {
      setError(err.response.data.detail);
    }
  };

  const convertTimestampToDate = (timestamp) => {
    let ms = timestamp * 1000;

    let date = new Date(ms);

    date = convertUTCDateToLocalDate(date);

    return date.toDateString() + " - " + date.toLocaleTimeString();
  }

  function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
}

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
      {userData.username !== '' && <Navbar UserName={userData.username}/>}
      <div className="container mx-auto px-4 py-2">
        <div className="bg-gray-700 shadow-md rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">User Profile</h2>
          <div className="space-y-3">
            <p><strong>Username:</strong> {userData.username}</p>
            <p><strong>Last Complete Logout:</strong> {userData.lastLogout}</p>
            <p><strong>Last Password Modification:</strong> {userData.lastPasswordChange}</p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4">
            <button onClick={() => setIsPasswordModalOpen(true)} className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300">
              Change Password
            </button>
            <button onClick={handleLogoutFromAllDevices} className="w-full md:w-auto px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition duration-300">Log out from All Devices</button>
            <button onClick={() => setIsDeleteModalOpen(true)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Delete Account
            </button>
          </div>
          <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
              <h2 className="text-lg font-semibold mb-4">Change Password (must be atleast 8 chars long)</h2>
              {error && <p className="text-red-400">{error}</p>}
              <div className="space-y-3">
                <input type="password" name="oldPassword" placeholder="Previous Password" onChange={handleChangePassword} className="w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded transition duration-300 ease-in-out" />
                <input type="password" name="newPassword" placeholder="New Password" onChange={handleChangePassword} className="w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded transition duration-300 ease-in-out" />
                <input type="password" name="confirmPassword" placeholder="Confirm New Password" onChange={handleChangePassword} className="w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded transition duration-300 ease-in-out" />
              </div>
              <button onClick={submitNewPassword} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                Submit
              </button>
          </Modal>
          <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
            <h2 className="text-xl font-semibold mb-4">Delete Account (Cannot Be Undone)</h2>
            {error && <p className="text-red-400">{error}</p>}
            <div className="space-y-3">
              <input type="text" name="username" placeholder="Username" onChange={handleDeleteAccount} className="w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded" />
              <input type="password" name="password" placeholder="Password" onChange={handleDeleteAccount} className="w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded" />
            </div>
            <button onClick={submitAccountDeletion} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Delete Account
            </button>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default Profile;
