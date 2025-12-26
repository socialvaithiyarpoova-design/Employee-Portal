import React, { useState, useEffect, useRef } from 'react';
import { PropagateLoader } from 'react-spinners';
import '../../assets/styles/branches.css';
import '../../assets/styles/user-profile.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { useLocation ,useNavigate} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import configModule from '../../../config.js';
import Pagination from "../../components/Pagination/index.jsx";
import SvgContent from '../../components/svgcontent.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import FilterModal from '../../components/filter-modal.jsx';
import filtericon from '../../assets/images/filtericon.svg';

function EmployeeAttendance() {
  const [userAttendanceDataList, setUserAttendanceDataList] = useState([]);
  const [needLoading, setNeedLoading] = useState(false);
  const { user, accessMenu } = useAuth();
  const user_typecode = user?.user_typecode;
  const userId = user?.userId;
  const navigate = useNavigate();
  const config = configModule.config();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isFilterHover, setIsFilterHover] = useState(false);
  const [buttonPermissions, setButtonPermissions] = useState({});
  const location = useLocation();
  const pathname = location?.pathname;
  const [selectedFilters, setSelectedFilters] = useState('');
  

  useEffect(() => {
    if (user) {
      const list = Array.isArray(accessMenu) ? accessMenu : (Array.isArray(accessMenu?.menuList) ? accessMenu.menuList : null);
      if (Array.isArray(list)) {
        const normalize = (p) => (p || '').split('?')[0].split('#')[0].replace(/\/+$/, '').toLowerCase();
        const foundMenu = list.find(item => normalize(item.path) === normalize('/employee') && item.user_id === userId);
        
        if (foundMenu) {
          setButtonPermissions({
            page_access: foundMenu.attendance_btn === 1,
            search: foundMenu.search_btn === 1,
            sort: foundMenu.sort_btn === 1,
            filter: foundMenu.filter_btn === 1,
            export: foundMenu.export_btn === 1,
          });
        } else {
          setButtonPermissions({});
        }
      }
    }
  }, [user, accessMenu, pathname]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setShowFilterModal(false);
        setActiveButton(null);
      }
    };
    if (showFilterModal) {
      document.addEventListener('keydown', onEsc);
    }
    return () => document.removeEventListener('keydown', onEsc);
  }, [showFilterModal]);

  const getUserAttendanceData = async (objStatus = '') => {
    setNeedLoading(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}getUserAttendanceData`, {
        user_typecode: user_typecode || "",
        startDate: objStatus?.startDate || '',
        endDate: objStatus?.endDate || '',
        status: objStatus?.status || '',
        branch_id: objStatus?.branch_id || null,
        id: userId || -1
      });

      const result = response.data;
      if (response.status === 200) {
        setUserAttendanceDataList(result.data);
        setShowFilterModal(false);
      } else {
        toast.error("Failed to fetch userAttendance details: " + result.message);
        console.error("Failed to fetch userAttendance details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching attendance details: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getUserAttendanceData();
    }
  }, [user]);

  // Ensure initial state is correct
  useEffect(() => {
    // Reset any active button state on component mount
    setActiveButton(null);
    setShowDropdown(false);
    setShowDateFilter(false);
  }, []);

  // Reset active button when date filter is closed
  useEffect(() => {
    if (!showDateFilter && activeButton === 'sort') {
      setActiveButton(null);
    }
  }, [showDateFilter, activeButton]);

  // Keep active state for modal-based filter; dropdown not used here
  useEffect(() => {
    // no-op: preserve activeButton when modal is open
  }, [showDropdown, activeButton]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.filter-container-up')) {
        closeFilterDropdown();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLastUserAttendance = currentPage * itemsPerPage;
  const indexOfFirstUserAttendance = indexOfLastUserAttendance - itemsPerPage;
  const safeList = Array.isArray(userAttendanceDataList) ? userAttendanceDataList : [];
  const paginatedUserAttendancees = safeList.slice(indexOfFirstUserAttendance, indexOfLastUserAttendance);

  const currentUserAttendancees = paginatedUserAttendancees.filter((item) =>
    `${item.attendance_id} ${item.emp_id} ${item.emp_name} ${item.designation} ${item.work_type} ${item.status}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const closeFilterDropdown = () => {
    setShowDropdown(false);
    setActiveButton(null);
  };

  const options = ['Present', 'Late', 'Leave', 'Permission', 'Absent'];

  const addHoursMinutes = (input, hoursToAdd, minutesToAdd) => {
    const date = new Date(input);
    date.setHours(date.getHours() + hoursToAdd);
    date.setMinutes(date.getMinutes() + minutesToAdd);
    return date;
  };

  const formatDateTime = (date) => {
    let day = String(date.getDate()).padStart(2, "0");
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let year = date.getFullYear();

    let hours = date.getHours();
    let minutes = String(date.getMinutes()).padStart(2, "0");
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

  const formatDateTimeOff = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return new Intl.DateTimeFormat('en-GB', options).format(date).replace(',', '');
  };

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    getUserAttendanceData(items);
  };

  const handleReset = () => {
    setSelectedFilters('');
    getUserAttendanceData();
    setActiveButton(null);
  };


  return (
    <div className='common-body-st'>
      <ToastContainer/>
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
          <p className='mb-0 header-titlecount-el'>Attendance Report : {currentUserAttendancees.length || 0}</p>
          <div className="d-flex align-items-center">
            <button onClick={() => { navigate("/employee/list") }}>
              <p className='mb-0 nav-btn-top'>
                Employee &gt; Attendance
              </p>
            </button>
          </div>
        </div>
        <div className="search-add-wrapper">
          {buttonPermissions.search && (
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              style={{ padding: "7px 12px" }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
          
          {buttonPermissions.filter && (
            <div className="filter-container-up">
              <button
                  className={`product-filter-btns ${activeButton === 'filter' ? 'active' : ''}`}
                onClick={() => { setShowFilterModal(true); setActiveButton('filter'); }}
                onMouseEnter={() => setIsFilterHover(true)}
                onMouseLeave={() => setIsFilterHover(false)}
                style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}
              >
                <SvgContent svg_name="btn_filter" stroke={(activeButton === 'filter' || isFilterHover) ? 'white' : '#0B9346'} width={20} height={20} />
                <span className="visible-label-up" style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}>Filter</span>
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
      <div className='body-div-el'>
        <div className='h-100 w-100 p-2 pb-0'>
          <div className='table-common-st'>
            <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
              <div className='brcommon-col-st w-10'>
                S no
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-13'>
                Emp ID
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-18'>
                Emp Name
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Designation
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Working hours
              </div> <span style={{ color: "#129347" }}> | </span>
              {/* <div className='brcommon-col-st w-10'>
                Work type
              </div> <span style={{ color: "#129347" }}> | </span> */}
              <div className='brcommon-col-st w-12'>
                Login
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-12'>
                Logoff
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Status
              </div> <span style={{ color: "#129347" }}> | </span>
            </div>

            <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
              {currentUserAttendancees && currentUserAttendancees.length > 0 ? (currentUserAttendancees.map((item, index) => (
                <div className='display-flex br-rowst' key={item.attendance_id}>
                  <div className='brcommon-col-st w-10'>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </div>
                  <div className='brcommon-col-st w-13'>
                    {item.emp_id}
                  </div>
                  <div className='brcommon-col-st w-18'>
                    {item.emp_name}
                  </div>
                  <div className='brcommon-col-st w-15'>
                    {item.designation}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {item.duration}
                  </div>
                  {/* <div className='brcommon-col-st w-10'>
                    {item.work_type}
                  </div> */}
                  <div className='brcommon-col-st w-12'>
                    {item.login_time ? formatDateTime(addHoursMinutes(item.login_time, 5, 30)) : null}
                  </div>
                  <div className='brcommon-col-st w-12'>
                    {item.logoff_time ? formatDateTimeOff(item.logoff_time) : null}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {item.status}
                  </div>
                </div>
              ))) : (
                <div className='tb-nodata-row-st display-flex'>
                  No Attendance list
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
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </label>
            <Pagination
              count={(Array.isArray(userAttendanceDataList) ? userAttendanceDataList : []).length}
              page={currentPage}
              pageSize={itemsPerPage}
              onChange={(pageNo) => setCurrentPage(pageNo)}
            />
          </div>
        </div>
      </div>

      {showFilterModal && (
        <FilterModal onFilterData={onFilterDataFunc} selectedFilters={selectedFilters}
          onClose={() => { setShowFilterModal(false); setActiveButton(null); }}
        />
      )}
    </div>
  );
}

export default EmployeeAttendance;
