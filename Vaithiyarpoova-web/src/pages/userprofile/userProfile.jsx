import React, { useEffect, useState } from 'react';
import '../../assets/styles/user-profile.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import filtericon from '../../assets/images/filtericon.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import configModule from '../../../config.js';
import SvgContent from '../../components/svgcontent.jsx';
import Pagination from "../../components/Pagination/index.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import UploadModal from './upload-userprofile.jsx';
import { PropagateLoader } from 'react-spinners';
import { Select, MenuItem, InputLabel, FormControl, Chip, Box } from "@mui/material";
import FilterModal from "../../components/filter-modal.jsx";
import { useLocation } from 'react-router-dom';

function UserProfile() {
  const { user, accessMenu } = useAuth();
  const user_typecode = user?.user_typecode;
  const userId = user?.userId;
  const [needLoading, setNeedLoading] = useState(false);
  const [leadDetails, setLeadDetails] = useState([]);
  const [shuffleLeads, setShuffleLeads] = useState(false);
  const [leadCount, setLeadCount] = useState('');
  const [shuffledEmp, setShuffledEmp] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [employeeID, setEmployeeID] = useState([]);
  const [isFilterHover, setIsFilterHover] = useState(false);
  const [nILeadDetails, setNILeadDetails] = useState([]);
  const config = configModule.config();
  const [status, setStatus] = useState("active");
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const isActive = status === "active";
  const [activeButton, setActiveButton] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState('');

  // Button permission states
  const [buttonPermissions, setButtonPermissions] = useState({});

  // Get current location and menu
  const location = useLocation();
  const pathname = location?.pathname;

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setShowFilterModal(false);
        setActiveButton(null);
        setIsFilterHover(false);
      }
    };
    if (showFilterModal) {
      document.addEventListener('keydown', onEsc);
    }
    return () => document.removeEventListener('keydown', onEsc);
  }, [showFilterModal]);

  const getPageDetails = async (objStatus = '') => {
    setNeedLoading(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}getAllLeadDetails`, {
        startDate: objStatus?.startDate || '',
        endDate: objStatus?.endDate || '',
        disposition: objStatus?.disposition || '',
        employee_id: objStatus?.employee_id || null,
        branch_id: objStatus?.branch_id || null,
        id: user_typecode !== "AD" ? userId : null, 
        country: objStatus?.country || null, 
        state: objStatus?.state || null,
        district: objStatus?.district || null
      });

      const result = response.data;

      if (response.status === 200) {
        const objNIData = result?.leads?.length > 0 ? result.leads.filter(itm => itm.disposition === "Not interested") : [];
        setLeadDetails(result?.leads?.length > 0 ? result.leads.filter(itm => itm.disposition !== "Not interested") : []);
        setNILeadDetails(objNIData || []);
        setShowFilterModal(false);

        // FOR SHUFFLE


        const teleUsers = result?.users
          .map(user => ({
            value: user.name,
            label: user.name,
            id: user.user_id,
            code: user.emp_id
          }));

        setShuffledEmp(teleUsers);



      } else {
        toast.error("Failed to fetch designation list: " + result.message);
      }
    } catch (error) {
      setLeadDetails([]);
      setNeedLoading(false);
      toast.error("Error fetching designation list: " + (error.response?.data?.message || error.message));
    } finally {
      setNeedLoading(false);
    }
  };

  // Load user permissions
  useEffect(() => {
    if (user && accessMenu) {
      if (Array.isArray(accessMenu)) {
        const foundMenu = accessMenu.find(item => item.path === pathname && item.user_id === userId);

        if (foundMenu) {
          const permissions = {
            active: foundMenu.active_btn === 1,
            inactive: foundMenu.inactive_btn === 1,
            search: foundMenu.search_btn === 1,
            sort: foundMenu.sort_btn === 1,
            filter: foundMenu.filter_btn === 1,
            upload: foundMenu.upload_btn === 1,
            shuffle: foundMenu.suffle_btn === 1
          };

          setButtonPermissions(permissions);
          if (permissions.active && !permissions.inactive) {
            setStatus("active");
          } else if (permissions.inactive && !permissions.active) {
            setStatus("inactive");
          }
        } else {
          setButtonPermissions({});
        }
      } else {
        setButtonPermissions({});
      }
    }
  }, [user, accessMenu, pathname]);

  useEffect(() => {
    if (user) {
      getPageDetails();
    }
  }, [user, status]);

  const formatDateTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const allLeads = isActive ? leadDetails : nILeadDetails;

  const filteredLeads = allLeads.filter((item) => {
    const matchSearch = `${item.lead_id} ${item.flead_id} ${item.lead_name} ${item.flead_name} ${item.mobile_number} ${item.category} ${item.created_by} ${item.created_at} ${item.disposition} ${item.disposition_date}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const itemDate = new Date(item.created_at);
    const matchDate =
      (!startDate || itemDate >= new Date(startDate.setHours(0, 0, 0, 0))) &&
      (!endDate || itemDate <= new Date(endDate.setHours(23, 59, 59, 999)));

    return matchSearch && matchDate;
  });

  const indexOfLastLeads = currentPage * itemsPerPage;
  const indexOfFirstLeads = indexOfLastLeads - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLeads, indexOfLastLeads);

  const handleSortClick = () => {
    setShowDateFilter(!showDateFilter);
    setActiveButton(showDateFilter ? null : 'sort');
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
    setActiveButton('upload');
  };

  const handleUploadClose = () => {
    setShowUploadModal(false);
    setActiveButton(null);
  };

  const handleEmployeeChange = (event, child) => {
   setEmployee(event.target.value);
   setEmployeeID((prev) => [...prev, child.props["data-id"]]);
  };

  const handleLeadCountChange = (event) => {
     setLeadCount(event.target.value);
  };

  const handleRemoveEmployee = (value) => {
    setEmployee((prev) => prev.filter((item) => item !== value));
  };

  const handleShuffleSave = async () => {
    if (!employeeID || employeeID.length === 0 || !leadCount) {
      toast.error("All columns are required");
      return;
    }

    const payload = {
      employeeID: employeeID,
      leadCount: leadCount,
      user_id : user?.userId,    
    };
      try {
        const response = await axios.post(`${config.apiBaseUrl}shuffleLeads`, payload);

        const msg = response.data?.message || "";

        if (msg.toLowerCase().includes("no leads")) {
          toast.error(msg);
        } else {
          toast.success(msg || "Leads shuffled successfully",{ autoClose: 500 }) ;
        }
        setShuffleLeads(false);
        setEmployeeID([]);
        setEmployee([]);
        getPageDetails();
        setLeadCount("");
      } catch (err) {
        console.error(err);
        toast.error("Failed to shuffle leads");
      }
  };

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    getPageDetails(items);
  };

  const handleReset = () => {
    setSelectedFilters('');
    getPageDetails();
    setActiveButton(null);
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
        <div className='header-divpart-el gap-2'>
          <p className='mb-0 header-titlecount-el'>Total user profiles : {allLeads?.length || 0}</p>
          <div className="status-toggle-up">
            {buttonPermissions.active && (
              <label htmlFor="status-active" className="custom-radio">
                <input
                  type="radio"
                  name="status"
                  id="status-active"
                  value="active"
                  checked={status === "active"}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <span className="radio-button"></span> Active
              </label>
            )}

            {buttonPermissions.inactive && (
              <label htmlFor="status-inactive" className="custom-radio">
                <input
                  type="radio"
                  name="status"
                  id="status-inactive"
                  value="inactive"
                  checked={status === "inactive"}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <span className="radio-button"></span> In-active
              </label>
            )}
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
          {status === "active" ? (
            <>
              {showDateFilter && (
                <div className="date-filter-popup">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="Start Date"
                    className="form-control form-btncontrol-up mb-2"
                  />
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    placeholderText="End Date"
                    className="form-control form-btncontrol-up mb-3"
                  />
                  <button
                    className="btn btn-sm btn-primary w-100 apply-filter-st"
                    onClick={() => {
                      setCurrentPage(1);
                      setShowDateFilter(false);
                      setActiveButton(null);
                    }}
                  >
                    Apply Filter
                  </button>
                </div>
              )}
              {buttonPermissions.filter && (
                <div className='position-relative'>
                  <div className="filter-container-up">
                    <button
                       className={`product-filter-btns ${activeButton === 'filter' ? 'active' : ''}`}
                      onClick={() => { setShowFilterModal(true); setActiveButton('filter'); }}
                       onMouseEnter={() => setIsFilterHover(true)}
                        onMouseLeave={() => setIsFilterHover(false)}
                    >
                      <img src={filtericon} alt="img" style={{ filter: (activeButton === 'filter' || isFilterHover) ? 'invert(1) brightness(2)' : 'none' }} />
                       <span style={{ marginLeft: 6, color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}>Filter</span>
                    </button>
                  </div>

                  {activeButton === 'filter' && (
                    <button className='filter-clear-st' onClick={handleReset} >
                      &times;
                    </button>
                  )}
                </div>
              )}
              {buttonPermissions.upload && (
                <button
                  className={`btn-top-up ${activeButton === 'upload' ? 'active' : ''}`}
                  onClick={handleUploadClick}
                >
                  <SvgContent svg_name="btn_upload" width={20} height={20} />
                  <span className='visible-label-up'>Upload</span>
                </button>
              )}

              <UploadModal
                show={showUploadModal}
                onClose={handleUploadClose}
                onUpload={(file) => {
                  handleUploadClose();
                }}
              />
            </>
          ) : (
            <>
              {buttonPermissions.shuffle && (
                <div className="filter-container-up">
                  <button className="btn-top-up" onClick={() => setShuffleLeads(true)}>
                    <SvgContent svg_name="suffle" />
                    <span className="visible-label-up">Shuffle</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className='phone-header-div-el'>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <p className='mb-0 header-titlecount-el'>Total user profiles : {allLeads?.length || 0}</p>
          <div className='d-flex gap-2'>
            {buttonPermissions.sort && (
              <button className="btn-top-up" onClick={handleSortClick}>
                <SvgContent svg_name="btn_calendar" width={20} height={20} />
              </button>
            )}
            {buttonPermissions.filter && (
              <button className="btn-top-up" onClick={() => { setShowFilterModal(true); setActiveButton('filter'); }}>
                <SvgContent svg_name="btn_filter" width={20} height={20} />
              </button>
            )}
            {buttonPermissions.upload && (
              <button className="btn-top-up" onClick={handleUploadClick}>
                <SvgContent svg_name="btn_upload" width={20} height={20} />
              </button>
            )}
          </div>
        </div>

        <div className="search-add-wrapper justify-content-between mb-3">
          <div className="status-toggle-up">
            {buttonPermissions.active && (
              <label htmlFor="status-active-mobile" className="custom-radio">
                <input
                  type="radio"
                  name="mbstatus"
                  id="status-active-mobile"
                  value="active"
                  checked={status === "active"}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <span className="radio-button"></span> Active : 920
              </label>
            )}

            {buttonPermissions.inactive && (
              <label htmlFor="status-inactive-mobile" className="custom-radio">
                <input
                  type="radio"
                  name="mbstatus"
                  id="status-inactive-mobile"
                  value="inactive"
                  checked={status === "inactive"}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <span className="radio-button"></span> In-active : 130
              </label>
            )}
          </div>
          {buttonPermissions.search && (
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className='body-div-el'>
        <div className='w-100 p-2 d-flex justify-content-center align-items-center' style={{ height: "calc(100% - 48px)" }}>
          {currentLeads.length > 0 ? (
            <div className='table-userpro-up w-100 h-100 overflow-auto'>
              <div className='table-head-up d-flex'>
                <div className='w-10 p-2 d-flex justify-content-center align-items-center'>S.No</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-14 p-2 d-flex justify-content-center align-items-center'>Cus ID</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-14 p-2 d-flex justify-content-center align-items-center'>Name</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Mobile</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Date</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-14 p-2 d-flex justify-content-center align-items-center'>Handled by</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Disposition</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Entry Date</div>
              </div>
              <div className='table-body-up d-flex'>
                {currentLeads.map((lead, index) => (
                  <div className='table-bodydiv-up' key={lead.lead_recid || lead.flead_recid}>
                    <div className='w-10 p-2 d-flex justify-content-center text-center align-items-center'>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </div>
                    <div className='w-14 p-2 d-flex justify-content-center text-center align-items-center'>
                      {lead.lead_id ? lead.lead_id : lead.flead_id}
                    </div>
                    <div className='w-14 p-2 d-flex justify-content-center text-center align-items-center'>
                      {lead.lead_name ? lead.lead_name : lead.flead_name}
                    </div>
                    <div className='w-12 p-2 d-flex justify-content-center text-center align-items-center'>
                      {lead.mobile_number}
                    </div>
                    <div className='w-12 p-2 d-flex justify-content-center text-center align-items-center'>
                      {lead.created_at ? formatDateTime(lead.created_at) : ''}
                    </div>
                    <div className='w-14 p-2 d-flex justify-content-center text-center align-items-center'>
                      {lead.name}
                    </div>
                    <div className='w-12 p-2 d-flex justify-content-center text-center align-items-center'>
                      {lead.disposition}
                    </div>
                    <div className='w-12 p-2 d-flex justify-content-center text-center align-items-center'>
                      {lead.disposition_date ? formatDateTime(lead.disposition_date) : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>No data found</div>
          )}
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
            count={filteredLeads.length}
            page={currentPage}
            pageSize={itemsPerPage}
            onChange={(pageNo) => setCurrentPage(pageNo)}
          />
        </div>
      </div>

      {shuffleLeads && (
        <div className='salespp-open-st'>
          <div className='salespp-container-st' style={{ minWidth: "382px" }}>
            <div className='d-flex gap-2 justify-content-between align-items-center mb-3'>
              <h5 className='mb-0'>Shuffle leads</h5>
              <span className="consult_close-button" style={{ fontSize: "28px" }} onClick={() => setShuffleLeads(false)}>×</span>
            </div>
            <div className='salespp-body-st w-100'>

              <div className="container commonst-select mb-3">
                <h6>Select Employee</h6>
                <div className="comm-select-shuf">
                  <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel id="multi-select-label">Select employee</InputLabel>
                    <Select
                      labelId="multi-select-label"
                      multiple
                      value={employee}
                      onChange={handleEmployeeChange}
                      label="Select employee"
                      renderValue={(selected = []) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              onMouseDown={(e) => e.stopPropagation()}
                              onDelete={() => handleRemoveEmployee(value)}
                            />
                          ))}
                        </Box>
                      )}
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid green',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid green',
                        }
                      }}
                    >
                      {shuffledEmp.map((option) => (
                        <MenuItem key={option.id} value={option.label} data-id={option.id}  >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>

              <div className="container commonst-select mb-3">
                <h6>Enter Lead Count</h6>
                <div className="comm-select-shuf">
                  <input
                    type="text"
                    name="leadcount"
                    className="form-control location-ip-br"
                    placeholder="Enter lead count"
                    value={leadCount}
                    onChange={handleLeadCountChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className='d-flex gap-2 mt-4 pt-2 justify-content-end align-items-center'>
              <button className='can-shuffle-st' onClick={() => setShuffleLeads(false)}>
                Cancel
              </button>
              <button className='can-shuffle-st bgsave-shuffle-st' onClick={handleShuffleSave}>
                Assign
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

export default UserProfile;
