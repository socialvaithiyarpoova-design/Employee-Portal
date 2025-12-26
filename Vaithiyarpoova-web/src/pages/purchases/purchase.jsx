import React, { useState, useEffect } from 'react';
import { PropagateLoader } from 'react-spinners';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import configModule from '../../../config.js';
import Pagination from "../../components/Pagination/index.jsx";
import SvgContent from '../../components/svgcontent.jsx';
import FilterModal from '../../components/filter-modal.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import { ExportButton, exportFormattedData } from '../../components/export-page.jsx';
import '../../assets/styles/user-profile.css';
import filtericon from '../../assets/images/filtericon.svg';

function PurchasePage() {
    const [orderPopupOpen, setOrderPopupOpen] = useState(false);
    const [vpPurchaseDataList, setVPPurchaseDataList] = useState([]);
    const [selectedItems, setSelectedItems] = useState('');
    const [grPurchaseDataList, setGRPurchaseDataList] = useState([]);
    const [needLoading, setNeedLoading] = useState(false);
    const { user, accessMenu } = useAuth();
    const usertype_code = user?.user_typecode;
    const location = useLocation();
    const pathname = location?.pathname;
    const config = configModule.config();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [status, setStatus] = useState("vaithyarpoova");
    const isActive = status === "vaithyarpoova";
    const state = location?.state;
    const [showPendingOnly, setShowPendingOnly] = useState(false);
    
    const baseData = isActive ? vpPurchaseDataList : grPurchaseDataList;
    const displayData = showPendingOnly ? baseData.filter(item => item.status?.toLowerCase() === 'pending') : baseData;
    

    const [activeButton, setActiveButton] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isFilterHover, setIsFilterHover] = useState(false);
    const [buttonPermissions, setButtonPermissions] = useState({});
    const [selectedFilters, setSelectedFilters] = useState('');

    const getPurchaseDatas = async (objStatus = null) => {
        setNeedLoading(true);

        try {
            const response = await axios.post(`${config.apiBaseUrl}getPurchaseDatas`, {
                startDate: objStatus?.startDate || '',
                endDate: objStatus?.endDate || '',
                branch_id: objStatus?.branch_id || null,
                emp_id: objStatus?.employee_id || null,
                status: objStatus?.status || '',
                usertype_code: usertype_code || '',
                user_id: user?.userId
            });

            const result = response.data;
            if (response.status === 200) {
                const allData = result.data || []; 

                const vpData = allData.filter(item => item.purchase_type?.toLowerCase() === "sale");
                const grData = allData.filter(item => item.purchase_type?.toLowerCase() === "field sale");

                const fin_vpData = vpData;
                const fin_grData = grData;
                
                setShowFilterModal(false);
                setVPPurchaseDataList(fin_vpData);
                setGRPurchaseDataList(fin_grData);
            } else {
                toast.error("Failed to fetch user activity details: " + result.message);
                console.error("Failed to fetch user activity details: " + result.message);
            }
        } catch (error) {
            toast.error(
                "Error fetching user activity details: " +
                (error.response?.data?.message || error.message)
            );
        } finally {
            setNeedLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            getPurchaseDatas(null);
        }
    }, [user]);


    useEffect(() => {
        if (state?.db_type === "Pending") {
            setShowPendingOnly(true);
            setCurrentPage(1);
        } else {
            setShowPendingOnly(false);
        }
    }, [state?.db_type]);

    useEffect(() => {
        if (user && Array.isArray(accessMenu)) {
            const found = accessMenu.find(m => m.path === pathname & m.user_id === user.userId );
            if (found) {
                setButtonPermissions({
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

    const indexOfLastPurchase = currentPage * itemsPerPage;
    const indexOfFirstPurchase = indexOfLastPurchase - itemsPerPage;
    const paginatedPurchase = displayData.slice(indexOfFirstPurchase, indexOfLastPurchase);

const handleExport = (data, fileName, fileType) => {
  const formattedData = data.map((item, index) => ({
    "S.No": index + 1,
    "Purchase ID": item.order_id || '',
    "Name": item.lead_name || '',
    "Sales Person ID": item.emp_id || '',
    "Order Qty": item.quantity || '',
    "Order Value": item.order_value || '',
    "Order Date": item.date_time ? new Date(item.date_time).toLocaleDateString() : '',
    "Status": item.status || ''
  }));

  exportFormattedData(formattedData, fileName || `${status} purchase`, fileType);
};


    const formatDateTime = (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "Invalid date";
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const onFilterDataFunc = (items) => {
        setSelectedFilters(items);
        getPurchaseDatas(items);
    };

    const handleFltReset = () => {
        setSelectedFilters('');
        getPurchaseDatas();
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
            <div className='header-div-ac'>
                <div className='header-divpart-el'>
                    <div className='d-flex gap-4 mb-2'>
                        <p className='mb-0 header-titlecount-el'>Purchases: {(vpPurchaseDataList?.length || 0) + (grPurchaseDataList?.length || 0)}</p>
                        <p className='mb-0 header-titlecount-el'>
                            Pending: {
                                status === "vaithyarpoova" 
                                    ? vpPurchaseDataList.filter(item => item.status?.toLowerCase() === 'pending').length 
                                    : grPurchaseDataList.filter(item => item.status?.toLowerCase() === 'pending').length
                            }
                        </p>
                    </div>

                    <div className="status-toggle-up">
                        <label htmlFor="status-active" className="custom-radio">
                            <input
                                type="radio"
                                name="status"
                                id="status-active"
                                value="vaithyarpoova"
                                checked={status === "vaithyarpoova"}
                                onChange={(e) => setStatus(e.target.value)}
                            />
                            <span className="radio-button"></span> Persons
                        </label>

                        <label htmlFor="status-inactive" className="custom-radio">
                            <input
                                type="radio"
                                name="status"
                                id="status-inactive"
                                value="gramium"
                                checked={status === "gramium"}
                                onChange={(e) => setStatus(e.target.value)}
                            />
                            <span className="radio-button"></span> Shops
                        </label>
                    </div>
                </div>
                <div className="search-add-wrapper">
                    {buttonPermissions.filter && (
                        <div className="filter-container-up">
                            <button
                                style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346',padding:'7px 15px' }}
                                onClick={() => { setShowFilterModal(true); setActiveButton('filter'); }}
                                onMouseEnter={() => setIsFilterHover(true)}
                                onMouseLeave={() => setIsFilterHover(false)}
                                className={`product-filter-btns ${activeButton === 'filter' ? 'active' : ''}`}
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
                            data={status === "vaithyarpoova" ? vpPurchaseDataList : grPurchaseDataList}
                            fileName={`${status}_purchase`}
                            onExport={(data, fileName, fileType) => handleExport(data, fileName, fileType)}
                            disabled={!((status === "vaithyarpoova" ? vpPurchaseDataList : grPurchaseDataList) || []).length}
                            />

                        </div>
                    )}

                </div>
            </div>
            <div className='body-div-ac'>
                <div className='h-100 w-100 p-2 pb-0'>
                    <div className='table-common-st '>
                        <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
                            <div className='brcommon-col-st w-10'>
                                S no
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-15'>
                                Purchase ID
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-15'>
                                Name
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                                Sales Person
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                                Order Qty
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                                Order Value
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                                Order Date
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                                Status
                            </div> <span style={{ color: "#129347" }}> | </span>
                            {buttonPermissions.view && (
                                <div className='brcommon-col-st w-10'>
                                    View
                                </div>
                            )}
                        </div>

                        <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
                            {paginatedPurchase && paginatedPurchase.length > 0 ? (paginatedPurchase.map((item, index) => (
                                <div className='display-flex br-rowst' key={index}>
                                    <div className='brcommon-col-st w-10'>
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </div>
                                    <div className='brcommon-col-st w-15'>
                                        {item.order_id}
                                    </div>
                                    <div className='brcommon-col-st w-15'>
                                        {item.emp_id}
                                    </div>
                                    <div className='brcommon-col-st w-10'>
                                        {item.lead_name}
                                    </div>
                                    <div className='brcommon-col-st w-10'>
                                        {item.quantity}
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
                                    {buttonPermissions.view && (
                                        <div className='brcommon-col-st w-10'>
                                            <button onClick={() => { setOrderPopupOpen(true); setSelectedItems(item); }}>
                                                <SvgContent svg_name="eyeopen" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))) : (
                                <div className='tb-nodata-row-st display-flex'>
                                    No Purchase list
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
                            count={displayData.length}
                            page={currentPage}
                            pageSize={itemsPerPage}
                            onChange={(pageNo) => setCurrentPage(pageNo)}
                        />
                    </div>
                </div>
            </div>

            {orderPopupOpen && (
                <div className="adminsale-modal-overlay">
                    <div className="adminsale-modal-box">
                        <div className="adminsale-modal-header">
                            <h5 className='mb-0 fw-semibold mb-1'>Order summary</h5>
                            <button className="adminsale-close-btn" onClick={() => setOrderPopupOpen(false)}>×</button>
                        </div>
                        <div className='adminsale-modal-body'>
                        <div className="adminsale-modal-section">
                            <h6 className="mb-0 fw-semibold mb-1">Order Details</h6>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>Order ID</p> <p>{selectedItems.order_id}</p>
                            </div>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>Order Date</p> <p> {selectedItems?.created_at
                                ? new Date(selectedItems.created_at).toISOString().slice(0, 19).replace("T", " - ")
                                : ""}</p>
                                        </div>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>Branch ID</p> <p>{selectedItems.branch_id || 'Head Office'}</p>
                            </div>            
                        </div>

                        <div className="adminsale-modal-section">
                            <h6 className="mb-0 fw-semibold mb-1">Client Details</h6>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>Client ID </p><p>{selectedItems.leads_id}</p>
                            </div>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>Name </p><p>{selectedItems.lead_name}</p>
                            </div>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>Mobile no </p><p>{selectedItems.mobile_number}</p>
                            </div>
                        </div>

                        <div className="adminsale-modal-section">
                            <h6 className="mb-0 fw-semibold mb-1">Delivery Details</h6>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>Address</p> <p>{selectedItems.address || '--'}</p>
                            </div>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>District </p> <p>{selectedItems.district || '--'}</p>
                            </div>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>State </p> <p>{selectedItems.state || '--'}</p>
                            </div>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>Country </p> <p>{selectedItems.country || '--'}</p>
                            </div>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>Pincode </p> <p>{selectedItems.pincode || '--'}</p>
                            </div>
                            <div className='d-flex'>
                                <p style={{ minWidth: "142px" }}>Courier</p> <p> {selectedItems.courier || '--'}</p>
                            </div>
                        </div>

                        <div className="adminsale-modal-section">
                            <h6 className="mb-0 fw-semibold mb-1">Product Details</h6>
                            {selectedItems.product_list && JSON.parse(selectedItems.product_list).map((item, index) => (
                                <div key={index} className='d-flex'>
                                    <p style={{ minWidth: "142px" }}>{item.id}</p>  <p>{item.name} {item.qty} </p>
                                </div>
                            ))}
                        </div>


                        <div className="adminsale-modal-section">
                            <h6 className="mb-0 fw-semibold mb-1">Payment Details</h6>
                            <div className="d-flex">
                                <p style={{ minWidth: "142px" }}>Order Value </p><p>₹ {selectedItems.order_value || 0}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ minWidth: "142px" }}>Discount</p><p> ₹ {selectedItems.discount || 0}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ minWidth: "142px" }}>Approved By</p><p>{selectedItems.approved_by || '---'}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ minWidth: "142px" }}>Courier Charge </p><p>{selectedItems.payment_mode} </p>
                            </div>
                            <div className="d-flex">
                                <p style={{ minWidth: "142px" }}>GST No </p><p>{selectedItems.gst_number || '-'}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ minWidth: "142px" }}>HSN </p><p>{selectedItems.hsn_codes || '-'}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ minWidth: "142px" }}>GST ({(selectedItems?.gst_percentage || 0) * 100 || '0'}% )</p><p> {(selectedItems.gst_amount) || '-'}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ minWidth: "142px" }}>Total Value </p><p>₹ {selectedItems.total_value}</p>
                            </div>
                            <div className="d-flex">
                                <p style={{ minWidth: "142px" }}>Reason </p><p>{selectedItems.reason}</p>
                            </div>
                        </div>
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
    );
}

export default PurchasePage;