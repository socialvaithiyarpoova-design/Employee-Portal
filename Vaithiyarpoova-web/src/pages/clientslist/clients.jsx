import React, { useState, useEffect } from 'react';
import { PropagateLoader } from 'react-spinners';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { useLocation ,useNavigate} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import configModule from '../../../config.js';
import Pagination from "../../components/Pagination/index.jsx";
import FilterModal from '../../components/filter-modal.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import { ExportButton, exportFormattedData } from '../../components/export-page.jsx';
import '../../assets/styles/user-profile.css';
import silver from '../../assets/images/silver.svg';
import gold from '../../assets/images/gold.svg';
import bronze from '../../assets/images/bronze.svg';
import filtericon from '../../assets/images/filtericon.svg';

function ClientsPage() {
  const [clientDataList, setClientDataList] = useState([]);
  const [shopDataList, setShopDataList] = useState([]);
  const [needLoading, setNeedLoading] = useState(false);
  const { user, accessMenu } = useAuth();
  const location = useLocation();
  const pathname = location?.pathname;
  const user_id = user?.userId;
  const user_typecode = user?.user_typecode;
  const config = configModule.config();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("people");
  const allClientData = (() => {
  if (status === "shop") return shopDataList;
  if (user_typecode === "FS") return shopDataList;
  return clientDataList;
})();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isFilterHover, setIsFilterHover] = useState(false);
  const navigate = useNavigate();
  const [buttonPermissions, setButtonPermissions] = useState({});
  const [selectedFilters, setSelectedFilters] = useState('');

  const getClientsData = async (objStatus = null) => {
    setNeedLoading(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}getClientsData`, {
        user_typecode: user_typecode || "",
        startDate: objStatus?.startDate || '',
        endDate: objStatus?.endDate || '',
        branch_id: objStatus?.branch_id || null,
        emp_id: objStatus?.employee_id || null,
        premium_id: objStatus?.premium || '',
        category: objStatus?.category || '',
        user_id: user_id,
        country: objStatus?.country || null,
        state: objStatus?.state || null,
        district: objStatus?.district || null,
      });

      const result = response.data;
      if (response.status === 200) {
        setClientDataList(result.data);
        setShopDataList(result.shopData);
        setShowFilterModal(false);
      } else {
        toast.error("Failed to fetch client data details: " + result.message);
        console.error("Failed to fetch client data details: " + result.message);
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
    const controller = new AbortController();
    getClientsData(null);
    return () => controller.abort();
  }
}, [user]);

  // Load button permissions for Clients page
  useEffect(() => {
    if (user && Array.isArray(accessMenu)) {
      const found = accessMenu.find(m => m.path === pathname && m.user_id === user_id);
      if (found) {
        const perms = {
          search: found.search_btn === 1,
          sort: found.sort_btn === 1,
          filter: found.filter_btn === 1,
          export: found.export_btn === 1,
          people: found.people_btn === 1,
          shop: found.shop_btn === 1,
          purchase_history: found.purchase_history_btn === 1,
          consulting_history: found.consulting_history_btn === 1,
          class: found.class_btn === 1,
          wallet: found.wallet_btn === 1,
        };
        setButtonPermissions(perms);
        // Ensure status reflects allowed toggle
        if (status === 'people' && !perms.people && perms.shop) setStatus('shop');
        if (status === 'shop' && !perms.shop && perms.people) setStatus('people');
      } else {
        setButtonPermissions({});
      }
    } else {
      setButtonPermissions({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, accessMenu, pathname]);

  // Escape handler for modal
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

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleExport = (data, fileName, fileType) => {
    const exportData = currentClientData.map((item, index) => ({
      "S.No": (currentPage - 1) * itemsPerPage + index + 1,
      "Client ID": item.lead_id || item.flead_id || '', // Support both people and shop
      "Name": item.lead_name || item.flead_name || '',
      "Phone": item.mobile_number || '',
      "Category": item.category || '',
      "Type": item.disposition || '',
      "Handle By": item.created_by_name || '',
      "Date": item.created_at ? formatDateTime(item.created_at) : ''
    }));

    exportFormattedData(exportData, fileName || 'ClientList', fileType);
  };

  const indexOfLastClientData = currentPage * itemsPerPage;
  const indexOfFirstClientData = indexOfLastClientData - itemsPerPage;
  const paginatedClientData = allClientData.slice(indexOfFirstClientData, indexOfLastClientData);

  const currentClientData = paginatedClientData.filter((item) =>
    `${item.attendance_id} ${item.lead_name} ${item.emp_name} ${item.disposition} ${item.work_type} ${item.status}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };


  const handleSelect = (status) => {
    setShowDropdown(false);
    setActiveButton(null);
    getClientsData(status);
  };

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    getClientsData(items);
  };

  const handleFltReset = () => {
    setSelectedFilters('');
    getClientsData();
    setActiveButton(null);
  };


  const getIconSrc = (icon) => {
    switch (icon) {
      case 'silver':
        return silver;
      case 'gold':
        return gold;
      case 'bronze':
        return bronze;
      default:
        return '';
    }
  };

  
  return (
    <div className='common-body-st' style={{ backgroundColor: 'transparent' }}>
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
      <div className='header-div-ac'>
        <div className='header-divpart-el'>
          <div className='d-flex gap-2 mb-2'>
            <p className='mb-0 header-titlecount-el'>Clients: {(clientDataList?.length) + (shopDataList?.length)}</p>
          </div>

          {(user_typecode === "AD" || user_typecode === "BH" || user_typecode === "AC" || user_typecode === "DIS" ) &&
            (<div className="status-toggle-up">
              <label htmlFor="status-active" className="custom-radio">
                <input
                  type="radio"
                  name="status"
                  id="status-active"
                  value="people"
                  checked={status === "people"}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <span className="radio-button"></span> People: {clientDataList?.length}
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
                <span className="radio-button"></span> Shops: {shopDataList?.length}
              </label>
            </div>
            )}

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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <span
                onClick={() => setSearchQuery("")}
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
                type='button'
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
                <button className='filter-clear-st' onClick={handleFltReset} >
                  &times;
                </button>
              )}
            </div>
          )}

          {buttonPermissions.export && (
            <div className="filter-container-up">
              <ExportButton
                data={currentClientData}
                fileName="ClientList"
                onExport={handleExport}
                disabled={!currentClientData || currentClientData.length === 0}
              />
            </div>
          )}

          {/* Type dropdown for purchase/consulting/class/wallet, gated per-entry */}
          {(buttonPermissions.purchase_history || buttonPermissions.consulting_history || buttonPermissions.class || buttonPermissions.wallet) && (
            <div className="filter-container-up position-relative">
              {showDropdown && (
                <div className="dropdown-menu-st show" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  zIndex: 1000,
                  minWidth: '200px',
                  borderRadius: '8px',
                  padding: '8px 0'
                }}>
                  {buttonPermissions.purchase_history && (
                    <button className="btn-top-up btn-bg-filled mb-1 w-100 text-start" onClick={() => handleSelect('Sale')}>Purchase history</button>
                  )}
                  {buttonPermissions.consulting_history && (
                    <button className="btn-top-up btn-bg-filled mb-1 w-100 text-start" onClick={() => handleSelect('Consulting')}>Consulting history</button>
                  )}
                  {buttonPermissions.class && (
                    <button className="btn-top-up btn-bg-filled mb-1 w-100 text-start" onClick={() => handleSelect('Class')}>Class</button>
                  )}
                  {buttonPermissions.wallet && (
                    <button className="btn-top-up btn-bg-filled mb-1 w-100 text-start" onClick={() => handleSelect('Wallet')}>Wallet</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className='body-div-ac' style={{ backgroundColor: 'transparent' }}>
        <div className='h-100 w-100 p-2 pb-0'>
          <div className='table-common-st '>
            <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
              <div className='brcommon-col-st w-10'>
                S no
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Client ID
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Name
              </div> <span style={{ color: "#129347" }}> | </span>
            
              {status === "shop" && (
              <>
                <span style={{ color: "#129347" }}> | </span>
                <div className="brcommon-col-st w-15">Shop Type</div>{" "}
              </>)}

              <div className='brcommon-col-st w-15'>
                Mobile
              </div> <span style={{ color: "#129347" }}> | </span>             
              <div className='brcommon-col-st w-15'>
                Disposition
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Handled by
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Date
              </div>
            </div>

            <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
              {currentClientData && currentClientData.length > 0 ? (currentClientData.map((item, index) => (
                <div className='display-flex br-rowst' key={item.lead_recid || item.flead_recid  } onClick={() => navigate(
                    (user_typecode === "FS" || status === "shop") ? "/clients/sales/profile" : "/clients/profile",
                    { 
                      state: { 
                        selectedData: item, 
                        status_data: (user_typecode === "TSL" || user_typecode === "TCL" || user_typecode === "FOI") ? "people" : (user_typecode === "FS" || status === "shop" ? "shop" : status)
                      }
                    }
                  )} >
                  <div className='brcommon-col-st w-10'>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </div><span style={{ color: "#ffffffff" }}> | </span>
                  <div className='brcommon-col-st w-15'>
                    {item.lead_id ?? item.flead_id}
                    {item.icon && (
                      <img
                        src={getIconSrc(item.icon)}
                        alt='icon'
                      />
                    )}
                  </div><span style={{ color: "#ffffffff" }}> | </span>
                  <div className='brcommon-col-st w-15'>
                    {item.lead_name ?? item.flead_name}
                  </div><span style={{ color: "#ffffffff" }}> | </span>
                  {status === "shop" && (
                      <>
                        <span style={{ color: "#ffffffff" }}> | </span>
                        <div className="brcommon-col-st w-15">
                          {item.shop_type}
                        </div>
                      </>
                    )}
                  <div className='brcommon-col-st w-15'>
                    {item.mobile_number}
                  </div><span style={{ color: "#ffffffff" }}> | </span>
                  <div className='brcommon-col-st w-15'>
                    {item.disposition}
                  </div><span style={{ color: "#ffffffff" }}> | </span>
                  <div className='brcommon-col-st w-15'>
                    {item.created_by_name || item.handler_name}
                  </div><span style={{ color: "#ffffffff" }}> | </span>
                  <div className="brcommon-col-st w-15 " >
                    {item.created_at ? formatDateTime(item.created_at) : ''}
                  </div>
                </div>
              ))) : (
                <div className='tb-body-row-st display-flex'>
                  {status === "people" ? "No people list" : "No shop list"}
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
                <option value={100}>100</option>
              </select>
            </label>
            <Pagination
              count={allClientData.length}
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
    </div>
  );
}

export default ClientsPage;
