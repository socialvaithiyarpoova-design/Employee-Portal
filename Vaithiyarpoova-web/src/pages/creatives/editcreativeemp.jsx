import React, { useState, useEffect } from 'react';
import './creatives.css';
import CommonSelect from "../../components/common-select.jsx";
import axios from "axios";
import configModule from '../../../config.js';
import { useAuth } from '../../components/context/Authcontext.jsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const Editcreative = ({ creativedata, close, fetchCreatives }) => {
  const { user } = useAuth();
  const config = configModule.config();


  const sociatype = [
    { label: "Whatsapp", value: "Whatsapp" },
    { label: "Facebook", value: "Facebook" },
    { label: "Instagram", value: "Instagram" },
    { label: "Youtube", value: "Youtube" },
    { label: "Others", value: "Others" }
  ];

const [formData, setFormData] = useState({
  empID: null,
  title: "",
  description: "",
  type: null,
  dateToPost: null,
});


 useEffect(() => {
  if (creativedata) {
    const matchedType = sociatype.find(
      (item) => item.value === creativedata.type
    );

    setFormData({
      empID: creativedata.emp_id || null,
      title: creativedata.title || "",
      description: creativedata.description || "",
      type: matchedType || null,     
      dateToPost: creativedata.date_to_post 
        ? new Date(creativedata.date_to_post) 
        : null,
    });
  }
}, [creativedata]);


const handleTypeChange = (selectedOption) => {
  setFormData(prev => ({
    ...prev,
    type: selectedOption
  }));
};


 const formatDate = (date) => {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


const saveCreativeDetails = async () => {
  const payload = {
    creative_id: creativedata.creative_id,
    title: formData.title?.trim() || "",
    type: formData.type?.target?.value || "",
    description: formData.description?.trim() || "",
    dateToPost: formData.dateToPost ? formatDate(formData.dateToPost) : null,
    empID: formData.empID, 
  };

  try {
    const res = await axios.post(
      `${config.apiBaseUrl}updateCreativeService`,
      { data: payload }
    );

    if (res.status === 200) {
      toast.success("Creative service updated successfully!", { autoClose: 500 });
      fetchCreatives();
      close();
    } else {
      toast.error(res.data.message || "Failed to update");
    }
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to update");
  }
};

  return (
    <div className="cs-modal-overlay">
      <div className="cs-modal-container">
        <div className="d-flex align-items-center mb-3">
          <h5 className="mb-0 fw-600">Edit Creative</h5>
        </div>

        <div className="row mb-3 align-items-center">
          <div className="col-6"><p className="mb-0 fw-500">Title</p></div>
          <div className="col-6">
            <input
              type="text"
              placeholder="Enter title"
              className="iventry-form-controle"
              value={formData.title}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="row mb-3 align-items-center">
          <div className="col-6"><p className="mb-0 fw-500">Type</p></div>
          <div className="col-6">
            <CommonSelect
              name="type"
              placeholder="Select Type"
              options={sociatype}
              value={formData.type || creativedata.type}
              onChange={handleTypeChange}
            />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="row mb-3 align-items-center">
          <div className="col-6"><p className="mb-0 fw-500">Description</p></div>
          <div className="col-6">
            <textarea
              className="iventry-form-controle"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              rows="3"
            />
          </div>
        </div>

        {/* DATE */}
        <div className="row mb-3 align-items-center">
          <div className="col-6"><p className="mb-0 fw-500">Date to Post</p></div>
          <div className="col-6">
            <DatePicker
              selected={formData.dateToPost}
              onChange={(date) => setFormData(prev => ({ ...prev, dateToPost: date }))}
              placeholderText="Select date"
              className="iventry-form-controle"
              dateFormat="dd-MM-yyyy"
            />
          </div>
        </div>

        <div className="product-modal-footer pt-2">
          <button className="cancel-button" onClick={close}>Cancel</button>
          <button className="next-button" onClick={saveCreativeDetails}>Update</button>
        </div>
      </div>
    </div>
  );
};

export default Editcreative;
