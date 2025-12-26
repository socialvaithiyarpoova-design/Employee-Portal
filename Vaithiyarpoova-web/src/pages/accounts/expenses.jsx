import React, { useState, useEffect, useRef } from 'react';
import { PropagateLoader } from 'react-spinners';
import '../../assets/styles/accounts.css';
import '../../assets/styles/user-profile.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import configModule from '../../../config.js';
import Pagination from "../../components/Pagination/index.jsx";
import SvgContent from '../../components/svgcontent.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import { ExportButton, exportFormattedData } from '../../components/export-page.jsx';
import printer from '../../assets/images/printer.svg';
import FilterModal from '../../components/filter-modal.jsx';
import filtericon from '../../assets/images/filtericon.svg';

function Expenses() {
  const [expensesData, setExpensesData] = useState([]);
  const [needLoading, setNeedLoading] = useState(false);
  const { user, accessMenu } = useAuth();
  const location = useLocation();
  const pathname = location?.pathname;
  const [buttonPermissions, setButtonPermissions] = useState({});
  const config = configModule.config();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpRowData, setSelectedExpRowData] = useState(null);
  const [isExpPopupOpen, setIsExpPopupOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [selectedExpenseForDecline, setSelectedExpenseForDecline] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState('');
  const [isFilterHover, setIsFilterHover] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPending, setShowPending] = useState(true);

  const getExpensesList = async (objItem = '') => {
        setNeedLoading(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}getExpensesList`, {
        startDate: objItem?.startDate || '',
        endDate: objItem?.endDate || '',
        status:  objItem?.status === "Decline" ? "Declined" : (objItem?.status || ''),
        branch: objItem?.branch_id || ''
      });

      const result = response.data;
      if (response.status === 200) {
        setExpensesData(result.data || []);
        setShowFilterModal(false);
      } else {
        toast.error("Failed to fetch expenses: " + result.message);
        console.error("Failed to fetch expenses: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching expenses: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  const updateExpenseStatus = async (expense_id, status, reason = '') => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}updateExpenseStatus`, {
        expense_id,
        status,
        reason
      });

      if (response.status === 200) {
        toast.success(`Expense ${status} successfully`);
        getExpensesList();
      } else {
        toast.error("Failed to update expense status");
      }
    } catch (error) {
      toast.error("Error updating expense status: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeclineClick = (expense) => {
    setSelectedExpenseForDecline(expense);
    setDeclineReason('');
    setShowDeclineModal(true);
    setIsExpPopupOpen(false);
  };

  const handleDeclineSubmit = async () => {
    if (!declineReason.trim()) {
      toast.error("Please enter a reason for declining");
      return;
    }

    await updateExpenseStatus(selectedExpenseForDecline.id, 'declined', declineReason);
    setShowDeclineModal(false);
    setDeclineReason('');
    setSelectedExpenseForDecline(null);
  };

  const handleDeclineCancel = () => {
    setShowDeclineModal(false);
    setDeclineReason('');
    setSelectedExpenseForDecline(null);
  };

  const getHistoryExpenses = () => {
    return expensesData.filter(expense => 
      expense.status === 'approved' || expense.status === 'declined'
    );
  };

  const getDisplayData = () => {
    if (showHistory) {
      return getHistoryExpenses();
    }
    if (showPending) {
      return expensesData.filter(expense => expense.status === 'pending');
    }
    return expensesData;
  };

  useEffect(() => {
    if (user) {
      getExpensesList();
    }
  }, [user]);

  useEffect(() => {
    if (user && Array.isArray(accessMenu)) {
      const foundMenu = accessMenu.find((m) => m.path === pathname && m.user_id === user?.userId);
      if (foundMenu) {
        setButtonPermissions({
          search: foundMenu.search_btn === 1,
          export: foundMenu.export_btn === 1,
          history: foundMenu.history_btn === 1,
          filter: foundMenu.filter_btn === 1,
        });
      } else {
        setButtonPermissions({});
      }
    } else {
      setButtonPermissions({});
    }
  }, [user, accessMenu, pathname]);

  const handleRowClick = (item, type) => {
    if (type === "VIEW") {
      setSelectedExpRowData(item);
      setIsExpPopupOpen(true);
    }
  };

  const handlePrint = (expense) => {
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Expense</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin-bottom: 20px; color: #0B622F; }
            .expense-details { margin-bottom: 20px; }
            .expense-details p { margin: 8px 0; }
            .expense-details strong { color: #333; }
            .receipt-image { max-width: 300px; margin-top: 15px; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <h3>Expense Details</h3>
          <div class="expense-details">
            <p><strong>Branch:</strong> ${expense.branch_name || ' Admin'}</p>
            <p><strong>Employee ID:</strong> ${expense.name || ''}</p>
            <p><strong>Date:</strong> ${new Date(expense.date_time).toLocaleDateString()}</p>
            <p><strong>Transaction ID:</strong> ${expense.transaction_id || '--'}</p>
            <p><strong>${expense.bill_type || 0}:</strong> ₹${expense.amount || 0}</p>
        <br>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleExport = (data) => {
    exportFormattedData(data, 'ExpensesData');
  };

  const handleHistoryClick = () => {
    setShowHistory(!showHistory);
    setShowPending(!showPending);
    setActiveButton(showHistory ? 'pending' : 'history');
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSelectedFilters('');
    setShowHistory(false);
    setShowPending(true);
    getExpensesList();
    setActiveButton('pending');
    setCurrentPage(1);
  };

  // Get display data based on history filter
  const displayData = getDisplayData();

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpensesData = displayData.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    getExpensesList(items);
  };

  return (
    <>
      <style>
        {`
          .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            text-transform: capitalize;
          }
          .icon-button {
            background: none;
            border: none;
            padding: 4px;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.2s;
          }
          .icon-button:hover {
            background-color: #f8f9fa;
          }
        `}
      </style>
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
          <div className='header-divpart-el d-flex gap-4 align-items-center' style={{ display: 'flex', flexDirection: 'row' }}>
            <span className='header-titlecount-el' style={{ display: 'inline-block' }}>
              {showHistory ? 'History Expenses' : showPending ? 'Pending Approvals' : 'Total Expenses'} : {displayData.length}
            </span>
          </div>

          <div className="search-add-wrapper">
            <input
              type="text"
              placeholder="Search"
              className="search-input-up"
              style={{padding:'6.5px 12px'}}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Filter Button */}
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
            
            {/* History Button */}
            {buttonPermissions.history && (
              <div className="filter-container-up position-relative">
                <button
                  className={`btn-top-up ${activeButton === 'history' ? 'active' : ''}`}
                  style={{
                    padding:'7px 15px',
                    color: activeButton === 'history' ? '#ffffff' : '#404040',
                    backgroundColor: activeButton === 'history' ? '#0B9346' : 'transparent'
                  }}
                  onClick={handleHistoryClick}
                >
                  <SvgContent svg_name="history" stroke={activeButton === 'history' ? '#ffffff' : '#404040'} width={20} height={20} />
                  <span>History</span>
                </button>
                
                {activeButton === 'history' && (
                  <button className='filter-clear-st' onClick={handleReset} >
                    &times;
                  </button>
                )}
              </div>
            )}

            {buttonPermissions.export && (
              <div className="filter-container-up">
                <ExportButton
                  data={currentExpensesData}
                  fileName="ExpensesData"
                  onExport={handleExport}
                  disabled={!currentExpensesData || currentExpensesData.length === 0}
                />
              </div>
            )}
          </div>
        </div>

        <div className='body-div-el'>

          {/* Expenses Table */}
          <div className='w-100 p-2 d-flex justify-content-center align-items-center' style={{ height: "calc(100% - 48px)" }}>
            {currentExpensesData && currentExpensesData.length > 0 ? (
              <div className='table-userpro-up w-100 h-100 overflow-auto'>
                <div className='table-head-up d-flex'>
                  <div className='w-10 p-2 d-flex justify-content-center align-items-center'>S.No</div>
                  <div className='w-20 p-2 d-flex justify-content-center align-items-center'>Branch</div>
                  <div className='w-15 p-2 d-flex justify-content-center align-items-center'>Value</div>
                  <div className='w-15 p-2 d-flex justify-content-center align-items-center'>Date</div>
                  <div className='w-15 p-2 d-flex justify-content-center align-items-center'>Status</div>
                  <div className='w-15 p-2 d-flex justify-content-center align-items-center'>Actions</div>
                  <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Print</div>
                </div>

                <div className='table-body-up d-flex flex-column'>
                  {currentExpensesData.map((item, index) => (
                    <div className='table-bodydiv-up d-flex' key={index}>
                      <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </div>
                      <div className='w-20 p-2 d-flex justify-content-center align-items-center'>
                        {item.branch_name || 'Admin'}
                      </div>
                      <div className='w-15 p-2 d-flex justify-content-center align-items-center'>
                        ₹{item.amount || 0}
                      </div>
                      <div className='w-15 p-2 d-flex justify-content-center align-items-center'>
                        {new Date(item.date_time).toLocaleDateString()}
                      </div>
                      <div className='w-15 p-2 d-flex justify-content-center align-items-center'>
                        <span className={`status-badge ${item.status}`}>
                          {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
                        </span>
                      </div>
                      <div className='w-15 p-2 d-flex justify-content-center align-items-center'>
                        <button onClick={() => handleRowClick(item, "VIEW")} className="icon-button">
                          <SvgContent svg_name="eyeopen" />
                        </button>
                      </div>
                      <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                        <button onClick={() => handlePrint(item)} className="icon-button">
                          <img src={printer} alt="print" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>{showHistory && displayData.length === 0 ? 'No history found' : 'No data found'}</div>
            )}
          </div>

          {/* Pagination */}
          {displayData.length > 0 && (
            <div className='footer-tab-ap'>
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
                count={displayData.length}
                page={currentPage}
                pageSize={itemsPerPage}
                onChange={(pageNo) => setCurrentPage(pageNo)}
              />
            </div>
          )}
        </div>

        {/* Expense Details Modal */}
        {isExpPopupOpen && selectedExpRowData && (
          <div className="modal-overlay" onClick={() => setIsExpPopupOpen(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px', width: '90%' }}>
              <div className="mb-3"  style={{display:'flex',justifyContent:'space-between',alignItems:"center"}}>
                <h4 className='mb-1'>Expense Details</h4>
                <button className="modal-close" onClick={() => setIsExpPopupOpen(false)}><span className='fw-700'>✖</span></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Left Column - Branch Details & Expense Details */}
                  <div className="col-md-6">
                    {/* Branch Details Section */}
                    <div className="mb-4">
                      <h6 className="mb-3">Branch Details</h6>
                      <div className="row">
                        <div className="col-6">
                          <p className="mb-2"><strong>Branch Name:</strong></p>
                          <p className="mb-2"><strong>Branch head Name:</strong></p>
                          <p className="mb-2"><strong>Expense Add Date:</strong></p>
                        </div>
                        <div className="col-6">
                          <p className="mb-2">{selectedExpRowData.branch_name || 'Admin - VPA001'}</p>
                          <p className="mb-2">{selectedExpRowData.name || ''}</p>
                          <p className="mb-2">{selectedExpRowData.created_at}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expense Details Section */}
                    <div>
                      <h6 className="mb-3">Expense Details</h6>
                      <div className="row">
                        <div className="col-6">
                          <p className="mb-2"><strong>{selectedExpRowData.bill_type || 0}:</strong></p>                       
                        </div>
                        <div className="col-6">
                          <p className="mb-2">₹{selectedExpRowData.amount || 0}</p>                          
                        </div>
                        {selectedExpRowData.decline_reason && (
                          <>
                        <div className="col-6">
                          <p className="mb-2"><strong>Reject resoan:</strong></p>                       
                        </div>
                        <div className="col-6">
                          <p className="mb-2">{selectedExpRowData.decline_reason || '----'}</p>                          
                        </div>
                        </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Payment Details */}
                  <div className="col-md-6">
                    <h6 className="mb-3">Payment Details</h6>
                    <div className="row">
                      <div className="col-6">
                        <p className="mb-2"><strong>Total value:</strong></p>
                        <p className="mb-2"><strong>Payment type:</strong></p>
                        <p className="mb-2"><strong>Transaction ID:</strong></p>
                        <p className="mb-2"><strong>Date:</strong></p>
                      </div>
                      <div className="col-6">
                        <p className="mb-2">₹{selectedExpRowData.amount || 0}</p>
                        <p className="mb-2">{selectedExpRowData.payment_type || '--'}</p>
                        <p className="mb-2">{selectedExpRowData.transaction_id || '--'}</p>
                        <p className="mb-2">{new Date(selectedExpRowData.date_time).toLocaleDateString() }</p>
                      </div>
                    </div>

                    {/* Receipt Section */}
                    <div className="mt-3">
                      <p className="mb-2"><strong>Receipt:</strong></p>
                      {selectedExpRowData.imageUrl ? (
                        <div className="receipt-container">
                          <img
                            src={selectedExpRowData.imageUrl}
                            onClick={() => window.open(selectedExpRowData.imageUrl, "_blank")}
                            alt="Receipt"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              border: '1px solid #ccc',
                              borderRadius: '8px',
                              marginBottom: '10px'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="receipt-placeholder" style={{
                          border: '2px dashed #ccc',
                          borderRadius: '8px',
                          padding: '20px',
                          textAlign: 'center',
                          color: '#666'
                        }}>
                          <p>No receipt image available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {selectedExpRowData.status === 'pending' ? (
                  <div className=" d-flex justify-content-end gap-2">
                    <button
                      className="cancel-button"
                      onClick={() => handleDeclineClick(selectedExpRowData)}
                    >
                      Decline
                    </button>
                    <button
                      className="next-button"
                      onClick={() => {
                        updateExpenseStatus(selectedExpRowData.id, 'approved');
                        setIsExpPopupOpen(false);
                      }}
                    >
                      Approve
                    </button>
                  </div>
                ) : (
                  <button className="cancel-button" onClick={() => setIsExpPopupOpen(false)}>Close</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="modal-overlay" onClick={handleDeclineCancel}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
              <div className="modal-header mb-2" >
                <h4 style={{ fontWeight: 'bold', color: '#1f1f1fff' }}>Decline</h4>
                <button className="modal-close" onClick={handleDeclineCancel}>×</button>
              </div>
              <div className="modal-body">
                <p className="mb-3">Enter the reason for decline the order</p>
                <textarea
                  className="form-control-st h-px-102"
                  rows="4"
                  placeholder="Enter reason for declining..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                />
              </div>
              <div className="modal-footer d-flex justify-content-end gap-2">
                <button
                  className="cancel-button"
                  onClick={handleDeclineCancel}
                >
                  Cancel
                </button>
                <button
                  className="next-button"
                  onClick={handleDeclineSubmit}
                >
                  Save
                </button>
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
    </>
  );
}

export default Expenses;