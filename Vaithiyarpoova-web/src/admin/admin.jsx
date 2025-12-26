import React from 'react';
import '../assets/styles/admin.css';
import main_logo from '../assets/images/main1.webp';
import LoginPage from './login.jsx';
import ForgotPwd from './forgot-pwd.jsx';
import { ToastContainer } from 'react-toastify';
import PropTypes from 'prop-types';
const AdminPage = ({ pathURL }) => {

    return (
        <div className="login-container-ad">
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
            <div className="card p-4 login-div-main">
                <img src={main_logo} className="login-logo-sb" alt="Logo" />
                {(!pathURL || pathURL === "/login") && <LoginPage />}
                {(!pathURL || pathURL === "/forgot-password") && <ForgotPwd />}
            </div>
        </div>
    );
};

AdminPage.propTypes = {
    pathURL: PropTypes.string.isRequired, 
  };

export default AdminPage;