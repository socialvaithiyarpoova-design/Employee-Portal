import React, { useState, useEffect } from 'react';
import { PropagateLoader } from 'react-spinners';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import configModule from '../../../config.js';
import '../../assets/styles/registration.css';
import DatePicker from 'react-datepicker';
import CommonSelect from "../../components/common-select.jsx";
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../../components/context/Authcontext.jsx';
import SvgContent from '../../components/svgcontent';
import 'react-datepicker/dist/react-datepicker.css';
import PreferredTimeSelect from "./PreferredTimeSelect"; 


function ClassRegister() {
    const { user } = useAuth();
    const userId = user?.userId;
    const location = useLocation();
    const navigate = useNavigate();
    const config = configModule.config();
    const [needLoading, setNeedLoading] = useState(false);
    const rowData = location?.state?.selectedData || [];
    const [registerId, setRegisterId] = useState("VPR001");
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [dateTime, setDateTime] = useState("");
    const [martialStatus, setMartialStatus] = useState("");
    const [isMaleTest, setIsMaleTest] = useState("");
    const [isFemaleTest, setIsFemaleTest] = useState("");
    const [femaleReason, setFemaleReason] = useState("");
    const [maleReason, setMaleReason] = useState("");
    const [showRightSection, setShowRightSection] = useState(false);
    const [showSecondPage, setShowSecondPage] = useState(false);
    const [isRightEditable, setIsRightEditable] = useState(false);
    const [discount, setDiscount] = useState("");
    const [approvedBy, setApprovedBy] = useState("");
    const [aDBranchData, setADBranchData] = useState([]);
    const [image, setImage] = useState(null);
    const [transactionId, setTransactionId] = useState("");
    const [vaithyarList, setVaithyarList] = useState("");
    const [vaithyarDetails, setVaithyarDetails] = useState([]);

    // Male partner details
    const [maleName, setMaleName] = useState("");
    const [maleDob, setMaleDob] = useState("");
    const [maleMobile, setMaleMobile] = useState("");
    const [maleEmail, setMaleEmail] = useState("");
    const [maleTestRemark, setMaleTestRemark] = useState("");
    const [maleCause, setMaleCause] = useState("");
    const [maleRemark, setMaleRemark] = useState("");

    // Female partner details
    const [femaleName, setFemaleName] = useState("");
    const [femaleDob, setFemaleDob] = useState("");
    const [femaleMobile, setFemaleMobile] = useState("");
    const [femaleEmail, setFemaleEmail] = useState("");
    const [femaleTestRemark, setFemaleTestRemark] = useState("");
    const [femaleCause, setFemaleCause] = useState("");
    const [femaleRemark, setFemaleRemark] = useState("");

    const [pricValue, setPricValue] = useState("");
    const [fullAddress, setFullAddress] = useState("");
    const [remarkValue, setRemarkValue] = useState("");
    const [country, setCountry] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [classType, setClassType] = useState("");
    const [prDateTime, setPrDateTime] = useState("");
    const [prTime, setPrTime] = useState("");
    const [timeSlots, setTimeSlots] = useState([]);

    const [reasonForMale, setReasonForMale] = useState([]);
    const [reasonForFemale, setReasonForFemale] = useState([]);
    const [causeForMale, setCauseForMale] = useState([]);
    const [causeForFemale, setCauseForFemale] = useState([]);
    const [gstId, setGstId] = useState(null);
    const [gstPercentage, setGstPercentage] = useState(0);

    const MartialList = [
        { label: "Married", value: "Married" },
        { label: "Soon to married", value: "Soon to married" },
        { label: "Precautionary", value: "Precautionary" }
    ];
    const FemaleTest = [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" }
    ];
    const MaleTest = [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" }
    ];
    const ClassType = [
        { label: "Single", value: "Single" },
        { label: "Couple", value: "Couple" }
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

     

    useEffect(() => {
        const fetchOrderId = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}getLatestClassId`);
                setRegisterId(res.data.nextOrderId);
            } catch (err) {
                toast.error("Failed to fetch class ID", err);
            }
        };

        fetchOrderId();
    }, []);

    useEffect(() => {
        const getInFertilityDatas = async () => {
            try {
                const response = await axios.get(`${config.apiBaseUrl}getInFertilityDatas`);

                const result = response.data;

                if (response.status === 200) {
                    const formattedMale = result.maleCategories.map(item => ({
                        label: item.name,
                        value: item.name,
                        id: item.id,
                        code: item.code
                    }));

                    const formattedFemale = result.femaleCategories.map(item => ({
                        label: item.name,
                        value: item.name,
                        id: item.id,
                        code: item.code
                    }));

                    setReasonForMale(formattedMale);
                    setReasonForFemale(formattedFemale);

                } else {
                    toast.error("Failed to fetch admin's list: " + result.message);
                }
            } catch (error) {
                toast.error("Error fetching admin's list: " + (error.response?.data?.message || error.message));
            }
        };

        getInFertilityDatas();
    }, []);

    useEffect(() => {
        setMaleCause('');

        const fetchMaleCauses = async () => {
            if (maleReason) {
                try {
                    const response = await axios.post(`${config.apiBaseUrl}getMaleCause`, {
                        id: maleReason?.target?.id
                    });

                    const result = response.data;

                    if (response.status === 200) {

                        const formattedFemale = result.data.map(item => ({
                            label: item.name,
                            value: item.name,
                            id: item.infertility_id,
                            code: item.code
                        }));

                        setCauseForMale(formattedFemale);
                    }
                    else {
                        toast.error("Failed to fetch admin's list: " + result.message);
                    }

                } catch (error) {
                    toast.error("Error fetching admin's list: " + (error.response?.data?.message || error.message));
                }
            }
        };

        fetchMaleCauses();

    }, [maleReason]);

    useEffect(() => {
        setFemaleCause('');

        const fetchFemaleCauses = async () => {
            if (femaleReason) {
                try {
                    const response = await axios.post(`${config.apiBaseUrl}getFemaleCause`, {
                        id: femaleReason?.target?.id
                    });

                    const result = response.data;

                    if (response.status === 200) {

                        const formattedMale = result.data.map(item => ({
                            label: item.name,
                            value: item.name,
                            id: item.infertility_id,
                            code: item.code
                        }));

                        setCauseForFemale(formattedMale);
                    }
                    else {
                        toast.error("Failed to fetch admin's list: " + result.message);
                    }

                } catch (error) {
                    toast.error("Error fetching admin's list: " + (error.response?.data?.message || error.message));
                }
            }
        };

        fetchFemaleCauses();

    }, [femaleReason]);

    useEffect(() => {
        const getADBranchList = async () => {
            try {
                const response = await axios.post(`${config.apiBaseUrl}getADBranchList`, {
                    userId: userId
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

    const getAllVaithiyarList = async () => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}getAllVaithiyarList`);
            const result = response.data;

            if (response.status === 200) {
                const formattedData = result.data.map(item => ({
                    label: item.name,
                    value: item.name,
                    id: item.user_id,
                    code: item.emp_id
                }));
                setVaithyarDetails(formattedData);
            } else {
                toast.error("Failed to fetch vaithyar list: " + result.message);
            }
        } catch (error) {
            toast.error("Error fetching vaithyar list: " + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        if (user) {
            getAllVaithiyarList();
        }
    }, [user]);


    const HeadOptions = Array.isArray(aDBranchData)
        ? aDBranchData.map(item => ({
            label: item.emp_id + " - " + item.label,
            value: item.value,
            id: item.user_id,
            code: item.emp_id
        }))
        : [];

   function formatDateToMySQL(date) {
    if (!date) return null;
    const d = new Date(date);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
   function formatDateTo(date) {
    if (!date) return null;
    const d = new Date(date);
    const pad = (n) => (n < 10 ? '0' + n : n);
     return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
   }

    useEffect(() => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB');
        setCurrentDate(formattedDate);
        const formattedTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
        setCurrentTime(formattedTime);
    }, []);

    const validateLeftForm = () => {
        if (!registerId || !currentDate || !currentTime || !martialStatus) {
            toast.error("Please fill all required fields in Register details");
            return false;
        }

        if (martialStatus?.target?.value === "Married" && !dateTime) {
            toast.error("Please select Married Date");
            return false;
        }
        return true;
    };

    const handleReset = () => {
        setMartialStatus("");
        setDateTime(null);
        setShowRightSection(false);
    };

    const handleNextClick = async () => {
        if (!validateLeftForm()) return;

        setShowRightSection(true);

    };

    useEffect(() => {
        if (martialStatus?.target?.value === "Married" && !dateTime) {
            setShowRightSection(false);
        }
    }, [martialStatus]);

    const handleRgtReset = () => {

        // Male partner details
        setMaleName("");
        setMaleDob("");
        setMaleMobile("");
        setMaleEmail("");
        setIsMaleTest("");
        setMaleTestRemark("");
        setMaleReason("");
        setMaleCause("");
        setMaleRemark("");

        // Female partner details
        setFemaleName("");
        setFemaleDob("");
        setFemaleMobile("");
        setFemaleEmail("");
        setIsFemaleTest("");
        setFemaleTestRemark("");
        setFemaleReason("");
        setFemaleCause("");
        setFemaleRemark("");
    };

    const validateRightForm = () => {
        const isMaleSectionFilled = maleName || maleDob || maleMobile || maleEmail;
        const isFemaleSectionFilled = femaleName || femaleDob || femaleMobile || femaleEmail;

        if (isMaleSectionFilled) {
            if (!maleName || !maleDob || !maleMobile || !maleEmail || !isMaleTest || !maleReason || !maleCause) {
                toast.error("Please fill all mandatory male partner details.");
                return false;
            }
            if (isMaleTest?.value === "Yes" && !maleTestRemark) {
                toast.error("Please specify male test details.");
                return false;
            }
        }

        if (isFemaleSectionFilled) {
            if (!femaleName || !femaleDob || !femaleMobile || !femaleEmail || !isFemaleTest || !femaleReason || !femaleCause) {
                toast.error("Please fill all mandatory female partner details.");
                return false;
            }
            if (isFemaleTest?.value === "Yes" && !femaleTestRemark) {
                toast.error("Please specify female test details.");
                return false;
            }
        }

        if (!isMaleSectionFilled && !isFemaleSectionFilled) {
            toast.error("Please fill at least one partner's full details.");
            return false;
        }

        return true;
    };

const handleSaveClassData = async () => {
    // Check if at least one partner is filled
    if (!maleName && !femaleName) {
        return toast.error("Please fill at least one partner's details.");
    }

    // Email & Mobile validation helpers
    const validateEmail = (email) => {
        const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
        return emailPattern.test(email);
    };

    const validateMobile = (mobile) => {
        return /^[6-9]\d{9}$/.test(mobile);
    };

    // Validate male partner details if entered
    if (maleEmail && !validateEmail(maleEmail)) {
        return toast.error("Enter a valid male partner email.");
    }
    if (maleMobile && !validateMobile(maleMobile)) {
        return toast.error("Enter a valid 10-digit male partner mobile number.");
    }

    // Validate female partner details if entered
    if (femaleEmail && !validateEmail(femaleEmail)) {
        return toast.error("Enter a valid female partner email.");
    }
    if (femaleMobile && !validateMobile(femaleMobile)) {
        return toast.error("Enter a valid 10-digit female partner mobile number.");
    }

    // Check right form completeness
    if (!validateRightForm()) {
        return toast.error("All fields are required.");
    }

    // Proceed to next page
    setShowSecondPage(true);
};

    const getAllTimeSlotList = async () => {
        try {
            const response = await axios.post(`${config.apiBaseUrl}getAllTimeslotList`,{
                id: vaithyarList?.target?.id || '',
                date:  prDateTime ? formatDateToMySQL(prDateTime) : ""
            });
            const result = response.data;

            if (response.status === 200) {
                const times = result.data.map(item => item.appointment_time);
                setTimeSlots(times);
            } else {
                toast.error("Failed to fetch vaithyar list: " + result.message);
            }
        } catch (error) {
            toast.error("Error fetching vaithyar list: " + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        if (vaithyarList?.target?.id && prDateTime) {
            setTimeSlots([]);
            getAllTimeSlotList();
        } else {
            setPrTime("");
            setTimeSlots([]);
        }
    }, [vaithyarList?.target?.id, prDateTime]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            setImage(file);
        } else {
            toast.error('Please upload a valid JPEG or PNG image.');
        }
        e.target.value = "";
    };

    const handleRemoveImage = () => {
        setImage(null);
        const input = document.getElementById("imageUpload");
        if (input) input.value = "";
    };


    const resetAddrForm = () => {
        setPricValue("");
        setFullAddress("");
        setRemarkValue("");
        setCountry("");
        setState("");
        setCity("");
        setPincode("");
        setClassType("");
        setPrDateTime(null);
        setPrTime(null);
    };

    const validateGeneralDetailsForm = () => {
        if (!fullAddress || !country || !state || !city || !pincode || !prDateTime || !prTime || !classType) {
            toast.error("Please fill all required fields in General details");
            return false;
        }
        return true;
    };

    const validatePaymentDetailsForm = () => {
        if (!pricValue) {
            toast.error("Please enter the price");
            return false;
        }
        if (!approvedBy) {
            toast.error("Please select who approved the discount");
            return false;
        }
        if (!transactionId) {
            toast.error("Please enter the transaction ID");
            return false;
        }
        if (!dateTime) {
            toast.error("Please select the payment date");
            return false;
        }
        return true;
    };

const validateEmail = (email) => {
    if (email !== email.toLowerCase()) {
        return { isValid: false, message: "Email must contain only lowercase letters." };
    }
    if (!email.includes('@')) {
        return { isValid: false, message: "Email must contain '@' symbol." };
    }
    const parts = email.split('@');
    if (parts.length !== 2) {
        return { isValid: false, message: "Email must contain exactly one '@' symbol." };
    }
    const [localPart, domain] = parts;
    if (!localPart || localPart.trim() === '') {
        return { isValid: false, message: "Email must have text before '@'." };
    }
    if (!domain || domain.trim() === '') {
        return { isValid: false, message: "Email must have domain after '@'." };
    }
    if (!domain.includes('.')) {
        return { isValid: false, message: "Email domain must contain a '.' (e.g., gmail.com)." };
    }
    const domainParts = domain.split('.');
    if (domainParts.some(part => !part || part.trim() === '')) {
        return { isValid: false, message: "Invalid email domain format." };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: "Please enter a valid email address." };
    }
    return { isValid: true, message: "" };
};

    const validateMobileNumber = (mobile) => {
        if (!mobile?.trim()) {
            return { isValid: false, message: "Mobile number is required." };
        }
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

    const gstPercent = parseFloat(gstPercentage || 0);
    const afterDiscount = Math.max(pricValue - discount);
    const gstValue = afterDiscount * gstPercent;
    const finaltotal = afterDiscount + gstValue;


    const handleSave = async () => {
 

        if (!validatePaymentDetailsForm()) {
                return;
            }
            const validations = [
            { value: maleEmail, label: "Male Email" },
            { value: femaleEmail, label: "Female Email" },
            { value: maleMobile, label: "Male Mobile" },
            { value: femaleMobile, label: "Female Mobile" }
        ];

        for (const { value, label } of validations) {
            if (value) {
                if (label.includes("Email")) {
                    const result = validateEmail(value);
                    if (!result.isValid) {
                        toast.error(`${label}: ${result.message}`);
                        return;
                    }
                } else {
                    const result = validateMobileNumber(value);
                    if (!result.isValid) {
                        toast.error(`${label}: ${result.message}`);
                        return;
                    }
                }
            }
        }
       const formData = new FormData();
        // Register Info
        formData.append("registerId", registerId);
        formData.append("currentDate", currentDate);
        formData.append("currentTime", currentTime);
        formData.append("martialStatus", martialStatus?.target?.value || martialStatus);
        formData.append("marriedDate", dateTime ? formatDateToMySQL(dateTime) : "");

        // Male Partner
        formData.append("maleName", maleName);
        formData.append("maleDob", maleDob ? formatDateToMySQL(maleDob) : "");
        formData.append("maleMobile", maleMobile);
        formData.append("maleEmail", maleEmail);
        formData.append("isMaleTest", isMaleTest?.target?.value || isMaleTest);
        formData.append("maleTestRemark", maleTestRemark);
        formData.append("maleReason", maleReason?.target?.value || maleReason);
        formData.append("maleCause", maleCause?.target?.value || maleCause);
        formData.append("maleRemark", maleRemark);

        // Female Partner
        formData.append("femaleName", femaleName);
        formData.append("femaleDob", femaleDob);
        formData.append("femaleMobile", femaleMobile);
        formData.append("femaleEmail", femaleEmail);
        formData.append("isFemaleTest", isFemaleTest?.target?.value || isFemaleTest);
        formData.append("femaleTestRemark", femaleTestRemark);
        formData.append("femaleReason", femaleReason?.target?.value || femaleReason);
        formData.append("femaleCause", femaleCause?.target?.value || femaleCause);
        formData.append("femaleRemark", femaleRemark);

        // Address
        formData.append("address", fullAddress);
        formData.append("country", country);
        formData.append("state", state);
        formData.append("city", city);
        formData.append("pincode", pincode);

        // Preferred Details
        formData.append("preferredDate", prDateTime ? formatDateToMySQL(prDateTime) : "");
        formData.append("preferredTime", prTime );

        // Class Type & Remarks
        formData.append("classType", classType?.target?.value || classType);
        formData.append("remark", remarkValue);

        // Payment
        formData.append("assigned_to", vaithyarList?.target?.id || "");
        formData.append("price", pricValue);
        formData.append("amount_to_pay", finaltotal);
        formData.append("discount", discount);
        formData.append("approvedBy", approvedBy?.target?.id);
        formData.append("gst_id", gstId);
        formData.append("gst_amount", gstValue);
        formData.append("transactionId", transactionId);
        formData.append("paymentDate", dateTime ? formatDateTo(dateTime) : "");
        formData.append("folder", "payment_class");
        formData.append("userId", userId);
        formData.append("lead_recid", rowData?.lead_recid);

        // Receipt Image
        if (image) {
            formData.append("receipt_image_url", image);
        }

        try {
            const response = await axios.post(`${config.apiBaseUrl}insertClassOrder`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.status === 200) {
                toast.success("Registration saved successfully!");

                setTimeout(() => {
                    navigate("/leads");
                }, 2000);
            } else {
                toast.error("Something went wrong!");
            }
        } catch (error) {
            console.error("Error saving registration:", error);
            const errorMessage = error.response?.data?.message || "Failed to save data.";
            toast.error(errorMessage);
        }
    };

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
                    <p className='mb-0 fw-medium'>Registration</p>
                    <div>
                        <button className='mb-0 nav-btn-top' onClick={() => navigate("/leads")}>
                            Leads &gt; List
                        </button> &nbsp;&gt;&nbsp;
                        <p className='mb-0 nav-btn-top'>
                            {rowData.lead_id} &gt;  cart
                        </p>
                    </div>
                </div>
            </div>

            {/* Note about partner details - positioned right after header */}
            <div className="w-100" style={{ padding: '0 20px', marginBottom: '20px' }}>
                <div className="alert alert-info" style={{
                    backgroundColor: '#FFF3E0',
                    border: '1px solid #FF9800',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#E65100',
                    margin: '0'
                }}>
                    <strong>Note:</strong> Either male or female partner details can be filled, or both can be filled. At least one partner's details are required.
                </div>
            </div>

            <div className='body-div-cr' style={{padding:'10px 18px'}}>
                {!showSecondPage ? (
                    <div className='w-100 h-100 display-flex gap-3'>
                        <div className="reg-container">
                            <h5 className="reg-heading">Register details</h5>
                            <div className='body-reg-lft'>
                                <div className="reg-commonst-select mb-4">
                                    <label>Reg no</label>
                                    <input type="text" value={registerId} disabled className="reg-input reg-readonly-green" />
                                </div>

                                <div className="reg-commonst-select mb-4">
                                    <label>Reg date</label>
                                    <input type="text" value={currentDate} disabled className="reg-input" />
                                </div>

                                <div className="reg-commonst-select mb-4">
                                    <label>Reg Time</label>
                                    <input type="text" value={currentTime} disabled className="reg-input" />
                                </div>

                                <div className="reg-commonst-select mb-4">
                                    <label>Marital status</label>
                                    <CommonSelect
                                        header="Select option"
                                        placeholder="Select option"
                                        name="martial"
                                        value={martialStatus}
                                        onChange={setMartialStatus}
                                        options={MartialList}
                                    />
                                </div>

                                <div className="reg-commonst-select mb-4">
                                    <label>Married date</label>
                                    <DatePicker
                                        selected={dateTime}
                                        onChange={(date) => setDateTime(date)}
                                        placeholderText="DD/MM/YYYY"
                                        className="form-control-st reg-date-st m-0 w-100"
                                        dateFormat="dd-MM-yyyy"
                                    />
                                </div>
                            </div>

                            <div className="reg-actions">
                                <button className="reg-cancel-btn" onClick={handleReset} >Cancel</button>
                                <button className="reg-next-btn" onClick={handleNextClick} >Next</button>
                            </div>
                        </div>
                        <div className={`reg-container-rgt bg-white ${!showRightSection ? 'disabled-section' : ''}`}>
                            <div className='reg-subcontainer-rgt'>
                                <div className="partner-form-container w-50">
                                    <h5 className='mb-0 fw-semibold' style={{ height: "42px" }} >Partner details - Male</h5>
                                    <form className="partner-form">
                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Name</label>
                                            <input type="text" className="form-control-st" placeholder="Enter name" value={maleName} onChange={(e) => setMaleName(e.target.value)} />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>DOB</label>
                                            <DatePicker
                                                selected={maleDob}
                                                onChange={(date) => setMaleDob(date)}
                                                placeholderText="dd/mm/yyyy"
                                                className="form-control-st"
                                                dateFormat="dd-MM-yyyy"
                                                showMonthDropdown
                                                showYearDropdown
                                                scrollableYearDropdown
                                                yearDropdownItemNumber={100}
                                                maxDate={new Date()}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Mobile</label>
                                            <input
                                                type="number"
                                                className="form-control-st"
                                                placeholder="Enter mobile number"
                                                value={maleMobile}
                                                maxLength={10}
                                                onChange={(e) => setMaleMobile(e.target.value)}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Email</label>
                                            <input type="email" className="form-control-st" value={maleEmail} onChange={(e) => setMaleEmail(e.target.value)} placeholder="Enter email" />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Already take any tests?</label>
                                            <CommonSelect
                                                header="Select option"
                                                placeholder="Select option"
                                                name="maletest"
                                                value={isMaleTest}
                                                onChange={setIsMaleTest}
                                                options={MaleTest}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>If yes, Please specify</label>
                                            <input
                                                type="text"
                                                className="form-control-st"
                                                placeholder="Specify tests"
                                                value={maleTestRemark}
                                                onChange={(e) => setMaleTestRemark(e.target.value)}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Reason for infertility</label>
                                            <CommonSelect
                                                header="Select option"
                                                placeholder="Select option"
                                                name="maletest"
                                                value={maleReason}
                                                onChange={setMaleReason}
                                                options={reasonForMale}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Specific Causes</label>
                                            <CommonSelect
                                                header="Select option"
                                                placeholder="Select option"
                                                name="maletest"
                                                value={maleCause}
                                                onChange={setMaleCause}
                                                options={causeForMale}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Remark</label>
                                            <textarea
                                                className="form-control-st"
                                                placeholder="Enter remarks"
                                                rows="3"
                                                value={maleRemark}
                                                onChange={(e) => setMaleRemark(e.target.value)}
                                            />
                                        </div>
                                    </form>
                                </div>

                                <div className="partner-form-container w-50">
                                    <h5 className='mb-0 fw-semibold' style={{ height: "42px" }}>Partner details - Female</h5>
                                    <form className="partner-form">
                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Name</label>
                                            <input
                                                type="text"
                                                className="form-control-st"
                                                placeholder="Enter name"
                                                value={femaleName}
                                                onChange={(e) => setFemaleName(e.target.value)}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>DOB</label>
                                            <DatePicker
                                                selected={femaleDob}
                                                onChange={(date) => setFemaleDob(date)}
                                                placeholderText="DD/MM/YYYY"
                                                className="form-control-st reg-date-st m-0 w-100"
                                                dateFormat="dd-MM-yyyy"
                                                showMonthDropdown
                                                showYearDropdown
                                                scrollableYearDropdown
                                                yearDropdownItemNumber={100}
                                                maxDate={new Date()}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Mobile</label>
                                            <input
                                                type="number"
                                                className="form-control-st"
                                                placeholder="Enter mobile number"
                                                value={femaleMobile}
                                                maxLength={10}
                                                onChange={(e) => setFemaleMobile(e.target.value)}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Email</label>
                                            <input
                                                type="email"
                                                className="form-control-st"
                                                placeholder="Enter email"
                                                value={femaleEmail}
                                                onChange={(e) => setFemaleEmail(e.target.value)}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Already take any tests?</label>
                                            <CommonSelect
                                                header="Select option"
                                                placeholder="Select option"
                                                name="maletest"
                                                value={isFemaleTest}
                                                onChange={setIsFemaleTest}
                                                options={FemaleTest}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>If yes, Please specify</label>
                                            <input
                                                type="text"
                                                className="form-control-st"
                                                placeholder="Specify tests"
                                                value={femaleTestRemark}
                                                onChange={(e) => setFemaleTestRemark(e.target.value)}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Reason for infertility</label>
                                            <CommonSelect
                                                header="Select option"
                                                placeholder="Select option"
                                                name="maletest"
                                                value={femaleReason}
                                                onChange={setFemaleReason}
                                                options={reasonForFemale}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Specific Causes</label>
                                            <CommonSelect
                                                header="Select option"
                                                placeholder="Select option"
                                                name="maletest"
                                                value={femaleCause}
                                                onChange={setFemaleCause}
                                                options={causeForFemale}
                                            />
                                        </div>

                                        <div className="commonst-select mb-3">
                                            <label className='label-controll-st'>Remark</label>
                                            <textarea
                                                className="form-control-st"
                                                placeholder="Enter remarks"
                                                rows="3"
                                                value={femaleRemark}
                                                onChange={(e) => setFemaleRemark(e.target.value)}
                                            />
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="foot-regclass-st">
                                <button className="reg-cancel-btn" onClick={handleRgtReset}>Cancel</button>
                                <button className="reg-next-btn" onClick={handleSaveClassData} >Next</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='w-100 h-100 display-flex gap-3'>
                        <div className={`regres-container-rgt bg-white ${!showRightSection ? 'disabled-section' : ''}`}>
                            <div className='regres-subcontainer-rgt'>
                                <h5 className='text-left general-data-st payment-title'>General details</h5>

                                <div className="commonst-select mb-3">
                                    <label className='label-controll-st'>Address</label>
                                    <textarea
                                        className="form-control-st"
                                        placeholder="Enter address"
                                        rows="5"
                                        value={fullAddress}
                                        style={{ height: "112px" }}
                                        onChange={(e) => setFullAddress(e.target.value)}
                                    />
                                </div>

                                <div className='subcenter-input-st'>
                                    <div className="commonst-select mb-3">
                                        <label className='label-controll-st'>Country</label>
                                        <input
                                            type="text"
                                            className="form-control-st"
                                            placeholder="Enter country"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                        />
                                    </div>
                                    <div className="commonst-select mb-3">
                                        <label className='label-controll-st'>State</label>
                                        <input
                                            type="text"
                                            className="form-control-st"
                                            placeholder="Enter state"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className='subcenter-input-st'>
                                    <div className="commonst-select mb-3">
                                        <label className='label-controll-st'>City</label>
                                        <input
                                            type="text"
                                            className="form-control-st"
                                            placeholder="Enter city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                    </div>
                                    <div className="commonst-select mb-3">
                                        <label className='label-controll-st'>Pincode</label>
                                        <input
                                            type="number"
                                            className="form-control-st"
                                            placeholder="Enter pincode"
                                            value={pincode}
                                            maxLength={6}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^\d{0,6}$/.test(value)) setPincode(value);
                                            }}
                                            />
                                    </div>
                                </div>

                               <div className="commonst-select mb-3">
                                    <label htmlFor='vaithyar-select' className='label-controll-st'>Select vaithyar</label>
                                    <CommonSelect
                                        id="vaithyar-select"
                                        header="Select vaithyar"
                                        placeholder="Select vaithyar"
                                        name="vaithyar"
                                        value={vaithyarList}
                                        onChange={setVaithyarList}
                                        options={vaithyarDetails}
                                    />
                                </div>
                                <div className='subcenter-input-st'>
                                    <div className="commonst-select mb-3">
                                        <label className='label-controll-st'> PreferredDate</label>
                                        <DatePicker
                                            selected={prDateTime}
                                            onChange={(date) => setPrDateTime(date)}
                                            placeholderText="DD/MM/YYYY"
                                            className="form-control-st preffered-date-st m-0 w-100"
                                            dateFormat="yyyy-MM-dd"
                                            minDate={new Date()}
                                        />
                                    </div>
                                    <div className="commonst-select mb-3">
                                        <label className='label-controll-st'>Preferred Time</label>
                                       <PreferredTimeSelect
                                            timeSlots={timeSlots}
                                            prTime={prTime}
                                            setPrTime={setPrTime}
                                        />
                                    </div>

                                </div>

                                <div className='subcenter-input-st'>
                                    <div className="commonst-select classtype-st mb-3">
                                        <label className='label-controll-st'>Class type</label>
                                        <CommonSelect
                                            header="Select option"
                                            placeholder="Select option"
                                            name="martial"
                                            value={classType}
                                            onChange={setClassType}
                                            options={ClassType}
                                        />
                                    </div>
                                </div>

                                <div className="commonst-select mb-3">
                                    <label className='label-controll-st'>Remark</label>
                                    <textarea
                                        className="form-control-st"
                                        placeholder="Enter remarks"
                                        rows="3"
                                        value={remarkValue}
                                        onChange={(e) => setRemarkValue(e.target.value)}
                                    />
                                </div>
                               
                            </div>
                            <div className="footres-regclass-st">
                                <button className="reg-cancel-btn" onClick={resetAddrForm} >Cancel</button>
                                <button
                                    className="reg-next-btn"
                                    onClick={() => {
                                        if (validateGeneralDetailsForm()) {
                                            getgstpercentage();
                                            setIsRightEditable(true);
                                        }
                                    }}
                                    disabled={!fullAddress || !country || !state || !city || !pincode || !prDateTime || !prTime || !classType}
                                    style={{
                                        opacity: (!fullAddress || !country || !state || !city || !pincode || !prDateTime || !prTime || !classType) ? 0.6 : 1,
                                        cursor: (!fullAddress || !country || !state || !city || !pincode || !prDateTime || !prTime || !classType) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                        <div className="regres-container">
                            <div className="payment-container">
                                <h5 className="payment-title">Payment Details</h5>
                                <div
                                    className={`payment-grid ${!isRightEditable ? "disabled-section" : ""}`}
                                >
                                    <div className="label">Price</div>
                                    <input
                                        type="text"
                                        placeholder="Price"
                                        className="form-control-st"
                                        value={pricValue}
                                        onChange={(e) => setPricValue(e.target.value)}
                                    />

                                    <div className="label">Discount</div>
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
                                            const maxDiscount = pricValue * 0.25; 
                                            if (numValue > maxDiscount) {
                                                toast.warning(`Maximum allowed discount is (₹${maxDiscount.toFixed(2)}).`);
                                                return;
                                            }
                                            setDiscount(value);
                                            }
                                        }}
                                        />
                                    </div>
                                      {parseFloat(discount || 0) > 0 && (
                                        <>
                                    <div className="label">
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
                                        />
                                    </div>
                                        </>
                                    )}

                                    <div className="label">Total value</div>
                                    <div className="value">₹ {afterDiscount || 0}</div>

                                    <div className="label">
                                        Amount to pay <br />
                                        <small>(Include 18% gst)</small>
                                    </div>
                                    <div className="value">₹ {(finaltotal) || 0} </div>

                                </div>

                                <div className={`upload-receipt-container p-0 mt-3 ${!isRightEditable ? "disabled-section" : ""}`} >
                                    <h5 className="upload-title">Upload receipt</h5>
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
                                        <div className="appoint_file-chip mb-2">
                                            <span className="appoint_file-name small">{image.name}</span>
                                            <span className="appoint_file-remove" onClick={handleRemoveImage} title="Remove">
                                                ×
                                            </span>
                                        </div>
                                    )}


                                    <div className="form-row">
                                        <label className='pt-2 mb-0'>Transaction ID</label>
                                        <input
                                            type="text"
                                            className="form-control-st commcb-select-of"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            placeholder="Enter transaction ID "
                                        />
                                    </div>

                                    <div className="form-row">
                                        <label htmlFor="datetime" style={{ minWidth: "152px" }}>Date and time</label>
                                        <DatePicker
                                            selected={dateTime}
                                            onChange={(date) => setDateTime(date)}
                                            maxDate={new Date()} 
                                            minDate={new Date(new Date().setDate(new Date().getDate() - 3))}
                                            className="form-control-st "
                                            dateFormat="dd-MM-yyyy h:mm aa"
                                            showTimeSelect
                                            timeFormat="hh:mm aa"
                                            timeIntervals={15}
                                            placeholderText="DD/MM/YYYY HH:MM"
                                            popperPlacement="bottom"
                                        />
                                    </div>
                                </div>
                                <div className="regres-actions">
                                    <button className="reg-cancel-btn" onClick={() => navigate("/leads")} >Cancel</button>
                                    <button
                                        className="reg-next-btn"
                                        onClick={handleSave}
                                        disabled={!pricValue || !approvedBy || !transactionId || !dateTime}
                                        style={{
                                            opacity: (!pricValue || !approvedBy || !transactionId || !dateTime) ? 0.6 : 1,
                                            cursor: (!pricValue || !approvedBy || !transactionId || !dateTime) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
    )
}

export default ClassRegister
