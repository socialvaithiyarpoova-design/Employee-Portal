import React, { useState, useEffect } from 'react';
import { PropagateLoader } from 'react-spinners';
import '../../assets/styles/todolist.css';
import Pagination from "../../components/Pagination/index.jsx";
import { useAuth } from '../../components/context/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import configModule from '../../../config.js';
import SvgContent from '../../components/svgcontent.jsx';
import CommonSelect from "../../components/common-select.jsx";
import DatePicker from 'react-datepicker';
import { useLocation } from 'react-router-dom';
import CreditapprovalModal from '../credits/creditapproval-modal.jsx';
import '../../assets/styles/creditapproval-modal.css';
import FilterModal from '../../components/filter-modal.jsx';

function Collections() {
  const { user, accessMenu } = useAuth();
  const userId = user?.userId;
  const user_typecode = user?.user_typecode;
  const location = useLocation();
  const [buttonPermissions, setButtonPermissions] = useState({});
  const config = configModule.config();
  const [needLoading, setNeedLoading] = useState(false);
  const [isBtnClicked, setIsBtnClicked] = useState("Today");
  const [collectionList, setCollectionList] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dispositionList, setDispositionList] = useState([]);
  const [reAssignDate, setReAssignDate] = useState(null);
  const [comments, setComments] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState('');

  // Load button permissions based on current path
  useEffect(() => {
    if (accessMenu && location.pathname) {
      const currentPath = location.pathname;
      const menuItem = accessMenu.find(item => item.path === currentPath);

      if (menuItem) {
        setButtonPermissions({
          sort: menuItem.sort_btn === 1,
          filter: menuItem.filter_btn === 1
        });
      } else {
        setButtonPermissions({});
      }
    }
  }, [accessMenu, location.pathname]);

  const indexOfLastTodo = currentPage * itemsPerPage;
  const indexOfFirstTodo = indexOfLastTodo - itemsPerPage;
  const paginatedTodoes = collectionList.slice(indexOfFirstTodo, indexOfLastTodo);

  const currentTodoes = paginatedTodoes;

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getLeadsPage = async (objItem = '') => {
    setNeedLoading(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}getCollectionData`, {
        userId: userId,
        isBtnClicked: isBtnClicked,
        startDate: objItem?.startDate || '',
        endDate: objItem?.endDate || ''
      });

      const result = response.data;

      if (response.status === 200) {
        setCollectionList(result.data);
        setShowFilterModal(false);
      } else {
        toast.error("Failed to fetch collection list: " + result.message);
      }
    } catch (error) {
      toast.error("Error fetching collection list: " + (error.response?.data?.message || error.message));
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getLeadsPage();
    }
  }, [user, isBtnClicked]);

  const formatDateTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };


  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    getLeadsPage(items);
  };

  const handleReset = () => {
    setSelectedFilters('');
    getLeadsPage();
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
      <div className='d-flex align-items-center gap-2 p-3' style={{ height: "72px" }}>
        <button className={`filter-btn-st ${isBtnClicked === "Today" ? "bg-color-std" : ""}`} onClick={() => setIsBtnClicked("Today")} >Today’s Credits</button>
        <button className={`filter-btn-st ${isBtnClicked === "Upcoming" ? "bg-color-std" : ""}`} onClick={() => setIsBtnClicked("Upcoming")}>Upcoming Credits</button>
        <button className={`filter-btn-st ${isBtnClicked === "All" ? "bg-color-std" : ""}`} onClick={() => setIsBtnClicked("All")}>Total Pending Credits</button>
      
        {buttonPermissions.filter && (
        <div className='filter-container-up position-relative' style={{ marginLeft: "auto" }}>
          <button
            className="btn-top-up btn-bg-filled"
            onClick={() => { setShowFilterModal(true); setActiveButton('filter'); }}
          >
            <SvgContent svg_name="btn_filter" stroke="white" width={20} height={20} />
            <span className="visible-label-up">Filter</span>
          </button>

          {activeButton === 'filter' && (
            <button className='filter-clear-st' onClick={handleReset} >
              &times;
            </button>
          )}
        </div>
      )}
      </div>
      <div style={{ height: "calc(100% - 72px)" }} className='pe-2 ps-2'>
        <div className='h-100 w-100 p-2 pb-0'>
          <div className='table-common-st'>
            <div className='tb-header-row-st display-flex'>
              <div className='brcommon-col-st w-10'>
                S no
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Shop ID
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-20'>
                Name
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Mobile
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Amount
              </div>  <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Ord Date
              </div>  <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Coll Date
              </div>  <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Action
              </div>
            </div>

            <div className='tb-body-row-st'>
              {currentTodoes && currentTodoes.length > 0 ? (currentTodoes.map((item, index) => (
                <div className='display-flex br-rowst' key={item.order_recid}>
                  <div className='brcommon-col-st w-10'>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </div>
                  <div className='brcommon-col-st w-15'>
                    {item.leads_id}
                  </div>
                  <div className='brcommon-col-st w-20'>
                    {item.flead_name}
                  </div>
                  <div className='brcommon-col-st w-15'>
                    {item.mobile_number}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {item.amount_to_pay}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {formatDateTime(item.created_at)}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {formatDateTime(item.date_time)}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    <button onClick={() => { setShowModal(true); setSelectedRow(item); }}>
                      <SvgContent svg_name="eyeopen" />
                    </button>
                  </div>
                </div>
              ))) : (
                <div className='tb-nodata-row-st display-flex'>
                  No collection/credit list
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
              count={collectionList.length}
              page={currentPage}
              pageSize={itemsPerPage}
              onChange={(pageNo) => setCurrentPage(pageNo)}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <CreditapprovalModal
          onClose={() => setShowModal(false)}
          order={selectedRow}
          type="collections"
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

export default Collections;
