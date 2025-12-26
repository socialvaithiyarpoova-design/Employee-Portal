import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../assets/styles/addemployeelist.css';
import SvgContent from '../../components/svgcontent.jsx';
import DatePicker from 'react-datepicker';
import { useAuth } from '../../components/context/Authcontext.jsx';
import configModule from '../../../config.js';
import { PropagateLoader } from 'react-spinners';

function AddEmployee() {
    const config = configModule.config();
    const [vpaCode, setVpaCode] = useState("XXXXXX");
    const [needLoading, setNeedLoading] = useState(false);
    const navigate = useNavigate();
    const [previewUrl, setPreviewUrl] = useState(null);
    const location = useLocation();
    const desCode = location.state?.role?.target?.code;
    const branchid = location.state?.boptions?.target?.id;
    const desValue = location.state?.role?.target?.value;
    const desId = location.state?.role?.target?.id;
    const objEditsItem = location.state?.item;
    const actionType = location.state?.type;
    const { user } = useAuth();
    const user_typecode = user?.user_typecode;
    const userId = user?.userId;
    const [formData, setFormData] = useState({
        emp_id: vpaCode,
        name: '',
        designation: desValue,
        designation_id: desId,
        email: '',
        mobile_number: '',
        date_of_joining: null,
        date_of_birth:null,
        wed_date:null,
        salary: '',
        incentive_percentage: '' || 0,
        address: '',
        image_url: null,
        folder: "employees",
        start_work_time: null,
        end_work_time: null,
        branch_rceid: branchid ? parseInt(branchid, 10) : 0
    });

    const formatDateTime = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    useEffect(() => {
        if (actionType === "Edit" && objEditsItem) {
            const parseTimeToDate = (timeStr) => {
                if (!timeStr) return '';
                const [hours, minutes] = timeStr.split(':').map(Number);
                const date = new Date();
                date.setHours(hours, minutes, 0, 0);
                return date;
            };
            
            setFormData({
                emp_id: objEditsItem.emp_id || 'VPA001',
                name: objEditsItem.name || '',
                designation: objEditsItem.designation || '',
                email: objEditsItem.email || '',
                mobile_number: objEditsItem.mobile_number || '',
                date_of_joining: objEditsItem.date_of_joining
                    ? new Date(objEditsItem.date_of_joining)
                    : '',
                date_of_birth: objEditsItem.date_of_birth
                    ? new Date(objEditsItem.date_of_birth)
                    : '',
                wed_date: objEditsItem.wed_date
                ? new Date(objEditsItem.wed_date)
                : '',     
                salary: objEditsItem.salary || '',
                incentive_percentage: objEditsItem.incentive_percentage || '',
                address: objEditsItem.address || '',
                image_url: objEditsItem.image_url || '',
                start_work_time: parseTimeToDate(objEditsItem.start_work_time || ''),
                end_work_time: parseTimeToDate(objEditsItem.end_work_time || ''),
            });
            setPreviewUrl(objEditsItem.image_url || '');
        }
    }, [actionType, objEditsItem]);



    const getNextNumber = (lastEmpId) => {
        let numbers = lastEmpId || [];

        const parsedNumbers = numbers.map(code => {
            const match = code.match(/^VPA(\d{3})/);
            return match ? parseInt(match[1], 10) : 0;
        });

        const max = parsedNumbers.length > 0 ? Math.max(...parsedNumbers) : 0;
        return (max + 1).toString().padStart(3, '0');
    };

    const generateCode = (lastEmpId) => {
        if (user) {
            const prefix = "VPA";
            const number = getNextNumber(lastEmpId);
            const locationCode = user_typecode === "AD" ? "HO" : "";
            setVpaCode(`${prefix}${number}${desCode}${locationCode}`);

            setFormData((prev) => ({
                ...prev,
                emp_id: `${prefix}${number}${desCode}${locationCode}`,
            }));
        }
    };

    const getLastEmpID = async () => {
        let lastEmpId = [];
        if (user) {
            try {
                const response = await fetch(`${config.apiBaseUrl}GetLastEmpID`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ userId: parseInt(userId), value: desValue || '' })
                });
                const result = await response.json();
                if (response.ok) {
                    if (result.data.length === 0) {
                        lastEmpId = result.data;
                    } else {
                        lastEmpId = [result.data[0].emp_id];
                    }
                    generateCode(lastEmpId);
                } else {
                    console.error("Failed to fetch designation list: " + result.message);
                    toast.error("Failed to fetch designation list: " + result.message);
                }
            } catch (error) {
                console.error("Error fetching designation list: " + error.message);
                toast.error("Error fetching designation list: " + error.message);
            }
        }
    };

    useEffect(() => {
        if (actionType === "Add") {
            getLastEmpID();
        }
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (date) => {
        setFormData((prev) => ({
            ...prev,
            date_of_joining: formatDateTime(date),
        }));
    };

    const handleDateChangedob = (date) => {
        setFormData((prev) => ({
            ...prev,
            date_of_birth: formatDateTime(date),
        }));
    };
        const handleDateChangewed = (date) => {
        setFormData((prev) => ({
            ...prev,
            wed_date: formatDateTime(date),
        }));
    };

    const handleCancel = () => {
         setFormData(prev => ({
              ...prev,
            emp_id: prev.emp_id || vpaCode,
            designation: prev.designation || desValue,
            designation_id: prev.designation_id || desId,
            name: '',
            email: '',
            mobile_number: '',
            date_of_joining: null,
            date_of_birth:null,
            wed_date:null,
            salary: '',
            incentive_percentage: '',
            address: '',
            image_url: null,
            folder: "employees",
            start_work_time: null,
            end_work_time: null,
            branch_id: prev.emp_id
          }));
            setPreviewUrl(null);
    };

    const getChangedFields = () => {
        return Object.entries(formData)
            .filter(([key, newValue]) => {
                if (newValue === null) return false;
    
                let oldValue = objEditsItem[key];
    
                if (newValue instanceof Date && oldValue) {
                    return new Date(oldValue).getTime() !== newValue.getTime();
                }
    
                if (
                    typeof newValue === "number" ||
                    (!isNaN(newValue) && newValue !== "")
                ) {
                    return Number(oldValue) !== Number(newValue);
                }
    
                if (
                    (newValue === '' || newValue === undefined) &&
                    (oldValue === '' || oldValue === null || oldValue === undefined)
                ) {
                    return false;
                }
    
                return newValue !== oldValue;
            })
            .map(([key, newValue]) => {
                if (
                    (key === "start_work_time" || key === "end_work_time") &&
                    newValue instanceof Date
                ) {
                    newValue = newValue.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                }
    
                return {
                    key,
                    newValue,
                    emp_recid: objEditsItem.user_id,
                };
            });
    };    

const validateEmail = (email) => {
    if (!email?.trim()) {
        return { isValid: false, message: "Email is required." };
    }
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


    const handleSubmit = async (e) => {
        e.preventDefault();
        setNeedLoading(true);

        if (
            !formData.emp_id &&
            !formData.name?.trim() ||
            !formData.designation ||
            !formData.email?.trim() ||
            !formData.mobile_number?.trim() ||
            !formData.date_of_joining ||
            !formData.salary?.trim() ||           
            !formData.address?.trim()
        ) {
            setNeedLoading(false);
            return toast.error("Required all fields.");
        }

        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) {
        setNeedLoading(false);
        return toast.error(emailValidation.message);
        }
        const mobileValidation = validateMobileNumber(formData.mobile_number);
            if (!mobileValidation.isValid) {
                setNeedLoading(false);
                return toast.error(mobileValidation.message);
            }
        if (actionType === "Add" && !formData.image_url) {
        setNeedLoading(false);
        return toast.error("Employee image is mandatory.");
        }  

        const formDataToSend = new FormData();

        try {
            let api = '';

            if (actionType === "Edit") {
                const changedFields = getChangedFields();
            
                if (changedFields.length === 0) {
                    toast.info("No changes to update.");
                    setNeedLoading(false);
                    return;
                }
            
                formDataToSend.append("userId", userId);
                formDataToSend.append("emp_recid", objEditsItem.user_id);
            
                const imageUpdate = changedFields.find(item => item.key === "image_url");
                if (imageUpdate && imageUpdate.newValue instanceof File) {
                    formDataToSend.append("image_url", imageUpdate.newValue);
                    formDataToSend.append("folder", "employees");
                }
                
                const sanitizedUpdates = changedFields.map(item =>
                    item.key === "image_url" && item.newValue instanceof File
                        ? { ...item, newValue: item.newValue.name }
                        : item
                );
                formDataToSend.append("updates", JSON.stringify(sanitizedUpdates));
            
                api = "updateEmpDetails";
            }     else {

                formDataToSend.append("userId", userId);
                formDataToSend.append("work_start", formatTime(formData.start_work_time));
                formDataToSend.append("work_end", formatTime(formData.end_work_time));

                for (const key in formData) {
                    formDataToSend.append(key, formData[key]);
                }

                api = "saveEmpDetails";
            }

            const response = await fetch(`${config.apiBaseUrl}${api}`, {
                method: "POST",
                body: formDataToSend
            });

            const result = await response.json();
               if (response.ok) {
                toast.success(result.message);
                const responseData = result?.data;
                if (responseData) {
                    fetch(`${config.apiBaseUrlpy}graph_update`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tablename: responseData.table_name,
                        type: responseData.method,
                        id: responseData.id,
                        column_name: responseData.id_column_name,
                    }),
                    }).catch(err => console.error("Graph update failed:", err));
                }
                const birthDate =formData.date_of_birth;
                const anniversaryDate =formData.wed_date;
                if ( actionType === "Add" && birthDate || anniversaryDate) {
                    const eventType = birthDate ? "Birthday" : "Anniversary";
                    const eventDate = birthDate || anniversaryDate;

                    fetch(`${config.apiBaseUrl}saveEventDetails`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: userId,
                        action: "events",
                        type: eventType,
                        date: eventDate,
                        target:'',
                        remark:'',
                        emp_id: responseData.id,
                    }),
                    }).catch(err => console.error("Event insert failed:", err));
                }
            setTimeout(() => {
                handleRemoveImage();
                handleCancel();
                navigate("/employee/list");
                setNeedLoading(false);
            }, 3000);
            } else {
            if (result?.error?.code === "ER_DUP_ENTRY") {
                if (result?.error?.sqlMessage?.includes('users.email')) {
                    toast.error("Email already exists. Please use a different email.");
                } else if (result?.error?.sqlMessage?.includes('users.mobile_number')) {
                    toast.error("Mobile number already exists. Please use a different number.");
                } else {
                    toast.error("Duplicate entry. Please check the form.");
                }
            } else {
                toast.error("Failed to save: " + result.message);
            }
            setNeedLoading(false);
            }
        } catch (error) {
            console.error("Error saving: " + error.message);
            toast.error("Error saving: " + error.message);
            setNeedLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            setFormData(prevState => ({
                ...prevState,
                image_url: file
            }));
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            toast.error('Please upload a valid JPEG or PNG image.');
        }
          e.target.value = null;
    };

    const handleRemoveImage = () => {
        setFormData(prevState => ({
            ...prevState,
            image_url: null
        }));
        setPreviewUrl(null);
    };

    const handleStartTimeChange = (time) => {
        setFormData((prev) => ({
            ...prev,
            start_work_time: time
        }));
    };

    const handleEndTimeChange = (time) => {
        setFormData((prev) => ({
            ...prev,
            end_work_time: time
        }));
    };

    const formatTime = (date) => {
        if (!date) return '';
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = "00";
        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className='common-body-st'>
            <div className='header-div-el'>
                <div className='header-divpart-el'>
                    <p className='mb-0 header-titlecount-el'>Add New employee</p>
                    <div className="d-flex align-items-center">
                        <button onClick={() => { navigate("/employee/list") }}>
                            <p className='mb-0 nav-btn-top'>
                                Employee &gt; List
                            </p>
                        </button>&nbsp;&gt;&nbsp;{''}
                        <button>
                            {actionType === "Add" ? <p className='mb-0 nav-btn-top'>
                                Add new
                            </p> : <p className='mb-0 nav-btn-top'>
                                Edit
                            </p>}
                        </button>
                    </div>
                </div>
            </div>
            <div className='body-div-el'>
                <div className="w-100 h-100 inner-body-st">
                    <div className='left-container-el'>
                        <div className='left-header-st'>
                            <h5 className='mb-0'>Employee image</h5>
                        </div>
                    <div className="upload-container">
                    <div className="upload-box w-100 h-100">
                        {previewUrl ? (
                            <>
                            <img src={previewUrl} alt="Preview" className="preview-image" />
                            <button
                                type="button"
                                className="remove-image-btn"
                                onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage();
                                }}
                            >
                                <SvgContent svg_name="Trash" />
                            </button>
                            </>
                        ) : (
                            <label htmlFor="imageUpload" style={{cursor:'pointer'}} className="not-getimage-st">
                            <SvgContent svg_name="upload" width="100" height="45" />
                            <div>
                                <p className='mb-0 text-upload-st'>Upload image</p>
                                <span style={{ color: "#404040", fontSize: "12px" }}>
                                (JPEG, PNG)
                                </span>
                            </div>
                            </label>
                        )}
                        </div>
                    </div>

                    <div className='left-footer-st'>
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/jpeg, image/png"
                            onChange={handleImageChange}
                            className="upload-input"
                            hidden
                            />

                           <label htmlFor="imageUpload" className="upload-btn display-flex">
                            Upload image
                          </label>
                        </div>
                    </div>
                    <div className='right-container-el'>
                        <div className='top-addoption-ae'>
                            <h5 className='mb-0'>General details</h5>
                        </div>
                        <form className="w-100 form-st-ae">
                            <div className='display-flex mb-3 w-100 gap-3'>
                                <div style={{ width: "calc(100% - 12px)" }}>
                                    <label htmlFor='emp_id' className="form-label">Emp ID</label>
                                    <input
                                        type="text"
                                        className="form-control text-success fw-bold"
                                        value={formData.emp_id || ''}
                                        disabled
                                    />
                                </div>
                                <div style={{ width: "calc(100% - 12px)" }}>
                                    <label htmlFor='name' className="form-label">Employee Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="Enter employee name"
                                        value={formData.name}
                                        onChange={handleChange || ''}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='display-flex mb-3 w-100 gap-3'>
                                <div style={{ width: "calc(100% - 12px)" }}>
                                    <label htmlFor='Designation' className="form-label">Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        className="form-control"
                                        placeholder="Designation"
                                        value={formData.designation || ''}
                                        onChange={handleChange}
                                        required
                                        disabled
                                    />
                                </div>
                                <div style={{ width: "calc(100% - 12px)" }}>
                                    <label htmlFor='MNumber' className="form-label">Mobile</label>
                                    <input
                                        type="number"
                                        name="mobile_number"
                                        className="form-control"
                                        placeholder="Enter mobile number"
                                        value={formData.mobile_number || ''}
                                        onChange={handleChange}
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='display-flex mb-3 w-100 gap-3'>
                                <div style={{ width: "calc(100% - 12px)" }}>
                                    <label htmlFor='Email' className="form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Enter mail address"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div style={{ width: "calc(100% - 12px)" }}>
                                    <label htmlFor='DataOfJoining' className="form-label">Date Of Joining</label>
                                    <DatePicker
                                        selected={formData.date_of_joining}
                                        onChange={handleDateChange}
                                        placeholderText="Select date of joining"
                                        className="form-control"
                                        dateFormat="dd-MM-yyyy"
                                    />
                                </div>
                            </div>
                                 <div className='display-flex mb-3 w-100 gap-3'>
                                <div style={{ width: "calc(50% - 12px)" }}>
                                    <label htmlFor='WorkingHoursStart' className="form-label">Date Of Birth</label>
                                    <DatePicker
                                        selected={formData.date_of_birth}
                                        onChange={handleDateChangedob}
                                        placeholderText="Select date of birth"
                                        className="form-control"
                                        dateFormat="dd-MM-yyyy"
                                        showMonthDropdown
                                        showYearDropdown
                                        scrollableYearDropdown
                                        yearDropdownItemNumber={100}
                                        maxDate={new Date()}
                                    />
                                </div>
                                <div style={{ width: "calc(50% - 12px)" }}>
                                    <label htmlFor='WorkingHoursEnd' className="form-label">Wed Anniversary <span className='e-manniver'>(Optional)</span></label>
                                    <DatePicker
                                        selected={formData.wed_date}
                                        onChange={handleDateChangewed}
                                        placeholderText="Select date of anniversary"
                                        className="form-control"
                                        dateFormat="dd-MM-yyyy"
                                        showMonthDropdown
                                        showYearDropdown
                                        scrollableYearDropdown
                                        yearDropdownItemNumber={100}
                                        maxDate={new Date()}
                                    />
                                </div>
                                </div>
                            <div className='display-flex mb-3 w-100 gap-3'>
                                <div style={{ width: "calc(50% - 12px)" }}>
                                    <label htmlFor='WorkingHoursStart' className="form-label">Start Time</label>
                                    <DatePicker
                                        selected={formData.start_work_time}
                                        onChange={handleStartTimeChange}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="Start"
                                        dateFormat="hh:mm aa"
                                        placeholderText="From"
                                        className="form-control"
                                    />
                                </div>
                                <div style={{ width: "calc(50% - 12px)" }}>
                                    <label htmlFor='WorkingHoursEnd' className="form-label">End Time</label>
                                    <DatePicker
                                        selected={formData.end_work_time}
                                        onChange={handleEndTimeChange}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="End"
                                        dateFormat="hh:mm aa"
                                        placeholderText="To"
                                        className="form-control"
                                    />
                                </div>
                                <div style={{ width: "calc(100% - 12px)" }}>
                                    <label htmlFor='Salary' className="form-label">Salary</label>
                                    <input
                                        type="number"
                                        name="salary"
                                        className="form-control"
                                        placeholder="Enter emp salary"
                                        value={formData.salary || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='display-flex mb-3 w-100 gap-3 align-items-start'>
                                {(formData.designation !== 'Creative service' && 
                                formData.designation !== 'Dispatch' && 
                                formData.designation !== 'Accounts') && (
                                    <div style={{ width: "calc(100% - 12px)" }}>
                                        <label htmlFor='Incentive' className="form-label">Incentive (%)</label>
                                        <input
                                            type="number"
                                            name="incentive_percentage"
                                            className="form-control"
                                            placeholder="Enter percentage"
                                            value={formData.incentive_percentage || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )}
                                <div style={{ width: "calc(100% - 12px)" }} >
                                    <label htmlFor='Address' className="form-label">Address</label>
                                    <textarea
                                        name="address"
                                        className="form-control text-add-st"
                                        placeholder="Enter employee address"
                                        value={formData.address || ''}
                                        onChange={handleChange}
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </form>
                        <div className='footer-addoption-ae'>
                            <button type="button" className="close-ae" onClick={handleCancel}>
                                Clear
                            </button>
                            <button type="submit" className="btn-success save-ae" onClick={handleSubmit}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>

                {needLoading && (
                    <div className='loading-container w-100 h-100'>
                        <PropagateLoader
                            visible="true"
                            height="100"
                            width="100"
                            color="#0B9346"
                            radius="10"
                        />
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
    );
}

export default AddEmployee;
