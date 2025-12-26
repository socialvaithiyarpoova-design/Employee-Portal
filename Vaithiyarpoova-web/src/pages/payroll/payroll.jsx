import React, { useEffect, useState } from 'react';
import '../../assets/styles/user-profile.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { toast } from 'react-toastify';
import FilterModal from '../../components/filter-modal.jsx';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import configModule from '../../../config.js';
import SvgContent from '../../components/svgcontent.jsx';
import Pagination from "../../components/Pagination/index.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PropagateLoader } from 'react-spinners';
import { useLocation } from 'react-router-dom';
import { ExportButton, exportFormattedData } from '../../components/export-page.jsx';
import filtericon from '../../assets/images/filtericon.svg';

function PayRoll() {
    const { user, accessMenu } = useAuth();
    const location = useLocation();
    const [buttonPermissions, setButtonPermissions] = useState({});
    const [activeButton, setActiveButton] = useState(null);
    const [needLoading, setNeedLoading] = useState(false);
    const [leadDetails, setLeadDetails] = useState([]);
    const config = configModule.config();
    const [status, setStatus] = useState("active");
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isFilterHover, setIsFilterHover] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState('');

    // Load button permissions based on current path
    useEffect(() => {
        if (accessMenu && location.pathname) {
            const currentPath = location.pathname;
            const menuItem = accessMenu.find(item => item.path === currentPath);

            if (menuItem) {
                setButtonPermissions({
                    search: menuItem.search_btn === 1,
                    sort: menuItem.sort_btn === 1,
                    filter: menuItem.filter_btn === 1,
                    export: menuItem.export_btn === 1
                });
            } else {
                setButtonPermissions({});
            }
        }
    }, [accessMenu, location.pathname]);

    const getPageDetails = async (objStatus = '') => {
        setNeedLoading(true);
        try {
            const response = await axios.post(`${config.apiBaseUrl}getAllPayrolls`, {
                startDate: objStatus?.startDate || '',
                endDate: objStatus?.endDate || '',
                branch_id: objStatus?.branch_id || null,
                employee_id: objStatus?.employee_id || null
            });

            const result = response.data;

            if (response.status === 200) {
                setLeadDetails(result.data);
                setShowFilterModal(false);
            } else {
                toast.error("Failed to fetch data list: " + result.message);
            }
        } catch (error) {
            setLeadDetails([]);
            toast.error("Error fetching data list: " + (error.response?.data?.message || error.message));
        } finally {
            setNeedLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            getPageDetails();
        }
    }, [user]);

    const formatDateTime = (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "Invalid date";
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const filteredLeads = leadDetails.filter((item) => {
        const matchSearch = `${item.emp_id} ${item.name} ${item.designation} ${item.branch_name} ${item.disposition} ${item.disposition_date}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        return matchSearch;
    });

    const indexOfLastLeads = currentPage * itemsPerPage;
    const indexOfFirstLeads = indexOfLastLeads - itemsPerPage;
    const currentData = filteredLeads.slice(indexOfFirstLeads, indexOfLastLeads);

    const handleExport = (data) => {
        exportFormattedData(data, 'ExpensesData');
    };

    useEffect(() => {
        const onEsc = (e) => {
            if (e.key === 'Escape') {
                setShowFilterModal(false);
                setIsFilterHover(false);
            }
        };
        if (showFilterModal) document.addEventListener('keydown', onEsc);
        return () => document.removeEventListener('keydown', onEsc);
    }, [showFilterModal]);

    const onFilterDataFunc = (items) => {
        setSelectedFilters(items);
        getPageDetails(items);
    };

    const handleReset = () => {
        setSelectedFilters('');
        getPageDetails();
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
                <div className='header-divpart-el gap-2'>
                    <p className='mb-0 header-titlecount-el'>Total employee : {filteredLeads.length || 0}</p>
                </div>

                <div className="search-add-wrapper">
                    {buttonPermissions.search && (
                        <input
                            type="text"
                            placeholder="Search"
                            className="search-input-up"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    )}
                    {buttonPermissions.sort && (
                        <button className="btn-top-up" onClick={() => setShowDateFilter(!showDateFilter)} >
                            <SvgContent svg_name="btn_calendar" width={20} height={20} />
                            <span className='visible-label-up'>Sort</span>
                        </button>
                    )}
                    {showDateFilter && buttonPermissions.sort && (
                        <div className="date-filter-popup">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="DD/MM/YYYY"
                                className="form-control form-btncontrol-up mb-2"
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                placeholderText="DD/MM/YYYY"
                                className="form-control form-btncontrol-up mb-3"
                            />
                            <button
                                className="btn btn-sm btn-primary w-100 apply-filter-st"
                                onClick={() => {
                                    setCurrentPage(1);
                                    setShowDateFilter(false);
                                }}
                            >
                                Apply Filter
                            </button>
                        </div>
                    )}
                    {buttonPermissions.filter && (
                        <div className='filter-container-up position-relative'>
                            <button
                                className={`product-filter-btns ${activeButton === 'filter' ? 'active' : ''}`}
                                style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346',padding:'7px 15px' }}
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

                    {buttonPermissions.export && (
                        <div className="filter-container-up">
                            <ExportButton
                                data={currentData}
                                fileName="ExpensesData"
                                onExport={handleExport}
                                disabled={!currentData || currentData.length === 0}
                            />
                        </div>
                    )}

                </div>
            </div>

            <div className='phone-header-div-el'>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                    <p className='mb-0 header-titlecount-el'>Total user profiles : 1050</p>
                    <div className='d-flex gap-2'>
                        <button className="btn-top-up"><SvgContent svg_name="btn_calendar" width={20} height={20} /></button>
                        <button className="btn-top-up"><SvgContent svg_name="btn_filter" width={20} height={20} /></button>
                        <button className="btn-top-up"><SvgContent svg_name="btn_upload" width={20} height={20} /></button>
                    </div>
                </div>

                <div className="search-add-wrapper justify-content-between mb-3">
                    <div className="status-toggle-up">
                        <label htmlFor="status-active-mobile" className="custom-radio">
                            <input
                                type="radio"
                                name="mbstatus"
                                id="status-active-mobile"
                                value="active"
                                checked={status === "active"}
                                onChange={(e) => setStatus(e.target.value)}
                            />
                            <span className="radio-button"></span> Active : 920
                        </label>

                        <label htmlFor="status-inactive-mobile" className="custom-radio">
                            <input
                                type="radio"
                                name="mbstatus"
                                id="status-inactive-mobile"
                                value="inactive"
                                checked={status === "inactive"}
                                onChange={(e) => setStatus(e.target.value)}
                            />
                            <span className="radio-button"></span> In-active : 130
                        </label>
                    </div>
                    {buttonPermissions.search && (
                        <input
                            type="text"
                            placeholder="Search"
                            className="search-input"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    )}
                </div>
            </div>

            <div className='body-div-el'>
                <div className='w-100 p-2 d-flex justify-content-center align-items-center' style={{ height: "calc(100% - 48px)" }}>
                    {currentData.length > 0 ? (
                        <div className='table-userpro-up w-100 h-100 overflow-auto'>
                            <div className='table-head-up d-flex'>
                                <div className='w-8 p-2 d-flex justify-content-center align-items-center'>S.No</div><span style={{ color: "#129347" }}> | </span>
                                <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Emp ID</div><span style={{ color: "#129347" }}> | </span>
                                <div className='w-11 p-2 d-flex justify-content-center align-items-center'>Name</div><span style={{ color: "#129347" }}> | </span>
                                <div className='w-12 p-2 d-flex justify-content-center align-items-center'>Designation</div><span style={{ color: "#129347" }}> | </span>
                                <div className='w-14 p-2 d-flex justify-content-center align-items-center'>Branch</div><span style={{ color: "#129347" }}> | </span>
                                <div className='w-8 p-2 d-flex justify-content-center align-items-center'>Leaves</div><span style={{ color: "#129347" }}> | </span>
                                <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Permission</div><span style={{ color: "#129347" }}> | </span>
                                <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Incentive</div><span style={{ color: "#129347" }}> | </span>
                                <div className='w-7 p-2 d-flex justify-content-center align-items-center'>Salary</div><span style={{ color: "#129347" }}> | </span>
                                <div className='w-10 p-2 d-flex justify-content-center align-items-center'>Total</div>
                            </div>
                            <div className='table-body-up d-flex'>
                                {currentData.map((item, index) => (
                                    <div className='table-bodydiv-up ' style={{padding :'0px ' ,minHeight:'55px' ,textAlign:'center'}}  key={item.order_recid || index}>
                                        <div className='w-8 p-2 d-flex justify-content-center align-items-center'>
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </div><span style={{ color: "#ffffffff" }}> | </span>
                                        <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                            {item.emp_id}
                                        </div><span style={{ color: "#ffffffff" }}> | </span>
                                        <div className='w-11 p-2 d-flex justify-content-center align-items-center'>
                                            {item.name}
                                        </div><span style={{ color: "#ffffffff" }}> | </span>
                                        <div className='w-12 p-2 d-flex justify-content-center text-center align-items-center'>
                                            {item.designation}
                                        </div><span style={{ color: "#ffffffff" }}> | </span>
                                        <div  className='w-14 p-2 d-flex justify-content-center align-items-center branch_name-st'>
                                            {item.branch_name}
                                        </div><span style={{ color: "#ffffffff" }}> | </span>
                                        <div className='w-8 p-2 d-flex justify-content-center align-items-center'>
                                            {item.leaves}
                                        </div><span style={{ color: "#ffffffff" }}> | </span>
                                        <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                            {item.permission}
                                        </div><span style={{ color: "#ffffffff" }}> | </span>
                                        <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                            {item.incentive_earned}
                                        </div><span style={{ color: "#ffffffff" }}> | </span>
                                        <div className='w-7 p-2 d-flex justify-content-center align-items-center'>
                                            {item.salary}
                                        </div><span style={{ color: "#ffffffff" }}> | </span>
                                        <div className='w-10 p-2 d-flex justify-content-center align-items-center'>
                                            {item.total_amount}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>No data found</div>
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
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                            <option value={50}>50</option>
                        </select>
                    </label>
                    <Pagination
                        count={filteredLeads.length}
                        page={currentPage}
                        pageSize={itemsPerPage}
                        onChange={(pageNo) => setCurrentPage(pageNo)}
                    />
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

export default PayRoll;
