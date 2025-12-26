import React, { useState, useEffect } from 'react';
import '../../assets/styles/leads.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import '../../assets/styles/viewlead.css';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import configModule from '../../../config.js';
import { PropagateLoader } from 'react-spinners';
import { useNavigate, useLocation } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import SvgContent from '../../components/svgcontent.jsx';


function LeadHistoryByFS() {
    const { user } = useAuth();
    const [needLoading, setNeedLoading] = useState(false);
    const [salePopupOpen, setSalePopupOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState('');
    const [activeTab, setActiveTab] = useState("Purchase history");
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedData } = location.state || {};
    const config = configModule.config();
    const [leadHistoryData, setLeadHistoryData] = useState({
        "Purchase history": []
    });


    const formatDateTime = (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "Invalid date";
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const getLeadsHistoryDetails = async () => {
        setNeedLoading(true);
        try {
            const response = await axios.post(`${config.apiBaseUrl}getLeadsHistoryDetailsByFS`, {
                lead_id: selectedData?.lead_recid || selectedData?.flead_recid,
                id: selectedData?.lead_id || selectedData?.flead_id,
            });
            const result = response.data;
            if (response.status === 200) {
                setLeadHistoryData(result.data)
            } else {
                toast.error("Failed to fetch history list: " + result.message);
            }
        } catch (error) {
            toast.error("Error fetching history list: " + (error.response?.data?.message || error.message));
        } finally {
            setNeedLoading(false);
        }
    };

    useEffect(() => {
        if (user && selectedData) {
            getLeadsHistoryDetails();
        }
    }, [user]);

    function formatDateToMySQLQuery(date) {
        if (!date) return null;
        const d = new Date(date);
        const pad = (n) => (n < 10 ? '0' + n : n);

        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    };


    return (
        <div className='common-body-st'>
            {needLoading && (
                <div className='loading-container w-100 h-100'>
                    <PropagateLoader color="#0B9346" />
                </div>
            )}

            <div className='w-100 h-100 p-3'>
                <div className='lead-viewhead-st'>
                    <button onClick={() => navigate("/clients")}>
                        <p className='mb-0 nav-btn-top'>Clients &nbsp;</p>
                    </button>
                    <button>
                        <p className='mb-0 nav-btn-top'>&gt; Profile &gt; View</p>
                    </button>
                </div>

                <div className='lead-viewbody-st display-flex align-items-start'>

                    {/* Left: Client Info */}
                    <div className="client-info-card">
                        <h5 className='fw-bold mb-4'>Client details</h5>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Client ID</p>
                            <p className='client-title'>{selectedData?.lead_id ||selectedData?.flead_id }</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Client name</p>
                            <p className='client-title'>{selectedData?.lead_name || selectedData?.flead_name }</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Shop Keeper</p>
                            <p className='client-title'>{selectedData?.shop_keeper || ''}</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Shop Type</p>
                            <p className='client-title'>{selectedData?.shop_type || ''}</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Phone</p>
                            <p className='client-title'>{selectedData?.mobile_number || ''}</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Email</p>
                            <p className='client-title'>{selectedData?.email || '---'}</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Handled by</p>
                            <p className='client-title'>{selectedData?.created_by_name || ''}</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Address</p>
                            <p className='client-title'>{selectedData?.address || '---'}</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >District</p>
                            <p className='client-title'>{selectedData?.city || '---'}</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >State</p>
                            <p className='client-title'>{selectedData?.state || '---'}</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >country</p>
                            <p className='client-title'>{selectedData?.country || '---'}</p>
                        </div>
                         
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Date</p>
                            <p className='client-title'>{formatDateToMySQLQuery(selectedData?.created_at) || ''}</p>
                        </div>
                    </div>

                    {/* Center: Tabs */}
                    <div className="history-tabs-container">
                        <h5 className="fw-semibold mb-3">History</h5>
                        <ul className="history-tabs">
                            {Object.keys(leadHistoryData).map((tab) => (
                                <button onClick={() => setActiveTab(tab)} key={tab} >
                                    <li className={activeTab === tab ? "history-active" : ""}>
                                        {tab}
                                    </li>
                                </button>
                            ))}
                        </ul>
                    </div>

                    {/* Right: Table */}
                    {activeTab === "Purchase history" && (
                        <div className="history-table-container">
                            <div className='w-100 history-maintab-sthgt' >
                                <div className='w-100 display-flex hist-tab-head'>
                                    <div className='w-20 his-headcol-st'>
                                        S no
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className='w-20 his-headcol-st'>
                                        Date
                                    </div><span style={{ color: "#129347" }}>|</span>                                 
                                    <div className='w-20 his-headcol-st'>
                                        Handler
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className='w-20 his-headcol-st'>
                                        Value
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className='w-20 his-headcol-st'>
                                        <SvgContent svg_name="col_info" />
                                    </div>
                                </div>
                                <div className='w-100 his-body-st'>
                                    {leadHistoryData && leadHistoryData[activeTab] ? (
                                        leadHistoryData[activeTab].map((item, index) => (
                                            <div key={item.id || index} className='display-flex'>
                                                <div className='w-20 his-headcol-st'>
                                                    {index + 1}
                                                </div><span style={{ color: "#ffffffff" }}>|</span>
                                                <div className='w-20 his-headcol-st'>
                                                    {formatDateTime(item.date_time)}
                                                </div><span style={{ color: "#ffffffff" }}>|</span>                                                
                                                <div className='w-20 his-headcol-st'>
                                                    {item.handler_name}
                                                </div><span style={{ color: "#ffffffff" }}>|</span>
                                                <div className='w-20 his-headcol-st'>
                                                    {item.amount_to_pay}
                                                </div><span style={{ color: "#ffffffff" }}>|</span>
                                                <div className='w-20 his-headcol-st'>
                                                    <button className='cursor-pointer' onClick={() => {
                                                        setSalePopupOpen(true);
                                                        setSelectedItems(item);
                                                    }} >
                                                        <SvgContent svg_name="info" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))) : (
                                        <div className='display-flex h-100'>No data found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {salePopupOpen && (
                <div className='salespp-open-st'>
                    <div className='salespp-container-st'>
                        <div className='d-flex gap-2 justify-content-between align-items-center mb-3'>
                            <h5 className='mb-0'>Details</h5>
                            <span className="consult_close-button" style={{ fontSize: "28px" }} onClick={() => setSalePopupOpen(false)}>×</span>
                        </div>
                        <div className='salespp-body-st'>
                            {activeTab === "Purchase history" && (
                                selectedItems.product_list && (
                                    JSON.parse(selectedItems.product_list).map((item, index) => (
                                        <div key={item.rec_id || item.id || index} className='display-flex mb-3 justify-content-between gap-4'>
                                            <div className='d-flex'>
                                                <p className='mb-0' style={{ minWidth: "132px" }}>{item.id || ''}</p>
                                                <p className='mb-0' > - {item.name || ''}</p>
                                            </div>
                                            <div>
                                                Qty: {item.qty}
                                            </div>
                                        </div>
                                    ))
                                )
                            )}


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
        </div>
    );
}

export default LeadHistoryByFS;

