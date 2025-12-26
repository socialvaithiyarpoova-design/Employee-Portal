import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../components/context/Authcontext.jsx';
import SvgContent from '../../components/svgcontent.jsx';
import axios from 'axios';
import configModule from '../../../config.js';
import { toast, ToastContainer } from 'react-toastify';
import FilterModal from '../../components/filter-modal.jsx';
import { PropagateLoader } from 'react-spinners';
import { ExportButton, exportFormattedData } from '../../components/export-page.jsx';
import '../../assets/styles/user-profile.css';
import './reports.css';
import Pagination from "../../components/Pagination/index.jsx";

function Reports() {
  const location = useLocation();
  const pathname = location?.pathname;
  const { user, accessMenu } = useAuth();
  const [buttonPermissions, setButtonPermissions] = useState({});
  const [status, setStatus] = useState("sales");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Report state
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const config = configModule.config();
  const [activeButton, setActiveButton] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState('');

  const [showFilterModal, setShowFilterModal] = useState(false);


  const indexOfLastTodo = currentPage * itemsPerPage;
  const indexOfFirstTodo = indexOfLastTodo - itemsPerPage;
  const paginatedReports = reportsData.slice(indexOfFirstTodo, indexOfLastTodo);



useEffect(() => {
  if (user && Array.isArray(accessMenu)) {
      const found = accessMenu.find(m => m.path === pathname & m.user_id === user.userId );
      if (found) {
          setButtonPermissions({
              history: found.history_btn === 1,
              sort: found.sort_btn === 1,
              filter: found.filter_btn === 1,
              export: found.export_btn === 1,
              view: found.view_btn === 1,
          });
      } else {
          setButtonPermissions({});
      }
  } else {
      setButtonPermissions({});
  }
}, [user, accessMenu, pathname]);

  const fetchReportsData = async (objItem = '') => {
    setLoading(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}getReportsData`, {
        startDate : objItem?.startDate || '',
        endDate : objItem?.endDate || '',
        status: status || 'sales',
        user_id: user?.userId
      });

      if (response.status === 200 && response.data.success) {
        setReportsData(response.data.data);
        setShowFilterModal(false);
      } else {
        toast.error('Failed to fetch reports data');
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast.error('Error fetching reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Fetch data when report type changes
  useEffect(() => {
    if (user) {
      fetchReportsData();
    }
  }, [status]);

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    fetchReportsData(items);
  };

  const handleReset = () => {
    setSelectedFilters('');
    fetchReportsData();
    setActiveButton(null);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    const pad = (n) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    return `${day}/${month}/${year}`;
  };


  const handleExport = (data, fileName, fileType) => {
    let exportData = [];

    if (status === "sales") {
      exportData = paginatedReports.map((item, index) => ({
        "S No": (currentPage - 1) * itemsPerPage + index + 1,
        "Date": item.date_time || '',
        "Vaithiyar Poova": item.vp_paid_amount || '',
        "Gramiyam": item.gr_paid_amount || 0,
        "Total": (
          parseFloat(item.vp_paid_amount || 0) +
          parseFloat(item.gr_paid_amount || 0)
        ).toFixed(2)
      }));
    } else {
      exportData = paginatedReports.map((item, index) => ({
        "S No": (currentPage - 1) * itemsPerPage + index + 1,
        "Employee ID": item.emp_id || '',
        "Vaithiyar Poova": item.vp_paid_amount || '',
        "Gramiyam": item.gr_paid_amount || 0,
        "Total": (
          parseFloat(item.vp_paid_amount || 0) +
          parseFloat(item.gr_paid_amount || 0)
        ).toFixed(2),
        "Incentive earned": item.incentive_earned
      }));
    }

    exportFormattedData(exportData, fileName || 'export_file', fileType);
  };


  return (
    <div className='common-body-st'>
      {/* Header */}
      <div className='header-div-el'>
        <h5>Report : {reportsData.length || 0}</h5>

        <div className="search-add-wrapper search-add-wrapper-st">
          {/* Date Range Filter */}
         {buttonPermissions.filter && (
          <div className='filter-container-up position-relative'>
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
          </div> )}
        {buttonPermissions.export && (
          <div className="filter-container-up">
            <ExportButton
              data={paginatedReports}
              fileName="AccountsData"
              onExport={handleExport}
              disabled={!paginatedReports || paginatedReports.length === 0}
            />
          </div>
         )}
        </div>
      </div>

      {/* Main Content */}
      <div className='body-div-el'>
        {/* Report Type Selection */}
        <div className="mb-3">
          <div className="status-toggle-up">
            <label htmlFor="status-active" className="custom-radio">
              <input
                type="radio"
                name="status"
                id="status-active"
                value="sales"
                checked={status === "sales"}
                onChange={(e) => setStatus(e.target.value)}
              />
              <span className="radio-button"></span> Sales report
            </label>

            <label htmlFor="status-inactive" className="custom-radio">
              <input
                type="radio"
                name="status"
                id="status-inactive"
                value="employee"
                checked={status === "employee"}
                onChange={(e) => setStatus(e.target.value)}
              />
              <span className="radio-button"></span> Employee report
            </label>
          </div>
        </div>



        {/* Reports Table */}
        <div className="reports-table-container overflow-auto">
          {loading ? (
            <div className='loading-container w-100 h-100'>
              <PropagateLoader
                height="100"
                width="100"
                color="#0B9346"
                radius="10"
              />
            </div>
          ) : (
            <div className='table-userpro-up w-100 h-100'>
              <div className='table-head-up d-flex'>
                {status === 'sales' ? (
                  <>
                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>S no</div>
                    <div className='w-20 p-2 d-flex justify-content-center align-items-center'>Date</div>
                    <div className='w-25 p-2 d-flex justify-content-center align-items-center'>Vaithiyar Poova</div>
                    <div className='w-25 p-2 d-flex justify-content-center align-items-center'>Gramiyam</div>
                    <div className='w-20 p-2 d-flex justify-content-center align-items-center'>Total</div>
                  </>
                ) : (
                  <>
                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>S no</div>
                    <div className='w-15 p-2 d-flex justify-content-center align-items-center'>Employee ID</div>
                    <div className='w-25 p-2 d-flex justify-content-center align-items-center'>Vaithiyar Poova</div>
                    <div className='w-15 p-2 d-flex justify-content-center align-items-center'>Gramiyam</div>
                    <div className='w-20 p-2 d-flex justify-content-center align-items-center'>Total</div>
                    <div className='w-15 p-2 d-flex justify-content-center align-items-center'>Incentive earned</div>
                  </>
                )}
              </div>

              <div className='table-body-up d-flex flex-column'>
                {paginatedReports.length > 0 ? (
                  paginatedReports.map((item, index) => (
                    <div className='table-bodydiv-up d-flex' key={index}>
                      {status === 'sales' ? (
                        <>
                          <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </div>
                          <div className='w-20 p-2 d-flex justify-content-center align-items-center'>
                            {formatDateTime(item.date_time)}
                          </div>
                          <div className='w-25 p-2 d-flex justify-content-center align-items-center'>
                            ₹ {item.vp_paid_amount || 0}
                          </div>
                          <div className='w-25 p-2 d-flex justify-content-center align-items-center'>
                            ₹ {item.gr_paid_amount || 0}
                          </div>
                          <div className='w-20 p-2 d-flex justify-content-center align-items-center'>
                            ₹ {Number(item.vp_paid_amount) + Number(item.gr_paid_amount) || 0}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </div>
                          <div className='w-15 p-2 d-flex justify-content-center align-items-center'>
                            {item.emp_id || ''}
                          </div>
                          <div className='w-25 p-2 d-flex justify-content-center align-items-center'>
                            {item.vp_paid_amount || 0}
                          </div>
                          <div className='w-15 p-2 d-flex justify-content-center align-items-center'>
                            {item.gr_paid_amount || 0}
                          </div>
                          <div className='w-20 p-2 d-flex justify-content-center align-items-center'>
                            ₹ {Number(item.vp_paid_amount) + Number(item.gr_paid_amount) || 0}
                          </div>
                          <div className='w-15 p-2 d-flex justify-content-center align-items-center'>
                            ₹ {item.incentive_earned || 0}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className='table-bodydiv-up d-flex'>
                    <div className='w-100 p-4 text-center text-muted'>
                      No data found
                    </div>
                  </div>
                )}
              </div>
            </div>
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
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </label>
          <Pagination
            count={reportsData.length}
            page={currentPage}
            pageSize={itemsPerPage}
            onChange={(pageNo) => setCurrentPage(pageNo)}
          />
        </div>
      </div>

      {/* Toast Container */}
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

export default Reports;