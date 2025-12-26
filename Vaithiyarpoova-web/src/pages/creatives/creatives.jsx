import React, { useState, useEffect, useRef } from 'react';
import './creatives.css';
import Pagination from "../../components/Pagination/index.jsx";
import CommonSelect from "../../components/common-select.jsx";
import axios from "axios";
import configModule from '../../../config.js';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Actioneditebtn from '../../assets/images/actionedit.svg';
import EditcreativeEmp from './editcreativeemp.jsx';

function Creatives() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [showModal, setShowModal] = useState(false);
  const [serviceData, setServiceData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const titleInputRef = useRef(null);
  const { user, accessMenu } = useAuth();
  const location = useLocation();
  const pathname = location?.pathname;
  const db_state_item = location?.state?.db_type;
  const [mainstep, setMainstep] = useState(db_state_item || 'Todays');
  const userId = user?.userId;
  const config = configModule.config();
  const [menuIndex, setMenuIndex] = useState(null);
  const dropdownRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);



  const handleEditClick = (item) => {
  setSelectedEditData(item);
  setShowEditModal(true);
};

const handelclickdelete = (item) => {
  setSelectedDeleteId(item);
  setShowDeleteModal(true);
};

const handelclosedelete = () => {
  setShowDeleteModal(false);
  setSelectedDeleteId(null);
};



