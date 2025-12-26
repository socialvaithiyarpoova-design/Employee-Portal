import React, { useState, useEffect } from 'react';
import { PropagateLoader } from 'react-spinners';
import '../../assets/styles/branches.css';
import '../../assets/styles/user-profile.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { useLocation,useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import configModule from '../../../config.js';
import Pagination from "../../components/Pagination/index.jsx";
import SvgContent from '../../components/svgcontent.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import FilterModal from '../../components/filter-modal.jsx';
import filtericon from '../../assets/images/filtericon.svg';

function EmployeeLeavePermission() {
  const [userActivityDataList, setUserActivityDataList] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [penLeaveData, setPenLeaveData] = useState([]);
  const [permissionData, setPermissionData] = useState([]);
  const [penPermissionData, setPenPermissionData] = useState([]);
  const [userActivityDataHistory, setUserActivityDataHistory] = useState([]);
  const [needLoading, setNeedLoading] = useState(false);
  const { user, accessMenu } = useAuth();
  const userId = user?.userId;
    const navigate = useNavigate();
  const user_typecode = user?.user_typecode;
  const config = configModule.config();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isFilterHover, setIsFilterHover] = useState(false);
  const [status, setStatus] = useState("pending");
  const isActive = status === "pending";
  const allUserActData = isActive ? userActivityDataList : userActivityDataHistory;
  const [buttonPermissions, setButtonPermissions] = useState({});
  const location = useLocation();
  const pathname = location?.pathname;
  const db_state_item = location?.state?.db_type;
  const [selectedFilters, setSelectedFilters] = useState('');

  useEffect(() => {
    if (user && accessMenu) {
      const list = Array.isArray(accessMenu) ? accessMenu : (Array.isArray(accessMenu?.menuList) ? accessMenu.menuList : null);
      if (Array.isArray(list)) {
        const normalize = (p) => (p || '').split('?')[0].split('#')[0].replace(/\/+$/, '').toLowerCase();
        const foundMenu = list.find(item => normalize(item.path) === normalize('/employee') && item.user_id === userId);
        if (foundMenu) {
          setButtonPermissions({
            page_access: foundMenu.leave_permission_btn === 1,
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

  const getUserActivityDatas = async (objStatus = null) => {
    setNeedLoading(true);

    setSelectedFilters(db_state_item ? {status: db_state_item}  : '' );

    try {
      const response = await axios.post(`${config.apiBaseUrl}getUserActivityDatas`, {
        user_typecode: user_typecode || "",
        startDate: objStatus?.startDate || '',
        endDate: objStatus?.endDate || '',
        status: objStatus?.status || (db_state_item || ''),
        id : userId || -1,
        type: objStatus?.type2 ||  "",
        branch_id: objStatus?.branch_id || "",
      });

      const result = response.data;
      if (response.status === 200) {
        const pendingData = result?.data?.length > 0 ? result.data.filter(itm => itm.user_status === "Pending") : [];
        const historyData = result?.data?.length > 0 ? result.data.filter(itm => itm.user_status !== "Pending") : [];
        const PenLeave = result?.data?.length > 0 ? result.data.filter(itm =>  itm.user_status === "Pending" &&  itm.action === "Leave") : [];
        const PenPermission = result?.data?.length > 0 ? result.data.filter(itm =>  itm.user_status === "Pending" &&  itm.action === "Permission") : [];
        const Leave = result?.data?.length > 0 ? result.data.filter(itm => itm.user_status !== "Pending" && itm.action === "Leave") : [];
        const Permission = result?.data?.length > 0 ? result.data.filter(itm => itm.user_status !== "Pending" &&  itm.action === "Permission") : [];
        setUserActivityDataList(pendingData);
        setUserActivityDataHistory(historyData);
        setLeaveData(Leave);
        setPermissionData(Permission);
        setPenLeaveData(PenLeave);
        setPenPermissionData(PenPermission);

        setShowFilterModal(false);
      } else {
        toast.error("Failed to fetch user activity details: " + result.message);
        console.error("Failed to fetch user activity details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching user acivity details: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getUserActivityDatas(null);
    }
  }, [user, db_state_item]);

  // Reset active button when date filter is closed
  useEffect(() => {
    if ( activeButton === 'sort') {
      setActiveButton(null);
    }
  }, [ activeButton]);

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

  const currentUserActivity = allUserActData.filter((item) =>
    `${item.attendance_id} ${item.emp_id} ${item.emp_name} ${item.designation} ${item.work_type} ${item.status}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const indexOfLastUserActivity = currentPage * itemsPerPage;
  const indexOfFirstUserActivity = indexOfLastUserActivity - itemsPerPage;
  const paginatedUserActivity = currentUserActivity.slice(indexOfFirstUserActivity, indexOfLastUserActivity);

  const closeFilterDropdown = () => {
    setShowDropdown(false);
    setActiveButton(null);
  };

  const sendApprovals = async (objType, item) => {
    if (item) {
      setNeedLoading(true);

      try {
        const response = await axios.post(`${config.apiBaseUrl}sendApprovalStatus`, {
          status: objType || "",
          id: item.lp_recid || -1
        });

        const result = response.data;
        if (response.status === 200) {
          const responseData = result?.data;

          toast.success(`Status updated  successfully`);
          getUserActivityDatas(null);
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
        } else {
          toast.error("Failed to update user activity: " + result.message);
          console.error("Failed to update user activity: " + result.message);
        }
      } catch (error) {
        toast.error(
          "Error saving user acivity details: " +
          (error.response?.data?.message || error.message)
        );
      } finally {
        setNeedLoading(false);
      }
    }
  };

  const formatDateTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(+hours);
    date.setMinutes(+minutes);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    if (status === "Decline") return { color: "red" };
    if (status === "Approved") return { color: "green" };
    return { color: "#e27500" };
  };

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    getUserActivityDatas(items);
  };

  const handleReset = () => {
    setSelectedFilters('');
    getUserActivityDatas();
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
      <div className='header-div-lp'>
        <div className='header-divpart-el'>
          <div className='d-flex gap-2'>
            <p className='mb-0 header-titlecount-el'>Leaves : {status === "history" ? leaveData?.length : penLeaveData?.length }</p>
            <p className='mb-0 header-titlecount-el'>Permissions : {status === "history" ? permissionData?.length : penPermissionData?.length }</p>
          </div>
          <div className="d-flex align-items-center mb-4">
            <button onClick={() => { navigate("/employee/list") }}>
              <p className='mb-0 nav-btn-top'>
                Employee &gt; Leave and Permission
              </p>
            </button>
          </div>

          <div className="status-toggle-up">
            <label htmlFor="status-active" className="custom-radio">
              <input
                type="radio"
                name="status"
                id="status-active"
                value="pending"
                checked={status === "pending"}
                onChange={(e) => setStatus(e.target.value)}
              />
              <span className="radio-button"></span> Pending Request
            </label>

            <label htmlFor="status-inactive" className="custom-radio">
              <input
                type="radio"
                name="status"
                id="status-inactive"
                value="history"
                checked={status === "history"}
                onChange={(e) => setStatus(e.target.value)}
              />
              <span className="radio-button"></span> History
            </label>
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
      <div className='body-div-lp'>
        <div className='h-100 w-100 p-2 pb-0'>
          <div className='table-common-st'>
            <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
              <div className='brcommon-col-st w-10'>
                S no
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Emp ID
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className={`brcommon-col-st ${status === "history" ? "w-15" : "w-10"}`}>
                Name
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Type
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className={`brcommon-col-st ${status === "history" ? "w-20" : "w-15"}`}>
                Reason
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                From
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                To
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Status
              </div> <span style={{ color: "#129347" }}> | </span>
              {status !== "history" && (
                <>
                  <div className='brcommon-col-st w-10'>
                    Action
                  </div> <span style={{ color: "#129347" }}> | </span>
                </>
              )}
            </div>

            <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
              {paginatedUserActivity && paginatedUserActivity.length > 0 ? (paginatedUserActivity.map((item, index) => (
                <div className='display-flex br-rowst' key={item.lp_recid}>
                  <div className='brcommon-col-st w-10'>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </div>
                  <div className='brcommon-col-st w-15'>
                    {item.emp_id}
                  </div>
                  <div className={`brcommon-col-st ${status === "history" ? "w-15" : "w-10"}`}>
                    {item.emp_name}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {item.action}
                  </div>
                  <div className={`brcommon-col-st ${status === "history" ? "w-20" : "w-15"}`}>
                    {item.Reason}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {item.from_time ? formatTime(item.from_time) : formatDateTime(item.from_date)}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {item.to_time ? formatTime(item.to_time) : formatDateTime(item.to_date)}
                  </div>
                  <div className='brcommon-col-st w-10 fw-bold' style={getStatusColor(item.user_status)}>
                    {item.user_status}
                  </div>
                  {status !== "history" && (
                    <div className='brcommon-col-st w-10 justify-content-between ps-4 pe-4'>
                      <button className='me-3' onClick={() => sendApprovals("Decline", item)} >
                        <SvgContent svg_name="approve_cross" width="15" height="15" />
                      </button>
                      <button onClick={() => sendApprovals("Approved", item)}>
                        <SvgContent svg_name="approve_tick" width="15" height="15" />
                      </button>
                    </div>
                  )}
                </div>
              ))) : (
                <div className='tb-nodata-row-st display-flex'>
                  No leave/permission list
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
              count={currentUserActivity.length}
              page={currentPage}
              pageSize={itemsPerPage}
              onChange={(pageNo) => setCurrentPage(pageNo)}
            />
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


      {showFilterModal && (
        <FilterModal onFilterData={onFilterDataFunc} selectedFilters={selectedFilters}
          onClose={() => { setShowFilterModal(false); setActiveButton(null); }}
        />
      )}
    </div>
  );
}

export default EmployeeLeavePermission;
