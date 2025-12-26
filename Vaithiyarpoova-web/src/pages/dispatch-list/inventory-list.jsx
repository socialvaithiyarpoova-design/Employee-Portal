import React, { useState, useEffect, useRef } from 'react';
import filtericon from '../../assets/images/filtericon.svg';
import FilterModal from '../../components/filter-modal.jsx';
import { useAuth } from '../../components/context/Authcontext.jsx';
import configModule from '../../../config.js';
import Pagination from "../../components/Pagination/index.jsx";
import { PropagateLoader } from 'react-spinners';
import axios from 'axios';
import '../../assets/styles/user-profile.css';
import { useLocation } from 'react-router-dom';

function Inventorydis() {
  const config = configModule.config();
  const [needLoading, setNeedLoading] = useState(false);
  const [selected, setSelected] = useState('Vaithiyar Poova');
  const { user ,accessMenu } = useAuth();
  const userId = user?.userId;
  const location = useLocation(); 
  const { slectdispatch} =location.state || {};
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeButton, setActiveButton] = useState("");
  const [stockFilter, setStockFilter] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isFilterHover, setIsFilterHover] = useState(false);
  const dropdownRef = useRef(null);
  const filterBtnRef = useRef(null);
  const [selectedFilters, setSelectedFilters] = useState('');

  // Button permission states
  const [buttonPermissions, setButtonPermissions] = useState({});

  // Get current location and menu
  const locationHook = useLocation();
  const pathname = locationHook?.pathname;
  const db_state_item = locationHook?.state?.db_type;
  const [dbInitialDbState, setDBInitialDbState] = useState(db_state_item || "");

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


