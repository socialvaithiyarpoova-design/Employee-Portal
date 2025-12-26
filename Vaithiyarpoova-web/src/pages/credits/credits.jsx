import React, { useEffect, useState } from 'react';
import '../../assets/styles/user-profile.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SvgContent from '../../components/svgcontent.jsx';
import Pagination from "../../components/Pagination/index.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PropagateLoader } from 'react-spinners';
import viewicon from '../../assets/images/viewicon.svg';
import configModule from '../../../config.js';
import axios from "axios";
import dayjs from "../../components/utils/dayjsConfig.js";
import CreditapprovalModal from './creditapproval-modal.jsx';
import '../../assets/styles/creditapproval-modal.css';
import { useLocation } from 'react-router-dom';
import FilterModal from '../../components/filter-modal.jsx';
import filtericon from '../../assets/images/filtericon.svg';

function Credits() {
  const { user, accessMenu } = useAuth();
  const location = useLocation();
  const [buttonPermissions, setButtonPermissions] = useState({});
  const config = configModule.config();
  const [needLoading, setNeedLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState('');
  const [appCreditList, setAppCreditList] = useState([]);
  const [creditList, setCreditList] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const allDataList = status === "Pending" ? creditList : appCreditList;
  const [show, setShow] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState('');
  const [activeButton, setActiveButton] = useState(null);
  const [isFilterHover, setIsFilterHover] = useState(false);

  // Load button permissions based on current path
  useEffect(() => {
    if (accessMenu && location.pathname) {
      const currentPath = location.pathname;
      const menuItem = accessMenu.find(item => item.path === currentPath);

      if (menuItem) {
        setButtonPermissions({
          search: menuItem.search_btn === 1,
          filter: menuItem.filter_btn === 1
        });
      } else {
        setButtonPermissions({});
      }
    }
  }, [accessMenu, location.pathname]);

  const parseDate = (str) => {
    const [day, month, year] = str.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const getCrteditsData = async (objItem = '') => {
    setNeedLoading(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}getCrteditsData`, {
        startDate: objItem?.startDate || '',
        endDate: objItem?.endDate || '',
        branch_id: objItem?.branch_id || null,
        employee_id: objItem?.branch_id || null
      });

      const result = response.data;
      if (response.status === 200) {
        setCreditList(result?.data?.length > 0 ? result?.data?.filter(itm => itm.paid_status === "Pending") : []);
        setAppCreditList(result?.data?.length > 0 ? result?.data?.filter(itm => itm.paid_status !== "Pending") : []);
        setShowFilterModal(false);
      } else {
        toast.error("Failed to fetch details: " + result.message);
        console.error("Failed to fetch details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching details: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if ((!startDate && !endDate) || (startDate && endDate)) {
      getCrteditsData();
    }
  }, [startDate, endDate]);

  const filteredLeads = allDataList.filter((item) => {
    const matchesSearch = `${item.emp_id} ${item.order_id} ${item.total_value} ${item.created_at} ${item.date_time} ${item.paid_status}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const itemDate = parseDate(item.created_at);
    const matchDate =
      (!startDate || itemDate >= new Date(startDate.setHours(0, 0, 0, 0))) &&
      (!endDate || itemDate <= new Date(endDate.setHours(23, 59, 59, 999)));

    return matchesSearch && matchDate;
  });

  const indexOfLastLeads = currentPage * itemsPerPage;
  const indexOfFirstLeads = indexOfLastLeads - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLeads, indexOfLastLeads);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    getCrteditsData(items);
  };

  const handleReset = () => {
    setSelectedFilters('');
    getCrteditsData();
    setActiveButton(null);
  };

  return (
    <div className='common-body-st'>
      {needLoading && (
        <div className='loading-container w-100 h-100'>
          <PropagateLoader height="100" width="100" color="#0B9346" radius="10" />
        </div>
      )}

      <div className='header-div-el'>
        <div className='header-divpart-el gap-2'>
          <p className='mb-0 header-titlecount-el'>Total credits : {filteredLeads.length}</p>
          <div className="status-toggle-up">
            <label className="custom-radio">
              <input
                type="radio"
                name="status"
                value="Pending"
                checked={status === "Pending"}
                onChange={(e) => setStatus(e.target.value)}
              />
              <span className="radio-button"></span> Pending
            </label>

            <label className="custom-radio">
              <input
                type="radio"
                name="status"
                value="Received"
                checked={status === "Received"}
                onChange={(e) => setStatus(e.target.value)}
              />
              <span className="radio-button"></span> Received
            </label>
          </div>
        </div>

        <div className="search-add-wrapper">
          {buttonPermissions.search && (
            <input
              type="text"
              placeholder="Search"
              className="search-input-up"
              style={{padding:'6.5px 15px'}}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}

          {buttonPermissions.filter && (
            <div className='filter-container-up position-relative'>
              <button
               className={`product-filter-btns ${activeButton === 'filter' ? 'active' : ''}`}
                style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}
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
        </div>
      </div>

      <div className='body-div-el'>
        <div className='w-100 p-2 d-flex justify-content-center align-items-center' style={{ height: "calc(100% - 48px)" }}>
          {currentLeads.length > 0 ? (
            <div className='table-userpro-up w-100 h-100 overflow-auto'>
              <div className='table-head-up d-flex'>
                <div className='w-10 p-2 d-flex justify-content-center align-items-center'>S.No</div>
                <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Emp ID</div>
                <div className='w-14 p-2 d-flex justify-content-center align-items-center'>Order ID</div>
                <div className='w-15 p-2 d-flex justify-content-center align-items-center'>Amount</div>
                <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Order Date</div>
                <div className='w-15 p-2 d-flex justify-content-center align-items-center'>Collection Date</div>
                <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Status</div>
                <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Action</div>
              </div>

              <div className='table-body-up d-flex flex-column'>
                {currentLeads.map((item, index) => (
                  <div className='table-bodydiv-up d-flex' key={index}>
                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </div>
                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>{item.emp_id}</div>
                    <div className='w-14 p-2 d-flex justify-content-center align-items-center'>{item.order_id}</div>
                    <div className='w-15 p-2 d-flex justify-content-center align-items-center'>{item.total_value}</div>
                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>
                      {dayjs.utc(item.created_at).format("DD/MM/YYYY")}
                    </div>
                    <div className='w-15 p-2 d-flex justify-content-center align-items-center'>
                      {dayjs.utc(item.date_time).format("DD/MM/YYYY")}
                    </div>
                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>{item.paid_status}</div>
                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>
                      <img src={viewicon} alt='viewicon' className='cursor-pointer' onClick={() => { setShow(true); setSelectedItems(item); }} />
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
          <label className="me-2">
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
            count={filteredLeads.length}
            page={currentPage}
            pageSize={itemsPerPage}
            onChange={(pageNo) => setCurrentPage(pageNo)}
          />
        </div>
      </div>

      {show && (
        <CreditapprovalModal
          onClose={() => setShow(false)}
          order={selectedItems}
          type={status === "Received" ? "credits" : "view"}
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

      {showFilterModal && (
        <FilterModal onFilterData={onFilterDataFunc} selectedFilters={selectedFilters}
          onClose={() => { setShowFilterModal(false); setActiveButton(null); }}
        />
      )}
    </div>
  );
}

export default Credits;
