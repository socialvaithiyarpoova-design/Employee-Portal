import React, { useEffect, useState } from 'react';
import axios from 'axios';
import configModule from '../../../config.js';
import Pagination from '../../components/Pagination/index.jsx';
import filtericon from '../../assets/images/filtericon.svg';
import '../../assets/styles/user-profile.css';
import '../../assets/styles/accounts.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { useLocation } from 'react-router-dom';
import FilterModal from '../../components/filter-modal.jsx';
import gold from '../../assets/images/gold.svg';
import bronze from '../../assets/images/bronze.svg';
import silver from '../../assets/images/silver.svg';
import { ExportButton, exportFormattedData } from '../../components/export-page.jsx';

function LeadsPool() {
  const config = configModule.config();
  const {user, accessMenu } = useAuth();
  const location = useLocation();
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [viewMode, setViewMode] = useState('today');
  const user_id =user?.userId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buttonPermissions, setButtonPermissions] = useState({});
  const [isFilterHover, setIsFilterHover] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState('');
  const [activeButton, setActiveButton] = useState(null);
  const allLeads = viewMode === "today" ? leads : totalLeads;

  useEffect(() => {
    if (accessMenu && location.pathname) {
      const currentPath = location.pathname;
      const menuItem = accessMenu.find(item => item.path === currentPath & item.user_id === user_id );

      if (menuItem) {
        setButtonPermissions({
          search: menuItem.search_btn === 1 || menuItem.search_btn === 'YES',
          filter: menuItem.filter_btn === 1 || menuItem.filter_btn === 'YES',
          export: menuItem.export_btn === 1 || menuItem.export_btn === 'YES'
         
        });
      } else {
        setButtonPermissions({});
      }
    }
  }, [accessMenu, location.pathname]);

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

