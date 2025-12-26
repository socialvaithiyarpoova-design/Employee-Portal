import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import configModule from '../../../config.js';
import filtericon from '../../assets/images/filtericon.svg';
import SvgContent from '../../components/svgcontent.jsx';
import Pagination from "../../components/Pagination/index.jsx";
import 'react-datepicker/dist/react-datepicker.css';
import { PropagateLoader } from 'react-spinners';
import viewicon from '../../assets/images/viewicon.svg';
import { useLocation } from 'react-router-dom';
import FilterModal from '../../components/filter-modal.jsx';
import BillingModel from './billing-model.jsx';
import Walletmodel from './wallet-model.jsx';
import ConsultingModel from './consulting-model.jsx';
import ClassModel from './class-model.jsx';

function Approvals() {
  const { user, accessMenu } = useAuth();
  const location = useLocation();
  const db_state_item = location?.state?.db_type;
  const [buttonPermissions, setButtonPermissions] = useState({});
  const dateFilterRef = useRef();
  const [needLoading, setNeedLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const config = configModule.config();
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHistoryClicked, setIsHistoryClicked] = useState(false);
  let startDate = null;
  let endDate = null;
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState('');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showConsultingModal, setShowConsultingModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedItemData, setSelectedItemData] = useState(null);
    const [isFilterHover, setIsFilterHover] = useState(false);

  useEffect(() => {
    if (accessMenu && location.pathname) {
      const currentPath = location.pathname;
      const menuItem = accessMenu.find(item => item.path === currentPath  && item.user_id === user?.userId );
      if (menuItem) {
        setButtonPermissions({
          search: menuItem.search_btn === 1,
          filter: menuItem.filter_btn === 1,
          history: menuItem.history_btn === 1,
          sort: menuItem.sort_btn === 1,
          export: menuItem.export_btn === 1
        });
      }
    }
  }, [accessMenu, location.pathname]);



  // Handle click outside date filter to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target)) {
        setShowDateFilter(false);
        setActiveButton(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getOrderDetails = async (type = "Reset",objStatus = "") => {
    setNeedLoading(true);
    let stDate = '';
    let endDate = '';

    if(db_state_item === "ac_today") {
      stDate = formatDateToMySQLQuery(new Date());
      endDate = formatDateToMySQLQuery(new Date());
    }

    try {
      const response = await axios.post(`${config.apiBaseUrl}getapprovel`, {
        btnData: type,
        branch_id: objStatus?.branch_id || null,
        employee_id: objStatus?.employee_id || null,
        startDate: objStatus?.startDate || (stDate || ''),
        endDate: objStatus?.endDate || (endDate || ''),
        status: objStatus?.status || '',
        type: objStatus?.type || '',
      });

      const result = response.data;

      if (response.status === 200) {
        setOrderDetails(result?.data);
        setShowFilterModal(false);       
      } else {
        toast.error("Failed to fetch designation list: " + result.message);
      }
    } catch (error) {
      setOrderDetails([]);
      toast.error("Error fetching designation list: " + (error.response?.data?.message || error.message));
    } finally {
      setNeedLoading(false);
    }
  };

 const handleViewClick = async (item) => {
  closeAllModals();
  try {
    let response;
    switch (item.type.toLowerCase()) {
      case "billing":
        response = await axios.post(`${config.apiBaseUrl}getBillingDetails`, {
          billing_recid: item.id,
          type:item.type
        });
        break;

      case "class":
        response = await axios.post(`${config.apiBaseUrl}getClassDetails`, {
          class_register_id: item.id,
          type:item.type
        });
        break;

      case "consulting":
        response = await axios.post(`${config.apiBaseUrl}getConsultingDetails`, {
          id: item.id,
          type:item.type
        });
        break;

      case "wallet":
        response = await axios.post(`${config.apiBaseUrl}getWalletDetails`, {
          wallet_id: item.id,
          type:item.type
        });
        break;

      default:
        toast.error(`Unknown type: ${item.type}`);
        return;
    }

    if (response.status === 200) {
      const detailData = response.data.data;
      setSelectedItemData(detailData);

      openModalByType(item.type.toLowerCase());
    } else {
      toast.error("Failed to fetch details");
    }
  } catch (error) {
    console.error("Error fetching item details:", error);
    toast.error("Error loading details: " + (error.response?.data?.message || error.message));
  }
};

  const closeAllModals = () => {
    setShowBillingModal(false);
    setShowWalletModal(false);
    setShowConsultingModal(false);
    setShowClassModal(false);
    setSelectedItemData(null);
  };

const openModalByType = (type) => {
  switch (type) {
    case "billing":
      setShowBillingModal(true);
      break;
    case "wallet":
      setShowWalletModal(true);
      break;
    case "consulting":
      setShowConsultingModal(true);
      break;
    case "class":
      setShowClassModal(true);
      break;
    default:
      toast.error(`Unknown modal type: ${type}`);
  }
};


  useEffect(() => {
    if (user) {
      getOrderDetails();
    }
  }, [user, db_state_item]);

  useEffect(() => {
    if (!showDateFilter && activeButton === 'sort') {
      setActiveButton(null);
    }
  }, [showDateFilter, activeButton]);

  function formatDateToMySQLQuery(date) {
    if (!date) return null;
    const d = new Date(date);
    const pad = (n) => (n < 10 ? '0' + n : n);

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  const formatDateTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const filteredLeads = orderDetails.filter((item) => {
    const matchSearch = `${item.order_id} ${item.order_name} ${item.order_qty} ${item.order_value} ${item.date_time} ${item.order_type} ${item.status} `
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

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    getOrderDetails('Reset', items);
  };

  const handleReset = () => {
    setSelectedFilters('');
    getOrderDetails('Reset','');
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
      <div className='header-div-order'>
        <div className='header-divpart-el gap-2'>
          <div className='d-flex align-items-center gap-2 flex-wrap'>
            <p className='mb-0 header-titlecount-el'>
              {activeButton === "history" ? "Total history" : "Pending approvals"} : {orderDetails.length}
            </p>
          </div>        
        </div>
        <div className="search-add-wrapper">
          {buttonPermissions.search && (
            <div>
              <input
                type="text"
                placeholder="Search"
                className="search-input-up"
                style={{padding:'6.5px 12px'}}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}


          {buttonPermissions.filter && (
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

          {buttonPermissions.history && (
            <div className="position-relative">
              <button
                className={`btn-top-up position-relative ${activeButton === 'history' ? 'active' : ''}`}
                style={{padding:'7px 15px'}}
                onClick={() => {
                  setActiveButton('history');
                  getOrderDetails('History');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveButton('history');
                  }
                }}
                tabIndex={0}
                aria-label="View order history"
              >
                <SvgContent svg_name="history" width={20} height={20} />
                <span className='visible-label-up' >History</span>
              </button>

              {activeButton === "history" && (
                <button className='times-st' onClick={() => {
                  setActiveButton(null);
                  setIsHistoryClicked(false);
                  getOrderDetails("Reset");
                }}>&times;</button>
              )}
            </div>
          )}         
        </div>
      </div>

      <div className='body-div-el'>
        <div className='w-100 p-2 d-flex justify-content-center align-items-center' style={{ height: "calc(100% - 48px)" }}>
          {currentLeads.length > 0 ? (
            <div className='table-userpro-up w-100 h-100 overflow-auto'>
              <div className='table-head-up d-flex'>
                <div className={activeButton === "history" ? 'w-10 p-2 d-flex text-center justify-content-center align-items-center' : 'w-10 p-2 d-flex text-center justify-content-center align-items-center'}>S.No</div><span style={{ color: "#129347" }}> | </span>
                <div className={activeButton === "history" ? 'w-15 p-2 d-flex text-center justify-content-center align-items-center' : 'w-20 p-2 d-flex text-center justify-content-center align-items-center'}>Client ID</div><span style={{ color: "#129347" }}> | </span>
                <div className={activeButton === "history" ? 'w-20 p-2 d-flex text-center justify-content-center align-items-center' : 'w-20 p-2 d-flex text-center justify-content-center align-items-center'}>Handle By</div><span style={{ color: "#129347" }}> | </span>
                <div className={activeButton === "history" ? 'w-15 p-2 d-flex text-center justify-content-center align-items-center' : 'w-15 p-2 d-flex text-center justify-content-center align-items-center'}>Date</div><span style={{ color: "#129347" }}> | </span>
                <div className={activeButton === "history" ? 'w-15 p-2 d-flex text-center justify-content-center align-items-center' : 'w-20 p-2 d-flex text-center justify-content-center align-items-center'}>Type</div><span style={{ color: "#129347" }}> | </span>
                {activeButton === "history" && (
                  <> <div className='w-15 p-2 d-flex text-center justify-content-center align-items-center'>Status</div><span style={{ color: "#129347" }}> | </span>
                  </>
                )}
                <div className={activeButton === "history" ? 'w-10 p-2 d-flex text-center justify-content-center align-items-center' : 'w-15 p-2 d-flex text-center justify-content-center align-items-center'}>View</div>
              </div>
              <div className='table-body-up d-flex'>
                {currentLeads.map((item, index) => (
                  <div className='table-bodydiv-up' key={item.order_id || index}>
                    <div className={activeButton === "history" ? 'w-10 p-2 d-flex text-center justify-content-center align-items-center' : 'w-10 p-2 d-flex text-center justify-content-center align-items-center'}>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className={activeButton === "history" ? 'w-15 p-2 d-flex text-center justify-content-center align-items-center' : 'w-20 p-2 d-flex text-center justify-content-center align-items-center'}>
                      {item.lead_id || '---'}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className={activeButton === "history" ? 'w-20 p-2 d-flex text-center justify-content-center align-items-center' : 'w-20 p-2 d-flex text-center justify-content-center align-items-center'}>
                      {item.emp_id}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className={activeButton === "history" ? 'w-15 p-2 d-flex text-center justify-content-center align-items-center' : 'w-15 p-2 d-flex text-center justify-content-center align-items-center'}>
                     {formatDateTime(item.date_time)}
                    </div>  <span style={{ color: "#ffffffff" }}> | </span>                 
                    <div className={activeButton === "history" ? 'w-15 p-2 d-flex text-center justify-content-center align-items-center' : 'w-20 p-2 d-flex text-center justify-content-center align-items-center'}>
                       {item.type}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                      {activeButton === "history" && (
                       <> 
                       <div className='w-15 p-2 d-flex text-center justify-content-center align-items-center'>{item.status}</div><span style={{ color: "#ffffffff" }}> | </span>
                      </>
                    )}
                    <div className={activeButton === "history" ? 'w-10 p-2 d-flex text-center justify-content-center align-items-center' : 'w-15 p-2 d-flex text-center justify-content-center align-items-center'}>
                      <button
                         onClick={() => {
                          handleViewClick(item);
                         if (activeButton === "history") {
                              setIsHistoryClicked(true);
                            } else {
                              setIsHistoryClicked(false);
                            }
                           }}
                        className="icon-button"
                        aria-label="View Order"
                       >
                        <img src={viewicon} alt="view" />
                      </button>                    
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
     {showBillingModal && (
      <BillingModel 
          onClose={() => setShowBillingModal(false)}
          data={selectedItemData}
          isHistoryClicked={isHistoryClicked} 
          orderDetails={getOrderDetails}
        />
      )}
        
       {showWalletModal && (
        <Walletmodel 
         onClose={() => setShowWalletModal(false)}
         data={selectedItemData}
        isHistoryClicked={isHistoryClicked} 
         orderDetails={getOrderDetails}
        />
     )}

      {showConsultingModal && (
      <ConsultingModel 
        onClose={() => setShowConsultingModal(false)}
        data={selectedItemData}
        isHistoryClicked={isHistoryClicked}  
        orderDetails={getOrderDetails}
      />)}
      {showClassModal && (
      <ClassModel 
        onClose={() => setShowClassModal(false)}
        data={selectedItemData}
        isHistoryClicked={isHistoryClicked}  
        orderDetails={getOrderDetails}
      />
      )}


      {showFilterModal && (
        <FilterModal onFilterData={onFilterDataFunc} selectedFilters={selectedFilters}
          onClose={() => { setShowFilterModal(false); setActiveButton(null); }}
        />
      )}

    </div>
  );
}

export default Approvals;
