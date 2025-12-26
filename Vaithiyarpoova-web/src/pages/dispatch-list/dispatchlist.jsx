import React, { useState, useEffect} from 'react';
import { PropagateLoader } from 'react-spinners';
import '../../assets/styles/branches.css';
import '../../assets/styles/user-profile.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { useLocation ,useNavigate } from 'react-router-dom';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import configModule from '../../../config.js';
import Pagination from "../../components/Pagination/index.jsx";


function Dispatchlist() {
    const [serviceData, setServiceData] = useState([]);
    const [needLoading, setNeedLoading] = useState(false);
    const { user, accessMenu } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location?.pathname;
    const userId = user?.userId;
    const config = configModule.config();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [searchQuery, setSearchQuery] = useState("");
    const [buttonPermissions, setButtonPermissions] = useState({});


    const getinventorylist = async () => {
        setNeedLoading(true);
        try {
            const response = await axios.get(`${config.apiBaseUrl}getinventorylist`, {
            });

            const result = response.data.branches;
            if (response.status === 200) {
                setServiceData(result);          
      };
        } catch (error) {
            console.error("Error fetching inventory list:", error);
            toast.error("⚠️ Something went wrong while fetching inventory list");
        } finally {
            setNeedLoading(false);
        }
    };

    useEffect(() => {
        getinventorylist();
    }, []);

    useEffect(() => {
        if (user && Array.isArray(accessMenu)) {
            const found = accessMenu.find(m => m.path === pathname && m.user_id === userId);
            if (found) {
                setButtonPermissions({
                    search: found.search_btn === 1,
                });
            } else {
                setButtonPermissions({});
            }
        } else {
            setButtonPermissions({});
        }
    }, [user, accessMenu, pathname]);


    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const indexOfLastCreativeServices = currentPage * itemsPerPage;
    const indexOfFirstCreativeServices = indexOfLastCreativeServices - itemsPerPage;
    const paginatedCreativeServices = serviceData.slice(indexOfFirstCreativeServices, indexOfLastCreativeServices);

    const currentCreativeServices = paginatedCreativeServices.filter((item) =>
        `${item.branch_id} ${item.branch_in_charge} ${item.phone_number} ${item.location} ${item.branch_name} `
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );


    return (
        <div className='common-body-st'>
            <ToastContainer/>
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
            <div className='header-div-lp header-div-cp'>
                <div className='header-divpart-el'>
                    <div className='d-flex gap-2'>
                        <p className='mb-0 header-titlecount-el'>Total Inventory : {serviceData?.length || 0}</p>
                    </div>
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
                                color: "#666",
                                fontSize: "16px",
                            }}
                            >
                            ✕
                            </span>
                        )}
                        </div>

                    )}
                </div>
            </div>
            <div className='body-div-lp' style={{ height: "calc(100% - 58px)" }}>
                <div className='h-100 w-100 p-2 pb-0'>
                    <div className='table-common-st'>
                        <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
                            <div className='brcommon-col-st w-10'>
                                S no
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-15'>
                            Inventory ID
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-20'>
                            Incharge Name
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-15'>
                            Inventory Name
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-15'>
                            Location
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-15'>
                            Mobile No
                            </div> <span style={{ color: "#129347" }}> | </span>
                            <div className='brcommon-col-st w-10'>
                             View
                            </div>
                        </div>

                        <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
                            {currentCreativeServices && currentCreativeServices.length > 0 ? (currentCreativeServices.map((item, index) => (
                                <div className='display-flex br-rowst' key={item.branch_recid}>
                                    <div className='brcommon-col-st w-10'>
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-15'>
                                        {item.branch_id}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-20'>
                                        {item.branch_in_charge}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-15'>
                                        {item.branch_name}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-15'>
                                        {item.location}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-15'>
                                        {item.phone_number}
                                    </div><span style={{ color: "#ffffffff" }}> | </span>
                                    <div className='brcommon-col-st w-10'>
                                       <button
                                        type='button'
                                        onClick={() =>
                                            navigate("/inventory-list/inventoryproduct", {
                                            state: { slectdispatch: item }
                                            })
                                        }
                                        >
                                        View
                                        </button>
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
                        <Pagination
                            count={serviceData.length}
                            page={currentPage}
                            pageSize={itemsPerPage}
                            onChange={(pageNo) => setCurrentPage(pageNo)}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Dispatchlist;
