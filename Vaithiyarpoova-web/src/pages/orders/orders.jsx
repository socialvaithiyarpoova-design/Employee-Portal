import React, { useEffect, useState, useRef } from 'react';
import '../../assets/styles/user-profile.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import configModule from '../../../config.js';
import SvgContent from '../../components/svgcontent.jsx';
import Pagination from "../../components/Pagination/index.jsx";
import 'react-datepicker/dist/react-datepicker.css';
import { PropagateLoader } from 'react-spinners';
import viewicon from '../../assets/images/viewicon.svg';
import printer from '../../assets/images/printer.svg';
import OrderDetailModal from './order-modal.jsx';
import '../../assets/styles/orders.css';
import { useLocation } from 'react-router-dom';
import FilterModal from '../../components/filter-modal.jsx';
import logo from '../../assets/images/main1.webp';
import filtericon from '../../assets/images/filtericon.svg';

function Orders() {
  const { user, accessMenu } = useAuth();
  const location = useLocation();
  const db_state_item = location?.state?.db_type;
  const [buttonPermissions, setButtonPermissions] = useState({});
  const printRef = useRef();
  const dateFilterRef = useRef();
  const [needLoading, setNeedLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [nILeadDetails, setNILeadDetails] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const config = configModule.config();
  const [status, setStatus] = useState("person");
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHistoryClicked, setIsHistoryClicked] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const currentList = status === "person" ? orderDetails : nILeadDetails;
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [isFilterHover, setIsFilterHover] = useState(false);

  // Load button permissions based on current path
  useEffect(() => {
    if (accessMenu && location.pathname) {
      const currentPath = location.pathname;
      const menuItem = accessMenu.find(item => item.path === currentPath);

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

  // Convert logo to base64 on component mount
useEffect(() => {
  const convertLogoToBase64 = async () => {
    try {
      const response = await fetch(logo);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error converting logo to base64:', error);
    }
  };
  convertLogoToBase64();
}, []);

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

function formatDateOnly(date) {
    if (!date) return null;
    const d = new Date(date);
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }


  const getOrderDetails = async (type = "Reset",objStatus = "") => {
    setNeedLoading(true);
    let stDate = '';
    let endDate = '';

    if(db_state_item === "ac_today") {
      stDate = formatDateOnly(new Date());
      endDate = formatDateOnly(new Date());
    }

    try {
      const response = await axios.post(`${config.apiBaseUrl}getOrderDetails`, {
        btnData: type,
        branch_id: objStatus?.branch_id || null,
        employee_id: objStatus?.employee_id || null,
        startDate: objStatus?.startDate || (stDate || ''),
        endDate: objStatus?.endDate || (endDate || ''),
        status: objStatus?.status || ''
      });

      const result = response.data;

      if (response.status === 200) {
        setOrderDetails(result?.data);
        setShowFilterModal(false);
        setNILeadDetails(result?.shopes);
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

  useEffect(() => {
    if (user) {
      if (db_state_item === "history") {
        setActiveButton("history");  
        getOrderDetails("History");
      } else {
        setActiveButton("orders");
        getOrderDetails();
      }
    }
  }, [user, db_state_item]);



  // Reset sort button active state when date filter closes
  useEffect(() => {
    if (!showDateFilter && activeButton === 'sort') {
      setActiveButton(null);
    }
  }, [showDateFilter, activeButton]);


  const formatDateTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const filteredLeads = currentList.filter((item) => {
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

const handlePrint = (order) => {
  setSelectedOrder(order);

  setTimeout(() => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Order</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h4 { margin-bottom: 8px; border-bottom: 1px solid #ccc; }
            p { margin: 4px 0; }
            img { max-width: 100%; margin-top: 10px; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Use requestAnimationFrame for immediate rendering
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      });
    });
  }, 100);
};
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
            <p className='mb-0 header-titlecount-el'>Total orders : {nILeadDetails.length + orderDetails.length}</p>
            {activeButton !== "history" && (<p className='mb-0 header-titlecount-el'>Pending approvals : {status === "shop" ? nILeadDetails.length : orderDetails.length} </p>)}
          </div>
          <div className="status-toggle-up">
            <label htmlFor="status-active" className="custom-radio">
              <input
                type="radio"
                name="status"
                id="status-active"
                value="person"
                checked={status === "person"}
                onChange={(e) => setStatus(e.target.value)}
              />
              <span className="radio-button"></span> Persons
            </label>

            <label htmlFor="status-inactive" className="custom-radio">
              <input
                type="radio"
                name="status"
                id="status-inactive"
                value="shop"
                checked={status === "shop"}
                onChange={(e) => setStatus(e.target.value)}
              />
              <span className="radio-button"></span> Shops
            </label>
          </div>
        </div>

        <div className="search-add-wrapper">
          {buttonPermissions.search && (
            <div>
              <input
                type="text"
                placeholder="Search"
                className="search-input-up"
                style={{padding:'6.5px 15px'}}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}


          {buttonPermissions.filter && (
            <div className='filter-container-up position-relative'>
              <button
                style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}
                  className={`product-filter-btns ${activeButton === 'filter' ? 'active' : ''}`}
                  onClick={() => { setShowFilterModal(true); setActiveButton('filter'); }}
                  onMouseEnter={() => setIsFilterHover(true)}
                  onMouseLeave={() => setIsFilterHover(false)}
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
                style={{padding:'7px 15px'}}
                aria-label="View order history"
              >
                <SvgContent svg_name="history" width={20} height={20} />
                <span className='visible-label-up' >History</span>
              </button>

              {activeButton === "history" && (
                <button className='times-st' onClick={() => {
                  setActiveButton(null);
                  getOrderDetails("Reset");
                }}>&times;</button>
              )}
            </div>
          )}

          {buttonPermissions.export && (
            <div className="filter-container-up">
              <button
                className={`btn-top-up btn-bg-filled ${activeButton === 'export' ? 'active' : ''}`}
                onClick={() => {
                  setActiveButton('export');
                  setTimeout(() => setActiveButton(null), 500);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveButton('export');
                    setTimeout(() => setActiveButton(null), 500);
                  }
                }}
                tabIndex={0}
                aria-label="Export orders data"
              >
                <span>Export</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className='body-div-el'>
        <div className='w-100 p-2 d-flex justify-content-center align-items-center' style={{ height: "calc(100% - 48px)" }}>
          {currentLeads.length > 0 ? (
            <div className='table-userpro-up w-100 h-100 overflow-auto'>
              <div className='table-head-up d-flex'>
                <div className='w-10 p-2 d-flex text-center justify-content-center align-items-center'>S.No</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-10 p-2 d-flex text-center justify-content-center align-items-center'>Order ID</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-14 p-2 d-flex text-center justify-content-center align-items-center'>Client Name</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-12 p-2 d-flex text-center justify-content-center align-items-center'>Quantity</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-12 p-2 d-flex text-center justify-content-center align-items-center'>Value</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-10 p-2 d-flex text-center justify-content-center align-items-center'>Date</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-10 p-2 d-flex text-center justify-content-center align-items-center'>Type</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-12 p-2 d-flex text-center justify-content-center align-items-center'>Status</div><span style={{ color: "#129347" }}> | </span>
                <div className='w-10 p-2 d-flex text-center justify-content-center align-items-center'>Action</div>
              </div>
              <div className='table-body-up d-flex'>
                {currentLeads.map((item, index) => (
                  <div className='table-bodydiv-up' key={item.order_id || index}>
                    <div className='w-10 p-2 d-flex text-center  justify-content-center align-items-center'>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </div>
                    <div className='w-10 p-2 d-flex text-center  justify-content-center align-items-center'>
                      {item.order_id}
                    </div>
                    <div className='w-14 p-2 d-flex text-center  justify-content-center align-items-center'>
                      {item.order_name}
                    </div>
                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>
                      {item.quantity}
                    </div>
                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>
                      {item.total_value}
                    </div>
                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                      {formatDateTime(item.date_time)}
                    </div>
                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                      {item.direct_pickup ? "Direct" : "Courier"}
                    </div>
                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>
                      {item.status}
                    </div>
                    <div className='w-10 p-2 d-flex justify-content-center align-items-center gap-3'>
                      <button
                        onClick={() => {
                          setSelectedOrder(item);
                          setIsHistoryClicked(true);
                        }}

                        className="icon-button"
                        aria-label="View Order"
                      >
                        <img src={viewicon} alt="view" />
                      </button>

                      <button
                        onClick={() => handlePrint(item)}
                        className="icon-button"
                        aria-label="Print Order"
                      >
                        <img src={printer} alt="printer" />
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
        {isHistoryClicked && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setIsHistoryClicked(false);
            if (activeButton === 'history') {
              getOrderDetails('History');
            } else {
              getOrderDetails();
            }
          }}
          type={activeButton === 'history' ? 'history' : 'view'}
          option={status}
        />
      )}
    <div style={{ display: 'none' }}>
      <div ref={printRef}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {logoBase64 && (
            <img 
              src={logoBase64} 
              alt="Company Logo" 
              style={{ width: '140px', height: 'auto' }} 
            />
          )}
        </div>
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {}}
          type="print"    
          option={status}   
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

      {showFilterModal && (
        <FilterModal onFilterData={onFilterDataFunc} selectedFilters={selectedFilters}
          onClose={() => { setShowFilterModal(false); setActiveButton(null); }}
        />
      )}

    </div>
  );
}

export default Orders;
