import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import configModule from '../../config.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SvgContent from '../components/svgcontent.jsx';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [viewing, setViewing] = useState('forgot-pwd');
    const navigate = useNavigate();
    const config = configModule.config();
    const [verifyform, setVerifyForm] = useState({ otp: ['', '', '', ''] });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showCnfmPassword, setShowCnfmPassword] = useState(false);
    const [loading, setLoading] = useState({ otp: false, verify: false, reset: false });


    const checkMailIsCorrect = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.warning("Enter admin's mail ID.");
            return;
        }
        setLoading(prevState => ({ ...prevState, otp: true }));
        try {
            const response = await fetch(`${config.apiBaseUrl}checkMail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mail: email }),
            });

            const result = await response.json();
            if (response.ok) {
                let message = "";

                if (result[0].status === 200) {
                    toast.success(result[0].message);
                    setViewing('verify-otp');
                } else if (result[0].status === 201) {
                    message = "You need to log in initially using the email and password associated with your account";
                    toast.warning(message);
                } else if (result[0].status === 202) {
                    message = "Email is incorrect, try valid mail id";
                    toast.error(message);
                }
            } else {
                toast.error('Error: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setLoading(prevState => ({ ...prevState, otp: false }));
        }
    };

    const handleOTPChange = (e, index) => {
        const newOtp = [...verifyform.otp];
        newOtp[index] = e.target.value;

        if (e.target.value.length === 1 && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }

        setVerifyForm({ otp: newOtp });
    };

    const verifyOTP = async (e) => {
        e.preventDefault();

        if (verifyform.otp[0] !== "" && verifyform.otp[1] !== "" && verifyform.otp[2] !== "" && verifyform.otp[3] !== "") {
            const otpValue = verifyform.otp[0] + verifyform.otp[1] + verifyform.otp[2] + verifyform.otp[3];
            setLoading(prevState => ({ ...prevState, verify: true }));
            try {
                const response = await fetch(`${config.apiBaseUrl}verifyOTP`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ otpValue }),
                });

                const result = await response.json();
                if (response.ok) {
                    if (result[0].status === 200) {
                        setViewing("change-pwd");
                    }
                    else if (result[0].status === 201) {
                        toast.warning("Invalid OTP, Please check the code and try again.");
                    }
                } else {
                    toast.error('Error: ' + result.message);
                }
            } catch (error) {
                console.error(error);
                toast.error('An error occurred');
            } finally {
                setLoading(prevState => ({ ...prevState, verify: false }));
            }
        }
        else {
            toast.warning("Cannot empty fields");
        }

        setVerifyForm({ otp: ['', '', '', ''] });
    };

    const ResetPassword = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.warning("Password fields cannot be empty.");
        } else if (password !== confirmPassword) {
            toast.error("Passwords do not match. Please retype them.");
        } else if (password.length < 6) {
            toast.warning("Password should be at least 6 characters long.");
        } else {
            setLoading(prevState => ({ ...prevState, reset: true }));
            try {
                const response = await fetch(`${config.apiBaseUrl}SetPassword`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pwd: password, confirmPwd: confirmPassword, mail: email }),
                });

                const result = await response.json();
                if (response.ok) {
                    toast.success("Password successfully changed.");

                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else {
                    toast.error('Error: ' + result.message);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(prevState => ({ ...prevState, reset: false }));
            }
        }
    };

    return (
        <form>
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
            {viewing === "forgot-pwd" && (
                <>
                    <div className="mb-2">
                        <label htmlFor="email" className="form-label mb-3 admin-label">Enter admin's Mail ID</label>
                        <input
                            type="email"
                            className="admin-input"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='d-flex justify-content-end align-items-end mb-5 gap-2'>
                        <p className='mb-0' style={{ fontSize: "12px" }}>Back to login</p><button className='backtologin' onClick={() => navigate('/login')} >Login</button>
                    </div>
                    <button type="submit" className="btn btn-primary admin-button" disabled={loading.otp} onClick={checkMailIsCorrect}>{loading.otp ? "Sending..." : "Send OTP"}</button>
                </>
            )}

            {viewing === "verify-otp" && (
                <>
                    <div className="mb-2">
                        <label htmlFor="email" className="form-label mb-3 admin-label text-center">
                            Enter 4 Digit one time password (OTP) We send to your registered Email
                        </label>
                        <div className="display-flex">
                            {verifyform.otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    className="otp-input"
                                    id={`otp-${index}`}
                                    maxLength="1" // Limit input to 1 character
                                    value={digit}
                                    onChange={(e) => handleOTPChange(e, index)}
                                />
                            ))}
                        </div>
                    </div>
                    <button className='forgot' style={{ marginRight: "60px" }} onClick={checkMailIsCorrect} >Resend OTP</button>
                    <button type="submit" className="btn btn-primary admin-button" disabled={loading.verify} onClick={verifyOTP}> {loading.verify ? "Verifing..." : "Verify OTP"}</button>
                </>
            )}

            {viewing === "change-pwd" && (
                <>
                    <div className="mb-5 position-relative">
                        <label htmlFor="password" className="form-label mb-3 admin-label">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="admin-input"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span
                            className="toggle-password"
                        >
                            <button onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <SvgContent svg_name="eyeclose" /> : <SvgContent svg_name="eyeopen" />}
                            </button>
                        </span>
                    </div>

                    <div className="mb-5 position-relative">
                        <label htmlFor="confirmPassword" className="form-label mb-3 admin-label">Confirm Password</label>
                        <input
                            type={showCnfmPassword ? 'text' : 'password'}
                            className="admin-input"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <span
                            className="toggle-password"
                        >
                            <button onClick={() => setShowCnfmPassword(!showCnfmPassword)}>
                            {showCnfmPassword ? <SvgContent svg_name="eyeclose" /> : <SvgContent svg_name="eyeopen" />}
                            </button>
                        </span>
                    </div>
                    <button type="submit" className="btn btn-primary admin-button" disabled={loading.reset} onClick={ResetPassword} > {loading.reset ? "Reseting..." : "Reset"}</button>
                </>
            )}
        </form>
    );
};

export default LoginPage;
