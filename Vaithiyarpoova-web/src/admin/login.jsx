import React, { useState, useRef, useEffect } from 'react';
import SvgContent from '../components/svgcontent';
import { useNavigate } from 'react-router-dom';
import configModule from '../../config.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../components/context/Authcontext.jsx';

const LOGIN_SUCCESS_TOAST_ID = 'login-success';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const config = configModule.config();
    const { login } = useAuth();
    const isSubmitting = useRef(false);

    // Clear any existing toasts when component mounts
    useEffect(() => {
        toast.dismiss();
        
        // Cleanup function to clear toasts when component unmounts
        return () => {
            toast.dismiss();
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (isSubmitting.current) return;
        isSubmitting.current = true;

        setLoading(true);

        if (!username || !password) {
            toast.error("All fields required", { autoClose: 3000, pauseOnHover: false });
            setLoading(false);
            isSubmitting.current = false;
            return;
        }

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;

            try {
                const response = await fetch(`${config.apiBaseUrl}login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, latitude, longitude }),
                });

                const result = await response.json();

                if (response.ok) {
                    // Clear any existing toasts
                    toast.dismiss(LOGIN_SUCCESS_TOAST_ID);
                    
                    toast.success(result.message, {
                        toastId: LOGIN_SUCCESS_TOAST_ID,
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                    login(result.token);
                    localStorage.setItem("authToken", result.token);
                    if (typeof result.pmsToken === 'string') { // #NEW
                        localStorage.setItem("authPermissions", result.pmsToken); // #NEW
                    } // #NEW
                    if (result.accessUserMenu !== undefined) { // #NEW
                        const accessVal = typeof result.accessUserMenu === 'string' // #NEW
                          ? result.accessUserMenu // #NEW
                          : JSON.stringify(result.accessUserMenu); // #NEW
                        localStorage.setItem("accessMenu", accessVal); // #NEW
                    } // #NEW
                    setTimeout(() => {
                       window.location.href = '/dashboard';
                        setUsername('');
                        setPassword('');
                        toast.dismiss(LOGIN_SUCCESS_TOAST_ID);
                    }, 3000);
                } else {
                    toast.error(result.message || "Login error", { autoClose: 3000, pauseOnHover: false });
                    setLoading(false);
                    isSubmitting.current = false;
                }
            } catch (error) {
                console.error("Login error:", error);
                toast.error("An error occurred", { autoClose: 3000, pauseOnHover: false });
                setLoading(false);
                isSubmitting.current = false;
            }
        }, (err) => {
            console.error("Location error:", err);
            toast.error("Unable to get location", { autoClose: 3000, pauseOnHover: false });
            setLoading(false);
            isSubmitting.current = false;
        });
    };

    return (
        <form >
            <div className="mb-4">
                <label htmlFor="user" className="form-label mb-3 admin-label">Username</label>
                <input
                    type="text"
                    className="admin-input"
                    id="user"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.trim())}
                    required
                    autoComplete="username"
                />
            </div>
            <div className="mb-2 position-relative">
                <label htmlFor="password" className="form-label mb-3 admin-label">Password</label>
                <input
                    type={showPassword ? 'text' : 'password'}
                    className="admin-input"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.trim())}
                    required
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <SvgContent svg_name="eyeclose" /> : <SvgContent svg_name="eyeopen" />}
                </button>
            </div>

            <button
                type="button"
                className="forgot"
                onClick={() => navigate('/forgot-password')}
            >
                Forgot password?
            </button>

            <button
                type="submit"
                className="btn btn-primary admin-button"
                disabled={loading}
                onClick={handleLogin}
            >
                {loading ? <span className="button-animate">Logging in...</span> : "Login"}
            </button>
        </form>
    );
};

export default LoginPage;
