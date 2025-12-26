import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import configModule from '../../../config.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { PropagateLoader } from 'react-spinners';
import CommonSelect from '../../components/common-select.jsx';

function AddEditBranch({ rowData = {}, selectedItem = '', closeAddeditModal = {} }) {
    const config = configModule.config();
    const [branchHeadOpt, setBranchHeadOpt] = useState([]);
    const [branchHeader, setBranchHeader] = useState([]);
    const getField = (field, fallback = '') => selectedItem[field] || fallback;
    const getNestedRowValue = (key) => rowData?.[key]?.value || '';

    const defaultFormData = {
        branch_id: getField('branch_id'),
        branch_name: getField('branch_name'),
        branch_incharge_recid: getField('branch_incharge_recid'),
        branch_in_charge: getField('branch_in_charge'),
        email: getField('email'),
        opening_date: getField('opening_date'),
        rent: getField('rent'),
        branch_type: selectedItem.branch_type || getNestedRowValue('type'),
        phone_number: getField('phone_number'),
        country: selectedItem.country || getNestedRowValue('country'),
        state: selectedItem.state || getNestedRowValue('state'),
        district: selectedItem.district || getNestedRowValue('city'),
        location: selectedItem.location || rowData?.location,
        assign_dispatch: selectedItem?.selDispatch?.target?.id|| rowData?.selDispatch?.target?.id,
        address: getField('address'),
        assign_brand_vaithyar: selectedItem?.assign_brand_vaithyar ?? false,
        assign_brand_gramiyam: selectedItem?.assign_brand_gramiyam ?? false,
    };
    const [formData, setFormData] = useState(defaultFormData);
    const [loading, setLoading] = useState(false);
    const [btnIsDisabled, setBtnIsDisabled] = useState(false);

const resetForm = () => {
  const resetFormData = {
    branch_id: "",
    branch_name: "",
    branch_incharge_recid: "",
    branch_in_charge: "",
    email: "",
    opening_date: "",
    rent: "",
    branch_type: getNestedRowValue("type"),         // KEEP from rowData
    phone_number: "",
    country: getNestedRowValue("country"),         // KEEP from rowData
    state: getNestedRowValue("state"),             // KEEP from rowData
    district: getNestedRowValue("city"),           // KEEP from rowData
    location: rowData?.location || "",             // KEEP from rowData
    assign_dispatch: rowData?.selDispatch?.target?.id || "",
    address: "",
    assign_brand_vaithyar: false,
    assign_brand_gramiyam: false,
  };
  setFormData(resetFormData);
  setBranchHeader([]);
  setBranchHeadOpt([]);
};


    function getTwoLetterCode(str) {
        const words = str.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].slice(0, 2).toUpperCase();
        } else {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
    };

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

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleDateChange = (date) => {
        setFormData((prev) => ({
            ...prev,
            opening_date: formatDateTime(date),
        }));
    };

    const handleCheckboxChange = (e) => {
        const { id, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: checked
        }));
    };

    const getNextNumber = (lastBranchId) => {
        let numbers = lastBranchId || [];

        const parsedNumbers = numbers.map(code => {
            const match = code.match(/^([A-Z]+)(\d{3})$/);
            return match ? parseInt(match[2], 10) : 0;
        });

        const max = parsedNumbers.length > 0 ? Math.max(...parsedNumbers) : 0;
        return (max + 1).toString().padStart(3, '0');
    };

    const generateCode = (lastBranchId) => {
        if (lastBranchId) {
            const prefix = "VPA" + getTwoLetterCode(rowData?.state.code) + getTwoLetterCode(rowData?.location);
            const number = getNextNumber(lastBranchId);

            setFormData((prev) => ({
                ...prev,
                branch_id: `${prefix}${number}`,
            }));
        }
    };
    useEffect(() => {
  if (rowData.action === "Add") {
    resetForm();
  }
}, [rowData.action]);

    const getLastBranchId = async () => {
        let lastBranchId = [];
        try {
            const response = await fetch(`${config.apiBaseUrl}getLastBranchId`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ state: rowData?.state?.value || '', location: rowData?.location || '' })
            });
            const result = await response.json();
            if (response.ok) {
                if (result.branchData.length === 0) {
                    lastBranchId = result.branchData;
                } else {
                    lastBranchId = [result.branchData[0].branch_id];
                }
                generateCode(lastBranchId);
            } else {
                console.error("Failed to fetch branch last id: " + result.message);
                toast.error("Failed to fetch branch last id: " + result.message);
            }
        } catch (error) {
            console.error("Error fetching branch last id: " + error.message);
            toast.error("Error fetching branch last id: " + error.message);
        }
    };

    const getBranchHeadList = async (sType) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}getBranchHeadList`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ type: sType || '' })
            });
            const result = await response.json();
            if (response.ok) {
                if (result.headData) {
                    setBranchHeadOpt(result.headData);
                } else {
                    toast.info("No data found");
                    setBranchHeadOpt([]);
                }
            } else {
                console.error("Failed to fetch branch last id: " + result.message);
                toast.error("Failed to fetch branch last id: " + result.message);
            }
        } catch (error) {
            console.error("Error fetching branch last id: " + error.message);
            toast.error("Error fetching branch last id: " + error.message);
        }
    };

    useEffect(() => {
        if (rowData.action === "Add") {
            getLastBranchId();
        }
    }, [rowData.action]);

    useEffect(() => {
        let branchType = null;
        
        if (rowData.action === "Add") {
            branchType = rowData?.type?.value;
        } else if (rowData.action === "Edit") {
            branchType = selectedItem?.branch_type || getNestedRowValue('type');
        }
        if (branchType) {
            getBranchHeadList(branchType);
        }
    }, [rowData.action, rowData?.type?.value, selectedItem?.branch_type]);

    useEffect(() => {
        if (branchHeader) {
            const matchedHeader = branchHeadOpt.find(item => item.id === branchHeader?.target?.id);

            if (matchedHeader) {
                setFormData((prev) => ({
                    ...prev,
                    branch_in_charge: matchedHeader.value,
                    email: matchedHeader.email,
                    phone_number: matchedHeader.mobile_number,
                    branch_incharge_recid: matchedHeader.id,
                }));
            }
        }
    }, [branchHeader]);

    const validateForm = () => {
        const conditionalFields = ['phone_number', 'branch_in_charge', 'email', 'branch_incharge_recid'];
    
    const requiredFieldsFilled = Object.entries(formData).every(([key, value]) => {
        if (key === 'assign_dispatch') return true;  
        if (typeof value === 'boolean') return true;
        if (rowData.action === "Add" && conditionalFields.includes(key)) {
            return true;
        }
        return value !== '' && value !== null && value !== undefined;
    });

        const atLeastOneBrandAssigned = formData.assign_brand_vaithyar || formData.assign_brand_gramiyam;

        return requiredFieldsFilled && atLeastOneBrandAssigned;
    };

    const getChangedFields = () => {
        return Object.entries(formData)
            .filter(([key, newValue]) => {
                if (newValue === null) return false;

                let oldValue = selectedItem[key];

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
            .map(([key, newValue]) => ({
                key,
                newValue,
                branch_id: selectedItem.branch_recid,
            }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

         if (!validateForm()) {
        const message = rowData.action === "Edit" 
            ? "Please fill all fields including Phone Number, Branch In-Charge, and Email. Also ensure at least one brand is assigned."
            : "Please fill all required fields and ensure at least one brand is assigned.";
        toast.error(message);
        setLoading(false);
        return;
    }

        let payload;
        let api = '';

        if (rowData.action === "Edit") {
            const changedFields = getChangedFields();

            if (changedFields.length === 0) {
                toast.info("No changes to update.");
                setLoading(false);
                return;
            }

            payload = {
                branch_id: selectedItem.branch_recid,
                updates: changedFields
            };

            api = "updateBranchDetails";
        } else {
            payload = { formData: formData };
            api = "saveBranchDetails";
        }

        try {
            const response = await axios.post(`${config.apiBaseUrl}${api}`, payload);
            if (response.data) {
                toast.success(
                    rowData.action === "Edit"
                        ? "Branch updated successfully."
                        : "Branch added successfully."
                );
                const responseData = response.data?.data;
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
                    }).catch((err) => console.error("Graph update failed:", err));
                }
                
                setBtnIsDisabled(true);
                    setTimeout(() => {
                        resetForm();
                        closeAddeditModal();
                        setBtnIsDisabled(false);
                    }, 1500);
            } else {
                toast.info("No data found");
            }
        } catch (err) {
            if (err.response?.data?.message?.code === "ER_DUP_ENTRY") {
                toast.error(err.response?.data?.message?.sqlMessage, "Aready assign this branch head to another location")
            } else {
                toast.error(err.message);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="modal-overlay">
            {loading && (
                <div className='loading-container w-100 h-100'>
                    <PropagateLoader
                        height="100"
                        width="100"
                        color="#0B9346"
                        radius="10"
                    />
                </div>
            )}
            <div className="modal-container modal-container-ev" >
                <div className="modal-header mb-0 modal-header-aeb" >
                    <h5 className="mb-0 add-new-hdr ps-3">{rowData.action} New Branch</h5>
                </div>
                <div className="modal-body modal-body-aeb">
                    <form className="branch-form" >
                        <div className="form-grid">
                            <div className="col-12 col-xl-6 col-sm-12 col-lg-6 col-md-6 pe-2">
                                <div className="form-group-pp mb-3">
                                    <label htmlFor="branch_id">Branch ID</label>
                                    <input
                                        type="text"
                                        id="branch_id"
                                        name="branch_id"
                                        disabled
                                        className="form-control-st heightset-st fw-700"
                                        style={{ color: "#0B622F" }}
                                        value={formData.branch_id}
                                    />
                                </div>

                                <div className="form-group-pp mb-3">
                                    <label htmlFor="branch_name">Branch Name</label>
                                    <input
                                        type="text"
                                        id="branch_name"
                                        name="branch_name"
                                        className="form-control-st heightset-st"
                                        value={formData.branch_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group-pp mb-3">
                                    <label htmlFor="branch_name">Branch In-Charge</label>
                                    <div className="container commonst-select w-100">
                                        <div className="w-100">
                                            <CommonSelect
                                                header="Select Branch In-Charge"
                                                placeholder="Select Branch In-Charge"
                                                name="Branch_ID"
                                                value={branchHeader.length > 0 ? branchHeader : formData?.branch_in_charge}
                                                onChange={setBranchHeader}
                                                options={branchHeadOpt}
                                                isSearchable={true}
                                            />
                                        </div>
                                    </div>
                                </div>



                                <div className="form-group-pp mb-3">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-control-st heightset-st"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled
                                    />
                                </div>

                                <div className="form-group-pp mb-3">
                                    <label htmlFor="opening_date">Opening Date</label>
                                    <DatePicker
                                        selected={formData.opening_date}
                                        onChange={handleDateChange}
                                        placeholderText="DD/MM/YYYY"
                                        className="form-control-st heightset-st"
                                        dateFormat="dd-MM-yyyy"
                                    />
                                </div>

                                <div className="form-group-pp mb-3">
                                    <label htmlFor="rent">Rent</label>
                                    <input
                                        type="number"
                                        id="rent"
                                        name="rent"
                                        className="form-control-st heightset-st"
                                        value={formData.rent}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group-pp mb-3">
                                    <label htmlFor='brand'>Assign Brands</label>
                                    <div className='w-100'>
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                id="assign_brand_vaithyar"
                                                name="assign_brand_vaithyar"
                                                className="form-check-input cursor-pointer"
                                                checked={formData.assign_brand_vaithyar}
                                                onChange={handleCheckboxChange}
                                            />
                                            <label className="form-check-label cursor-pointer" htmlFor="assign_brand_vaithyar">
                                                Vaithiyar Poova
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                id="assign_brand_gramiyam"
                                                name="assignBrandasramiyam"
                                                className="form-check-input cursor-pointer"
                                                checked={formData.assign_brand_gramiyam || ''}
                                                onChange={handleCheckboxChange}
                                            />
                                            <label className="form-check-label cursor-pointer" htmlFor="brandGramiyam">
                                                Gramiyam
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-xl-6 col-sm-12 col-lg-6 col-md-6 ps-2">
                                <div className="form-group-pp mb-3">
                                    <label htmlFor="branch_type">Branch Type</label>
                                    <input
                                        type="text"
                                        id="branch_type"
                                        name="branch_type"
                                        className="form-control-st heightset-st"
                                        value={formData.branch_type}
                                        onChange={handleChange}
                                        disabled
                                    />
                                </div>

                                <div className="form-group-pp mb-3">
                                    <label htmlFor="phone_number">Phone Number</label>
                                    <input
                                        type="text"
                                        id="phone_number"
                                        name="phone_number"
                                        className="form-control-st heightset-st"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        maxLength={10}
                                        disabled
                                    />
                                </div>

                                <div className="form-group-pp mb-3">
                                    <label htmlFor="country">Country</label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        className="form-control-st heightset-st"
                                        value={formData.country}
                                        onChange={handleChange}
                                        disabled
                                    />
                                </div>

                                <div className="form-group-pp mb-3">
                                    <label htmlFor="state">Province / State</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        className="form-control-st heightset-st"
                                        value={formData.state}
                                        onChange={handleChange}
                                        disabled
                                    />
                                </div>

                                <div className="form-group-pp mb-3">
                                    <label htmlFor="district">Town / District</label>
                                    <input
                                        type="text"
                                        id="district"
                                        name="district"
                                        className="form-control-st heightset-st"
                                        value={formData.district}
                                        onChange={handleChange}
                                        disabled
                                    />
                                </div>

                                <div className="form-group-pp mb-3">
                                    <label htmlFor="location">Location</label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        className="form-control-st heightset-st"
                                        value={formData.location}
                                        onChange={handleChange}
                                        disabled
                                    />
                                </div>

                                <div className="form-group-pp mb-3">
                                    <label htmlFor="address">Address</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        rows="3"
                                        className="form-control-st-st"
                                        value={formData.address}
                                        onChange={handleChange}
                                        style={{ height: "112px !important" }}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className=" modal-footer-aeb"> 
                    <div className='d-flex justify-content-end w-100 gap-2'> 
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => {
                            resetForm();
                            closeAddeditModal();
                        }}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="next-button" onClick={handleSubmit} disabled={btnIsDisabled}>Save</button>
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

AddEditBranch.propTypes = {
    selectedItem: PropTypes.shape({
        branch_id: PropTypes.string,
        branch_name: PropTypes.string,
        branch_incharge_recid: PropTypes.number,
        branch_in_charge: PropTypes.string,
        email: PropTypes.string,
        opening_date: PropTypes.string,
        rent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        branch_type: PropTypes.string,
        phone_number: PropTypes.string,
        country: PropTypes.string,
        state: PropTypes.string,
        district: PropTypes.string,
        location: PropTypes.string,
        assign_dispatch: PropTypes.string,
        address: PropTypes.string,
        assign_brand_vaithyar: PropTypes.number,
        assign_brand_gramiyam: PropTypes.number
    }),
    rowData: PropTypes.object,
    closeAddeditModal: PropTypes.func.isRequired
};

export default AddEditBranch;