const toggleMenu = (itemId) => {
  setMenuIndex(menuIndex === itemId ? null : itemId);
};

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuIndex(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sociatype = [
      { label: "Whatsapp", value: "Whatsapp" },
        { label: "Facebook", value: "Facebook" },
        { label: "Instagram", value: "Instagram" },
        { label: "Youtube", value: "Youtube" },
        { label: "Others", value: "Others" }
  ];

  const [formData, setFormData] = useState({
    empID: "",
    title: "",
    type: "",
    description: "",
    dateToPost: null,
  });
  const [buttonPermissions, setButtonPermissions] = useState({});

  // Load button permissions for Creatives designation page by path
  useEffect(() => {
    if (user && Array.isArray(accessMenu)) {
      const found = accessMenu.find(m => m.path === pathname && m.user_id === user?.userId );
      if (found) {
        setButtonPermissions({
          search: found.search_btn === 1 || found.search_btn === 'YES',
          add: found.add_btn === 1 || found.add_btn === 'YES',
          filter: found.filter_btn === 1 || found.filter_btn === 'YES',
        });
      } else {
        setButtonPermissions({});
      }
    } else {
      setButtonPermissions({});
    }
  }, [user, accessMenu, pathname]);



  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value.target.value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, dateToPost: formatDateToMySQL(date) }));
  };

  const addcreative = ()=>{
    setFormData({ empID: userId, title: '', type: '', description: '', dateToPost: new Date() });
    setShowModal(true);
    setTimeout(() => { if (titleInputRef.current) titleInputRef.current.focus(); }, 100);
  }
  const closecreative = ()=>{
    setShowModal(false);
    setFormData({ empID: '', title: '', type: '', description: '', dateToPost: null });
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const isSameDay = (d1, d2) => (
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
  );

  const today = new Date();

  const fetchCreatives = async () => {
    try {
      const res = await axios.post(`${config.apiBaseUrl}getcreativesbyemp`, { user_id:userId });
      if (res.status === 200) {
        setServiceData(res.data?.data || []);
      } else {
        setServiceData([]);
        toast.error('Failed to fetch creative services');
      }
    } catch (error) {
      setServiceData([]);
      console.error('Error fetching creative services:', error);
      toast.error('Error fetching creative services');
    } 
  };

  useEffect(() => {
    fetchCreatives();
  }, []);

  useEffect(() => {
    fetchCreatives();
  }, []);


  useEffect(() => {
    if (user && Array.isArray(accessMenu)) {
      const found = accessMenu.find(m => m.path === pathname  && m.user_id === user?.userId);
      console.log(found)
      if (found) {
        setButtonPermissions({
          search: found.search_btn === 1 || found.search_btn === 'YES',
          add: found.add_btn === 1 || found.add_btn === 'YES',
          filter: found.filter_btn === 1 || found.filter_btn === 'YES',
          edit: found.edit_btn === 1,
          delete: found.delete_btn === 1,
        });
      } else {
        setButtonPermissions({});
      }
    } else {
      setButtonPermissions({});
    }
  }, [user, accessMenu, pathname]);


  const filteredByStep = () => {
  const q = searchQuery.trim().toLowerCase();

  const base = serviceData.filter(item => {
    if (!q) return true;
    return `${item.title||''} ${item.description||''} ${item.type||''} ${item.status||''}`
      .toLowerCase()
      .includes(q);
  });



  return base.filter(it => {
    const status = (it.status || "").toLowerCase();
    const dt = parseDate(it.date_to_post || it.created_at);

    if (status === "uploaded") {
      return mainstep === "Uploaded";
    }

    if (!dt) return false;

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (mainstep === "Todays") return isSameDay(dt, today);
    if (mainstep === "Overdue") return dt < todayStart;
    if (mainstep === "Upcoming") return dt > todayStart;
    if (mainstep === "Uploaded") return status === "uploaded";
 
    return true;
  });
};


  const filtered = filteredByStep();
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (val) => {
    const dt = parseDate(val);
    if (!dt) return '-';
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

const formatDateToMySQL = (date) => {
  if (!date) return formatDateToMySQL(new Date());
  const pad = (n) => n < 10 ? '0' + n : n;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ...`;
};

  const saveCreativeDetails = async () => {
    // Ensure we have a valid date
    let dateValue;
    if (formData.dateToPost instanceof Date) {
      dateValue = formatDateToMySQL(formData.dateToPost);
    } else if (formData.dateToPost) {
      dateValue = formatDateToMySQL(new Date(formData.dateToPost));
    } else {
      dateValue = formatDateToMySQL(new Date());
    }

    const payload = {
      empID: formData.empID || userId,
      title: (formData.title || '').trim(),
      type: (formData.type || '').trim(),
      description: (formData.description || '').trim(),
      dateToPost: dateValue
    };
    
    if (!payload.empID || !payload.title || !payload.type || !payload.description || !payload.dateToPost) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const res = await axios.post(`${config.apiBaseUrl}saveCreativeService`, { data: payload });
      if (res.status === 200) {
        toast.success('Creative service saved successfully!');
        await fetchCreatives();
        setShowModal(false);
        setFormData({ empID: '', title: '', type: '', description: '', dateToPost: null });
      } else {
        const msg = res?.data?.message || 'Failed to save';
        toast.error(msg);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save';
      toast.error(msg);
    }
  };

  const updateStatus = async (row, newStatus) => {
    const idKey = (row.hasOwnProperty('cs_recid') && 'cs_recid')
      || (row.hasOwnProperty('id') && 'id')
      || (row.hasOwnProperty('creative_id') && 'creative_id')
      || (row.hasOwnProperty('cs_id') && 'cs_id')
      || '';
    const rowId = idKey ? row[idKey] : undefined;
    if (!rowId) {
      toast.error('Unable to determine row ID to update.');
      return;
    }
    try {
      await axios.post(`${config.apiBaseUrl}updateCreativeStatus`, { id: rowId, idKey, status: newStatus });
      await fetchCreatives();
      toast.success('Status updated successfully!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    }
  };


 const getAllowedStatusOptions = (currentStatusRaw) => {
   const current = (currentStatusRaw || "").trim().toLowerCase();

   if (current === "todo") {
     return ["todo", "in progress", "hold", "completed"];
   }

   if (current === "in progress") {
     return ["in progress", "hold", "completed"];
   }
    if (current === "completed") {
      return [ "completed","correction", "Uploaded"];
    }

   if (current === "correction") {
     return ["correction", "completed", "uploaded"];
   }

   if (current === "hold") {
     return ["hold", "in progress", "completed"];
   }

  

   if (current === "uploaded") {
     return ["uploaded"];
   }

   // fallback
   return ["todo", "in progress", "correction", "completed", "hold"];
 };



 const deleteCreative = async (row) => {
   const creativeId =row?.creative_id ;

  try {
    const res = await axios.delete(`${config.apiBaseUrl}deleteCreative/${creativeId}`);

    if (res.status === 200) {
      toast.success("Creative deleted successfully", { autoClose: 400 });
      fetchCreatives();
      handelclosedelete();

    }
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to delete");
  }
};


  return (
    <div className="common-body-st">
      <div className="creative-main">
        <div className="creative-header-main">
          <h6 className="mt-0 mb-0 product-header-text">
            Total Creatives : {filtered.length}
          </h6>
          <div className="">
            {buttonPermissions.search && (
              <input
                type="search"
                className="appointmnet-search-input me-2"
                placeholder="Search "
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            )}
            {buttonPermissions.add && (
              <button
                type="button"
                className="appointmnet-new-btn"
                onClick={addcreative}
              >
                Add
              </button>
            )}
          </div>
        </div>
        {buttonPermissions.filter && (
          <div className="creative-sub-header">
            <button
              type="button"
              className={`ap-cbtns ${mainstep === "Todays" ? "active" : ""}`}
              onClick={() => {
                setMainstep("Todays");
                setCurrentPage(1);
              }}
            >
              {" "}
              Today's{" "}
            </button>
            <button
              type="button"
              className={`ap-cbtns ${mainstep === "Overdue" ? "active" : ""}`}
              onClick={() => {
                setMainstep("Overdue");
                setCurrentPage(1);
              }}
            >
              {" "}
              Overdue{" "}
            </button>
            <button
              type="button"
              className={`ap-cbtns ${mainstep === "Upcoming" ? "active" : ""}`}
              onClick={() => {
                setMainstep("Upcoming");
                setCurrentPage(1);
              }}
            >
              {" "}
              Incoming{" "}
            </button>
            <button
              type="button"
              className={`ap-cbtns ${mainstep === "Uploaded" ? "active" : ""}`}
              onClick={() => {
                setMainstep("Uploaded");
                setCurrentPage(1);
              }}
            >
              History
            </button>
          </div>
        )}
        <div className="creative-main-table">
          <div className="h-100 w-100">
            <div className="creative-s-table">
              <div
                className="cb-table-header display-flex"
                style={{ minWidth: "1112px" }}
              >
                <div className="brcommon-col-st w-7">S no </div>{" "}
                <span style={{ color: "#129347" }}> | </span>
                <div className="brcommon-col-st w-12">Date</div>{" "}
                <span style={{ color: "#129347" }}> | </span>
                <div className="brcommon-col-st w-15">Task-name</div>{" "}
                <span style={{ color: "#129347" }}> | </span>
                <div className="brcommon-col-st w-20">Description</div>{" "}
                <span style={{ color: "#129347" }}> | </span>
                <div className="brcommon-col-st w-12">Type</div>{" "}
                <span style={{ color: "#129347" }}> | </span>
                <div className="brcommon-col-st w-10">Date-to-post</div>{" "}
                <span style={{ color: "#129347" }}> | </span>
                <div className="brcommon-col-st w-14">Status</div>  
                <span style={{ color: "#129347" }}> | </span>
                <div className="brcommon-col-st w-10">Action</div>{" "}
              </div>
              <div className="cb-body-row-st">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <div
                      key={`${item.emp_id}-${index}`}
                      className="display-flex br-rowst w-100"
                    >
                      <div className="brcommon-col-st w-7">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </div>
                      <div className="brcommon-col-st w-12">
                        {formatDate(item.created_at)}
                      </div>
                      <div className="brcommon-col-st w-15">{item.title}</div>
                      <div className="brcommon-col-st w-20">
                        {item.description}
                      </div>
                      <div className="brcommon-col-st w-12">{item.type}</div>
                      <div className="brcommon-col-st w-10">
                        {formatDate(item.date_to_post)}
                      </div>
                      <div className="brcommon-col-st w-14 p-2">
                        <CommonSelect
                          name="status"
                          placeholder="Select Status"
                          value={item.status}
                          onChange={(e) => updateStatus(item, e.target?.value)}
                          options={getAllowedStatusOptions(item.status).map((st) => ({
                              label: st.charAt(0).toUpperCase() + st.slice(1), 
                              value: st.toLowerCase(),                         
                            }))}
                        />                              
                      </div>
                      <div className="brcommon-col-st w-10" >
                        <div>
                       <button onClick={() => toggleMenu(item.creative_id)}  >  <img src={Actioneditebtn} alt="Act" /></button>
                            {menuIndex === item.creative_id && (
                            <div className="action-menu-cr" ref={dropdownRef}>                           
                                <div    disabled={mainstep !== "Uploaded"}
                                  style={{
                                    opacity: mainstep === "Uploaded" ? 0.5 : 1,
                                    pointerEvents: mainstep === "Uploaded" ? "none" : "auto",
                                    cursor: mainstep === "Uploaded" ? "not-allowed" : "pointer"
                                  }}><button className="menu-item-product "
                                   onClick={() => handleEditClick(item)}  >Edit</button>
                                </div>                             
                                <div    disabled={mainstep !== "Uploaded"}
                                style={{
                                  opacity: mainstep === "Uploaded" ? 0.5 : 1,
                                  pointerEvents: mainstep === "Uploaded" ? "none" : "auto",
                                  cursor: mainstep === "Uploaded" ? "not-allowed" : "pointer"
                                }}><button className="menu-item-product1"
                                 onClick={() => handelclickdelete(item)}  >Delete</button>
                                </div>
                            </div>
                          )}
                          </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-100 display-flex">No Creatives</div>
                )}
              </div>
            </div>
            <div className="creative-footer-tab-cs">
              <label htmlFor="hfg" className="me-2">
                Results per page{" "}
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="row-per-page-select"
                  style={{ width: "60px" }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </label>
              <Pagination
                count={filtered.length}
                page={currentPage}
                pageSize={itemsPerPage}
                onChange={(pageNo) => setCurrentPage(pageNo)}
              />
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="cs-modal-overlay">
          <div className="cs-modal-container">
            <div className="d-flex  align-items-center mb-3">
              <div>
                <h5 className="mb-0 fw-600 ">Add creatives</h5>
              </div>
            </div>
            <div className="row mb-3 align-items-center ">
              <div className="col-6">
                <p className="mb-0 fw-500">Title</p>
              </div>
              <div className="col-6">
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="Enter title"
                  className="iventry-form-controle"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, title: e.target.value }));
                  }}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <div className="col-6">
                <p className="mb-0 fw-500">Type</p>
              </div>
              <div className="col-6">
                <CommonSelect
                  name="type"
                  value={formData.type}
                  onChange={(value) => handleSelectChange("type", value)}
                  placeholder="Select Type"
                  options={sociatype}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <div className="col-6">
                <p className="mb-0 fw-500">Description</p>
              </div>
              <div className="col-6">
                <textarea
                  className="iventry-form-controle"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }));
                  }}
                  rows="3"
                  style={{
                    resize: "vertical",
                    backgroundColor: "#fff",
                    color: "#000",
                  }}
                />
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <div className="col-6">
                <p className="mb-0 fw-500">Date to post/Deadline</p>
              </div>
              <div className="col-6">
                <DatePicker
                  selected={formData.dateToPost}
                  onChange={handleDateChange}
                  placeholderText="Select date"
                  className="iventry-form-controle"
                  dateFormat="dd-MM-yyyy"
                />
              </div>
            </div>
            <div className="product-modal-footer pt-2">
              <button className="cancel-button" onClick={closecreative}>
                Cancle
              </button>
              <button className="next-button" onClick={saveCreativeDetails}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}


      {showEditModal && (
        <EditcreativeEmp 
        close={() => setShowEditModal(false)} 
        creativedata={selectedEditData}  
        fetchCreatives={fetchCreatives}    
        />
      )}


{showDeleteModal &&(
       <div className="cs-modal-overlay">
          <div className="cs-modal-container">
            <div className="d-flex  align-items-center mb-3">
              <div>
                <h5 className="mb-0 fw-600 ">Delete creatives</h5>
              </div>
            </div>
            <div className=''>
              <p className="mb-1">
              <strong>Title:</strong> {selectedDeleteId?.title}
            </p>
              </div>
            <div className="product-modal-footer pt-2">
              <button className="cancel-button" onClick={handelclosedelete}>
                Cancle
              </button>
              <button className="next-button"   onClick={() => deleteCreative(selectedDeleteId)} >
                Delete
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
}

export default Creatives
