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

function LeadHistory() {
    const { user } = useAuth();
    const user_typecode = user?.user_typecode;
    const [needLoading, setNeedLoading] = useState(false);
    const [salePopupOpen, setSalePopupOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);
    const [activeTab, setActiveTab] = useState("Purchase history");
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedData, status_data } = location.state || {};
    const config = configModule.config();
    const [walletHistoryOpen, setWalletHistoryOpen] = useState(false);
    const [leadHistoryData, setLeadHistoryData] = useState({ "Purchase history": [], "Consulting history": [], "Class": [], "Wallet": [] });
    const [activeIndex, setActiveIndex] = useState(null);
    const [walletHistory, setWalletHistory] = useState([]);

    const formatDateTime = (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "Invalid date";
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const sections = [
        {
            title: 'Register details',
            content: (
                <table className="details-table">
                    {leadHistoryData["Class"] ? leadHistoryData["Class"].map((itm, index) => (
                        <tbody key={itm.reg_no || index} style={{ lineHeight: "35px", marginBottom: "18px" }}>
                            <tr>
                                <td >Reg no</td>
                                <td>{itm.reg_no}</td>
                            </tr>
                            <tr>
                                <td >Reg date</td>
                                <td>{itm.reg_date}</td>
                            </tr>
                            <tr>
                                <td >Reg time</td>
                                <td>{itm.reg_time}</td>
                            </tr>
                            <tr>
                                <td >Marital status</td>
                                <td>{itm.marital_status}</td>
                            </tr>
                            <tr>
                                <td >Married date</td>
                                <td>{itm.married_date}</td>
                            </tr>
                        </tbody>
                    )) : (
                        <div>
                            No data found here
                        </div>
                    )}

                </table>
            ),
        },
        {
            title: 'Partner details - Male',
            content: (
                <table className="details-table w-100">
                    {leadHistoryData["Class"] ? leadHistoryData["Class"].map((itm, index) => (
                        <tbody key={itm.reg_no || index} style={{ lineHeight: "35px", marginBottom: "18px", width: "100%" }}>
                            <tr className='w-100'>
                                <td className='male-column-st' >Male name</td>
                                <td className='malergh-column-st'>{itm.male_name || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Phone</td>
                                <td className='malergh-column-st'>{itm.male_mobile || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Email</td>
                                <td className='malergh-column-st'>{itm.male_email || ' -- '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >DOB</td>
                                <td className='malergh-column-st' >{itm.male_dob ? formatDateTime(itm.male_dob) : ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Test taken</td>
                                <td className='malergh-column-st' >{itm.male_tests_taken || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Test details</td>
                                <td className='malergh-column-st' >{itm.male_tests_details || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Reason</td>
                                <td className='malergh-column-st' >{itm.male_infertility_reason || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Causes</td>
                                <td className='malergh-column-st' >{itm.male_infertility_causes || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Remark</td>
                                <td className='malergh-column-st' >{itm.male_remark || ' - '}</td>
                            </tr>
                        </tbody>
                    )) : (
                        <div>
                            No data found here
                        </div>
                    )}

                </table>
            ),
        },
        {
            title: 'Partner details - Female',
            content: (
                <table className="details-table w-100">
                    {leadHistoryData["Class"] ? leadHistoryData["Class"].map((itm, index) => (
                        <tbody key={itm.reg_no || index} style={{ lineHeight: "35px", marginBottom: "18px", width: "100%" }}>
                            <tr className='w-100'>
                                <td className='male-column-st' >Female name</td>
                                <td className='malergh-column-st'>{itm.female_name || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Phone</td>
                                <td className='malergh-column-st'>{itm.female_mobile || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Email</td>
                                <td className='malergh-column-st'>{itm.female_email || ' --'}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >DOB</td>
                                <td className='malergh-column-st' >{itm.female_dob ? formatDateTime(itm.female_dob) : ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Test taken</td>
                                <td className='malergh-column-st' >{itm.female_tests_taken || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Test details</td>
                                <td className='malergh-column-st' >{itm.female_tests_details || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Reason</td>
                                <td className='malergh-column-st' >{itm.female_infertility_reason || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Causes</td>
                                <td className='malergh-column-st' >{itm.female_infertility_causes || ' - '}</td>
                            </tr>
                            <tr>
                                <td className='male-column-st' >Remark</td>
                                <td className='malergh-column-st' >{itm.female_remark || ' - '}</td>
                            </tr>
                        </tbody>
                    )) : (
                        <div>
                            No data found here
                        </div>
                    )}

                </table>
            ),
        },
        {
            title: 'General details',
            content: (
                <table className="details-table w-100">
                    {leadHistoryData["Class"] ? leadHistoryData["Class"].map((itm, index) => (
                        <tbody key={itm.reg_no || index} style={{ lineHeight: "35px", marginBottom: "18px", width: "100%" }}>
                            <tr className='w-100'>
                                <td className='male-column-st' >Lead ID</td>
                                <td className='malergh-column-st'>{itm.lead_id || itm.flead_id}</td>
                            </tr>
                            <tr className='w-100'>
                                <td className='male-column-st' >Lead name</td>
                                <td className='malergh-column-st'>{itm.lead_name || itm.flead_name}</td>
                            </tr>
                            <tr className='w-100'>
                                <td className='male-column-st' >Class type</td>
                                <td className='malergh-column-st'>{itm.class_type || ' - '}</td>
                            </tr>
                            <tr className='w-100'>
                                <td className='male-column-st' >Country</td>
                                <td className='malergh-column-st'>{itm.country || ' - '}</td>
                            </tr>
                            <tr className='w-100'>
                                <td className='male-column-st' >State</td>
                                <td className='malergh-column-st'>{itm.state || ' - '}</td>
                            </tr>
                            <tr className='w-100'>
                                <td className='male-column-st' >District</td>
                                <td className='malergh-column-st'>{itm.city || ' - '}</td>
                            </tr>
                            <tr className='w-100'>
                                <td className='male-column-st' >Pincode</td>
                                <td className='malergh-column-st'>{itm.pincode || ' - '}</td>
                            </tr>
                        </tbody>
                    )) : (
                        <div>
                            No data found here
                        </div>
                    )}

                </table>
            ),
        },
        {
            title: 'Payment details',
            content: (
                <table className="details-table w-100">
                    {leadHistoryData["Class"] ? leadHistoryData["Class"].map((itm, index) => (
                        <tbody key={itm.reg_no || index} style={{ lineHeight: "35px", marginBottom: "18px", width: "100%" }}>
                            <tr className='w-100'>
                                <td className='male-column-st' >Price</td>
                                <td className='malergh-column-st'>{itm.price_value || ' - '}</td>
                            </tr>
                            <tr className='w-100'>
                                <td className='male-column-st' >Discount</td>
                                <td className='malergh-column-st'>{itm.discount || ' - '}</td>
                            </tr>
                            <tr className='w-100'>
                                <td className='male-column-st' >Transaction ID</td>
                                <td className='malergh-column-st'>{itm.transaction_id || ' - '}</td>
                            </tr>
                            <tr className='w-100'>
                                <td className='male-column-st' >Payment date</td>
                                <td className='malergh-column-st'>{itm.payment_date.split(" ")[0] || ' - '}</td>
                            </tr>
                            <tr className='w-100'>
                                <td className='male-column-st' >Amount to pay</td>
                                <td className='malergh-column-st'>{itm.amount_to_pay || ' - '}</td>
                            </tr>
                        </tbody>
                    )) : (
                        <div>
                            No data found here
                        </div>
                    )}

                </table>
            ),
        },
    ];

    const getLeadsHistoryDetails = async () => {
        setNeedLoading(true);

        const apiCall = user_typecode === "FS" ? "getLeadsHistoryDetailsByFS" : "getLeadsHistoryDetails";
        try {
            const response = await axios.post(`${config.apiBaseUrl}${apiCall}`, {
                lead_id: selectedData?.lead_recid || selectedData?.flead_recid ,
                id: selectedData?.lead_id || selectedData?.flead_id
            });

            const result = response.data;

            if (response.status === 200) {
                setLeadHistoryData(result.data);
                const wallet = result?.data?.Wallet;

                if (wallet) {
                    setWalletBalance(wallet[0]?.wall_balance);
                }
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

    const toggleSection = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const handleViewWalletHis = async (objItem) => {
        try {
            const response = await axios.post(`${config.apiBaseUrl}getViewWalletHis`, {
                lead_recid: objItem?.lead_id || objItem?.flead_id,
                type: objItem?.lead_id ? "SL" : "FS"
            });

            const result = response.data;

            if (response.status === 200) {
                setWalletHistory(result.data);
            } else {
                toast.error("Failed to fetch data list: " + result.message);
            }
        } catch (error) {
            toast.error("Error fetching data list: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className='common-body-st'>
            {needLoading && (
                <div className='loading-container w-100 h-100'>
                    <PropagateLoader color="#0B9346" />
                </div>
            )}

            <div className='w-100 h-100 p-3'>
                {location.pathname === "/clients/profile" ? (
                    <div className='lead-viewhead-st'>
                        <button onClick={() => navigate("/clients")}>
                            <p className='mb-0 nav-btn-top'>Client &nbsp;</p>
                        </button>
                        <button>
                            <p className='mb-0 nav-btn-top'>&gt; Profile &gt; View</p>
                        </button>
                    </div>
                ) : (
                    <div className='lead-viewhead-st'>
                        <button onClick={() => navigate("/leads")}>
                            <p className='mb-0 nav-btn-top'>Leads &nbsp;</p>
                        </button>
                        <button>
                            <p className='mb-0 nav-btn-top'>&gt; Profile &gt; View</p>
                        </button>
                    </div >
                )
                }

                <div className='lead-viewbody-st display-flex align-items-start'>

                    {/* Left: Client Info */}
                    <div className="client-info-card">
                        <h5 className='fw-bold mb-4'>Client details</h5>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Client ID</p>
                            <p className='client-title'>{selectedData?.lead_id || selectedData?.flead_id}</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Client name</p>
                            <p className='client-title'>{selectedData?.lead_name || selectedData?.flead_name}</p>
                        </div>
                        {user_typecode !== "FS" && status_data !== "shop" ? (
                            <>
                                <div className='d-flex align-items-center gap-2 '>
                                    <p className="client-title fw-semibold min-wdset-st" >Age</p>
                                    <p className='client-title'>{selectedData?.age || ''}</p>
                                </div>
                                <div className='d-flex align-items-center gap-2 '>
                                    <p className="client-title fw-semibold min-wdset-st" >Gender</p>
                                    <p className='client-title'>{selectedData?.gender || ''}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className='d-flex align-items-center gap-2 '>
                                    <p className="client-title fw-semibold min-wdset-st" >Shop keeper</p>
                                    <p className='client-title'>{selectedData?.shop_keeper || ''}</p>
                                </div>
                                <div className='d-flex align-items-center gap-2 '>
                                    <p className="client-title fw-semibold min-wdset-st" >Shop type</p>
                                    <p className='client-title'>{selectedData?.shop_type || ''}</p>
                                </div>
                            </>
                        )}

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
                            <p className='client-title'>{selectedData?.handler_name|| selectedData?.created_by_name}</p>
                        </div>
                        <div className='d-flex align-items-center gap-2 '>
                            <p className="client-title fw-semibold min-wdset-st" >Date</p>
                            <p className='client-title'>{formatDateToMySQLQuery(selectedData?.created_at) || ''}</p>
                        </div>
                        {user_typecode !== "FS" && status_data !== "shop" && (
                            <>
                                <div className='d-flex align-items-center gap-2 '>
                                    <p className="client-title fw-semibold min-wdset-st" >Country</p>
                                    <p className='client-title'>{selectedData?.country || '---'}</p>
                                </div>
                                <div className='d-flex align-items-center gap-2 '>
                                    <p className="client-title fw-semibold min-wdset-st" >State</p>
                                    <p className='client-title'>{selectedData?.state || '---'}</p>
                                </div>
                                <div className='d-flex align-items-center gap-2 '>
                                    <p className="client-title fw-semibold min-wdset-st" >City</p>
                                    <p className='client-title'>{selectedData?.city || '---'}</p>
                                </div>
                                <div className='d-flex align-items-center gap-2 '>
                                    <p className="client-title fw-semibold min-wdset-st" >Location</p>
                                    <p className='client-title'>{selectedData?.location || '---'}</p>
                                </div>

                                <div className='d-flex align-items-center gap-2 '>
                                    <p className="client-title mb-0 fw-semibold min-wdset-st" >Wallet Bal</p>
                                    ₹ {selectedData?.wallet_amount || walletBalance || 0}
                                    <button className='client-title' onClick={() => { setWalletHistoryOpen(true); handleViewWalletHis(selectedData); }} >
                                        <SvgContent stroke='#fff' svg_name="info" />
                                    </button>
                                </div>

                            </>
                        )}
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
                           <div style={{padding:'1px 10px'}}> Total : {leadHistoryData[activeTab]?.length || 0}</div>
                            <div className='w-100 history-maintab-sthgt'>
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
                                       Details
                                    </div>
                                </div>
                                <div className='w-100 his-body-st'>
                                    {leadHistoryData && leadHistoryData[activeTab] ? (
                                        leadHistoryData[activeTab].map((item, index) => (
                                            <div key={item.id || index} className='display-flex'>
                                                <div className='w-20 his-headcol-st'>
                                                    {index + 1}
                                                </div>
                                                <div className='w-20 his-headcol-st'>
                                                    {formatDateTime(item.date_time)}
                                                </div>
                                                <div className='w-20 his-headcol-st'>
                                                    {item.handler_name}
                                                </div>
                                                <div className='w-20 his-headcol-st'>
                                                    {item.amount_to_pay}
                                                </div>
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

                    {activeTab === "Consulting history" && (
                        <div className="history-table-container">

                            <div style={{padding:'1px 10px'}}> Total {leadHistoryData[activeTab]?.length || 0}</div>
                            <div className='w-100 history-maintab-sthgt'>
                                <div className='w-100 display-flex hist-tab-head'>
                                    <div className='w-15 his-headcol-st'>
                                        S no
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className='w-20 his-headcol-st'>
                                        Date
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className='w-25 his-headcol-st'>
                                        Consultant
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className='w-25 his-headcol-st'>
                                        Handler
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className='w-15 his-headcol-st'>
                                       Details
                                    </div>
                                </div>
                                <div className='w-100 his-body-st'>
                                    {leadHistoryData && leadHistoryData[activeTab] ? (
                                        leadHistoryData[activeTab].map((item, index) => (
                                            <div key={item.id || index} className='display-flex'>
                                                <div className='w-15 his-headcol-st'>
                                                    {index + 1}
                                                </div>
                                                <div className='w-20 his-headcol-st'>
                                                    {formatDateTime(item.created_at)}
                                                </div>
                                                <div className='w-25 his-headcol-st'>
                                                    {item.vaithyar_name || ''}
                                                </div>
                                                <div className='w-25 his-headcol-st'>
                                                    {item.handler_name}
                                                </div>
                                                <div className='w-15 his-headcol-st'>
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

                    {activeTab === "Class" && (
                        <div className="history-table-container">
                            <div className='w-100 h-100'>
                                <div className="clsspp_accordion-container">
                                    {sections.map((section, index) => (
                                        <div key={index} className="clsspp_accordion-section">
                                            <button
                                                className="clsspp_accordion-header"
                                                onClick={() => toggleSection(index)}
                                            >
                                                {section.title}
                                                <span className={`clsspp_arrow ${activeIndex === index ? 'open' : ''}`}>
                                                    ▼
                                                </span>
                                            </button>
                                            {activeIndex === index && (
                                                <div className="clsspp_accordion-content">{section.content}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "Wallet" && (
                        <div className="history-table-container">
                            <div className='w-100 h-100'>
                                <div className='w-100 display-flex hist-tab-head'>
                                    <div className='w-10 his-headcol-st'>
                                        S no
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className='w-10 his-headcol-st'>
                                        Date
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className='w-15 his-headcol-st'>
                                        Call back
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className='w-15 his-headcol-st'>
                                        Handler
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className='w-25 his-headcol-st'>
                                        Value
                                    </div><span style={{ color: "#129347" }}>|</span>
                                    <div className="w-25 his-headcol-st">Status</div>
                                </div>
                                <div className='w-100 his-body-st'>
                                    {leadHistoryData && leadHistoryData[activeTab] ? (
                                        leadHistoryData[activeTab].map((item, index) => (
                                            <div key={item.id || index} className='display-flex'>
                                                <div className='w-10 his-headcol-st'>
                                                    {index + 1}
                                                </div>
                                                <div className='w-10 his-headcol-st'>
                                                    {formatDateTime(item.created_at)}
                                                </div>
                                                <div className='w-15 his-headcol-st'>
                                                    {formatDateTime(item.callback_date)}
                                                </div>
                                                <div className='w-15 his-headcol-st'>
                                                    {item.handler_name}
                                                </div>
                                                <div className='w-25 his-headcol-st'>
                                                    {item.amount_to_pay}
                                                </div>
                                                <div
                                                    className="w-25 his-headcol-st"
                                                    style={{
                                                        color:
                                                        item.wallet_status === "Approved"
                                                            ? "green"
                                                            : item.wallet_status === "Decline"
                                                            ? "red"
                                                            : "black",
                                                    }}
                                                    >
                                                    {item.wallet_status}
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
            </div >

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

                            {activeTab === "Consulting history" && (
                                selectedItems && (
                                    <div className=' mb-3 justify-content-between gap-4'>
                                        <div className='d-flex mb-4'>
                                            <p className='mb-0'>{selectedItems.lead_id || selectedItems.flead_id}</p>
                                            <p className='mb-0' > - {selectedItems.lead_name}</p>
                                        </div>
                                        <div>
                                            <span className='fw-semibold'>Slot Date & Time:</span>
                                            <p className='mb-2 mt-2'>{formatDateTime(selectedItems.slot_date)}</p>
                                            <p className='mb-0'>{selectedItems.slot_time}</p>
                                        </div>
                                        {selectedItems?.comments &&
                                        selectedItems.comments.trim() !== "" && (
                                            <div>
                                            <span className="fw-semibold">
                                                Diagnosis Description:
                                            </span>
                                            <p className="mb-0">{selectedItems.comments}</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {walletHistoryOpen && (
            <div className="modal-overlay modal-overlay-position">
                <div className="modal-container modal-overlay-position" style={{ width: "800px" }}>
                    <div className="modal-header">
                        <h5 className="mb-0 add-new-hdr">
                            View History - Total: {walletHistory && walletHistory.length > 0 ? walletHistory.reduce((sum, item) => sum + (parseFloat(item.final_amount) || 0), 0).toFixed(2) : '0.00'}
                        </h5>
                    </div>
                    <div className="modal-body" style={{ maxWidth: "800px", overflow: "auto" }}>
                        <div className='w-100 d-flex align-items-center tb-header-row-st' style={{ minWidth: "725px" }}>
                            <div style={{ minWidth: "72px" }} className="historytab-st  w-20">
                                S.No
                            </div>
                            <div style={{ minWidth: "112px" }} className="historytab-st  w-20">
                                Order ID
                            </div>
                            <div style={{ minWidth: "112px" }} className="historytab-st  w-20" >
                                Total Value
                            </div>
                            <div style={{ minWidth: "112px" }} className="historytab-st  w-20" >
                                Wallet
                            </div>
                            <div style={{ minWidth: "132px" }} className="historytab-st w-20">
                                Date Time
                            </div>
                        </div>
                        <div className='hist-tab-body-st'>
                            {walletHistory && walletHistory.map((item, idx) => (
                                <div className='w-100 d-flex align-items-center overflow-auto' key={item.id} style={{ minWidth: "725px" }}>
                                    <div style={{ minWidth: "72px" }} className="historytab-st w-20">
                                        {idx + 1 || 0}
                                    </div>
                                    <div style={{ minWidth: "112px" }} className="historytab-st w-20">
                                        {item.order_id}
                                    </div>
                                    <div style={{ minWidth: "112px" }} className="historytab-st w-20">
                                        {item.final_amount}
                                    </div>
                                    <div style={{ minWidth: "112px" }} className="historytab-st w-20">
                                        {item.wallet}
                                    </div>
                                    <div style={{ minWidth: "112px" }} className="historytab-st  w-20" >
                                        {item?.date_time ? formatDateTime(item.date_time) : ''}
                                    </div>
                                </div>
                            ))}

                            {walletHistory.length === 0 && (
                                <div style={{ minWidth: "212px" }} className="historytab-st">
                                    No data found
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="cancel-button" onClick={() => setWalletHistoryOpen(false)}>Close</button>
                    </div>
                </div>
            </div>
            )}

            <ToastContainer />
        </div >
    );
}

export default LeadHistory;