const fetchPool = async (objStatus = '') => {
  setLoading(true);
  setError(null);

  try {
    const todayDate = getTodayDate();
    
    const payload = {
      filteredData: {
        branch_id: objStatus?.branch_id || null,
        employee_id: objStatus?.employee_id || null,
        // Only send dates when in "today" mode or when filter has dates
        ...(viewMode === 'today' && {
          startDate: objStatus?.startDate || todayDate,
          endDate: objStatus?.endDate || todayDate
        }),
        // For total mode, only include dates if explicitly filtered
        ...(viewMode === 'total' && objStatus?.startDate && {
          startDate: objStatus.startDate,
          endDate: objStatus.endDate
        })
      }
    };

    console.log('Sending payload:', payload);

    const res = await axios.post(`${config.apiBaseUrl}getLeadPool`, payload);

    if (res.status === 200) {
      const data = res.data?.data || [];
      const clData = res.data?.total_data || [];
      setShowFilterModal(false);

      setLeads(data);
      setTotalLeads(clData);
    } else {
      setError('Failed to fetch leads data');
    }
  } catch (error) {
    console.error('Error fetching leads:', error);
    setError('Error connecting to server');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPool();
  }, [viewMode]);

  const filtered = allLeads
    .filter(l => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return `${l.branch_name || ''} ${l.emp_name || ''} ${l.emp_id || ''} ${l.callback_count || ''} ${l.followup_count || ''} ${l.leads_count || ''} ${l.total_leads || ''} ${l.call_not_response || ''}`.toLowerCase().includes(q);
    });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const checkboxStyle = { width: 18, height: 18, accentColor: '#0B9346', cursor: 'pointer' };

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    fetchPool(items);
  };

  const handleReset = () => {
    setSelectedFilters('');
    fetchPool();
    setActiveButton(null);
  };

  const handleExport = (fileName, fileType) => {
    const dataToExport = viewMode === "today" ? leads : totalLeads;

    const formattedData = dataToExport.map((item, index) => {
      const baseData = {
        "S.No": index + 1,
        "Branch": item.branch_name || '',
        "Name": item.emp_name || '',
        "Emp ID": item.emp_id || '',
        "Total": viewMode === "today"
          ? Number(item.lead_count || 0) + Number(item.callback_count || 0) + Number(item.followup_count || 0)
          : item.total_leads || '',
        "🥇 Gold": viewMode === "today" ? item.callback_count || 0 : item.gold_count || 0,
        "🥈 Silver": viewMode === "today" ? item.followup_count || 0 : item.silver_count || 0,
        "🥉 Bronze": viewMode === "today"
          ? Number(item.lead_count || 0) + Number(item.callback_count || 0) + Number(item.followup_count || 0)
          : item.bronze_count || 0,
      };

      if (viewMode === "today") {
        baseData["Call Not Response"] = item.call_not_response || 0;
      }

      return baseData;
    });

    exportFormattedData(formattedData, fileName || `Leads Pool`, fileType);
  };
  

  return (
    <div className='common-body-st'>
      <div className='header-div-ac'>
        <div className='header-divpart-el'>
          <div className='d-flex flex-column gap-2'>
            <div className='d-flex align-items-center gap-3'>
              <p className='mb-0 header-titlecount-el'>
                {viewMode === 'today' ? `Today's total: ` : `Total leads: `}
              </p>
            </div>
            <div className='d-flex align-items-center gap-3'>
              <label className='d-flex align-items-center custom-radio gap-2' style={{ cursor: 'pointer' }}>
                <input type='radio' name='viewMode' checked={viewMode === 'today'} onChange={() => { setViewMode('today'); setPage(1); }} style={checkboxStyle} />
                <span className="radio-button"></span><span>Today</span>
              </label>
              <label className='d-flex align-items-center custom-radio gap-2' style={{ cursor: 'pointer' }}>
                <input type='radio' name='viewMode' checked={viewMode === 'total'} onChange={() => { setViewMode('total'); setPage(1); }} style={checkboxStyle} />
                <span className="radio-button"></span><span>Total</span>
              </label>
            </div>
          </div>
        </div>
        <div className='search-add-wrapper'>
          {buttonPermissions.search && (
            <input type='text' className='search-input' placeholder='Search' value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} />
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
          {buttonPermissions.export && (
            <div className="filter-container-up">
              <ExportButton
                data={viewMode === "today" ? leads : totalLeads}
                fileName="Leads Pool"
                onExport={(data, fileName, fileType) =>
                  exportFormattedData(data, fileName, fileType)
                }
                disabled={!((viewMode === "today" ? leads : totalLeads) || []).length}
              />
            </div>
          )}
        </div>
      </div>

      <div className='body-div-ac'>
        <div className='h-100 w-100 p-2 pb-0'>
          {loading && (
            <div className='text-center p-4'>
              <div className='spinner-border text-success'>
                <span className='visually-hidden'>Loading...</span>
              </div>
              <p className='mt-2'>Loading leads...</p>
            </div>
          )}

          {error && (
            <div className='alert alert-danger m-3' role='alert'>
              <strong>Error:</strong> {error}
              <button
                type='button'
                className='btn btn-sm btn-outline-danger ms-3'
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className='table-common-st'>
              <div className='tb-header-row-st display-flex' style={{ minWidth: viewMode === "today" ? "1312px" : "1112px" }}>
                <div className='brcommon-col-st w-10'>
                  S no
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  Branch
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className={viewMode === "today" ? 'brcommon-col-st w-14' : 'brcommon-col-st w-16'}>
                  Name
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className={viewMode === "today" ? 'brcommon-col-st w-12' : 'brcommon-col-st w-15'}>
                  Emp ID
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className={viewMode === "today" ? 'brcommon-col-st w-10' : 'brcommon-col-st w-11'}>
                  {viewMode === "today" ? 'Leads' : 'Total'}
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className={viewMode === "today" ? 'brcommon-col-st w-10' : 'brcommon-col-st w-11'}>
                  {viewMode === "total" && (
                    <img src={gold} style={{ marginRight : "4px" }}  alt="gold" />
                  )}
                  {viewMode === "today" ? 'Follow up' : 'Gold'}
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className={viewMode === "today" ? 'brcommon-col-st w-10' : 'brcommon-col-st w-11'}>
                  {viewMode === "total" && (
                    <img src={silver} style={{ marginRight : "4px" }}  alt="silver" />
                  )}
                  {viewMode === "today" ? 'Call back' : 'Silver'}
                </div> <span style={{ color: "#129347" }}> | </span>
                 {viewMode === "today" && (
                  <>                  
                    <div className='brcommon-col-st w-10'>
                      Call Not Response
                    </div>
                     <span style={{ color: "#129347" }}> | </span>
                  </>
                )}
                <div className={viewMode === "today" ? 'brcommon-col-st w-10' : 'brcommon-col-st w-11'}>
                  {viewMode === "total" && (
                    <img src={bronze} style={{ marginRight : "4px" }} alt="bronze" />
                  )}
                  {viewMode === "today" ? 'Total' : 'Bronze'}
                </div>
               
              </div>

              <div className='tb-body-row-st' style={{ minWidth: viewMode === "today" ? "1312px" : "1112px" }}>
                {paginated.length > 0 ? paginated.map((l, idx) => (
                  <div className='display-flex br-rowst' key={`${l.source}-${l.id}-${idx}`}>
                    <div className='brcommon-col-st w-10'>
                      {(page - 1) * pageSize + idx + 1}
                    </div>
                    <div className='brcommon-col-st w-15' title={l.branch_name}>
                      {l.branch_name || "Admin"}
                    </div>
                    <div className={viewMode === "today" ? 'brcommon-col-st w-14' : 'brcommon-col-st w-16'}>
                      {l.emp_name}
                    </div>
                    <div className={viewMode === "today" ? 'brcommon-col-st w-12' : 'brcommon-col-st w-15'}>
                      {l.emp_id}
                    </div>
                    <div className={viewMode === "today" ? 'brcommon-col-st w-10' : 'brcommon-col-st w-11'}>
                      {l.lead_count}
                    </div>
                    <div className={viewMode === "today" ? 'brcommon-col-st w-10' : 'brcommon-col-st w-11'}>
                      {viewMode === "today" ? l.followup_count : l.gold_count}
                    </div>
                    <div className={viewMode === "today" ? 'brcommon-col-st w-10' : 'brcommon-col-st w-11'}>
                      {viewMode === "today" ? l.callback_count : l.silver_count}
                    </div>
                    {viewMode === "today" && (
                      <div className='brcommon-col-st w-10'>
                        {l.not_response_count || 0}
                      </div>
                    )}
                    <div className={viewMode === "today" ? 'brcommon-col-st w-10' : 'brcommon-col-st w-11'}>
                      {viewMode === "today" ? Number(l.lead_count) + Number(l.callback_count)+ Number(l.not_response_count) + Number(l.followup_count) : l.bronze_count}
                    </div>
                    
                  </div>
                )) : (
                  <div className='tb-nodata-row-st display-flex'>
                    No leads found
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className='footer-tab-st'>
              <label htmlFor="pageSizeSelect" className="me-2">
                Results per page{" "}
                <select
                  id="pageSizeSelect"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
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
                count={filtered.length}
                page={page}
                pageSize={pageSize}
                onChange={(pageNo) => setPage(pageNo)}
              />
            </div>
          )}
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

export default LeadsPool;