import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../components/context/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import configModule from '../../config.js';

function Logoutmodal({ oncloses }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = user?.username;
  const config = configModule.config();

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}updateLogoff`, {
        username: username
      });

      const result = response.data;
      if (response.status === 200) {

        localStorage.removeItem('authToken');
        localStorage.removeItem('authPermissions');
        localStorage.removeItem('lastOpenSubMenu');
        localStorage.removeItem('accessMenu');
        oncloses();
        navigate('/login');
      } else {
        toast.error("Failed to fetch logoff: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching logoff: " +
        (error.response?.data?.message || error.message)
      );
    }

  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        oncloses();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [oncloses]);

  return (
    <div className="modal-overlay modal-overlay-position">
      <div className="modal-container">
        <div className="modal-header mb-3">
          <h5 className="mb-0 add-new-hdr">Logout</h5>
        </div>

        <div className="modal-body mb-2">
          <div className="container commonst-select">
            <p>Are you sure you want to logout?</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={oncloses}>
            Cancel
          </button>
          <button
            className="next-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

Logoutmodal.propTypes = {
  oncloses: PropTypes.func.isRequired,
};
export default Logoutmodal;
