import React, { useState, useRef, useEffect } from "react";
import '../../assets/styles/employee.css';
import CommonSelect from "../../components/common-select.jsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import configModule from '../../../config.js';
import { useNavigate ,useLocation} from 'react-router-dom';
import axios from "axios";
import { useAuth } from '../../components/context/Authcontext.jsx';
import SvgContent from "../../components/svgcontent.jsx";
import { PropagateLoader } from 'react-spinners';
import filtericon from '../../assets/images/filtericon.svg';
import silver from '../../assets/images/silver.svg';
import gold from '../../assets/images/gold.svg';
import bronze from '../../assets/images/bronze.svg';
import FilterModal from '../../components/filter-modal.jsx';

function EmployeeList() {
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [delConfirmPopup, setDelConfirmPopup] = useState(false);
  const [assignPopup, setAssignPopup] = useState(false);
  const [empDropData, setEmpDropData] = useState([]);
  const [selectedViewValue, setSelectedViewValue] = useState('');
  const [showEmpDataPopup, setShowEmpDataPopup] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  const [employeList, setEmployeList] = useState([]);
  const [delEmployeList, setDelEmployeList] = useState([]);
  const [role, setRole] = useState(null);
  const config = configModule.config();
  const navigate = useNavigate();
  const { user, accessMenu } = useAuth();
  const location = useLocation();
  const pathname = location?.pathname;
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState('');
  const [activeButton, setActiveButton] = useState(null);
  const [branchOption, setBranchOption] = useState([]);
  const [boptions, setBoptions] = useState([]);
  const [isFilterHover, setIsFilterHover] = useState(false);
  // Button permissions derived from /employee ancestor path
  const [buttonPermissions, setButtonPermissions] = useState({});

  // Helper to detect admin targets (avoid edits on Admin)
  const isAdminItem = (emp) => {
    const roleText = (emp?.designation || '').toString().toLowerCase();
    return emp?.user_typecode === 'AD' || roleText.includes('admin');
  };

  const userId = user?.userId;
  const user_typecode = user?.user_typecode;
  const [status, setStatus] = useState("active");
  const isActive = status === "active";
  const currentList = isActive ? employeList : delEmployeList;
  const [searchQuery, setSearchQuery] = useState("");
  const [needLoading, setNeedLoading] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isAddButtonActive, setIsAddButtonActive] = useState(false);
  const designationSelectRef = useRef(null);

  
  const getDesignationList = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}getDesignationList`);

      const result = response.data;
      if (response.status === 200) {
        setRoleOptions(result.data?.length > 0 ? result.data : []);
      } else {
        toast.error("Failed to fetch designation list: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching designation list: " +
        (error.response?.data?.message || error.message)
      );
      setRoleOptions([]);
    }
  };

  const getbranchs = async () => {
  try {
    const response = await axios.post(`${config.apiBaseUrl}getbranchs`, {
      user_id: userId,
      user_type : user_typecode
    });

    if (response.status === 200) {
      setBranchOption(response.data.branch || []);
    } else {
      toast.error("Failed to fetch branches: " + response.data.message);
    }
  } catch (error) {
    toast.error(
      "Error fetching branches: " +
      (error.response?.data?.message || error.message)
    );
  }
};

  const getEmployeeList = async (objStatus = "") => {
    setNeedLoading(true);
    try {
      const endpoint = 'getEmployeeList';
      const response = await axios.post(`${config.apiBaseUrl}${endpoint}`, {
        userId: userId,
        user_typecode: user_typecode,
        viewAllForCS: user_typecode === 'CS',
        branch_id: objStatus?.branch_id || null,
        emp_id: objStatus?.employee_id || null

      });

      const result = response.data;
      if (response.status === 200) {
        const data = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
        setEmployeList(data.length > 0 ? data.filter(emp => (emp.isDeleted === 0 || emp.isDeleted === '0')) : []);
        setDelEmployeList(data.length > 0 ? data.filter(emp => (emp.isDeleted === 1 || emp.isDeleted === '1')) : []);

        setShowFilterModal(false);
      } else {
        toast.error("Failed to fetch employee list: " + (result?.message || 'Unknown error'));
      }
    } catch (error) {
      toast.error("Error fetching employee list: " + (error.response?.data?.message || error.message));
      setEmployeList([]);
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getDesignationList();
      getbranchs();
      getEmployeeList();
    }
  }, [user]);

  // Load button permissions using ancestor '/employee' menu row
  useEffect(() => {
    if (user && accessMenu) {
      const list = Array.isArray(accessMenu) ? accessMenu : (Array.isArray(accessMenu?.menuList) ? accessMenu.menuList : null);
      if (Array.isArray(list)) {
        const normalize = (p) => (p || '').split('?')[0].split('#')[0].replace(/\/+$/, '').toLowerCase();
        const foundMenu = list.find(item => normalize(item.path) === normalize('/employee')  && item.user_id === userId);
        
        if (foundMenu) {
          setButtonPermissions({
            search: foundMenu.search_btn === 1,
            add_new: (foundMenu.add_new_btn === 1) || (foundMenu.add_btn === 1),
            edit: foundMenu.edit_btn === 1,
            delete: foundMenu.delete_btn === 1,
            view: foundMenu.view_btn === 1,
            filter: foundMenu.filter_btn === 1,
            export: foundMenu.export_btn === 1,
          });
        } else {
          setButtonPermissions({});
        }
      } else {
        setButtonPermissions({});
      }
    }
  }, [user, accessMenu, pathname]);

  // Focus on designation select when modal opens
  useEffect(() => {
    if (showModal && designationSelectRef.current) {
      setTimeout(() => {
        if (designationSelectRef.current) {
          designationSelectRef.current.focus();
          setTimeout(() => {
            const selectInput = designationSelectRef.current?.querySelector('input');
            if (selectInput) {
              selectInput.focus();
            }
          }, 100);
        }
      }, 200); 
    }
  }, [showModal]);

  const AddEmployeeDetails = () => {
    if (!role) {
      toast.error("You need to select designation.");
      return;
    }

    setShowModal(false);
    navigate('/employee/list/add-edit', {
      state: { role, type: "Add" ,boptions}
    });
  };

  const editEmployeeDetails = (item) => {
    if (!item) {
      toast.error("No value found.");
      return;
    }

    navigate('/employee/list/add-edit', {
      state: { item, type: "Edit" }
    });
  };

  const [achievementsData, setAchievementsData] = useState([]);
  const [incentiveData, setIncentiveData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const visibleItems = showAll ? achievementsData : achievementsData.slice(0, 2);

  const fetchProfileData = async (userId, designation) => {
    if (!userId || !designation) return;

    setProfileLoading(true);
    try {
      const designationToUserTypeMap = {
        'Telecalling sales': 'TSL',
        'Telecalling class': 'TCL',
        'Branch head': 'BH',
        'Field Sales': 'FS',
        'Field sales': 'FS', // Handle lowercase variation
        'field sales': 'FS', // Handle all lowercase
        'Front office incharge': 'FOI',
        'Vaithiyar': 'VA',
        'Admin': 'AD',
        'Creative Services': 'CS',
        'Accountant': 'AC',
        'Distributor': 'DIS'
      };

      // Try exact match first, then try case-insensitive match
      let userTypeCode = designationToUserTypeMap[designation];
      if (!userTypeCode) {
        // Try case-insensitive matching
        const lowerDesignation = designation.toLowerCase();
        for (const [key, value] of Object.entries(designationToUserTypeMap)) {
          if (key.toLowerCase() === lowerDesignation) {
            userTypeCode = value;
            break;
          }
        }
      }

      // If still no match, try trimming whitespace and matching
      if (!userTypeCode) {
        const trimmedDesignation = designation.trim();
        userTypeCode = designationToUserTypeMap[trimmedDesignation];

        if (!userTypeCode) {
          // Try case-insensitive matching with trimmed designation
          const lowerTrimmedDesignation = trimmedDesignation.toLowerCase();
          for (const [key, value] of Object.entries(designationToUserTypeMap)) {
            if (key.toLowerCase() === lowerTrimmedDesignation) {
              userTypeCode = value;
              break;
            }
          }
        }
      }


      if (userTypeCode) {
        const profileResponse = await axios.post(`${config.apiBaseUrl}getProfileData`, {
          user_id: userId,
          user_typecode: userTypeCode
        });

        const { incentive, achievements,} = profileResponse.data.data;

        setIncentiveData(incentive);

        // Format achievements data to match UI expectations
        const formattedAchievements = achievements.map(item => ({
          amount: `₹ ${parseFloat(item.amount || 0).toLocaleString()}`,
          month: item.month,
          top_performer_name: item.top_performer_name || 'Star performer',
          top_performer_emp_id: item.top_performer_emp_id || ''
        }));
        setAchievementsData(formattedAchievements);
      } else {
        // Set default values for unsupported designations
        setIncentiveData({
          monthly_incentive: 0,
          total_incentive: 0,
          current_milestone: 0,
          monthly_target: 0
        });
        setAchievementsData([]);
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      // Set default values on error
      setIncentiveData({
        monthly_incentive: 0,
        total_incentive: 0,
        current_milestone: 0,
        monthly_target: 0
      });
      setAchievementsData([]);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOpenEmpData = async (item) => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}GetClientsCountList`, {
        user_id: item?.user_id
      });

      const result = response.data;
      if (response.status === 200) {
        setShowEmpDataPopup(true);
        setSelectedViewValue({
          ...item,
          bronze_count: result.data?.bronze_count ?? 0,
          gold_count: result.data?.gold_count ?? 0,
          silver_count: result.data?.silver_count ?? 0,
          total_count: result.data?.total_count ?? 0
        });

        // Fetch profile data for this employee
        if (item?.designation) {
          fetchProfileData(item.user_id, item.designation);
        }
      } else {
        toast.error("Failed to fetch client list: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching client list: " +
        (error.response?.data?.message || error.message)
      );
    }
  };

  const filteredList = currentList.filter((emp) =>
    `${emp.name} ${emp.designation} ${emp.email} ${emp.emp_id}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";

    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const confirmDeleteFunc = (item) => {
    setDelConfirmPopup(true);
    setSelectedViewValue(item);
  };

  const assignTaskToOther = async () => {
    setNeedLoading(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}assignTaskToOther`, {
        user_id: role.target.id, assign_id: selectedViewValue.user_id
      });

      const result = response.data;
      if (response.status === 200) {
        toast.success(`Leads successfully transferred to "${role.target.value}".`);

        setTimeout(() => {
          setNeedLoading(false);
          setAssignPopup(false);
          getDesignationList();
          getEmployeeList();
          setActiveDropdownId(null);
        }, 1000);

      } else {
        toast.error("Failed to fetch designation list: " + result.message);
        console.error("Failed to fetch designation list: " + result.message);
        setNeedLoading(false);
      }
    } catch (error) {
      setNeedLoading(false);
      toast.error("Error deleting : " + (error.response?.data?.message || error.message));
      console.error("Error deleting : " + (error.response?.data?.message || error.message));
    }
  };

  const assignWorkToOther = (item) => {
    const emp_record_id = item.user_id;

    setAssignPopup(true);
    setSelectedViewValue(item);

    const filteredEmpData = employeList
      .filter(emp => emp.user_id !== emp_record_id && emp?.usertype_id === item?.usertype_id)
      .map(emp => ({
        label: `${emp.emp_id} - ${emp.name}`,
        value: emp.name,
        id: emp.user_id,
        code: emp.emp_id
      }));

    setEmpDropData(filteredEmpData);
  };

  // Close Employee modals on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (showModal) {
          setShowModal(false);
          setIsAddButtonActive(false);
          return;
        }
        if (assignPopup) return setAssignPopup(false);
        if (delConfirmPopup) return setDelConfirmPopup(false);
        if (showEmpDataPopup) return setShowEmpDataPopup(false);
      }
    };
    if (showModal || assignPopup || delConfirmPopup || showEmpDataPopup) {
      window.addEventListener('keydown', handleEsc);
      window.addEventListener('keyup', handleEsc);
      return () => {
        window.removeEventListener('keydown', handleEsc);
        window.removeEventListener('keyup', handleEsc);
      };
    }
  }, [showModal, assignPopup, delConfirmPopup, showEmpDataPopup]);

  const handleDelete = async (item) => {
    setNeedLoading(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}deleteSelEmployee`, {
        emp_recid: item.user_id
      });

      const result = response.data;
      if (response.status === 200) {
        toast.success(`"${item.name}" successfully deleted.`);
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
          }).catch((err) => console.error("Graph update failed:", err));
        }
        setTimeout(() => {
          getDesignationList();
          getEmployeeList();
          setActiveDropdownId(null);
          setDelConfirmPopup(false);
          assignWorkToOther(item);
          setNeedLoading(false);
        }, 3000);

      } else {
        toast.error("Failed to fetch designation list: " + result.message);
        setNeedLoading(false);
      }
    } catch (error) {
      toast.error(
        "Error deleting : " +
        (error.response?.data?.message || error.message)
      );
      setNeedLoading(false);
    } 
  };

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    getEmployeeList(items);
  };

  const handleReset = () => {
    setSelectedFilters('');
    getEmployeeList();
    setActiveButton(null);
  };

  

const handleDownloadImg = async (imgUrl, fileName = "download.png") => {
  try {
    const response = await fetch(imgUrl);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Download failed:", error);
    toast.error("⚠️ Something went wrong while downloading the image");
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
      <div className='header-div-el'>
        <div className='header-divpart-el'>
          <p className='mb-0 header-titlecount-el'>Total Employee : {currentList && currentList.length ? currentList.length : 0}</p>
          <div className="d-flex align-items-center">
            <button onClick={() => {
              setShowModal(false);
              setIsAddButtonActive(false);
            }}>
              <p className='mb-0 nav-btn-top'>
                Employee &gt; List
              </p>
            </button>
          </div>
        </div>
        <div className="search-add-wrapper">
          {buttonPermissions.search && (
            <input
              type="text"
              placeholder="Search"
              className="search-input-up"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}

          {buttonPermissions.add_new && (
            <button
              className="add-newe-button"
              title={buttonPermissions.add_new ? "Add new" : "You dont have access"}
              onClick={() => {
                setShowModal(true);
                setIsAddButtonActive(true);
              }}
              disabled={!buttonPermissions.add_new}
            >
              Add new
            </button>
          )}

          {buttonPermissions.filter && user_typecode !== "BH" && (
            <div className='filter-container-up position-relative'>
              <button
                 className={`product-filter-btns ${activeButton === 'filter' ? 'active' : ''}`}
                onClick={() => { setShowFilterModal(true); setActiveButton('filter'); }}
                onMouseEnter={() => setIsFilterHover(true)}
                  onMouseLeave={() => setIsFilterHover(false)}
                   style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}
              >
                 <img src={filtericon} alt="img" style={{ filter: (activeButton === 'filter' || isFilterHover) ? 'invert(1) brightness(2)' : 'none' }} />
                                  <span style={{ marginLeft: 6, color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}>Filter</span>
              </button>

              {activeButton === 'filter' && (
                <button className='filter-clear-st' onClick={handleReset} >
                  &times;
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='phone-header-div-el'>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <div className="d-flex align-items-center">
            <button onClick={() => {
              setShowModal(false);
              setIsAddButtonActive(false);
            }}>
              <p className='mb-0 nav-btn-top'>
                Employee &gt; List
              </p>
            </button>
          </div>
          <p className='mb-0 header-titlecount-el'>
            Total Employee : {currentList?.length ?? 0}
          </p>
        </div>
        <div className="search-add-wrapper justify-content-end mb-3">
          {buttonPermissions.search && (
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
          {buttonPermissions.add_new && (
            <button
              className="add-newe-button"
              title={buttonPermissions.add_new ? "Add new" : "You dont have access"}
              onClick={() => {
                setShowModal(true);
                setIsAddButtonActive(true);
              }}
              disabled={!buttonPermissions.add_new}
            >
              Add new
            </button>
          )}
        </div>
      </div>

      <div className='body-div-el'>
            {user_typecode !== 'CS' && (
        <div className="status-toggle">
          <label htmlFor="status-active" className="custom-radio">
            <input
              type="radio"
              name="status"
              id="status-active"
              value="active"
              checked={status === "active"}
              onChange={(e) => setStatus(e.target.value)}
            />
            <span className="radio-button"></span>{' '}
            Active
          </label>
       
          <label htmlFor="status-inactive" className="custom-radio">
            <input
              type="radio"
              name="status"
              id="status-inactive"
              value="inactive"
              checked={status === "inactive"}
              onChange={(e) => setStatus(e.target.value)}
            />
            <span className="radio-button"></span>{' '}
            In-active
          </label>
       
        </div>
           )}
        {filteredList && filteredList.length > 0 ? (
          <div className="row current-item-el">
            {filteredList.map((item) => (
              <div key={item.emp_id} className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="p-4 h-100 item-box-el position-relative">
                  <button
                    type="button"
                    className="position-absolute top-0 start-0 end-0 bottom-0 w-100 h-100 border-0 bg-transparent"
                    onClick={!buttonPermissions.view ? undefined : () => handleOpenEmpData(item)}
                  />

                  {/* Dropdown menu */}
                  
                  <div className="dropdown position-absolute drop-dots" >
                      {user?.user_typecode !== "CS" && (
                       <>
                    {item.isDeleted === 0 && (buttonPermissions.edit || buttonPermissions.delete) && (
                      <button
                        className=""
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId((prev) =>
                            prev === item.emp_id ? null : item.emp_id
                          );
                        }}
                      >
                        <SvgContent svg_name="threedots" />
                      </button>
                    )}
                   </> 
                   )}

                    {item.isDeleted === 1 && item.isAssigned === 0 && (
                      <button style={{ padding: "3px 6px" }} onClick={()=>assignWorkToOther(item)} >
                        <SvgContent svg_name="info" stroke="#0B622F" />
                      </button>
                    )}
                
                 
                    {activeDropdownId === item.emp_id && (buttonPermissions.edit || buttonPermissions.delete) && (
                      <div className="editst-div-pp">
                        <div title={!buttonPermissions.edit ? "You don't have access" : "Edit"}>
                          <button
                            className="dropdown-item dropdown-item-st dropdown-item-edit"
                            title={!buttonPermissions.edit ? "You don't have access" : "Edit"}
                            onClick={() => editEmployeeDetails(item)}
                            disabled={!buttonPermissions.edit || isAdminItem(item)}
                          >
                            Edit
                          </button>
                        </div>
                        <div title={!buttonPermissions.delete ? "You don't have access" : "Delete"}>
                          <button
                            className="dropdown-item dropdown-item-st"
                            title={!buttonPermissions.delete ? "You don't have access" : "Delete"}
                            onClick={() => confirmDeleteFunc(item)}
                            disabled={!buttonPermissions.delete || isAdminItem(item)}
                          >
                            Delete
                          </button>
                        </div>     
                        <div>
                           <button className="dropdown-item dropdown-item-st" onClick={() => handleDownloadImg(item.image_url, "employee.png")}>
                            Download
                      </button>
                          </div>                  
                      </div>
                    )}
                  
                  </div>
                  {user?.user_typecode === "CS" && (
                  <div className="editst-div-pp-cs">
                     <button className="dropdown-item dropdown-item-st" onClick={() => handleDownloadImg(item.image_url, "employee.png")}>
                            Download
                      </button>
                  </div>
                  )}

                  {/* Header section */}
                  <div className="d-flex justify-content-start align-items-start gap-3 head-item-box">
                    <div className={
                      item.isDeleted === 0
                        ? "emp-img-st aimg-emp-el"
                        : "emp-img-st dimg-emp-el"
                    }>
                      <img
                        src={item.image_url}
                        alt="emp_img"
                        className="img-emp-el"
                      />
                    </div>
                    <div className="mt-2" style={{ lineHeight: "25px" }}>
                      <div className="fw-bold">{item.emp_id}</div>
                      <div>{item.name}</div>
                      <div>{item.designation}</div>
                    </div>
                  </div>

                  {/* Label box section */}
                  <div className="w-100 h-100 display-flex gap-3 mt-3">
                    <div className="w-100 h-100 box-label-el mt-3">
                      <div className="d-flex">
                        <label htmlFor={`doj-${item.emp_id}`} className="me-2 fw-medium" style={{ minWidth: "62px" }}>
                          DOJ:
                        </label>
                        <span id={`doj-${item.emp_id}`}>{formatDateTime(item.date_of_joining)}</span>
                      </div>                     
                     {user_typecode !== 'CS' && (
                      <>
                      <div className="d-flex">
                        <label htmlFor={`mobile-${item.emp_id}`} className="me-2 fw-medium" style={{ minWidth: "62px" }}>
                          Mobile:
                        </label>
                        <span id={`mobile-${item.emp_id}`}>{item.mobile_number}</span>
                      </div>
                      <div className="d-flex">
                        <label htmlFor={`email-${item.emp_id}`} className="me-2 fw-medium" style={{ minWidth: "62px" }}>
                          Email:
                        </label>
                        <span id={`email-${item.emp_id}`}>{item.email}</span>
                      </div>
                      </>
                     )}
                      {user_typecode == 'CS' && (
                      <div className="d-flex">
                        <label htmlFor={`mobile-${item.emp_id}`} className="me-2 fw-medium" style={{ minWidth: "62px" }}>
                        WEDDING DATE:
                        </label>
                        <span id={`mobile-${item.emp_id}`}>{formatDateTime(item.wed_date)}</span>
                      </div>
                      
                     )}
                       <div className="d-flex">
                        <label htmlFor={`doj-${item.emp_id}`} className="me-2 fw-medium" style={{ minWidth: "62px" }}>
                          DOB:
                        </label>
                        <span id={`doj-${item.emp_id}`}>{formatDateTime(item.date_of_birth )}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-100 inner-body-st">
            <p className="product-no-items-txt">No records found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay modal-overlay-position">
          <div className="modal-container">
            <div className="modal-header">
              <h5 className="mb-0 add-new-hdr">Add new employee</h5>
            </div>
            <div className="modal-body">
                <div className="container commonst-select">
                <h6>Select Branch</h6>
                <div className="comm-select-wd">
                  <div style={{ outline: 'none' }}                  >
                    <CommonSelect
                      header="Select branch"
                      name="role"
                      value={boptions}
                      onChange={setBoptions}
                      options={branchOption}
                    />
                  </div>
                </div>
              </div>      
              <div className="container commonst-select pt-3">
                <h6>Select Designation</h6>
                <div className="comm-select-wd">
                  <div
                    ref={designationSelectRef}
                    onFocus={() => {
                      setTimeout(() => {
                        const selectInput = designationSelectRef.current?.querySelector('input');
                        if (selectInput) {
                          selectInput.focus();
                        }
                      }, 50);
                    }}
                    style={{ outline: 'none' }}
                  >
                    <CommonSelect
                      header="Select designation"
                      name="role"
                      value={role}
                      onChange={setRole}
                      options={
                        user_typecode === "AD"
                          ? roleOptions.filter(
                              (item) =>
                                ["Accounts", "Dispatch", "Branch head"].some((allowed) =>
                                  item.label?.toLowerCase().includes(allowed.toLowerCase())
                                )
                            )
                          : user_typecode === "BH"
                          ? roleOptions.filter(
                              (item) =>
                                ![ "Accounts", "Dispatch", "Branch head"].some((hide) =>
                                  item.label?.toLowerCase().includes(hide.toLowerCase())
                                )
                            )
                          : roleOptions
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setShowModal(false);
                  setIsAddButtonActive(false);
                }}
              >
                Cancel
              </button>
              <button
                className="next-button"
                onClick={AddEmployeeDetails}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {assignPopup && (
        <div className="modal-overlay modal-overlay-position">
          <div className="modal-container">
            <div className="modal-header">
              <h5 className="mb-0 add-new-hdr">In-active data transfer</h5>
            </div>
            <div className="modal-body">
              <div className="container commonst-select">
                <h6>Select Employee</h6>
                <div className="comm-select-wd">
                  <CommonSelect
                    header="Select employee"
                    placeholder="Select employee"
                    name="role"
                    value={role}
                    onChange={setRole}
                    options={empDropData}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setAssignPopup(false)}>Cancel</button>
              <button className="next-button" onClick={assignTaskToOther} >Assign</button>
            </div>
          </div>
        </div>
      )}

      {delConfirmPopup && (
        <div className="modal-overlay modal-overlay-position">
          <div className="modal-container">
            <div className="modal-header mb-3">
              <h5 className="mb-0 add-new-hdr">Confirm to delete</h5>
            </div>
            <div className="modal-body mb-2">
              <div className="container commonst-select">
                <p>Are you sure to delete this "{selectedViewValue.emp_id} - {selectedViewValue.name}"?</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setDelConfirmPopup(false)}>Cancel</button>
              <button className="next-button" onClick={() => handleDelete(selectedViewValue)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showEmpDataPopup && (
        <div className="modal-overlay">
          <div className="modal-container modal-container-ev">
            <div className="modal-body modal-body-ev d-flex">
              <div className="col-5 h-100 left-view-emp">
                <div className="left-head-empview display-flex">
                  <img src={selectedViewValue.image_url} className={selectedViewValue.isDeleted === 1 ? "img-src-empdata img-src-dan-empdata" : "img-src-empdata img-src-act-empdata"} alt="emp data" />
                </div>
                <div className="left-body-empview">
                  <div className="w-100 h-100 left-corner-st">
                    <div className="d-flex mb-3" >
                      <label htmlFor={`doj-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>Emp ID:</label>
                      <span className="fw-500" id={`doj-${selectedViewValue.emp_id}`}>{selectedViewValue.emp_id}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`doj-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}> Employee Name:</label>
                      <span id={`doj-${selectedViewValue.emp_id}`}>{selectedViewValue.name}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`doj-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>Designation:</label>
                      <span id={`doj-${selectedViewValue.emp_id}`}>{selectedViewValue.designation}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`doj-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>Mobile:</label>
                      <span id={`doj-${selectedViewValue.emp_id}`}>{selectedViewValue.mobile_number}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`doj-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>Email:</label>
                      <span id={`doj-${selectedViewValue.emp_id}`}>{selectedViewValue.email}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`mobile-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>Date Of Joining:</label>
                      <span id={`mobile-${selectedViewValue.emp_id}`}>{formatDateTime(selectedViewValue.date_of_joining)}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`email-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>Salary:</label>
                      <span id={`email-${selectedViewValue.emp_id}`}>₹&nbsp;{selectedViewValue.salary}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`email-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>Incentive:</label>
                      <span id={`email-${selectedViewValue.emp_id}`}>{selectedViewValue.incentive_percentage}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`email-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>Address:</label>
                      <span id={`email-${selectedViewValue.emp_id}`}>{selectedViewValue.address}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`email-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>Total clients:</label>
                      <span id={`email-${selectedViewValue.emp_id}`}>{selectedViewValue.total_count}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`email-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>
                        <img src={gold} alt="gold" style={{ width: "18px", marginRight: "6px" }} />
                        Gold:
                      </label>
                      <span id={`email-${selectedViewValue.emp_id}`}>{selectedViewValue.gold_count}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`email-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>
                        <img src={silver} alt="silver" style={{ width: "18px", marginRight: "6px" }} />
                        Silver:
                      </label>
                      <span id={`email-${selectedViewValue.emp_id}`}>{selectedViewValue.silver_count}</span>
                    </div>
                    <div className="d-flex mb-3">
                      <label htmlFor={`email-${selectedViewValue.emp_id}`} className="me-2 fw-700" style={{ minWidth: "152px" }}>
                        <img src={bronze} alt="bronze" style={{ width: "18px", marginRight: "6px" }} />
                        Bronze:
                      </label>
                      <span id={`email-${selectedViewValue.emp_id}`}>{selectedViewValue.bronze_count}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-7 h-100">
                <div className="right-head-empview">
                  <button onClick={() => { setShowEmpDataPopup(false); setShowAll(false); }}>
                    <SvgContent svg_name="close" width="28" height="28" />
                  </button>
                </div>
                <div className="right-body-empview">
                  {/* Incentive Earned */}
                  <section>
                    <h5 className="text-2xl font-semibold mb-3">Incentive earned</h5>
                    {profileLoading ? (
                      <div className="text-center py-8">
                        <div className="text-gray-600">Loading performance data...</div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4 common-col-st p-6">
                        <div className="flex-1 text-center">
                          <h5 className="text-2xl font-semibold">
                            ₹ {incentiveData?.monthly_incentive?.toLocaleString() || '0'}
                          </h5>
                          <div className="text-gray-600 mt-1">Monthly Incentive earned</div>
                        </div>
                        <div className="flex-1 text-center">
                          <h5 className="text-2xl font-semibold">
                            ₹ {incentiveData?.total_incentive?.toLocaleString() || '0'}
                          </h5>
                          <div className="text-gray-600 mt-1">Total incentive earned</div>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Milestone */}
                  <section>
                    <h5 className="text-2xl font-semibold mb-3">Mile stone</h5>
                    {profileLoading ? (
                      <div className="text-center py-8">
                        <div className="text-gray-600">Loading milestone data...</div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center common-col-st p-6 text-center">
                        <div className="flex-1">
                          <h5 className="text-2xl font-semibold">
                            ₹ {incentiveData?.current_milestone?.toLocaleString() || '0'}
                          </h5>
                          <div className="text-gray-600 mt-1">Current milestone</div>
                        </div>
                        <div className="h-10 w-px bg-gray-300 mx-6"></div>
                        <div className="flex-1">
                          <h5 className="text-2xl font-semibold">
                            ₹ {incentiveData?.monthly_target?.toLocaleString() || '0'}
                          </h5>
                          <div className="text-gray-600 mt-1">Monthly target</div>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Achievements */}
                  <section>
                    <h5 className="text-2xl font-semibold mb-3">Achievements</h5>
                    {profileLoading ? (
                      <div className="text-center py-8">
                        <div className="text-gray-600">Loading achievements...</div>
                      </div>
                    ) : visibleItems.length > 0 ? (
                      <div className="flex justify-between items-center common-col-st p-6 text-center ">
                        {visibleItems.map((item, index) => (
                          <div
                            key={item.month}
                            className="text-center min-w-[160px] flex-shrink-0 col-4"
                          >
                            <div className="text-gray-600 text-sm">{item.top_performer_name}</div>
                            <h5 className="text-2xl font-semibold mt-1">{item.amount}</h5>
                            <div className="text-gray-600 text-sm mt-1">{item.month}</div>
                          </div>
                        ))}

                        {!showAll && visibleItems.length > 2 && (
                          <button
                            className="cursor-pointer fw-500 color-default"
                            onClick={() => setShowAll(true)}
                          >
                            View all
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full text-center">
                        <div className="text-gray-600">No achievements data available</div>
                      </div>
                    )}

                    {/* Refresh button in right bottom corner */}
                    <div className="d-flex justify-content-end mt-3">
                      <button
                        className="next-button"
                        onClick={() => fetchProfileData(selectedViewValue?.user_id, selectedViewValue?.designation)}
                        disabled={profileLoading}
                      >
                        {profileLoading ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>
                  </section>
                </div>
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

      {showFilterModal && (
        <FilterModal onFilterData={onFilterDataFunc} selectedFilters={selectedFilters}
          onClose={() => { setShowFilterModal(false); setActiveButton(null); }}
        />
      )}
    </div>
  );
}

export default EmployeeList;
