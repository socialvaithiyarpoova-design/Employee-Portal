import { useState, useEffect, useRef } from 'react';
import FilterModal from '../../components/filter-modal.jsx';
import configModule from '../../../config.js';
import Pagination from "../../components/Pagination/index.jsx";
import updatetd from '../../assets/images/updatebtn.svg';
import { PropagateLoader } from 'react-spinners';
import axios from 'axios';
import './stocks.css';
import Updatestock from './updatestock.jsx';
import Addstock from './addstock.jsx';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../components/context/Authcontext.jsx';
import SvgContent from '../../components/svgcontent.jsx';

function Stocks() {
  const config = configModule.config();
  const location = useLocation();
  const pathname = location?.pathname;
  const { user, accessMenu } = useAuth();


  const [needLoading, setNeedLoading] = useState(false);
  const [selected, setSelected] = useState('Vaithiyar Poova');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [stockFilter, setStockFilter] = useState(null);
  const [updatePrice, setUpdatePrice] = useState(false);
  const [exportin, setExportin] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [buttonPermissions, setButtonPermissions] = useState({});
  const dropdownRef = useRef(null);
  const filterBtnRef = useRef(null);
  const [selectedFilters, setSelectedFilters] = useState('');

  // Load button permissions for Stock page
  useEffect(() => {
    if (user && Array.isArray(accessMenu)) {
      const found = accessMenu.find(m => m.path === pathname);
      if (found) {
        setButtonPermissions({
          filter: found.filter_btn === 1,
          add: found.add_btn === 1,
          upgrade: found.upgrade_btn === 1,
          search: found.search_btn === 1,
        });
      } else {
        setButtonPermissions({});
      }
    } else {
      setButtonPermissions({});
    }
  }, [user, accessMenu, pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (activeButton === 'filter') setActiveButton(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeButton]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setShowFilterModal(false);
        setActiveButton(null);
        if (filterBtnRef.current) { filterBtnRef.current.blur(); }
      }
    };
    if (showFilterModal) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [showFilterModal]);

  const openviewmodel = () => { setUpdatePrice(true); }
  const closviewemodel = () => { setUpdatePrice(false); }
  const openexportmodel = () => { setExportin(true); setActiveButton('add'); }
  const closexportmodel = () => { setExportin(false); setActiveButton(null); }

  const fetchProducts = async (objItem = '') => {
    setNeedLoading(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}gettocks`, {
        brand: selected,
        status:  objItem?.status
      });
    
      if (stockFilter) {
        const filtered = response.data.filter(p => p.stock_status === stockFilter);
        setFilteredProducts(filtered);
        setShowFilterModal(false);
      } else {
        setFilteredProducts(response.data);
        setShowFilterModal(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selected, stockFilter]);



  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const statusClassMap = {
    "Available": "status-label-available",
    "Low Stock": "status-label-low-stock",
    "Not Available": "status-label-not-available"
  };

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    fetchProducts(items);
  };

  const handleReset = () => {
    setSelectedFilters('');
    fetchProducts();
    setActiveButton(null);
  };



  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
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
              <h6 className="mt-0 mb-0 product-header-text">Stock</h6>
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
              </div>
            )}
            {buttonPermissions.add && (
              <div><button type='button' className={`stocks-add-btn ${activeButton === 'add' ? 'active' : ''}`} onClick={openexportmodel} >Add</button></div>
            )}
          </div>
        </div>

        <div className='stock-body-container-products'>
                <div className='h-100 w-100 pt-2 pb-0'>
                    <div className='table-common-st'>
                        <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
                            <div className='brcommon-col-st w-5'>
                               S.No
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                              ID
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-14'>
                              Product
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-12'>
                              Category
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-12'>
                              SellingPrice
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                              Units
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-7'>
                              MinQty
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                              InStock
                            </div> <span style={{ color: "#129347" }}> | </span>
                             <div className='brcommon-col-st w-12'>
                            Status
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-8'>
                               Upgrade
                            </div> <span style={{ color: "#129347" }}> | </span>
                        </div>

                        <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
                            {currentProducts && currentProducts.length > 0 ?
                             (currentProducts.map((item, index) => (
                                <div className='display-flex br-rowst' key={item.stock_recid}>
                                    <div className='brcommon-col-st w-5'>
                                      {startIndex + index + 1}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-10'>
                                        {item.stock_product_id}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-14'>
                                       {item.product_name}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-12'>
                                      {item.product_category}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-12'>
                                      ₹{item.selling_price}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-10'>
                                      {item.units}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-7'>
                                      {item.min_stock_qty}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-10'>
                                     {item.stock_quantity}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>                                   
                                    <div className='brcommon-col-st w-12'>
                                     <span className={statusClassMap[item.stock_status] || ""}>{item.stock_status}</span>
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-8'>
                                         <button type='update' onClick={(e) => { openviewmodel(); setSelectedProduct(item); }}>
                                          <img src={updatetd} alt="close" style={{ cursor: "pointer" }} />
                                        </button>
                                    </div>
                                </div>
                            ))) : (
                                <div className='tb-nodata-row-st display-flex'>
                                    No stocks found.
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
      {updatePrice && (
        <Updatestock onClose={closviewemodel} getstocks={fetchProducts} stocks={selectedProduct} />)
      }
      {exportin && (
        <Addstock onClose={closexportmodel} getstocks={fetchProducts} />)
      }


      {showFilterModal && (
        <FilterModal onFilterData={onFilterDataFunc} selectedFilters={selectedFilters}
          onClose={() => { setShowFilterModal(false); setActiveButton(null); }}
        />
      )}
    </div>
  );
}

export default Stocks;