const fetchProducts = async (objFilter = "") => {
  setNeedLoading(true);

  try {
    const response = await axios.post(`${config.apiBaseUrl}get-products-by-brand`, {
      brand: selected,
      user_id:slectdispatch?.branch_recid,
      status: objFilter?.status || (dbInitialDbState || "")
    });
    
    let filtered = response.data;
    if (objFilter?.status) {
      filtered = filtered.filter(p => p.stock_status === objFilter.status);
    }
    else if (stockFilter) {
      filtered = filtered.filter(p => p.stock_status === stockFilter);
    }
    
    setFilteredProducts(filtered);
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    setNeedLoading(false);
    setShowFilterModal(false);
    if (dbInitialDbState) setDBInitialDbState("");
  }
};

  useEffect(() => {
    fetchProducts();
  }, [selected, stockFilter]);

  // Escape handler for modal
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setShowFilterModal(false);
        setIsFilterHover(false);
        if (filterBtnRef.current) { filterBtnRef.current.blur(); }
      }
    };
    if (showFilterModal) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [showFilterModal]);

  // Load button permissions based on current path
  useEffect(() => {
    if (accessMenu && pathname) {
      const currentPath = pathname;
      const menuItem = accessMenu.find(item => item.path === currentPath && item.user_id === userId);

      if (menuItem) {
        setButtonPermissions({
          filter: menuItem.filter_btn === 1,
          export: menuItem.export_btn === 1,
          upgrade: menuItem.upgrade_btn === 1
        });
      } else {
        setButtonPermissions({});
      }
    }
  }, [accessMenu, pathname]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const statusClassMap = {
    "Available": "status-label-available",
    "Low Stock": "status-label-low-stock",
    "Not Available": "status-label-not-available"
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

const onFilterDataFunc = (items) => {
  setSelectedFilters(items);
  if (items?.status) {
    setStockFilter(items.status);
  }
  fetchProducts(items);
};

const handleReset = () => {
  setSelectedFilters('');
  setStockFilter(null); 
  fetchProducts();
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
      <div className='header-container-products'>
        <div className='d-flex header-product-el '>
          <div className="col-lg-6 col-6 d-flex  align-items-center">
            <div className="header-product-pvt">
              <h6 className="mt-0 mb-0 product-header-text">Inventory</h6>
              <div className="checkbox-group-product mt-2 ">
                <label className="checkbox-item-product ">
                  <input
                    type="checkbox"
                    name="product"
                    value="Vaithiyar Poova"
                    className="custom-checkbox"
                    checked={selected === 'Vaithiyar Poova'}
                    onChange={(e) => setSelected(e.target.value)}
                  />
                  <span className="box">{selected === 'Vaithiyar Poova' && <span className="dot" />}</span> Vaithiyar Poova
                </label>
                <label className="checkbox-item-product">
                  <input
                    type="checkbox"
                    name="product"
                    value="Gramiyam"
                    className="custom-checkbox"
                    checked={selected === 'Gramiyam'}
                    onChange={(e) => setSelected(e.target.value)}
                  />
                  <span className="box"> {selected === 'Gramiyam' && <span className="dot" />}</span> Gramiyam
                </label>
              </div>
            </div>
          </div>
          <div className='col-lg-6  col-6 d-flex flex-wrap justify-content-end search-add-wrapper ' >
            {buttonPermissions.filter && (
              <div className="product-filter-dropdowns" ref={dropdownRef}>
                <button
                  className={`product-filter-btns ${activeButton === 'filter' ? 'active' : ''}`}
                  type="button"
                  onClick={() => { setShowFilterModal(true); setActiveButton('filter'); }}
                  onMouseEnter={() => setIsFilterHover(true)}
                  onMouseLeave={() => setIsFilterHover(false)}
                  ref={filterBtnRef}
                  style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}
                  tabIndex={0}
                  aria-label="Filter inventory by stock status"
                >
                  <img src={filtericon} alt="img" style={{ filter: (activeButton === 'filter' || isFilterHover) ? 'invert(1) brightness(2)' : 'none' }} />
                  <span style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346', marginLeft: 6 }}>Filter</span>
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
        <div className='body-container-products'>        
           <div className='h-100 w-100 p-2 pb-0'>
            <div className='table-common-st'>
                <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
                    <div className='brcommon-col-st w-8'>
                        S no
                    </div> <span style={{ color: "#129347" }}> | </span>
                    <div className='brcommon-col-st w-15'>
                    Product ID
                    </div> <span style={{ color: "#129347" }}> | </span>
                    <div className='brcommon-col-st w-18'>
                     Product
                    </div> <span style={{ color: "#129347" }}> | </span>
                    <div className='brcommon-col-st w-17'>
                    Category
                    </div> <span style={{ color: "#129347" }}> | </span>
                    <div className='brcommon-col-st w-10'>
                    Selling Price
                    </div> <span style={{ color: "#129347" }}> | </span>
                    
                    <div className='brcommon-col-st w-10'>
                    Min Qty
                    </div> <span style={{ color: "#129347" }}> | </span>
                    <div className='brcommon-col-st w-10'>
                    In Stock
                    </div>
                    <span style={{ color: "#129347" }}> | </span>
                    <div className='brcommon-col-st w-12'>
                    Status
                    </div>
                </div>

                <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
                    {currentProducts && currentProducts.length > 0 ? (currentProducts.map((item, index) => (
                        <div className='display-flex br-rowst' key={item.product_recid}>
                            <div className='brcommon-col-st w-8'>
                               {startIndex + index + 1}
                            </div><span style={{ color: "#ffffffff" }}> | </span>
                              <div className='brcommon-col-st w-15'>
                             {item.product_id}
                            </div><span style={{ color: "#ffffffff" }}> | </span>
                            <div className='brcommon-col-st w-18'>
                               {item.product_name}
                            </div><span style={{ color: "#ffffffff" }}> | </span>
                            <div className='brcommon-col-st w-17'>
                               {item.product_category}
                            </div><span style={{ color: "#ffffffff" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                               ₹{item.selling_price}
                            </div><span style={{ color: "#ffffffff" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                                {item.min_stock_quantity}
                            </div><span style={{ color: "#ffffffff" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                                {item.quantity}
                            </div><span style={{ color: "#ffffffff" }}> | </span>
                            <div className='brcommon-col-st w-12'>
                                <span className={statusClassMap[item.stock_status] || ""}>{item.stock_status}</span>
                            </div>                                   
                        </div>
                    ))) : (
                        <div className='tb-nodata-row-st display-flex'>
                            No Inventory list
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
                {filteredProducts.length > itemsPerPage && (
                <Pagination
                  count={filteredProducts.length}
                  page={currentPage}
                  pageSize={itemsPerPage}
                  onChange={(pageNo) => setCurrentPage(pageNo)}
                />
              )}
            </div>
           </div>
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

export default Inventorydis;
