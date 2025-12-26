import React, { useState, useEffect} from 'react';
import { PropagateLoader } from 'react-spinners';
import '../../assets/styles/tracking.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { toast } from 'react-toastify';
import FilterModal from '../../components/filter-modal.jsx';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import configModule from '../../../config.js';
import Pagination from "../../components/Pagination/index.jsx";
import SvgContent from '../../components/svgcontent.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation } from 'react-router-dom';

function Tracking() {
  const [trackingDetails, setTrackingDetails] = useState([]);
  const [trackingPend, setTrackingPend] = useState([]);
  const [needLoading, setNeedLoading] = useState(false);
  const { user, accessMenu } = useAuth();
  const location = useLocation();
  const [buttonPermissions, setButtonPermissions] = useState({});
  const user_typecode = user?.user_typecode;
  const user_id = user?.userId;
  const config = configModule.config();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isFilterHover, setIsFilterHover] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState('');

  useEffect(() => {
    if (accessMenu && location.pathname) {
      const currentPath = location.pathname;
      const menuItem = accessMenu.find(item => item.path === currentPath && item.user_id === user_id);

      if (menuItem) {
        setButtonPermissions({
          search: menuItem.search_btn === 1,
          sort: menuItem.sort_btn === 1,
          filter: menuItem.filter_btn === 1,
          view: menuItem.view_btn === 1
        });
      } else {
        setButtonPermissions({});
      }
    }
  }, [accessMenu, location.pathname]);

  const handleSearch = async (e) => {
  const query = e.target.value;
  setSearchQuery(query);

  if (query.trim().length >= 3) { // trigger after 3 chars
    await getOrderDetailsForTrack({ mobile_number: query });
  } else if (query.trim() === "") {
    await getOrderDetailsForTrack();
  }
};

  const getOrderDetailsForTrack = async (objStatus = null) => {
    setNeedLoading(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}getOrderDetailsForTrack`, {
        startDate: objStatus?.startDate || '',
        endDate: objStatus?.endDate || '',
        status: objStatus?.status || '',
        mobile_number: objStatus?.mobile_number || '',
        user_typecode: user_typecode,
        user_id: user_id,
      });

      const result = response.data;
      if (response.status === 200) {
        setTrackingDetails(result.data);
        setTrackingPend(result?.data?.length > 0 ? result.data.filter(itm => itm.status === "Pending") : []);
        setShowFilterModal(false);
      } else {
        toast.error("Failed to fetch tracking details: " + result.message);
        console.error("Failed to fetch tracking details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching tracking details: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getOrderDetailsForTrack(null);
    }
  }, [user]);


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

  const indexOfLastTracking = currentPage * itemsPerPage;
  const indexOfFirstTracking = indexOfLastTracking - itemsPerPage;
  const paginatedTracking = trackingDetails.slice(indexOfFirstTracking, indexOfLastTracking);

  const currentTracking = paginatedTracking.filter((item) =>
    `${item.attendance_id} ${item.order_id} ${item.mobile_number}  `
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );



  const closeFilterDropdown = () => {
    setShowDropdown(false);
    setActiveButton(null);
  };

  const formatDateTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    getOrderDetailsForTrack(items);
  };

  const handleReset = () => {
    setSelectedFilters('');
    getOrderDetailsForTrack();
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
      <div className='header-div-tr'>
        <div className='header-divpart-el'>
          <div className='d-flex gap-2'>
            <p className='mb-0 header-titlecount-el'>Total Order : {trackingDetails.length || 0}</p>
            <p className='mb-0 header-titlecount-el'>Pending Order : {trackingPend.length || 0}</p>
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
            onChange={handleSearch}
          />
          {searchQuery && (
            <span
               onClick={() => {
                setSearchQuery("");
                getOrderDetailsForTrack(); 
              }}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#000000ff",
                fontSize: "14px",
              }}
            >
              ✕
            </span>
          )}
        </div>
          )}

          {buttonPermissions.filter && (
            <div className="filter-container-up">
              <button
                className={`btn-top-up ${activeButton === 'filter' ? 'active btn-bg-filled' : ''}`}
                onClick={() => { setShowDropdown(false); setActiveButton('filter'); setShowFilterModal(true); }}
                onMouseEnter={() => setIsFilterHover(true)}
                onMouseLeave={() => setIsFilterHover(false)}
                tabIndex={0}
                aria-label="Filter tracking data by status"
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
      <div className='body-div-tr'>
        <div className='h-100 w-100 p-2 pb-0'>
          <div className='table-common-st'>
            <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
              <div className='brcommon-col-st w-10'>
                S no
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Order ID
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Name
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Order Value
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Date
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Status
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-20'>
                Tracking ID
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                View
              </div>
            </div>

            <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
              {currentTracking && currentTracking.length > 0 ? (currentTracking.map((item, index) => (
                <div className='display-flex br-rowst' key={`${item.order_id}-${index}`}>
                  <div className='brcommon-col-st w-10'>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </div>
                  <div className='brcommon-col-st w-15'>
                    {item.order_id}
                  </div>
                  <div className='brcommon-col-st w-15'>
                    {item.lead_name || item.flead_name}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {item.order_value}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {formatDateTime(item.date_time)}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {item.status}
                  </div>
                  <div className='brcommon-col-st w-20'>
                    {item.tracking_id || '-'}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {buttonPermissions.view ? (
                      <button className="" onClick={() => {
                        setSelectedOrder(item);
                        setShowOrderModal(true);
                      }}>
                        <SvgContent svg_name="eyeopen" />
                      </button>
                    ) : (<div style={{ cursor: "not-allowed" }}>View</div>)}
                  </div>
                </div>
              ))) : (
                <div className='tb-nodata-row-st display-flex'>
                  No tracking list
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
              count={trackingDetails.length}
              page={currentPage}
              pageSize={itemsPerPage}
              onChange={(pageNo) => setCurrentPage(pageNo)}
            />
          </div>
        </div>
      </div>
      {showOrderModal && selectedOrder && buttonPermissions.view && (
        <div className="tracking-modal-overlay">
          <div className="tracking-modal-content">
            <div className="tracking-modal-header">
              <h5>Tracking Summary</h5>
              <button onClick={() => setShowOrderModal(false)}>✖</button>
            </div>
            <div className="tracking-modal-body">
              < h6 className="fw-bold" >Order Details</h6>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Order ID:</strong> {selectedOrder.order_id}</p>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Order Date:</strong> {formatDateTime(selectedOrder.date_time)}</p>

              < h6 className="fw-bold" >Client Details</h6>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Client ID:</strong> {selectedOrder.leads_id}</p>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Name:</strong> {selectedOrder.lead_name}</p>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Mobile:</strong> {selectedOrder.additional_number}</p>

              < h6 className="fw-bold" >Delivery Details</h6>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Address:</strong> {selectedOrder.address}</p>
              <p><strong style={{ width: "132px", display: "inline-block" }} >District:</strong> {selectedOrder.district}</p>
              <p><strong style={{ width: "132px", display: "inline-block" }} >State:</strong> {selectedOrder.state}</p>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Courier:</strong> {selectedOrder.courier}</p>

              < h6 className="fw-bold" >Product Details</h6>
              {JSON.parse(selectedOrder?.product_list).map((item) => (
              <div key={item.rec_id} style={{ marginBottom: '10px' }}>
                <p style={{ margin: '5px 0' }}>
                  {item.id} - {item.qty} * ₹{item.price}
                </p>
              </div>
            ))}

              < h6 className="fw-bold" >Payment Details</h6>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Order Value:</strong> ₹{selectedOrder.order_value}</p>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Discount:</strong> ₹{selectedOrder.discount}</p>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Courier Charge:</strong> ₹{selectedOrder.courier_amount}</p>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Wallet:</strong> ₹{selectedOrder.wallet}</p>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Gst Amount:</strong> ₹{selectedOrder.gst_amount}</p>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Total Value:</strong> ₹{selectedOrder.final_amount}</p>

              < h6 className="fw-bold" >Status</h6>
              <p><strong style={{ width: "132px", display: "inline-block" }} >Current Status:</strong> {selectedOrder.status}</p>
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

export default Tracking;
