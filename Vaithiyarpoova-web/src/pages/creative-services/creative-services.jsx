import React, { useState, useEffect, useRef } from 'react';
import { PropagateLoader } from 'react-spinners';
import '../../assets/styles/branches.css';
import '../../assets/styles/user-profile.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import configModule from '../../../config.js';
import Pagination from "../../components/Pagination/index.jsx";
import SvgContent from '../../components/svgcontent.jsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CommonSelect from "../../components/common-select.jsx";
import FilterModal from '../../components/filter-modal.jsx';
import Actioneditebtn from '../../assets/images/actionedit.svg';
import Editcreative from './editcreative.jsx';
function CreativeService() {
    const [serviceData, setServiceData] = useState([]);
    const [employeeData, setEmployeeData] = useState([]);
    const [needLoading, setNeedLoading] = useState(false);
    const { user, accessMenu } = useAuth();
    const location = useLocation();
    const pathname = location?.pathname;
    const userId = user?.userId;
    const user_typecode = user?.user_typecode;
    const config = configModule.config();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [activeButton, setActiveButton] = useState(null);
    const [isFilterHover, setIsFilterHover] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const empIDSelectRef = useRef(null);
    const [buttonPermissions, setButtonPermissions] = useState({});
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



    const [formData, setFormData] = useState({
        empID: "",
        title: "",
        type: "",
        description: "",
        dateToPost: null,
    });
    const [selectedFilters, setSelectedFilters] = useState('');

    // Single, de-duplicated error toast for this page
    const ERROR_TOAST_ID = 'creative-service-error-toast';
    const showErrorToast = (message) => {
        try { toast.dismiss(ERROR_TOAST_ID); } catch { }
        toast.error(message, { toastId: ERROR_TOAST_ID, autoClose: 3000, pauseOnHover: true });
    };

    const TypeOptions = [
        { label: "Whatsapp", value: "Whatsapp" },
        { label: "Facebook", value: "Facebook" },
        { label: "Instagram", value: "Instagram" },
        { label: "Youtube", value: "Youtube" },
        { label: "Others", value: "Others" }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectemp = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value.target.id }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value.target.value }));
    };

    const handleDateChange = (date) => {
        setFormData((prev) => ({ ...prev, dateToPost: formatDateToMySQL(date) }));
    };

    const getCreativeServices = async (objStatus = '') => {
        setNeedLoading(true);

        try {
            const response = await axios.post(`${config.apiBaseUrl}getCreativeServices`, {
                filterData: objStatus || '',
                user_id:userId,
                user_typecode:user_typecode
            });

            const result = response.data;
            if (response.status === 200) {
                setServiceData(result.data);

            } else {
                showErrorToast("Failed to fetch creative service details: " + result.message);
                console.error("Failed to fetch creative service details: " + result.message);
            }
        } catch (error) {
            showErrorToast(
                "Error fetching creative service details: " +
                (error.response?.data?.message || error.message)
            );
        } finally {
            setNeedLoading(false);
        }
    };

    const getEmployeeList = async () => {
    setNeedLoading(true);

    try {
        const response = await axios.post(
            `${config.apiBaseUrl}getEmployeeListForCS`,
            {
                user_id: userId,
                user_typecode: user_typecode
            }
        );

        if (response.status === 200) {
            setEmployeeData(response.data.data);
        } else {
            showErrorToast("Failed to fetch employee details");
        }
    } catch (error) {
        showErrorToast(
            "Error fetching employee details: " +
            (error.response?.data?.message || error.message)
        );
    } finally {
        setNeedLoading(false);
    }
};

    useEffect(() => {
        if (user) {
            getCreativeServices(null);
            getEmployeeList();
        }
    }, [user]);


   
    // Load button permissions by path: search_btn, add_new_btn, filter_btn
    useEffect(() => {
        if (user && Array.isArray(accessMenu)) {
            const found = accessMenu.find(m => m.path === pathname && m.user_id === userId);
            if (found) {
                setButtonPermissions({
                    search: found.search_btn === 1,
                    add_btn: found.add_btn === 1,
                    filter: found.filter_btn === 1,
                });
            } else {
                setButtonPermissions({});
            }
        } else {
            setButtonPermissions({});
        }
    }, [user, accessMenu, pathname]);

    // Close modal on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                if (showModal) {
                    setShowModal(false);
                }
            }
        };

        if (showModal) {
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }
    }, [showModal]);

    // Reset filter button active state when dropdown closes
    useEffect(() => {
        if (!showDropdown) {
            setActiveButton(null);
        }
    }, [showDropdown]);

    // ESC handler for filter modal
    useEffect(() => {
        const onEsc = (e) => {
            if (e.key === 'Escape') {
                setShowFilterModal(false);
                setActiveButton(null);
                setIsFilterHover(false);
            }
        };
        if (showFilterModal) document.addEventListener('keydown', onEsc);
        return () => document.removeEventListener('keydown', onEsc);
    }, [showFilterModal]);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const indexOfLastCreativeServices = currentPage * itemsPerPage;
    const indexOfFirstCreativeServices = indexOfLastCreativeServices - itemsPerPage;
    const paginatedCreativeServices = serviceData.slice(indexOfFirstCreativeServices, indexOfLastCreativeServices);

    const currentCreativeServices = paginatedCreativeServices.filter((item) =>
        `${item.attendance_id} ${item.emp_id} ${item.emp_name} ${item.designation} ${item.work_type} ${item.status}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );


    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };



    const saveCreativeDetails = async () => {
        const dateValue = formData.dateToPost instanceof Date ? formatDateToMySQL(formData.dateToPost) : (formData.dateToPost || '');
        const payload = {
            empID: formData.empID ,
            title: (formData.title || '').trim(),
            type: (formData.type || '').trim(),
            description: (formData.description || '').trim(),
            dateToPost: dateValue
        };

        if (!payload.empID || !payload.title || !payload.type || !payload.description || !payload.dateToPost) {
            return alert('Please fill in all required fields.');
        }

        try {
            const response = await axios.post(`${config.apiBaseUrl}saveCreativeService`, { data: payload });
            const result = response.data;

            if (response.status === 200) {
                toast.success("Saved successfully.");
                const responseData = result?.data;
            if (responseData) {
                fetch(`${config.apiBaseUrlpy}graph_update`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tablename: responseData.table_name,
                        type: responseData.method,
                        id: responseData.id,
                        column_name: responseData.id_column_name
                    }),
                }).catch(err => console.error("Graph update failed:", err));
            }
                await getCreativeServices(null); // Refresh the data
                setShowModal(false);
                setActiveButton(null);
            } else {
                showErrorToast("Failed to save service details: " + result.message);
                console.error("Failed to save service details: " + result.message);
            }
        } catch (error) {
            showErrorToast(
                "Error saving service details: " +
                (error.response?.data?.message || error.message)
            );
        } finally {
            setNeedLoading(false);
        }
    };

        const formatDateToMySQL = (date) => {
        if (!date) return formatDateToMySQL(new Date());
        
        const pad = (n) => n < 10 ? '0' + n : n;
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ...`;
        };
    const onFilterDataFunc = (items) => {
        setSelectedFilters(items);
        getCreativeServices(items);
        setShowFilterModal(false);
        setActiveButton('filter');
        setIsFilterHover(false);
    };

    const handleFltReset = () => {
        setSelectedFilters('');
        getCreativeServices();
        setActiveButton(null);
    };


     const deleteCreative = async (row) => {
   const creativeId =row?.creative_id ;

  try {
    const res = await axios.delete(`${config.apiBaseUrl}deleteCreative/${creativeId}`);

    if (res.status === 200) {
      toast.success("Creative deleted successfully", { autoClose: 400 });
      getCreativeServices();
      handelclosedelete();

    }
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to delete");
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
            <div className='header-div-lp header-div-cp'>
                <div className='header-divpart-el'>
                    <div className='d-flex gap-2'>
                        <p className='mb-0 header-titlecount-el'>Total Creatives : {serviceData?.length || 0}</p>
                    </div>
                </div>
                <div className="search-add-wrapper">
                    {buttonPermissions.search && (
                        <div style={{ position: "relative", display: "inline-block" }}>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            className="search-input"
                            style={{ padding: "7px 28px 7px 12px" }}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <span
                            onClick={() => setSearchQuery("")}
                            style={{
                                position: "absolute",
                                right: "8px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                color: "#666",
                                fontSize: "16px",
                            }}
                            >
                            ✕
                            </span>
                        )}
                        </div>

                    )}
                    {buttonPermissions.add_btn && (
                        <button
                            className={`btn-top-up ${activeButton === 'add' ? 'active' : ''}`}
                            onClick={() => {
                                setFormData({ empID: '', title: '', type: '', description: '', dateToPost: new Date() });
                                setShowModal(true);
                                setActiveButton('add');
                                setTimeout(() => {
                                    if (empIDSelectRef.current) {
                                        empIDSelectRef.current.focus();
                                    }
                                }, 100);
                            }}
                        >
                            <span className='visible-label-up'>Add</span>
                        </button>
                    )}

                    {buttonPermissions.filter && (
                        <div className="filter-container-up">
                            <button
                                className={`btn-top-up ${activeButton === 'filter' ? 'active btn-bg-filled' : ''}`}
                                onClick={() => { setShowDropdown(false); setActiveButton('filter'); setShowFilterModal(true); }}
                                onMouseEnter={() => setIsFilterHover(true)}
                                onMouseLeave={() => setIsFilterHover(false)}
                            >
                                <SvgContent svg_name="btn_filter" stroke={(activeButton === 'filter' || isFilterHover) ? 'white' : '#0B9346'} width={20} height={20} />
                                <span className="visible-label-up" style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}>Filter</span>
                            </button>

                            {activeButton === 'filter' && (
                                <button className='filter-clear-st' onClick={handleFltReset} >
                                    &times;
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className='body-div-lp' style={{ height: "calc(100% - 58px)" }}>
                <div className='h-100 w-100 p-2 pb-0'>
                    <div className='table-common-st'>
                        <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
                            <div className='brcommon-col-st w-8'>
                                S no
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-8'>
                                Date
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-12'>
                                Emp Name
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-12'>
                                Title
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-12'>
                                Description
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                                Type
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                                Date To Post
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-8'>
                                Duration
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-12'>
                                Status
                            </div> 
                            <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-8'>
                                Action
                            </div> 
                        </div>

                        <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
                            {currentCreativeServices && currentCreativeServices.length > 0 ? (currentCreativeServices.map((item, index) => (
                                <div className='display-flex br-rowst' key={item.creative_id}>
                                    <div className='brcommon-col-st w-8'>
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </div>
                                    <div className='brcommon-col-st w-8'>
                                        {formatDate(item.created_at)}
                                    </div>
                                    <div className='brcommon-col-st w-12'>
                                        {item.emp_name}
                                    </div>
                                    <div className='brcommon-col-st w-12'>
                                        {item.title}
                                    </div>
                                    <div className='brcommon-col-st w-12'>
                                        {item.description}
                                    </div>
                                    <div className='brcommon-col-st w-10'>
                                        {item.type}
                                    </div>
                                    <div className='brcommon-col-st w-10'>
                                        {formatDate(item.date_to_post)}
                                    </div>
                                    <div className='brcommon-col-st w-8'>
                                       {item.total_working_time }
                                    </div>
                                    <div className='brcommon-col-st w-12'>
                                        {item.status || '----'}
                                    </div>

                                     <div className='brcommon-col-st w-8'>
                                       <div>
                                        <button onClick={() => toggleMenu(item.creative_id)}  >  <img src={Actioneditebtn} alt="Act" /></button>
                                        {menuIndex === item.creative_id && (
                                            <div className="action-menu-cr" ref={dropdownRef}>                           
                                                <div><button className="menu-item-product "
                                                    onClick={() => handleEditClick(item)} >Edit</button>
                                                </div>                             
                                                <div><button className="menu-item-product1"
                                                onClick={() => handelclickdelete(item)}>Delete</button>
                                                </div>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                </div>
                            ))) : (
                                <div className='tb-nodata-row-st display-flex'>
                                    No Creative Service list
                                </div>
                            )}

                        </div>
                    </div>
                    <div className='footer-tab-st'>
                        <label htmlFor="hfg" className="me-2">
                            Results per page{" "}
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="row-per-page-select"
                                style={{ width: "60px" }}
                            >
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                            </select>
                        </label>
                        <Pagination
                            count={serviceData.length}
                            page={currentPage}
                            pageSize={itemsPerPage}
                            onChange={(pageNo) => setCurrentPage(pageNo)}
                        />
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay modal-overlay-position">
                    <div className="modal-container modal-overlay-position" style={{ width: "625px" }}>
                        <div className="modal-header">
                            <h5 className="mb-0 add-new-hdr">Add New Task</h5>
                        </div>
                        <div className="modal-body">
                            <div className="container commonst-select mb-3">
                                <h6>Emp ID</h6>
                                <div className="comm-select-ba">
                                    <CommonSelect
                                        ref={empIDSelectRef}
                                        header="Select Emp ID"
                                        placeholder="Select Emp ID"
                                        name="empID"
                                        value={formData.empID}
                                        onChange={(id) => handleSelectemp("empID", id)}
                                        options={employeeData}
                                    />
                                </div>
                            </div>

                            <div className="container commonst-select mb-3">
                                <h6>Title</h6>
                                <div className="comm-select-ba">
                                    <input
                                        type="text"
                                        name="title"
                                        className="creative-input-services-p"
                                        placeholder="Enter Title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="container commonst-select mb-3">
                                <h6>Type</h6>
                                <div className="comm-select-ba">
                                    <CommonSelect
                                        header="Select Type"
                                        placeholder="Select Type"
                                        name="type"
                                        value={formData.type}
                                        onChange={(value) => handleSelectChange("type", value)}
                                        options={TypeOptions}
                                    />
                                </div>
                            </div>

                            <div className="container commonst-select mb-3">
                                <h6>Description</h6>
                                <div className="comm-select-ba">
                                    <input
                                        type="text"
                                        name="description"
                                        className="creative-input-services-p"
                                        placeholder="Enter Description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="container commonst-select mb-3">
                                <h6>Date To Post</h6>
                                <div className="comm-select-ba">
                                    <DatePicker
                                        selected={formData.dateToPost}
                                        onChange={handleDateChange}
                                        placeholderText="Select date"
                                        className="creative-input-services-p"
                                        minDate={new Date()}
                                        style={{ height: "48px !important" }}
                                        dateFormat="dd-MM-yyyy"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => {
                                setShowModal(false);
                                setActiveButton(null);
                            }}>Cancel</button>
                            <button className="next-button" onClick={() => {
                                saveCreativeDetails();
                                setActiveButton(null);
                            }}>Add</button>
                        </div>
                    </div>
                </div>
            )}
      {showEditModal && (
        <Editcreative 
        close={() => setShowEditModal(false)} 
        creativedata={selectedEditData}  
        fetchCreatives={getCreativeServices}    
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

            {showFilterModal && (
                <FilterModal onFilterData={onFilterDataFunc} selectedFilters={selectedFilters}
                    onClose={() => { setShowFilterModal(false); setActiveButton(null); }}
                />
            )}

        </div>
    );
}

export default CreativeService;
