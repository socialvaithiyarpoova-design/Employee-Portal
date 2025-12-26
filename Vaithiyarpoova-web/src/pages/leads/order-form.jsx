import React, { useState, useEffect } from "react";
import { PropagateLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useLocation } from "react-router-dom";
import configModule from '../../../config.js';
import axios from 'axios';
import { useAuth } from '../../components/context/Authcontext.jsx';
import CommonSelect from "../../components/common-select.jsx";
import SvgContent from '../../components/svgcontent.jsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import locationData from "../../components/districts.json";

const OrderForm = () => {
    const { user } = useAuth();
    const userId = user?.userId;
    const [needLoading, setNeedLoading] = useState(false);
    const [isStickerShown, setIsStickerShown] = useState(false);
    const [aDBranchData, setADBranchData] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "leads";
    const { leadData, selectedProducts, totalAmount, catagory,catagory_id,walletData,dispatch_id } = location.state || {};
    const [directPickup, setDirectPickup] = useState(false);
    const [approvedBy, setApprovedBy] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const [medicationPeriod, setMedicationPeriod] = useState("1 month");
    const [image, setImage] = useState(null);
    const [transactionId, setTransactionId] = useState(null);
    const [dateTime, setDateTime] = useState("");
    const [isRightEditable, setIsRightEditable] = useState(false);
    const [additionalNumber, setAdditionalNumber] = useState("");
    const [address, setAddress] = useState("");
    const [district, setDistrict] = useState("");
    const [stickType, setStickType] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("");
    const [pincode, setPincode] = useState("");
    const [courier, setCourier] = useState("");
    const [discount, setDiscount] = useState("");
    const config = configModule.config();
     const [courieramount, setCourieramount] = useState("");
    const [gstPercentage, setGstPercentage] = useState(0);
    const [gstId, setGstId] = useState(null);

const countryOptions = Object.keys(locationData).map((c) => ({
    label: c,
    value: c,
  }));

  const stateOptions =
    country && locationData[country]
      ? Object.keys(locationData[country]).map((s) => ({
          label: s,
          value: s,
        }))
      : [];

  const districtOptions =
    country && state
      ? locationData[country][state].map((d) => ({
          label: d,
          value: d,
        }))
      : [];

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
    setState("");
    setDistrict("");
  };

  const handleStateChange = (e) => {
    setState(e.target.value);
    setDistrict("");
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
  };


  const validateMobileNumber = (mobile) => {

    const cleanMobile = mobile.trim();
    if (!/^\d+$/.test(cleanMobile)) {
        return { isValid: false, message: "Mobile number must contain only digits." };
    }
    if (cleanMobile.length !== 10) {
        return { isValid: false, message: "Mobile number must be exactly 10 digits." };
    }
    if (!/^[6-9]/.test(cleanMobile)) {
        return { isValid: false, message: "Mobile number must start with 6, 7, 8, or 9." };
    }
    
    return { isValid: true, message: "" };
  };

    const CourierType = [
        { label: "DTDC", value: "DTDC" },
        { label: "India Post", value: "India Post" },
        { label: "MSS", value: "MSS" },
        { label: "Professional", value: "Professional" },
        { label: "ST", value: "ST" },
        { label: "Others", value: "Others" },
    ];

    const StickerTypes = [
        { label: "With sticker", value: "With sticker" },
        { label: "No sticker", value: "No sticker" }
    ];

     const payment = [
    { label: "Cash", value: "Cash" },
    { label: "Online", value: "Online" }
  ];



    useEffect(() => {
        const getADBranchList = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.post(`${config.apiBaseUrl}getADBranchList`, {
                    userId: userId
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = response.data;

                if (response.status === 200) {
                    setADBranchData(result.data);

                } else {
                    toast.error("Failed to fetch admin's list: " + result.message);
                }
            } catch (error) {
                toast.error("Error fetching admin's list: " + (error.response?.data?.message || error.message));
            } finally {
                setNeedLoading(false);
            }
        };

        if (userId) {
            getADBranchList();
        }
    }, [userId]);

    const HeadOptions = Array.isArray(aDBranchData)
        ? aDBranchData.map(item => ({
            label: item.emp_id + " - " + item.label,
            value: item.value
        }))
        : [];

    const MedicOptions = [
        { label: "7 Days", value: "7 Days" },
        { label: "15 Days", value: "15 Days" },
        { label: "1 months", value: "1 months" }
    ];


        const handleCheckboxChange = () => {
            const newValue = !directPickup;
            setDirectPickup(newValue);
            if (!newValue) {
                setPaymentMode("Online");
            } else {
                setPaymentMode("");
            }
        };

        const handleImageChange = (e) => {
            const file = e.target.files[0];

            if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
                setImage(file);
            } else {
                toast.error('Please upload a valid JPEG or PNG image.');
            }
            e.target.value = null;
        };


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

    const formatDateTime = (date) => {
        if (!date) return "";
        const pad = (n) => n.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const orderValue = parseFloat(totalAmount || 0);     
    const discountValue = parseFloat(discount || 0);      
    const walletBalance = parseFloat(walletData?.amount || 0); 
    const courierValue = parseFloat(courieramount || 0); 
    const gstPercent = parseFloat(gstPercentage || 0);  

    const afterDiscount = Math.max(orderValue - discountValue, 0);
    const withCourier = afterDiscount ;
    const gstValue = withCourier * gstPercent;
    const finalTotal = withCourier + gstValue + courierValue;
    const payableAmount = Math.max(finalTotal - walletBalance, 0);
   const walletUsed = Math.min(walletBalance, finalTotal); 
   const remainingWallet = Math.max(walletBalance - finalTotal, 0);

    const handleSubmit = async () => {
        setNeedLoading(true);

       // const recIds = selectedProducts.map(item => item.rec_id).join(',');
        const recIds = selectedProducts.map(item => item.rec_id);
        const qauntity = selectedProducts.reduce((sum, item) => sum + item.qty, 0);

        const formData = new FormData();
        formData.append("leads_id", leadData?.lead_id);
        formData.append("direct_pickup", directPickup ? "1" : "0");
        formData.append("additional_number", additionalNumber);
        formData.append("address", address);
        formData.append("district", district);
        formData.append("state", state);
        formData.append("country", country);
        formData.append("pincode", pincode);
        formData.append("catagory", catagory);
        formData.append("courier", courier?.target?.value || courier);
        formData.append("order_value", totalAmount);
        formData.append("discount", discount);
        formData.append("approved_by", approvedBy?.target?.value || approvedBy);
        formData.append("payment_mode", paymentMode?.target?.value || 'Online');
        formData.append("courier_amount", parseFloat(courieramount || 0));
        formData.append("gst_amount", gstValue.toFixed(2));
        formData.append("wallet",walletUsed);
        formData.append("total_value", finalTotal.toFixed(2));
        formData.append("amount_to_pay", payableAmount.toFixed(2));
        formData.append("medication_period", medicationPeriod?.target?.value || medicationPeriod);
        formData.append("transaction_id", transactionId ? transactionId.trim() : null);
        formData.append("date_time", formatDateTime(dateTime));
        formData.append("catagory_id",catagory_id);
        formData.append("quantity", qauntity);
        formData.append("rec_id", JSON.stringify(recIds));
        formData.append("user_id", userId);
        formData.append("stick_type", stickType?.target?.value || stickType);
        formData.append("folder", "payment");
        formData.append("gst_id", gstId);
        formData.append("products", JSON.stringify(selectedProducts));
        formData.append("dispatch_id", dispatch_id);


        if (image) {
            formData.append("receipt_image_url", image);
        }

        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.post(`${config.apiBaseUrl}insertSalesOrder`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

           if (res.status === 200) {
            toast.success("Order placed successfully");

            // ✅ If wallet was used, update it to 0 in backend
            if (walletBalance > 0) {
                try {
                    await axios.post(
                        `${config.apiBaseUrl}wallet-balance`,
                        { wallet_recid: walletData?.wallet_recid,
                          amount:remainingWallet},
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    console.log("Wallet balance reset to 0");
                } catch (err) {
                    console.error("Failed to reset wallet:", err);
                    toast.warning("Order placed, but wallet not updated");
                }
            }                        
            setTimeout(() => {
                navigate(from === "appointments" ? "/appointments" : "/leads");
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

      const handleClearDelivery = () => {
        setDirectPickup(false);
        setAdditionalNumber("");
        setAddress("");
        setDistrict("");
        setState("");
        setCountry("");
        setPincode("");
        setCourier("");
        };

        const isPlaceOrderEnabled = () => {
            if (!isRightEditable || !dateTime) return false;

            if (!directPickup) {
                if (
                    !additionalNumber.trim() ||
                    !address.trim() ||
                    !district.trim() ||
                    !state.trim() ||
                    !country.trim() ||
                    !courier
                ) return false;
            } else {
                if (!additionalNumber.trim()) return false;
            }

            if (parseFloat(discount || 0) > 0 && !approvedBy) return false;

            if (!directPickup && (!courieramount || parseFloat(courieramount) <= 0)) return false;

            if (!paymentMode) return false;

            if (!medicationPeriod) return false;

            if ((paymentMode === "Online" || paymentMode?.target?.value === "Online") && (!image || !transactionId?.trim())) return false;

            return true;
        };

  useEffect(() => {
    if (!directPickup) {
        setPaymentMode("Online");
    }
  }, [directPickup])


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
                    <p className='mb-0 fw-medium'>Add to cart</p>
                    <div>
                         <button
                            className="mb-0 nav-btn-top"
                            onClick={() =>
                                navigate(
                                location.pathname.includes("/appointments") ? "/appointments" : "/leads"
                                )
                            }
                            >
                            {location.pathname.includes("/appointments") ? "Appointments" : "Leads"} &gt; List
                            </button>{" "}&nbsp;
                        <p className='mb-0 nav-btn-top'>
                            &gt; Cart
                        </p>
                    </div>
                </div>
            </div>

            <div className='body-div-el'>
                <div className="w-100 h-100 body-odrform-st">
                    <div className="w-50 h-100 bg-white  response-mob-order" style={{ borderRadius: "12px" }}>
                        <div style={{height:'calc(100% - 70px',overflow:'auto'}}>
                        <div className="border rounded p-3 bg-white">
                            <div className="client-details-container">
                                <h4 className="section-title mb-3"><u>Client details</u></h4>
                                <div className="details-grid">
                                    <div className="detail-label">Customer ID</div>
                                    <div className="detail-value">{leadData?.lead_id}</div>

                                    <div className="detail-label">Name</div>
                                    <div className="detail-value">{leadData?.lead_name}</div>

                                    <div className="detail-label">Age</div>
                                    <div className="detail-value">{leadData?.age}</div>

                                    <div className="detail-label">Gender</div>
                                    <div className="detail-value">{leadData?.gender}</div>

                                    <div className="detail-label">Mobile</div>
                                    <div className="detail-value">{leadData?.mobile_number}</div>

                                    <div className="detail-label">Email</div>
                                    <div className="detail-value">{leadData?.email}</div>
                                </div>
                            </div>
                        </div>
                        <div className="delivery-form-container">
                            <h4 className="section-title mb-3">
                                <u>Delivery details</u>
                            </h4>

                            <div className="form-row">
                                <label className="display-flex mb-0">Direct pickup</label>
                                <div className="order_form-checkbox-wrapper commcb-select-of">
                                    <input
                                        type="checkbox"
                                        checked={directPickup}
                                        onChange={handleCheckboxChange}
                                        id="directPickup"
                                    />
                                    <label htmlFor="directPickup" className="order_form-checkbox-label mb-0">
                                        Click if customer request direct pickup
                                    </label>
                                </div>
                            </div>

                            <div className="commonst-select">
                                <label htmlFor="categoryInput" className="form-label">Additional No</label>
                                <div className="commcb-select-of position-relative">
                                    <input
                                        type="text"
                                        placeholder="Enter additional mobile number"
                                        disabled={false}
                                        value={additionalNumber}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) {
                                                setAdditionalNumber(value);
                                            }
                                        }}
                                        className="form-control-st  mb-3"
                                        maxLength={10}
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>

                            <div className="commonst-select">
                                <label htmlFor="categoryInput" className="form-label">Address</label>
                                <div className="commcb-select-of position-relative">
                                    <textarea
                                        placeholder="Enter address"
                                        disabled={directPickup}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                         className={`form-control-st-textarea mb-3 ${directPickup ? "disabled-fields" : ""}`}
                                        style={{ padding: "11px"}}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="commonst-select">
                                <label htmlFor="categoryInput" className="form-label">Country</label>
                                <div className="commcb-select-of position-relative mb-3">
                                   <CommonSelect
                                    placeholder="Select Country"
                                    name="country"
                                    value={country}
                                    onChange={handleCountryChange}
                                    options={countryOptions}
                                    isSearchable={true}
                                    disabled={directPickup}
                                    />
                                </div>
                            </div>
                             <div className="commonst-select">
                                <label htmlFor="categoryInput" className="form-label">State</label>
                                <div className="commcb-select-of position-relative mb-3">
                                   <CommonSelect
                                    placeholder="Select State"
                                    name="state"
                                    value={state}
                                    onChange={handleStateChange}
                                    options={stateOptions}
                                    isSearchable={true}
                                    disabled={directPickup}
                                />
                                </div>
                            </div>

                            <div className="commonst-select">
                                <label htmlFor="categoryInput" className="form-label">District</label>
                                <div className="commcb-select-of position-relative mb-3">
                                   <CommonSelect
                                    placeholder="Select District"
                                    name="district"
                                    value={district}
                                    onChange={handleDistrictChange}
                                    options={districtOptions}
                                    isSearchable={true}
                                    disabled={directPickup}
                                />
                                </div>
                            </div>

                                                   
                            <div className="commonst-select">
                                <label htmlFor="categoryInput" className="form-label">Pin Code</label>
                                <div className="commcb-select-of position-relative">
                                    <input
                                        type="number"
                                        placeholder="Enter pin code"
                                        disabled={directPickup}
                                        value={pincode}
                                        onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.length <= 6) setPincode(val); 
                                        }}    
                                        className="form-control-st  mb-3"
                                    />
                                </div>
                            </div>


                            <div className="commonst-select">
                                <label htmlFor="categoryInput" className="form-label">Courier</label>
                                <div className="commcb-select-of position-relative">
                                    <CommonSelect
                                        header="Select category"
                                        placeholder="Select category"
                                        name="type"
                                        value={courier}
                                        onChange={setCourier}
                                        options={CourierType}
                                        disabled={directPickup}
                                    />
                                </div>
                            </div>                           
                        </div>
                        </div>
                        <div className="p-3" style={{height:'70px'}}>
                       <div className="display-flex justify-content-end align-items-center gap-10">
                                <button className="cancel-btn-order-f me-3"   onClick={handleClearDelivery}>Clear</button>
                                <button
                                    className="save-btn-order-f"
                            disabled={
                            !directPickup && (
                            !additionalNumber.trim() ||
                            !address.trim() ||
                            !district.trim() ||
                            !state.trim() ||
                            !country.trim() ||
                            !courier
                            )
                        }
                        onClick={() => {
                            // ✅ Case 1: Direct Pickup
                            if (directPickup) {
                            // Skip all validations, just move ahead
                            setIsRightEditable(true);
                            return;
                            }

                            // ✅ Case 2: Delivery Mode — run validations
                            const { isValid, message } = validateMobileNumber(additionalNumber);
                            if (!isValid) {
                            toast.warning(message);
                            return;
                            }

                            if (
                            !additionalNumber.trim() ||
                            !address.trim() ||
                            !district.trim() ||
                            !state.trim() ||
                            !country.trim() ||
                            !courier
                            ) {
                            toast.warning("Please fill all delivery details before saving.");
                            return;
                            }

                            setIsRightEditable(true);
                        }}
                        >
                          Next
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="w-50 h-100 bg-white  response-mob-order " style={{ borderRadius: "12px" }}>
                        <div className="payment-container" style={{height:'calc(100% - 70px',overflow:'auto'}}>
                            <h4 className="section-title mb-3"><u>Payment receipt</u></h4>

                            <div
                                className={`payment-grid ${!isRightEditable ? "disabled-section" : ""}`}
                            >

                                <div className="label">Order value</div>
                                <div className="value">₹ {totalAmount}</div>

                         <div className="label discount-label" >Discount</div>
                                <div className="value">
                                    <input
                                            type="text"
                                            placeholder="Discount amount"
                                            className="form-control-st"
                                            value={discount}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^\d*\.?\d*$/.test(value)) {
                                                const numValue = parseFloat(value || "0");
                                                const maxDiscount = orderValue * 0.25; // 25% of total order value
                                                if (numValue > maxDiscount) {
                                                    toast.warning(`Maximum allowed discount is (₹${maxDiscount.toFixed(2)}).`);
                                                    return;
                                                }
                                                setDiscount(value);
                                                }
                                            }}
                                            disabled={!isRightEditable}
                                            pattern="[0-9]*"
                                            inputMode="numeric"
                                            />

                                </div>
                               {parseFloat(discount || 0) > 0 && (
                                        <>
                                            <div className="label pt-2">
                                                Approved by <br />
                                                <small>(person who approved discount)</small>
                                            </div>
                                            <div className="value">
                                                <CommonSelect
                                                    header="Select head"
                                                    placeholder="Select head"
                                                    name="admin"
                                                    value={approvedBy}
                                                    onChange={setApprovedBy}
                                                    options={HeadOptions}
                                                    disabled={!isRightEditable}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {!directPickup && (
                                    <>
                                        <div className="label discount-label">Courier amount</div>
                                        <div className="value">
                                        <input
                                            type="number"
                                            className="form-control-st"
                                            placeholder="Enter courier amount"
                                            value={courieramount}
                                            onChange={(e) => setCourieramount(e.target.value)}
                                            disabled={!isRightEditable}
                                        />
                                        </div>
                                        </>
                               )}

                                  
                                        <div className="label discount-label">Payment mode</div>
                                        <div className="value">                                      
                                         <div className="value">
                                            {directPickup ? (
                                            <CommonSelect
                                            header="Select  Method"
                                            placeholder="Select method"
                                            name="admin"
                                            value={paymentMode}
                                            onChange={setPaymentMode}
                                            options={payment}
                                            disabled={!isRightEditable}
                                            />
                                            ) : (
                                            <div>Online</div>
                                        )}
                                         </div>
                                        </div>
                                   
                                   


                                <div className="label">Wallet</div>
                                <div className="value">₹ {walletBalance}</div>

                                <div className="label">GST ({(gstPercentage * 100).toFixed(0)}%)</div>
                                <div className="value">₹ {gstValue.toFixed(2)}</div>

                                <div className="label">Total value
                                     <br />
                                    <small>(Balance  + gst value)</small>
                                </div>
                                <div className="value">₹ {finalTotal.toFixed(2)}</div>

                                <div className="label">
                                    Amount to pay
                                </div>
                                <div className="value">₹ {payableAmount.toFixed(2)} *</div>

                                <div className="label pt-2">
                                    Medication period <br />
                                    <small>(select prescribed duration)</small>
                                </div>
                                <div className="value">
                                    <CommonSelect
                                        header="Select medication period"
                                        placeholder="Select medication period"
                                        name="admin"
                                        value={medicationPeriod}
                                        onChange={setMedicationPeriod}
                                        options={MedicOptions}
                                        disabled={!isRightEditable}
                                    />
                                </div>
                            </div>
                           {(paymentMode?.target?.value === "Online" || paymentMode === "Online") && (
                            <div className={`upload-receipt-container ${!isRightEditable ? "disabled-section" : ""}`} >
                                <h4 className="section-title mb-2 pt-2"><u>Upload receipt</u></h4>
                                <p className="upload-subtext">
                                    Collect screenshot from client and upload to place the order
                                </p>

                                <label htmlFor="imageUpload" className="upload-box">
                                    <input
                                        type="file"
                                        id="imageUpload"
                                        onChange={handleImageChange}
                                        accept="image/jpeg, image/png"
                                        hidden
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

                             {(paymentMode?.target?.value === "Online" || paymentMode === "Online") && (
                                <div className="form-row">
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
                                )}

                                                       
                            </div>
                             )}
                            <div className="form-row">
                                <label htmlFor="datetime" style={{ minWidth: "125px" }} className="discount-label">
                                    Date and time
                                </label>
                                <DatePicker
                                    selected={dateTime}
                                    onChange={(date) => setDateTime(date)}
                                    maxDate={new Date()} 
                                    minDate={new Date(new Date().setDate(new Date().getDate() - 2))}
                                    showTimeSelect
                                    dateFormat="dd-MM-yyyy h:mm aa"
                                    timeFormat="hh:mm aa"
                                    timeIntervals={15}
                                    placeholderText="DD/MM/YYYY HH:MM"
                                    className="form-control-st datpick-select-of"
                                    disabled={!isRightEditable}
                                    popperPlacement="bottom"
                                />
                                </div>                               
                        </div>
                        <div className="p-3" style={{height:'70px'}}>
                            <button
                                    className="place-order-btn"
                                    onClick={() => { setIsStickerShown(true);}}
                                    disabled={!isPlaceOrderEnabled()}
                                    style={{
                                        opacity: !isPlaceOrderEnabled() ? 0.6 : 1,
                                        cursor: !isPlaceOrderEnabled() ? 'not-allowed' : 'pointer'
                                    }} >
                                    Place Order
                                </button>
                        </div>
                    </div>
                </div>
            </div>

            {isStickerShown && (
                <div className="modal-overlay modal-overlay-position">
                    <div className="modal-container">
                        <div className="modal-header mb-3">
                            <h5 className="mb-0 add-new-hdr">Package type</h5>
                        </div>
                        <div className="modal-body mb-2">
                            <div className="container commonst-select mb-4">
                                <p className="mb-0" style={{ minWidth: "120px" }}>Select type</p>
                                <CommonSelect
                                    header="Select type"
                                    placeholder="Select type"
                                    name="type"
                                    value={stickType}
                                    onChange={setStickType}
                                    options={StickerTypes}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setIsStickerShown(false)}>No</button>
                            <button
                                className="next-button"
                                onClick={handleSubmit}
                                disabled={!stickType}
                                style={{
                                    opacity: !stickType ? 0.6 : 1,
                                    cursor: !stickType ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
};

export default OrderForm;
