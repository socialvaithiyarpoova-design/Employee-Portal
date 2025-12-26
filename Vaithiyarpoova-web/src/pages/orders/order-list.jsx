import React, { useEffect, useState, useRef } from 'react';
import '../../assets/styles/user-profile.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import configModule from '../../../config.js';
import SvgContent from '../../components/svgcontent.jsx';
import Pagination from "../../components/Pagination/index.jsx";
import 'react-datepicker/dist/react-datepicker.css';
import { PropagateLoader } from 'react-spinners';
import viewicon from '../../assets/images/viewicon.svg';
import update from '../../assets/images/updatebtn.svg';
import { ExportButton, exportFormattedData } from '../../components/export-page.jsx';
import OrderSummaryPopup from './order-summary.jsx';
import CommonSelect from "../../components/common-select.jsx";
import { useLocation } from 'react-router-dom';
import FilterModal from '../../components/filter-modal.jsx';
import filtericon from '../../assets/images/filtericon.svg';

function Orderlist() {
    const { user, accessMenu } = useAuth();
    const location = useLocation();
    const db_state_item = location?.state?.db_type;
    const [buttonPermissions, setButtonPermissions] = useState({});
    const [needLoading, setNeedLoading] = useState(false);
    const [type, setType] = useState(null);
    const [historyIsSHown, setHistoryIsSHown] = useState(false);
    const [orderDetails, setOrderDetails] = useState([]);
    const [orderShipDetails, setOrderShipDetails] = useState([]);
    const [orderPenDetails, setOrderPenDetails] = useState([]);
    const config = configModule.config();
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [selectedItems, setSelectedItems] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [trackIdData, setTrackIdData] = useState('');
    const [netWeight, setNetWeight] = useState('');
    const [activeButton, setActiveButton] = useState(null);
    const dateFilterRef = useRef(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState('');
      const [isFilterHover, setIsFilterHover] = useState(false);

    // Load button permissions based on current path
    useEffect(() => {
        if (accessMenu && location.pathname) {
            const currentPath = location.pathname;
            const menuItem = accessMenu.find(item => item.path === currentPath);

            if (menuItem) {
                setButtonPermissions({
                    search: menuItem.search_btn === 1,
                    sort: menuItem.sort_btn === 1,
                    history: menuItem.history_btn === 1,
                    export: menuItem.export_btn === 1,
                    view: menuItem.view_btn === 1,
                    update: menuItem.update_btn === 1,
                    filter: menuItem.filter_btn === 1,
                });
            }
        }
    }, [accessMenu, location.pathname]);

    const CourierType = [
        { label: "DTDC", value: "DTDC" },
        { label: "India Post", value: "India Post" },
        { label: "MSS", value: "MSS" },
        { label: "Professional", value: "Professional" },
        { label: "ST", value: "ST" },
        { label: "Others", value: "Others" },
    ];

    const TypeOptions = [
        { label: "Dispatched", value: "Dispatched" },
        { label: "In transit", value: "In transit" }
    ];


    useEffect(() => {
        function handleClickOutside(event) {
            if (dateFilterRef.current && !dateFilterRef.current.contains(event.target)) {
                setShowDateFilter(false);
                setActiveButton(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset sort button active state when date filter closes
    useEffect(() => {
        if (!showDateFilter && activeButton === 'sort') {
            setActiveButton(null);
        }
    }, [showDateFilter, activeButton]);

    const getOrderDetails = async (objItem = '') => {
        setNeedLoading(true);
        let stDate = '';
        let endDate = '';
        let ac_status = '';

        if (db_state_item) {
        if (db_state_item === "dis_today") {
            const today = new Date();
            stDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            endDate = stDate;
        } else if (db_state_item === "Total") { 
            setHistoryIsSHown(true);
        } else if (db_state_item !== "dis_today") {
            if (db_state_item !== "Approved") {
                setHistoryIsSHown(true);
            }
            ac_status = db_state_item;
        }
    }
        try {
            const response = await axios.post(`${config.apiBaseUrl}getOrderListDis`, {
                startDate: objItem?.startDate || (stDate || ''),
                endDate: objItem?.endDate || (endDate || ''),
                status: objItem?.status || (ac_status || ''),
                branch_id: objItem?.branch_id || null,
                employee_id: objItem?.employee_id || null,
                user_id: user?.userId
            });

            const result = response.data;

            if (response.status === 200) {
                setOrderDetails(Array.isArray(result) ? result : result.data || []);
                setOrderShipDetails(
                    Array.isArray(result?.data)
                        ? result.data.filter(itm => itm.status !== "Approved" )
                        : []
                );
                setOrderPenDetails(
                    Array.isArray(result?.data)
                        ? result.data.filter(itm =>  itm.status === "Approved")
                        : []
                );

                setShowFilterModal(false);

            } else {
                toast.error("Failed to fetch orders list: " + result.message);
            }
        } catch (error) {
            setOrderDetails([]);
            toast.error("Error fetching orders list: " + (error.response?.data?.message || error.message));
        } finally {
            setNeedLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            getOrderDetails();
        }
    }, [user, db_state_item]);

    const formatDateTime = (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "Invalid date";
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const filteredLeads = Array.isArray(orderPenDetails)
        ? orderPenDetails.filter((item) => {
            const matchSearch = `${item.order_id} ${item.order_name} ${item.quantity} ${item.total_value} ${item.courier} ${item.status}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const itemDate = new Date(item.date_time);
            const matchDate =
                (!startDate || itemDate >= new Date(startDate.setHours(0, 0, 0, 0))) &&
                (!endDate || itemDate <= new Date(endDate.setHours(23, 59, 59, 999)));

            return matchSearch && matchDate;
        })
        : [];

    const filteredShip = Array.isArray(orderShipDetails)
        ? orderShipDetails.filter((item) => {
            const matchSearch = `${item.order_id} ${item.order_name} ${item.quantity} ${item.total_value} ${item.courier} ${item.status}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const itemDate = new Date(item.date_time);
            const matchDate =
                (!startDate || itemDate >= new Date(startDate.setHours(0, 0, 0, 0))) &&
                (!endDate || itemDate <= new Date(endDate.setHours(23, 59, 59, 999)));

            return matchSearch && matchDate;
        })
        : [];


    const indexOfLastLeads = currentPage * itemsPerPage;
    const indexOfFirstLeads = indexOfLastLeads - itemsPerPage;
    const currentLeads = filteredLeads.slice(indexOfFirstLeads, indexOfLastLeads);
    const currentShipping = filteredShip.slice(indexOfFirstLeads, indexOfLastLeads);

    const fillteredDataRes = historyIsSHown ? filteredShip : filteredLeads;

    const handleExport = (data, fileName, fileType) => {
        const exportData = fillteredDataRes.map((lead, index) => ({
            "S.No": (currentPage - 1) * itemsPerPage + index + 1,
            "Order ID": lead.order_id,
            "Name": lead.order_name,
            "Quantity": lead.quantity,
            "Value": lead.total_value,
            "Date": formatDateTime(lead.date_time),
            "Courier": lead.direct_pickup ? 'Direct' : lead.courier,
            "Status": lead.status === 'Approved' ? 'Pending' : lead.status
        }));

        exportFormattedData(exportData, fileName || "Order_List", fileType);
    };

    const handleUpdateOrders = async () => {
         const selectedType =
            type?.target?.value || 
            type?.value || 
            "";
   console.log("Update :", selectedType, "netWeight",netWeight);
        if (!selectedItems.order_id || !selectedType || !netWeight) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (selectedType === "In transit" && !trackIdData.trim()) {
            toast.error("Tracking ID is required for 'In transit' orders");
            return;
        }
        const payload = {
            created_by: selectedItems?.created_by,
            order_recid: selectedItems?.order_recid,
            order_id: selectedItems?.order_id,
            courier: courierList?.target?.value || courierList,
            type: selectedType || "",
            tracking_id: trackIdData || selectedItems?.tracking_id || "",
            net_weight: netWeight || selectedItems?.net_weight,
            type_mode:selectedItems?.type_mode,
        };

        console.log("Update Payload:", payload);

        try {
            const response = await axios.post(`${config.apiBaseUrl}updateDisOrders`, payload);
            const responseData = response?.data?.data;

            if (response.status === 200 && responseData) {
                toast.success('Order updated success');

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

                setTimeout(() => {
                    setUpdateModalOpen(false);
                    setNetWeight('')
                    getOrderDetails();
                }, 3000);
            } else {
                toast.error(response.data.message || "Failed to update order");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Something went wrong while updating the order");
        }
    };

    const [courierList, setCourierList] = useState("");

    useEffect(() => {
  if (selectedItems) {
    setCourierList(selectedItems.courier || "");
    setType(selectedItems.status || "");
    setNetWeight(selectedItems.net_weight || "");  
    setTrackIdData(selectedItems.tracking_id || "");
  }
}, [selectedItems]);



    const onFilterDataFunc = (items) => {
        setSelectedFilters(items);
        getOrderDetails(items);
    };

    const handleReset = () => {
        setSelectedFilters('');
        getOrderDetails();
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
            <div className='header-div-el'>

                {!historyIsSHown ? (
                    <div className='header-divpart-el gap-4 flex-row'>
                        <p className='mb-0 header-titlecount-el'>Total order : {orderDetails.length}</p>
                        <p className='mb-0 header-titlecount-el'>Pending order : {orderPenDetails.length}</p>
                    </div>
                ) : (
                    <div>
                        <button className='mb-0 nav-btn-top' onClick={() => setHistoryIsSHown(false)}>
                            Orders
                        </button>&nbsp;
                        <p className='mb-0 nav-btn-top'>
                            &gt; History
                        </p>
                    </div>
                )}

                <div className="search-add-wrapper">
                    {buttonPermissions.search && (
                        <input
                            type="text"
                            placeholder="Search"
                            className="search-input-up"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    )}
                    {buttonPermissions.history && (
                        <div className="filter-container-up">

                            <button className="btn-top-up"  onClick={() =>{ setHistoryIsSHown(true); setActiveButton('history'); }}style={{padding:'6.5px 15px'}}>
                                <SvgContent svg_name="history" />
                                <span>History</span>
                            </button>

                            {activeButton === "history" && (
                            <button className='times-st' onClick={() => {
                           setActiveButton(null);
                           setHistoryIsSHown(false);
                           getOrderDetails();
                            }}>&times;</button>
                            )}

                        </div>
                    )}

                    {buttonPermissions.export && (
                        <div className="filter-container-up">
                            <ExportButton
                                data={currentLeads}
                                fileName="Order_list"
                                onExport={handleExport}
                                disabled={!currentLeads || currentLeads.length === 0}
                            />
                        </div>
                    )}

                    {buttonPermissions.filter && (
                        <div className='filter-container-up position-relative'>
                            <button
                               className={`product-filter-btns ${activeButton === 'filter' ? 'active' : ''}`}
                                type="button"
                                onClick={() => { setShowFilterModal(true); setActiveButton('filter');  }}
                                onMouseEnter={() => setIsFilterHover(true)}
                                onMouseLeave={() => setIsFilterHover(false)}
                                aria-label="Filter products by type"
                                style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346',padding:'7.6px 13px' }}
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
                    {!historyIsSHown ? (
                        currentLeads.length > 0 ? (
                            <div className='table-userpro-up w-100 h-100 overflow-auto'>
                                <div className='table-head-up d-flex'>
                                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>S.No</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Order ID</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-14 p-2 d-flex justify-content-center align-items-center'>Name</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Quantity</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Value</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Date</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Courier</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Status</div>
                                    {(buttonPermissions.view || buttonPermissions.update) && (
                                        <>
                                            <span style={{ color: "#129347" }}> | </span>
                                            <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Action</div>
                                        </>
                                    )}
                                </div>
                                <div className='table-body-up d-flex'>
                                    {currentLeads.map((lead, index) => (
                                        <div className='table-bodydiv-up' key={lead.lead_recid || index}
                                        >
                                            <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </div><span style={{ color: "#ffffffff" }}> | </span>
                                            <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.order_id}
                                            </div><span style={{ color: "#ffffffff" }}> | </span>
                                            <div className='w-14 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.order_name}
                                            </div><span style={{ color: "#ffffffff" }}> | </span>
                                            <div className='w-12 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.quantity}
                                            </div><span style={{ color: "#ffffffff" }}> | </span>
                                            <div className='w-12 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.total_value}
                                            </div><span style={{ color: "#ffffffff" }}> | </span>
                                            <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                                {formatDateTime(lead.date_time)}
                                            </div><span style={{ color: "#ffffffff" }}> | </span>
                                            <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.direct_pickup ? 'Direct' : lead.courier}
                                            </div><span style={{ color: "#ffffffff" }}> | </span>
                                            <div className='w-12 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.status === 'Approved' ? 'Pending' : lead.status}
                                            </div><span style={{ color: "#ffffffff" }}> | </span>
                                            {(buttonPermissions.view || buttonPermissions.update) && (
                                                <div className='w-10 p-2 gap-3 d-flex justify-content-center align-items-center'>
                                                    {buttonPermissions.view && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRowIndex(index);
                                                                setShowPopup(true);
                                                            }}>
                                                            <img src={viewicon} alt='view' />
                                                        </button>
                                                    )}
                                                    {buttonPermissions.update && (
                                                        <button onClick={() => {
                                                            setUpdateModalOpen(true);
                                                            setSelectedItems(lead);
                                                        }}>
                                                            <img src={update} alt='update' />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>No data found</div>
                        )
                    ) : (
                        currentShipping.length > 0 ? (
                            <div className='table-userpro-up w-100 h-100 overflow-auto'>
                                <div className='table-head-up d-flex'>
                                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>S.No</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Order ID</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-14 p-2 d-flex justify-content-center align-items-center'>Name</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Quantity</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Value</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Date</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Courier</div><span style={{ color: "#129347" }}> | </span>
                                    <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Status</div>
                                    {buttonPermissions.view && (
                                        <>
                                            <span style={{ color: "#129347" }}> | </span>
                                            <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Action</div>
                                        </>
                                    )}
                                </div>
                                <div className='table-body-up d-flex'>
                                    {currentShipping.map((lead, index) => (
                                        <div className='table-bodydiv-up' key={lead.lead_recid || index}>
                                            <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </div><span style={{ color: "#ffffffff" ,display:'flex',justifyContent:'center',alignItems:'center'}}> | </span>
                                            <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.order_id}
                                            </div><span style={{ color: "#ffffffff" ,display:'flex',justifyContent:'center',alignItems:'center'}}> | </span>
                                            <div className='w-14 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.order_name}
                                            </div><span style={{ color: "#ffffffff" ,display:'flex',justifyContent:'center',alignItems:'center'}}> | </span>
                                            <div className='w-12 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.quantity}
                                            </div><span style={{ color: "#ffffffff" ,display:'flex',justifyContent:'center',alignItems:'center'}}> | </span>
                                            <div className='w-12 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.total_value}
                                            </div><span style={{ color: "#ffffffff" ,display:'flex',justifyContent:'center',alignItems:'center'}}> | </span>
                                            <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                                {formatDateTime(lead.date_time)}
                                            </div><span style={{ color: "#ffffffff" ,display:'flex',justifyContent:'center',alignItems:'center'}}> | </span>
                                            <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.direct_pickup ? 'Direct' : lead.courier}
                                            </div><span style={{ color: "#ffffffff" ,display:'flex',justifyContent:'center',alignItems:'center'}}> | </span>
                                            <div className='w-12 p-2 d-flex justify-content-center align-items-center'>
                                                {lead.status === 'Approved' ? 'Pending' : lead.status}
                                            </div><span style={{ color: "#ffffffff" ,display:'flex',justifyContent:'center',alignItems:'center'}}> | </span>
                                            {(buttonPermissions.view || buttonPermissions.update) && (
                                                <div className='w-10 p-2 gap-3 d-flex justify-content-center align-items-center'>
                                                    {buttonPermissions.view && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRowIndex(index);
                                                                setShowPopup(true);
                                                            }}>
                                                            <img src={viewicon} alt='view' />
                                                        </button>
                                                    )}
                                                    {buttonPermissions.update && (
                                                        <button onClick={() => {
                                                            setUpdateModalOpen(true);
                                                            setSelectedItems(lead);
                                                        }}>
                                                            <img src={update} alt='update' />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>No data found</div>
                        )
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
                        count={fillteredDataRes.length}
                        page={currentPage}
                        pageSize={itemsPerPage}
                        onChange={(pageNo) => setCurrentPage(pageNo)}
                    />
                </div>
            </div>
            {updateModalOpen && (
                <div className="modal-overlay modal-overlay-position">
                    <div className="modal-container modal-overlay-position" style={{ width: "625px" }}>
                        <div className="modal-header">
                            <h5 className="mb-0 add-new-hdr">Update order status</h5>
                        </div>
                        <div className="modal-body">
                            <div className="container commonst-select mb-3">
                                <h6>Order ID</h6>
                                <div className="comm-select-ba">
                                    <input
                                        type="text"
                                        name="Order ID"
                                        className="form-control location-ip-br"
                                        placeholder="Enter Order ID"
                                        value={selectedItems.order_id}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="container commonst-select mb-3">
                                <h6>Order Date</h6>
                                <div className="comm-select-ba">
                                    <input
                                        type="text"
                                        name="Order Date"
                                        className="form-control location-ip-br"
                                        placeholder="Enter Order date"
                                        value={formatDateTime(selectedItems.date_time)}
                                        readOnly
                                    />
                                </div>
                            </div>

                            {selectedItems?.courier && (
                                <div className="container commonst-select mb-3">
                                    <h6>Courier</h6>
                                    <div className="comm-select-ba">
                                        <CommonSelect
                                            header="Select courier"
                                            placeholder="Select courier"
                                            name="courier"
                                            value={courierList}
                                            onChange={setCourierList}
                                            options={CourierType}
                                            isSearchable={true}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="container commonst-select mb-3">
                                <h6>Select Type</h6>
                                <div className="comm-select-ba">
                                    <CommonSelect
                                        header="Select Type"
                                        placeholder="Select Type"
                                        name="type"
                                        value={type}
                                        onChange={setType}
                                        options={TypeOptions}
                                        disabled={selectedItems?.status === "In transit"}
                                    />
                                </div>
                            </div>
                            {(
                                (type?.target?.value === "In transit") || 
                                (type === "In transit") ||
                                (historyIsSHown && selectedItems?.status === "In transit")
                                ) && (
                                <div className="container commonst-select mb-3">
                                    <h6>Tracking ID</h6>
                                    <div className="comm-select-ba">
                                    <input
                                        type="text"
                                        name="Tracking ID"
                                        className="form-control location-ip-br"
                                        placeholder="Enter Tracking Id"
                                        value={trackIdData}
                                        readOnly={historyIsSHown && selectedItems?.status === "In transit"}
                                        onChange={(e) => setTrackIdData(e.target.value)}
                                    />
                                    </div>
                                </div>
                                )}
                        
                            <div className="container commonst-select mb-3">
                                <h6>Net wt</h6>
                                <div className="comm-select-ba">
                                    <input
                                        type="number"
                                        name="Net Weight"
                                        className="form-control location-ip-br"
                                        placeholder="Enter Net Wt"
                                        value={netWeight}
                                        readOnly={historyIsSHown && selectedItems?.status === "In transit"}
                                        onChange={(e) => setNetWeight(e.target.value)}
                                    />
                                </div>
                            </div>
                    

                        </div>

                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => {
                                setUpdateModalOpen(false);
                                setType(null);
                                setNetWeight('');
                                setTrackIdData('');
                            }}>Cancel</button>
                           <button
                            className="next-button"
                            onClick={handleUpdateOrders}
                            disabled={historyIsSHown && selectedItems?.status === "In transit"}
                            style={{
                                opacity: historyIsSHown && selectedItems?.status === "In transit" ? 0.6 : 1,
                                cursor: historyIsSHown && selectedItems?.status === "In transit" ? "not-allowed" : "pointer"
                            }}
                        >
                            Save
                        </button>
                        </div>
                    </div>
                </div>
            )}
            {selectedRowIndex !== null && showPopup && (
                <OrderSummaryPopup
                    order={historyIsSHown ? currentShipping[selectedRowIndex] : currentLeads[selectedRowIndex]}
                    onClose={() => setShowPopup(false)}
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

export default Orderlist;
