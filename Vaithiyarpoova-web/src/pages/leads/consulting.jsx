import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "../../assets/styles/consulting.css";
import CommonSelect from "../../components/common-select.jsx";
import { useAuth } from '../../components/context/Authcontext.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import configModule from '../../../config.js';
import SvgContent from '../../components/svgcontent.jsx';
import PropTypes from "prop-types";

const AddConsultingModal = ({ onClose, rowData }) => {
    const { user } = useAuth();
    const userId = user?.userId;
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState("");
    const [vaithyarList, setVaithyarList] = useState("");
    const [vaithyarDetails, setVaithyarDetails] = useState([]);
    const [paymnetOption, setPaymnetOption] = useState(false);
    const config = configModule.config();
    const [price, setPrice] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [timeSlots, setTimeSlots] = useState([]);
    const [dateTime, setDateTime] = useState(new Date());
    const [receipt, setReceipt] = useState(null);

    const handleReceiptUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceipt(file);
        }
         e.target.value = "";
    };

        const handleRemoveReceipt = () => {
        setReceipt(null);
        const input = document.getElementById("uploadInput");
        if (input) input.value = "";
        };

    const handleClear = () => {
        setPrice("");
        setTransactionId("");
        setDateTime(null);
        setReceipt(null);
    };

    // 🔹 Helper to parse "hh.mm AM/PM" into real Date
    const parseTime = (timeStr, date) => {
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate;
    };

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

    const getAllTimeSlotList = async () => {
        try {
            const response = await axios.post(`${config.apiBaseUrl}getAllTimeslotList`,{
                id: vaithyarList?.target?.id || '',
                date: selectedDate ? selectedDate.toISOString().split("T")[0] : ''
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
        if (user) {
            getAllVaithiyarList();
        }
    }, [user]);

    useEffect(() => {
        if (vaithyarList?.target?.id && selectedDate) {
            getAllTimeSlotList();
        }
    }, [vaithyarList?.target?.id, selectedDate]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                onClose && onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = async () => {
        if (!price || !receipt || !transactionId || !dateTime || !vaithyarList || !selectedSlot) {
            toast.warning("Please fill all required fields.");
            return;
        }

        try {
            const formData = new FormData();

            formData.append("vaithyar_name", vaithyarList?.target?.name || vaithyarList?.label);
            formData.append("vaithyar_id", vaithyarList?.target?.id || "");
            formData.append("slot_date", selectedDate.toISOString().split("T")[0]);
            formData.append("slot_time", selectedSlot);
            formData.append("price", price);
            formData.append("receipt_image", receipt);
            formData.append("folder", "consultation");
            formData.append("transaction_id", transactionId);
            formData.append("paid_date", dateTime?.toISOString().split("T")[0]);
            formData.append("created_by", userId || "");
            formData.append("owned_by", rowData?.lead_recid || "");

            const response = await axios.post(
                `${config.apiBaseUrl}saveConsultingAppointment`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
             const { status, message } = response.data;
              if (status === "duplicate") {
                    toast.error(message);
                    return;
                }
            if (response.status === 200) {
                toast.success(message || "Appointment booked successfully!");
                setTimeout(() => {
                    handleClear();
                    setPaymnetOption(false);
                    onClose();
                }, 3000);
            } else {
                toast.error("Failed to book appointment: " + response.data.message);
            }
        } catch (error) {
            toast.error("Error booking appointment: " + (error.response?.data?.message || error.message));
        }
    };

    const now = new Date();

    return (
        <div className="consult_modal-overlay">
            {!paymnetOption ? (
                <div className="consult_modal-container">
                    <div className="consult_modal-header">
                        <h5 className="mb-0 fw-semibold">Add Consulting</h5>
                    </div>

                    <div className="consult_modal-body">
                        <label className="consult_label">Select vaithiyar</label>
                        <CommonSelect
                            header="Select vaithiyar"
                            placeholder="Select vaithiyar"
                            name="vaithyar"
                            value={vaithyarList}
                            onChange={setVaithyarList}
                            options={vaithyarDetails}
                        />

                        <label className="consult_label mt-3">Select slot</label>
                        <div className="consult_calendar-slot-wrapper">
                            <div className="consult_calendar-box">
                                <DatePicker
                                    selected={selectedDate}
                                    className="appointment-st"
                                    onChange={(date) => {
                                        setSelectedDate(date);
                                        setSelectedSlot("");
                                    }}
                                    inline
                                    minDate={new Date()}
                                    dayClassName={(date) =>
                                        date.toDateString() === new Date().toDateString()
                                            ? "consult_day selected"
                                            : "consult_day"
                                    }
                                />
                            </div>

                            {/* 🔹 Time Slots */}
                            <div className="consult_slot-box">
                                <div className="consult_slot-date">
                                    {selectedDate.toDateString()}
                                </div>
                                <div className="consult_slot-times">
                                    {timeSlots.map((slot, idx) => {
                                        const slotTime = parseTime(slot, selectedDate);

                                        // disable past slots if date is today
                                        const isDisabled =
                                            selectedDate.toDateString() === now.toDateString() &&
                                            slotTime < now;

                                        return (
                                            <div
                                                key={idx}
                                                className={`consult_slot-time 
                                                    ${selectedSlot === slot ? "selected" : ""} 
                                                    ${isDisabled ? "disabled" : ""}`}
                                                onClick={() => !isDisabled && setSelectedSlot(slot)}
                                            >
                                                {slot}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="consult_modal-footer">
                        <button className="consult_cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="consult_save-button"
                            disabled={!vaithyarList || !selectedSlot}
                            onClick={() => setPaymnetOption(true)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <div className="consult_modal-container">
                    <div className="consult_modal-header mb-4">
                        <h5 className="mb-0 fw-semibold">Add Consulting</h5>
                    </div>
                    <div className="appoint_container">
                        <div className="appoint_card">
                            <h5 className="fw-semibold">Client details</h5>
                            <div className="appoint_row"><span>Customer ID</span><span>{rowData?.lead_id || ''}</span></div>
                            <div className="appoint_row"><span>Name</span><span>{rowData?.lead_name || ''}</span></div>
                            <div className="appoint_row"><span>Age</span><span>{rowData?.age || ''}</span></div>
                            <div className="appoint_row"><span>Gender</span><span>{rowData?.gender || ''}</span></div>
                            <div className="appoint_row"><span>Phone</span><span>{rowData?.mobile_number || ''}</span></div>
                            <div className="appoint_row"><span>Email</span><span>{rowData?.email || ''}</span></div>

                            <h5 className="appoint_slot_title fw-semibold">Slot details</h5>
                            <div className="appoint_row"><span>Vaithyar</span><span>{vaithyarList?.target?.name || ''}</span></div>
                            <div className="appoint_row"><span>Date</span><span>{selectedDate.toLocaleDateString("en-GB") || ''}</span></div>
                            <div className="appoint_row"><span>Time</span><span>{selectedSlot || ''}</span></div>
                        </div>

                        <div className="appoint_card">
                            <h5 className="fw-semibold">Payment details</h5>
                            <div className="appoint_input-row">
                                <label style={{ minWidth: "122px" }}>Price</label>
                                <input
                                    type="number"
                                    value={price}
                                    className="w-100"
                                    placeholder="Enter price"
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>

                            <div className="appoint_input-row">
                                 <label style={{ minWidth: "122px" }}>Price</label>
                                <div><span className="appoint_rupee">₹ {price || 0}</span></div>
                            </div>

                            <div className="appoint_upload">
                                <label>Upload receipt</label>
                                <p className="small">Collect client's payment screenshot and upload before booking.</p>
                                <div className="appoint_upload-box">
                                    <label htmlFor="uploadInput" className="appoint_upload-label">
                                        <SvgContent svg_name="btn_upload" stroke="#0B622F" style={{ zIndex: "999" }} />
                                        <span style={{ color: "#121212", zIndex: "0" }}>Upload image</span>
                                    </label>
                                    <input
                                        id="uploadInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleReceiptUpload}
                                        style={{ display: "none" }}
                                    />
                                   {receipt && (
                                    <div className="appoint_file-chip">
                                        <span className="appoint_file-name small">{receipt.name}</span>
                                        <span
                                        className="appoint_file-remove"
                                        onClick={handleRemoveReceipt}
                                        title="Remove">
                                        ×
                                        </span>
                                    </div>
                                    )}

                                </div>
                            </div>

                            <div className="appoint_input-row">
                                <label style={{ minWidth: "122px" }}>Transaction ID</label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    className="w-100"
                                    placeholder="Enter transaction ID"
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    style={{ outline: "none" }}
                                />
                            </div>

                            <div className="appoint_input-row">
                                <label style={{ minWidth: "122px" }}>Date</label>
                                <DatePicker
                                    selected={dateTime}
                                    minDate={new Date()} 
                                    onChange={(date) => setDateTime(date)}
                                    dateFormat="dd-MM-yyyy h:mm aa"
                                    className="appoint_datepicker w-100"                                    
                                    timeFormat="hh:mm aa"
                                    showTimeSelect 
                                    timeIntervals={15}
                                    placeholderText="DD/MM/YYYY HH:MM"
                                    popperPlacement="bottom"
                                />
                            </div>

                            <div className="appoint_buttons">
                                <button className="appoint_clear-btn" onClick={() => setPaymnetOption(false)}>Back</button>
                                <button className="appoint_book-btn" onClick={handleSubmit}>Book appointment</button>
                            </div>
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

AddConsultingModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    rowData: PropTypes.shape({
        lead_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        lead_name: PropTypes.string,
        age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        gender: PropTypes.string,
        mobile_number: PropTypes.string,
        email: PropTypes.string,
        lead_recid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
};

export default AddConsultingModal;
