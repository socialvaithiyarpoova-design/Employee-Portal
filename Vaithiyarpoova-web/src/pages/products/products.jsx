import React, { useState, useEffect, useRef } from 'react';
import './product.css'
import closebtn from '../../assets/images/closebtn.svg';
import filtericon from '../../assets/images/filtericon.svg';
import Actioneditebtn from '../../assets/images/actionedit.svg';
import CommonSelect from "../../components/common-select.jsx";
import Pagination from "../../components/Pagination/index.jsx";
import configModule from '../../../config.js';
import { useNavigate,useLocation } from 'react-router-dom';
import FilterModal from '../../components/filter-modal.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import axios from 'axios';
import Viewproduct from './viewproduct.jsx';
import { useAuth } from '../../components/context/Authcontext.jsx';


function Products() {
  const [selected, setSelected] = useState('Vaithiyar Poova');
  const [showModal, setShowModal] = useState(false);
  const [viewproduct, setViewproduct] = useState(false);
  const [delConfirmPopup, setDelConfirmPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [productBrand, setProductBrand] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [formFactor, setFormFactor] = useState([]);
  const [products, setProducts] = useState([]);
  const config = configModule.config();
  const [ptype, setPtype] = useState(null);
  const [factor, setFactor] = useState(null);
  const [brand, setBrand] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [counts, setCounts] = useState(null);
  const { user, accessMenu } = useAuth();
  const user_typecode = user?.user_typecode;
  const [selectedFilters, setSelectedFilters] = useState('');
  // Button permission states
  const [buttonPermissions, setButtonPermissions] = useState({});
  // Get current location and menu
  const location = useLocation();
  const pathname = location?.pathname;
  const [menuIndex, setMenuIndex] = useState(null);
  const [productTypeFilter, setProductTypeFilter] = useState(null);
  const dropdownRef = useRef(null);
  const filterBtnRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const formFactorSelectRef = useRef(null);
  const [isAddButtonActive, setIsAddButtonActive] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [isFilterHover, setIsFilterHover] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const toggleMenu = (index) => {
    setMenuIndex(menuIndex === index ? null : index);
  };

  const openmodel = () => {
    setShowModal(true);
    setIsAddButtonActive(true);
    // Focus on form factor dropdown when modal opens
    setTimeout(() => {
      if (formFactorSelectRef.current) {
        formFactorSelectRef.current.focus();
      }
    }, 100);
  }
  const closemodel = () => {
    setShowModal(false);
    setIsAddButtonActive(false);
  }
  const openviewmodel = () => { setViewproduct(true); }
  const closviewemodel = () => { setViewproduct(false); }
  const openDetetemodel = () => { setDelConfirmPopup(true); }
  const closDetetemodel = () => { setDelConfirmPopup(false); }

  const fetchProducts = async (objItem = '') => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}getProduct`, {
        brand: selected,
        form_factor: objItem?.form_factor || '',
        category: objItem?.category || '',
        user_id: user?.userId 
      });
      setProducts(response.data);
      setFilteredProducts(response.data);
      setShowFilterModal(false);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };


  async function fetchCounts() {
    try {
      const response = await axios.post(`${config.apiBaseUrl}getProductcount`);
      setCounts(response.data);
    } catch (err) {
      toast.error('Failed to fetch product counts');
      console.error(err);
    }
  }


  const fetchProductTypes = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}masters/product_types`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      if (response.ok) {
        const transformedData = (result.data || []).map(item => ({
          label: item.type_name,
          value: item.type_name,
          code: item.code,
          id: item.product_type_id
        }));
        setProductTypes(transformedData);
      } else {
        toast.error("Failed to fetch product types: " + result.message);
      }
    } catch (error) {
      toast.error("Error fetching product types: " + error.message);
    }
  };

  const fetchProducybrand = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}productBrand`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      if (response.ok) {
        const transformedData = (result.data || []).map(item => ({
          label: item.label,
          value: item.value,
          code: item.code,
          id: item.brand_id
        }));
        setProductBrand(transformedData);
      } else {
        toast.error("Failed to fetch product types: " + result.message);
      }
    } catch (error) {
      toast.error("Error fetching product types: " + error.message);
    }
  };

  const getformfactor = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}masters/form_factors`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      if (response.ok) {
        // Transform the data to match CommonSelect expected format
        const transformedData = (result.data || []).map(item => ({
          label: item.form_name,
          value: item.form_name,
          code: item.code,
          id: item.form_factor_id
        }));
        setFormFactor(transformedData);
      } else {
        toast.error("Failed to fetch form factors: " + result.message);
      }
    } catch (error) {
      toast.error("Error fetching form factors: " + error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selected]);

  useEffect(() => {
    fetchCounts();
    fetchProductTypes();
    fetchProducybrand();
    getformfactor();
  }, []);

  // Load button permissions
  useEffect(() => {
    if (user && accessMenu) {
      if (Array.isArray(accessMenu)) {
        // Find menu item by path (same as userProfile.jsx)
        const foundMenu = accessMenu.find(item => item.path === pathname && item.user_id === user?.userId );

        if (foundMenu) {
          // Create permissions object directly from foundMenu
          const permissions = {
            search: foundMenu.search_btn === 1,
            add: foundMenu.add_btn === 1,
            edit: foundMenu.edit_btn === 1,
            delete: foundMenu.delete_btn === 1,
            view: foundMenu.view_btn === 1,
            filter: foundMenu.filter_btn === 1
          };

          setButtonPermissions(permissions);
        } else {
          setButtonPermissions({});
        }
      } else {
        setButtonPermissions({});
      }
    }
  }, [user, accessMenu, pathname]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    let filtered = products;

    if (productTypeFilter) {
      filtered = filtered.filter(product => product.product_type === productTypeFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.product_id.toLowerCase().includes(term) ||
        product.product_name.toLowerCase().includes(term) ||
        product.product_category.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  }, [productTypeFilter, searchTerm, products]);

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const AddProduct = () => {
    if (!brand) {
      toast.error("You need to Select Product type.");
      return;
    }
    if (!ptype) {
      toast.error("You need to Select Product type.");
      return;
    }
    if (!factor) {
      toast.error("You need to Select Form factor.");
      return;
    }
    setShowModal(false);
    navigate('/products/add', {
      state: { brand,ptype, factor }
    });
  };

  const editProduct = (item) => {
    if (!item) {
      toast.error("No value found.");
      return;
    }
    navigate('/products/add', {
      state: { productData: item, type: "Edit" }
    });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuIndex(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // ESC handler for filter modal
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setShowFilterModal(false);
        setActiveButton(null);
        setIsFilterHover(false);
        if (filterBtnRef.current) { filterBtnRef.current.blur(); }
      }
    };
    if (showFilterModal) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [showFilterModal]);

  // Close open popups on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (showModal) return closemodel();
        if (viewproduct) return closviewemodel();
        if (delConfirmPopup) return closDetetemodel();
      }
    };
    if (showModal || viewproduct || delConfirmPopup) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showModal, viewproduct, delConfirmPopup]);

  const handleDelete = async () => {
    setDelConfirmPopup(false);
    setLoading(true);
    const product_recid = selectedProduct?.product_recid;

    try {
      const response = await axios.delete(`${config.apiBaseUrl}product/${product_recid}`, {
      data: {
        productName: selectedProduct?.product_name,
        userId: user?.userId,
      }
      });
      const result = response.data;

      if (response.status === 200) {
        toast.success('Product deleted successfully!');

        const responseData = result?.data;
        if (responseData) {
          fetch(`${config.apiBaseUrlpy}graph_update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tablename: responseData.table_name,
              type: responseData.method,
              id: responseData.id,
              column_name: responseData.id_column_name
            }),
          }).catch((err) => console.error("Graph update failed:", err));
        }

        await fetchProducts();
        await fetchCounts();
      } else {
        toast.error('Failed to delete product.');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete product.');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className='common-body-st'>
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
        theme="colored" />
      <div className='header-container-products'>
        <div className='d-flex header-product-el '>
          <div className="col-lg-6 col-6 d-flex  align-items-center">
            <div className="header-product-pvt">
              <h6 className="mt-0 mb-0 product-header-text">Total Products : {counts?.vaithyarPoovaCount + counts?.gramiyamCount}</h6>
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
                  <span className="box">{selected === 'Vaithiyar Poova' && <span className="dot" />}</span> Vaithiyar Poova : {counts?.vaithyarPoovaCount}
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
                  <span className="box"> {selected === 'Gramiyam' && <span className="dot" />}</span> Gramiyam : {counts?.gramiyamCount}
                </label>
              </div>
            </div>
          </div>
          <div className='col-lg-6  col-6 d-flex flex-wrap justify-content-end search-add-wrapper ' >
            {buttonPermissions.search && (
              <div className=''>
                <input type='search' className='product-search-input' placeholder='Search ' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            )}
            {buttonPermissions.filter && (
              <div className="product-filter-dropdowns" ref={dropdownRef}>
                <button
                  className={`product-filter-btns ${activeButton === 'filter' ? 'active' : ''}`}
                  type="button"
                  onClick={() => { setShowFilterModal(true); setActiveButton('filter');  }}
                  onMouseEnter={() => setIsFilterHover(true)}
                  onMouseLeave={() => setIsFilterHover(false)}
                  aria-label="Filter products by type"
                  style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}
                  ref={filterBtnRef}
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
            {buttonPermissions.add && (
              <div><button type='button' className={`product-Addnew-btn ${isAddButtonActive ? 'active' : ''}`} onClick={openmodel}>Add new</button></div>
            )}
          </div>
        </div>
        <div className='body-container-products'>
          {/* <p className='product-no-items-txt'>  No records found</p> */}
          <div className="common-overall-container">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-th">
                  <tr className=' table-th-row'>
                    <th>S.No</th>
                    <th>Product ID</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Created Date</th>
                    {(buttonPermissions.edit || buttonPermissions.delete)  && (<th>Action</th>)}
                  </tr>
                </thead>
                <tbody className="tbody-responsive">
                  {currentProducts.map((item, index) => (
                    <tr key={item.product_recid} style={{ position: "relative" }} onClick={(e) => {
                      if (e.target.closest('.td-action-menu')) return;
                      if (buttonPermissions.view) {
                        openviewmodel();
                        setSelectedProduct(item);
                      }
                    }}>
                      <td>{indexOfFirstProduct + index + 1}</td>
                      <td>{item.product_id}</td>
                      <td className="product-cell-mr">
                        <div className="product-card">
                          <div className="product-status">
                            <img src={item.imageUrl} alt='img' className="product-img" />
                          </div>
                          <div className="product-details">
                            <h6 className="product-name">{item.product_name}</h6>
                            <p className="product-category">{item.product_category}</p>
                            <p className="product-form-factor">{item.form_factor} /<span> {item.product_type}</span></p>
                          </div>
                        </div>
                      </td>
                      <td>₹{item.selling_price}</td>
                      <td>{format(new Date(item.created_at), 'dd-MM-yyyy')}</td>
                      {(buttonPermissions.edit || buttonPermissions.delete) && (
                        <td className='td-action-menu'><button onClick={(e) => { e.stopPropagation(); toggleMenu(index); }}> <img src={Actioneditebtn} alt="Act" /> </button>
                          {menuIndex === index && (
                            <div className="action-menu" ref={dropdownRef}>
                              {buttonPermissions.edit && (
                                <div><button className="menu-item-product "
                                  onClick={(e) => { e.stopPropagation(); editProduct(item); }} >Edit</button></div>
                              )}
                              {buttonPermissions.delete && (
                                <div><button className="menu-item-product1"
                                  onClick={(e) => { e.stopPropagation(); setSelectedProduct(item); openDetetemodel(); }} >Delete</button></div>
                              )}
                            </div>
                          )}
                        </td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-2  fs-6 d-flex justify-content-between align-items-center " style={{ height: "50px" }}>
            <div className="d-flex align-items-center w-100 justify-content-between ">
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
              {products.length > itemsPerPage && (
                <Pagination
                  count={products.length}
                  page={currentPage}
                  pageSize={itemsPerPage}
                  onChange={(pageNo) => setCurrentPage(pageNo)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="product-modal-overlay">
          <div className="product-modal-container">
            <div className="product-modal-header">
              <h5 className="mb-0 add-new-hdr">Add New Product</h5>
              <button className="close-button" onClick={closemodel} ><img src={closebtn} alt="close" /></button>
            </div>
            <div className="product-modal-body">
              <div className="d-flex">
                <div className='col-5 d-flex  align-items-center'> <h6 className=''>Select Brand</h6>  </div>
                <div className='col-7'>
                  <CommonSelect
                    name="factor"
                    value={brand}
                    onChange={setBrand}
                    placeholder="Select brand"
                    options={productBrand}
                  />
                </div>
              </div>
               <div className="d-flex mt-3">
                <div className='col-5 d-flex  align-items-center'> <h6 className=''>Select Form Factor</h6>  </div>
                <div className='col-7'>
                  <CommonSelect
                    ref={formFactorSelectRef}
                    name="factor"
                    value={factor}
                    onChange={setFactor}
                    placeholder="Select form factor"
                    options={formFactor}
                  />
                </div>
              </div>
              <div className="d-flex mt-3">
                <div className='col-5 d-flex  align-items-center'> <h6 className=''>Select Product Type</h6>  </div>
                <div className='col-7'>
                  <CommonSelect
                    name="ptype"
                    value={ptype}
                    onChange={setPtype}
                    placeholder="Select product type"
                    options={productTypes}
                  />
                </div>
              </div>
            </div>
            <div className="product-modal-footer">
              <button className="cancel-button" onClick={closemodel}>Cancel</button>
              <button className="next-button" onClick={AddProduct}  >Next</button>
            </div>
          </div>
        </div>
      )}
      {viewproduct && (
        <Viewproduct onClose={closviewemodel} products={selectedProduct} />)
      }

      {delConfirmPopup && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header mb-3">
              <h5 className="mb-0 add-new-hdr">Confirm to delete</h5>
            </div>
            <div className="modal-body mb-2">
              <div className="container commonst-select">
                <p>Are you sure to delete this  "{selectedProduct.product_id}"?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closDetetemodel} >Cancel</button>
              <button className="next-button" onClick={() => handleDelete()} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</button>
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

export default Products;
