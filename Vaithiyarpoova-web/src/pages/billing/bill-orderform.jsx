import React, { useState, useEffect } from 'react';
import { PropagateLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import '../../assets/styles/billing.css';
import SvgContent from '../../components/svgcontent.jsx';
import CommonSelect from "../../components/common-select.jsx";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import configModule from '../../../config.js';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../components/context/Authcontext.jsx';

function BillOrderForm() {
    // Client details states
    const [lead_name, setLeadName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [mobile_number, setMobileNumber] = useState("");
    const [email, setEmail] = useState("");
    
    // Payment states
    const [discount, setDiscount] = useState("");
    const [approvedBy, setApprovedBy] = useState("");
    const [paymentMode, setPaymentMode] = useState("Online");
    const [transactionId, setTransactionId] = useState("");
    const [image, setImage] = useState(null);
    
    // Other states
    const [gstPercentage, setGstPercentage] = useState(0);
    const [gstId, setGstId] = useState(null);
    const [needLoading, setNeedLoading] = useState(false);
    const [isRightEditable, setIsRightEditable] = useState(false);
    
    const location = useLocation();
    const { user } = useAuth();
    const userId = user?.userId;
    const navigate = useNavigate();
    const { selectedProducts, totalAmount, catagory } = location.state || {};
    const config = configModule.config();

    const paymentmode = [
        { label: "Cash", value: "Cash" },
        { label: "Online", value: "Online" }
    ];

    const Approvels = [
        { label: "Admin", value: "Admin" },
        { label: "Branch Head", value: "Branch Head" }
    ];

    const getgstpercentage = async () => {
        try {
            const res = await axios.get(`${config.apiBaseUrl}gstpercent`);
            setGstPercentage(res.data.gst_percentage);
            setGstId(res.data.gst_id);
        } catch (error) {
            console.error("Error fetching GST:", error);
        }
    };

    useEffect(() => {
        getgstpercentage();
    }, []);

    // Calculations
    const orderValue = parseFloat(totalAmount || 0);
    const discountValue = parseFloat(discount || 0);
    const gstPercent = parseFloat(gstPercentage || 0);

    const afterDiscount = Math.max(orderValue - discountValue, 0);
    const gstValue = afterDiscount * gstPercent;
    const finalTotal = afterDiscount + gstValue;
    const payableAmount = Math.max(finalTotal, 0);


    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }
            setImage(file);
        }
    };

    // Handle clear form
    const handleClear = () => {
        setLeadName("");
        setAge("");
        setGender("");
        setMobileNumber("");
        setEmail("");
    };

    // Handle next button (enable right side)
    const handleNext = () => {
        if (!lead_name.trim()) {
            toast.warning("Please enter client name");
            return;
        }
        if (!mobile_number.trim()) {
            toast.warning("Please enter mobile number");
            return;
        }
        if (mobile_number.length !== 10) {
            toast.warning("Mobile number must be 10 digits");
            return;
        }
        setIsRightEditable(true);      
    };

    const handleSubmit = async () => {
        if (!lead_name.trim()) {
            toast.warning("Please enter client name");
            return;
        }
        if (!mobile_number.trim() || mobile_number.length !== 10) {
            toast.warning("Please enter valid 10-digit mobile number");
            return;
        }
        if (!isRightEditable) {
            toast.warning("Please click 'Next' to proceed with payment details");
            return;
        }
        if (!image) {
            toast.warning("Please upload payment receipt");
            return;
        }
        if (!transactionId.trim()) {
            toast.warning("Please enter transaction ID");
            return;
        }

        setNeedLoading(true);
        const quantity = selectedProducts.reduce((sum, item) => sum + item.qty, 0);

        const formData = new FormData();
        formData.append("lead_name", lead_name);
        formData.append("age", age);
        formData.append('gender', gender);
        formData.append("mobile", mobile_number);
        formData.append("email", email);
        formData.append("order_value", orderValue.toFixed(2));
        formData.append("discount", discountValue.toFixed(2));
        formData.append("approved_by", approvedBy?.target?.value || approvedBy);
        formData.append("payment_mode", paymentMode?.target?.value || paymentMode);
        formData.append("gst_amount", gstValue.toFixed(2));
        formData.append("total_value", finalTotal.toFixed(2));
        formData.append("amount_to_pay", payableAmount.toFixed(2));
        formData.append("transaction_id", transactionId.trim());
        formData.append("catagory", catagory);
        formData.append("quantity", quantity);
        formData.append("created_by", userId);
        formData.append("folder", "payment");
        formData.append("gst_id", gstId);

        if (image) {
            formData.append("receipt_image_url", image);
        }

        formData.append("products", JSON.stringify(selectedProducts));

        try {
            const res = await axios.post(`${config.apiBaseUrl}insertbillingOrder`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
          
            if (res.status === 200) {
                toast.success("Order placed successfully");
                
                const stockData = selectedProducts.map(p => ({
                    product_id: p.id,
                    qty: p.qty
                }));

                try {
                    await fetch(`${config.apiBaseUrl}reduce-stock`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(stockData),
                    });
                    console.log("📦 Stock reduced successfully");
                } catch (stockErr) {
                    console.error("❌ Stock update failed:", stockErr);
                    toast.warn("Order placed, but stock update failed.");
                }

                setTimeout(() => {
                    navigate("/billing");
                    setNeedLoading(false);
                }, 2000);
            } else {
                toast.error("Failed to place order");
                setNeedLoading(false);
            }
        } catch (err) {
            let errorMsg = err?.response?.data?.message || err.message;

            if (errorMsg.includes("Duplicate entry") && errorMsg.includes("transaction_id_UNIQUE")) {
                errorMsg = "Transaction ID already exists. Please use another.";
            }

            toast.error(errorMsg || "Error while placing order");
            setNeedLoading(false);
        }
    };

   const isOnlinePayment = (paymentMode?.target?.value || paymentMode) === "Online";

    return (
        <div className='common-body-st'>
            {needLoading && (
                <div className='loading-container w-100 h-100'>
                    <PropagateLoader
                        height="100"
                        width="100"
                        color="#0B9346"
                        radius="10"
                    />
                </div>
            )}
            <div className='header-cart-st'>
                <div>
                    <p className='mb-0 fw-medium'>Billing</p>
                </div>
            </div>

            <div className='body-div-el' style={{ padding: '16px' }}>
                <div className="billform_form-container h-100">
                    <div className="billform_client-details h-100">
                        <div style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
                            <h5 className='mb-3'>Client details</h5>
                            <div className="billform_form-group">
                                <label className="minwd-set-st">Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter client name"
                                    value={lead_name}
                                    onChange={(e) => setLeadName(e.target.value)}
                                />
                            </div>
                            <div className="billform_form-group">
                                <label className="minwd-set-st">Age</label>
                                <input
                                    type="text"
                                    placeholder="Enter client age"
                                    value={age}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value) && (value === '' || parseInt(value) <= 120)) {
                                            setAge(value);
                                        }
                                    }}
                                />
                            </div>
                            <div className="billform_form-group">
                                <label className="minwd-set-st">Gender</label>
                                <input
                                    type="text"
                                    placeholder="Enter gender"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                />
                            </div>
                            <div className="billform_form-group">
                                <label htmlFor='phone' className="minwd-set-st">Phone *</label>
                                <input
                                    type="text"
                                    placeholder="Enter mobile number"
                                    value={mobile_number}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value) && value.length <= 10) {
                                            setMobileNumber(value);
                                        }
                                    }}
                                    maxLength={10}
                                />
                            </div>
                            <div className="billform_form-group">
                                <label className="minwd-set-st">Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>                           
                        </div>
                        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                            <div className="billform_button-group">
                                <button className="billform_btn-clear" onClick={handleClear}>Clear</button>
                                <button className="billform_btn-save" onClick={handleNext}>Next</button>
                            </div>
                        </div>
                    </div>

                    <div className="billform_payment-receipt">
                        <div style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
                            <h5 className='mb-3'>Payment receipt</h5>
                            <div className="billform_form-group">
                                <label className="minwd-set-st" >Order value</label>
                                <p className="billform_bold">₹{orderValue.toFixed(2)}</p>
                            </div>
                            <div className="billform_form-group">
                                <label className="minwd-set-st" style={{display:'flex',alignItems:'center'}}>Discount</label>
                                <input
                                    type="text"
                                    placeholder="Discount amount"
                                    className="form-control-st"
                                    value={discount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*\.?\d*$/.test(value)) {
                                            const numValue = parseFloat(value || "0");
                                            const maxDiscount = orderValue * 0.25;
                                            if (numValue > maxDiscount) {
                                                toast.warning(`Maximum allowed discount is ₹${maxDiscount.toFixed(2)} (25%).`);
                                                return;
                                            }
                                            setDiscount(value);
                                        }
                                    }}
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    disabled={!isRightEditable}
                                />
                            </div>
                            {discountValue > 0 && (
                                <div className="billform_form-group">
                                    <label className="minwd-set-st" style={{display:'flex',alignItems:'center'}}>
                                        Approved by 
                                    </label>
                                    <CommonSelect
                                        options={Approvels}
                                        value={approvedBy}
                                        onChange={setApprovedBy}
                                        placeholder="Select approver"
                                        isDisabled={!isRightEditable}
                                    />
                                </div>
                            )}
                            <div className="billform_form-group">
                                    <label className="minwd-set-st" style={{display:'flex',alignItems:'center'}}>
                                       Payment mode
                                    </label>
                                   <CommonSelect
                                        options={paymentmode}
                                        value={paymentMode}
                                        onChange={setPaymentMode}
                                        placeholder="Select payment mode"
                                        isDisabled={!isRightEditable}
                                    />
                                </div>
                            <div className="billform_form-group" >
                                    <label className="minwd-set-st" style={{ minWidth: "165px" }}></label>
                                    
                                </div>
                            <div className="billform_form-group">
                                <label className="minwd-set-st">After discount</label>
                                <p className="billform_bold">₹{afterDiscount.toFixed(2)}</p>
                            </div>

                            <div className="billform_form-group">
                                <label className="minwd-set-st">GST ({(gstPercent * 100).toFixed(0)}%)</label>
                                <p className="billform_bold">₹{gstValue.toFixed(2)}</p>
                            </div>
                            <div className="billform_form-group">
                                <label className="minwd-set-st">Total value</label>
                                <p className="billform_bold">₹{finalTotal.toFixed(2)}</p>
                            </div>
                            <div className="billform_form-group">
                                <label className="minwd-set-st">
                                    Amount to pay
                                </label>
                                <p className="billform_bold" style={{ color: '#0B9346', fontSize: '20px' }}>
                                    ₹{payableAmount.toFixed(2)}
                                </p>
                            </div>
                     {isOnlinePayment && (
                            <div className={`upload-receipt-container ${!isRightEditable ? "disabled-section" : ""}`}>
                                <h4 className="section-title mb-2 pt-2"><u>Upload receipt</u></h4>
                                <p className="upload-subtext">
                                    Collect screenshot from client and upload to place the order
                                </p>

                                <label htmlFor="imageUpload" className="upload-box" style={{ cursor: isRightEditable ? 'pointer' : 'not-allowed' }}>
                                    <input
                                        type="file"
                                        id="imageUpload"
                                        onChange={handleImageChange}
                                        accept="image/jpeg, image/png"
                                        hidden
                                        disabled={!isRightEditable}
                                    />
                                    <SvgContent svg_name="btn_upload" stroke="#0B622F" style={{ zIndex: "999" }} />
                                    <span style={{ color: "#121212", zIndex: "0" }}>Upload image</span>
                                </label>

                                {image && (
                                    <div className="uploaded-file" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <p style={{ margin: 0 }}>Selected: {image.name}</p>
                                        <button
                                            type="button"
                                            onClick={() => setImage(null)}
                                            style={{
                                                border: "none",
                                                background: "transparent",
                                                cursor: "pointer",
                                                color: "red",
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                            }}
                                            aria-label="Remove selected file"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                

                                <div className="form-row" style={{ marginTop: '12px' }}>
                                    <label className="discount-label" style={{ minWidth: "165px" }}>Transaction ID</label>
                                    <input
                                        type="text"
                                        className="form-control-st commcb-select-of"
                                        value={transactionId}
                                        placeholder="Enter transaction ID"
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        disabled={!isRightEditable}
                                    />
                                </div>                          
                            </div>
                     )}
                        </div>
                        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                            <div className="billform_button-group">
                                <button 
                                    className="billform_btn-save-print" 
                                    onClick={handleSubmit}
                                    disabled={!isRightEditable}
                                    style={{ opacity: isRightEditable ? 1 : 0.5, cursor: isRightEditable ? 'pointer' : 'not-allowed' }}
                                >
                                    Place order
                                </button>
                            </div>
                        </div>
                    </div>
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

export default BillOrderForm;