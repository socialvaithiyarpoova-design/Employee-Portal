import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/styles/dashboard.css';
import AnimatedCounter from '../../components/AnimatedCounter.jsx';
import ModalPopup from '../../components/modal-popup.jsx';
import configModule from '../../../config.js';
import { useAuth } from '../../components/context/Authcontext.jsx';

import lead_dbc from '../../assets/images/lead_dbc.svg';
import revenue_dbc from '../../assets/images/revenue_dbc.svg';
import expense_dbc from '../../assets/images/expense_dbc.svg';
import orders from '../../assets/images/orders.svg';
import req_pending from '../../assets/images/req_pending.svg';
import permission from '../../assets/images/permission.svg';

import t_orders from '../../assets/images/t_order.svg';
import t_orders2 from '../../assets/images/t_orders2.svg';
import R_dispatch from '../../assets/images/r_dispatch.svg';
import Intransit from '../../assets/images/Intransit.svg';
import stock_alert from '../../assets/images/s_alert.svg';
import pending_order from '../../assets/images/pending_orders.svg';

import call_back from '../../assets/images/call_back.svg';
import total_sales from '../../assets/images/total_sales.svg';
import saleofmonth from '../../assets/images/saleofmonth.svg';
import performer from '../../assets/images/performer.svg';
import follow_up from '../../assets/images/follow_up.svg';
import register from '../../assets/images/register.svg';

import today_ment from '../../assets/images/today_appointment.svg';
import t_class from '../../assets/images/t_class.svg';
import u_class from '../../assets/images/u_class.svg';
import t_appointment from '../../assets/images/t_appoint.svg';
import t_class_r from '../../assets/images/t_c_regiter.svg';
import fs_callb from '../../assets/images/call_back.svg';
import fs_tsale from '../../assets/images/total_sales.svg';
import fs_saleofmn from '../../assets/images/saleofmonth.svg';
import fs_star from '../../assets/images/performer.svg';
import fs_followup from '../../assets/images/follow_up.svg';
import fs_coll from '../../assets/images/fs_coll.svg';

import cs_t_c_forward from '../../assets/images/cs_t_carry_forword.svg';
import cs_t_evants from '../../assets/images/cs_t_evants.svg';
import cs_t_deliver from '../../assets/images/cs_t_del.svg';

import { PropagateLoader } from 'react-spinners';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const today = new Date();
  const [initialPopup, setInitialPopup] = useState(false);
  const config = configModule.config();
  const { user } = useAuth();
  const user_typecode = user?.user_typecode;
  const userId = user?.userId;
  const loginTime = user?.loginTime;
  const formattedLoginTime = loginTime ? new Date(loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
  let cardData = [];
  const [needLoading, setNeedLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState('');
  const [csdata, setCsdata] = useState([]);
  const navigate = useNavigate();

  const getDashboardDataUT = async () => {
    setNeedLoading(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}getDashboardDataUT`, {
        user_typecode: user_typecode,
        user_id: userId
      });

      const result = response.data;
      if (response.status === 200) {
        setDashboardData(result.data);
      } else {
        toast.error("Failed to get db details: " + result.message);
        console.error("Failed to get db details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching db details: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getDashboardDataUT();
    }
  }, [user]);

  useEffect(() => {
    if (user_typecode === "CS") {
      setCsdata([
        { name: "Today's deliverables", img: cs_t_deliver, count: dashboardData?.cs_today_delivary || 0, path: "/creatives" },
        { name: "Today's events", img: cs_t_evants, count: dashboardData?.cs_today_events || 0, path: "/calendar" },
        { name: "Total carry forwards", img: cs_t_c_forward, count: dashboardData?.cs_carry_forward || 0, path: "/creatives", key: "Overdue" },
      ]);
    } else {
      setCsdata([]);
    }
  }, [user_typecode]);

  if (user_typecode === "AD" ) {
    cardData = [
      { name: "Today’s leads", path: "/leads/pool", img: lead_dbc, count: dashboardData?.ad_today_lead ?? dashboardData?.bh_today_lead ?? 0 },
      { name: "Today’s revenue", path: "/accounts", img: revenue_dbc, count: dashboardData?.ad_total_revenue ?? dashboardData?.bh_total_revenue ?? 0, key: "revenue" },
      { name: "Monthly expenses", path: "/accounts", img: expense_dbc, count: dashboardData?.ad_total_expense ?? dashboardData?.bh_total_expense ?? 0, key: "expense" },
      { name: "Pending orders", path: "/purchase", img: orders, count: dashboardData?.ad_pending_order ?? dashboardData?.bh_pending_order ?? 0,key: "Pending" },
      { name: "Total pending leave request", path: "/employee/leave-permission", img: req_pending, count: dashboardData?.ad_pending_leaves ?? dashboardData?.bh_pending_leaves ?? 0 , key: "Leave"},
      { name: "Total pending Permission request", path: "/employee/leave-permission", img: permission, count: dashboardData?.ad_pending_permission ?? dashboardData?.bh_pending_permission ?? 0 , key: "Permission" },
    ];
  }  else if (user_typecode === "BH") {
    cardData = [
      { name: "Today’s leads",  img: lead_dbc, count: dashboardData?.bh_today_lead || 0 },
      { name: "Today revenue", path: "/accounts", img: revenue_dbc, count: dashboardData?.bh_total_revenue || 0, key: "revenue" },
      { name: "Monthly Expenses", path: "/accounts", img: expense_dbc, count: dashboardData?.bh_total_expense || 0, key: "expense" },
      { name: "Pending orders", path:  "/purchase", img: orders, count: dashboardData?.bh_pending_order || 0 ,key: "Pending"},
      { name: "Total pending leave request", path: "/employee/leave-permission", img: req_pending, count: dashboardData?.bh_pending_leaves || 0 , key: "Leave"},
      { name: "Total pending Permission request", path: "/employee/leave-permission", img: permission, count: dashboardData?.bh_pending_permission || 0 , key: "Permission"},
    ];
  } 
    
    else if (user_typecode === "TSL") {
    cardData = [
      { name: "Today's leads", img: lead_dbc, count: dashboardData?.tsl_today_leads || 0, path: "/leads" },
      { name: "Today's follow-up's", img: follow_up, count: dashboardData?.tsl_today_followup || 0, path: "/todo", key: "Follow up" },
      { name: "Today's call backs", img: call_back, count: dashboardData?.tsl_today_calback || 0, path: "/todo", key: "Call back" },
      { name: "Today's sales", img: total_sales, count: dashboardData?.tsl_today_sale || 0 },
      { name: "Total sales of the month", img: saleofmonth, count: dashboardData?.tsl_month_sale || 0, incentive: dashboardData?.tsl_incentive },
      { name: "Star performer", img: performer, count: dashboardData?.tsl_star_performar || 0 },
    ];
  } else if (user_typecode === "DIS") {
    cardData = [
      { name: "Pending orders", img: pending_order, count: dashboardData?.Pending_order || 0, path: "/orders-list", key: "Approved"},
      { name: "Today's orders", img: t_orders, count: dashboardData?.today_order || 0, path: "/orders-list", key: "dis_today" },
      { name: "Dispatched", img: R_dispatch, count: dashboardData?.ready_to_dispatch || 0, path: "/orders-list", key: "Dispatched" },
      { name: "In transit", img: Intransit, count: dashboardData?.total_in_transit || 0, path: "/orders-list", key: "In transit"  },
      { name: "Stock alert (low)", img: stock_alert, count: dashboardData?.stock_alert || 0, path: "/inventory" , key: "Low Stock" },
      { name: "Total orders", img: t_orders2, count: dashboardData?.total_order || 0, path: "/orders-list", key: "Total"  },
    ];
  } else if (user_typecode === "TCL") {
    
    cardData = [
      { name: "Today's leads", img: lead_dbc, count: dashboardData?.tcl_today_leads || 0, path: "/leads" },
      { name: "Today's follow-up's", img: follow_up, count: dashboardData?.tcl_today_followup || 0, path: "/todo", key: "Follow up" },
      { name: "Today's call backs", img: call_back, count: dashboardData?.tcl_today_calback || 0, path: "/todo", key: "Call back" },
      { name: "Today's sales", img: total_sales, count: dashboardData?.tcl_today_sale || 0 },
      { name: "Today's registrations", img: register, count: dashboardData?.tcl_Today_registers || 0, path: "/leads" },
      { name: "Total sales of the month", img: saleofmonth, count: dashboardData?.tcl_month_sale || 0 },
      { name: "Star performer", img: performer, count: dashboardData?.tcl_star_performar || 0 },
    ];
  }
  else if (user_typecode === "AC") {
    cardData = [
      { name: "Pending approvals", img: permission, count: dashboardData?.ac_pending_order || 0, path: "/orders" },
      { name: "Today's orders", img: t_orders, count: dashboardData?.ac_today_order || 0, path: "/orders", key: "ac_today" },
      { name: "Monthly revenue", img: revenue_dbc, count: dashboardData?.ac_total_revenue || 0, path: "/randd" , key: "revenue"},
      { name: "Monthly expenses", img: expense_dbc, count: dashboardData?.ac_total_expense || 0, path: "/randd", key: "expense" },
      { name: "Total orders", img: t_orders2, count: dashboardData?.ac_total_order || 0, path: "/orders", key: "history"},

    ];
  }
  else if (user_typecode === "VA") {
    cardData = [
      { name: "Today's appointment", img: today_ment, count: dashboardData?.va_today_appointment || 0, path: "/appointments", key: "Consulting" },
      { name: "Upcoming appointment", img: today_ment, count: dashboardData?.va_upcome_appointment || 0, path: "/appointments", key: "Con_Upcoming" },
      { name: "Today's class", img: t_class, count: dashboardData?.va_today_class || 0, path: "/appointments", key: "Class" },
      { name: "Upcoming  class", img: u_class, count: dashboardData?.va_upcoming_class || 0, path: "/appointments", key: "Class_Upcoming" },
      { name: "Total appointment", img: t_appointment, count: dashboardData?.va_total_appointment || 0 , path: "/appointments", key: "All_Consulting"},
      { name: "Total class", img: t_class_r, count: dashboardData?.va_total_register || 0 , path: "/appointments", key: "All_Class"},
    ];
  }
  else if (user_typecode === "FS") {
    cardData = [
      { name: "Today's leads", img: lead_dbc, count: dashboardData?.fs_fieldlead || 0},
      { name: "Today's collections", img: fs_coll, count: dashboardData?.fs_today_collection || 0, path: "/collections" },
      { name: "Today's follow-up's", img: fs_followup, count: dashboardData?.fs_today_followup || 0, path: "/todo", key: "Follow up"},
      { name: "Today's call backs", img: fs_callb, count: dashboardData?.fs_today_calback || 0, path: "/todo", key: "Call back" },
      { name: "Total sales of the month", img: fs_saleofmn, count: dashboardData?.fs_sale_month || 0, incentive: dashboardData?.fs_incentives },
      { name: "Today's sales", img: fs_tsale, count: dashboardData?.fs_total_sale || 0 },
      { name: "Star performer", img: fs_star, count: dashboardData?.fs_star_performar || 0 },
    ];
  }
  else if (user_typecode === "FOI") {
    cardData = [
      { name: "Today's leads", img: lead_dbc, count: dashboardData?.foi_today_leads || 0, path: "/leads" },
      { name: "Today's Follow-up's", img: fs_followup, count: dashboardData?.foi_today_followup || 0, path: "/todo", key: "Follow up" },
      { name: "Today's call backs", img: fs_callb, count: dashboardData?.foi_today_calback || 0, path: "/todo", key: "Call back" },
      { name: "Total bills of the month", img: fs_saleofmn, count: dashboardData?.foi_bill_month || 0 },
      { name: "Total sales of the month", img: fs_saleofmn, count: dashboardData?.foi_sale_month || 0 },
      { name: "Stock alert", img: stock_alert, count: dashboardData?.foi_stock_alert || 0, path: "/stocks", key: "Low Stock"},
      { name: "Star performer", img: fs_star, count: dashboardData?.foi_star_performar || 0 },
    ];
  }

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}CheckLeadCount`,{
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: parseInt(userId) }),
          signal: controller.signal
        });

        const result = await response.json();
        if (response.ok) {
          setInitialPopup(!(result.data && result.data.length > 0));
        } else {
          toast.error("Failed to submit count: " + result.message);
          setInitialPopup(true);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error("Error submitting count: " + error.message);
          setInitialPopup(false);
        }
      }
    })();
    return () => controller.abort();
  }, [userId, config.apiBaseUrl]);

  const closeInitialModal = () => {
    setInitialPopup(false);
  };

  const formattedDate = `${today.toLocaleDateString("en-US", { weekday: "long" })}, ${today
    .toLocaleDateString("en-GB")
    .split("/")
    .join("-")}`;



  const renderCardContent = (item) => {
    if (item.name === "Star performer") {
      return <h6>{item?.count || ''}</h6>;
    }

    if (item.name === "Total sales of the month") {
      return (
        <>
          <div className='display-flex'>
            <div>
              <h5>{item.count || '₹ 0'}</h5>
              <h6>Incentive: ₹{item.incentive || 0}</h6>
            </div>
          </div>
        </>
      );
    }

if (item.name === "Total sales of the month" || item.name === "Today's sales" ) {
  if (typeof item.count === 'string' && item.count.includes('/')) {
    return (
      <div className="d-flex flex-column align-items-center">
        <h5 className="mb-0">{item.count}</h5>
      </div>
    );
  }
}


    if (item.name === "Today's leads") {
      return (
        <div className='d-flex'>
          {
            typeof item.count === 'number' ? (
              <AnimatedCounter start={0} end={item.count} duration={1000} />
            ) : (
              <h5>{item.count}</h5>
            )
          }
        </div>
      );
    }

    return <AnimatedCounter start={0} end={item.count} duration={1000} />;
  };

  const renderContentByName = (item) => {
    switch (item.name) {
      case "Total sales of the month":
        return (
          <>
            <div className='display-flex'>
              {
                typeof item.count === 'number' ? (
                  <AnimatedCounter start={0} end={item.count} duration={1000} />
                ) : (
                  <div>
                    <h5>{item.count}</h5>
                    <h6>Incentive: ₹{item.incentive || 0}</h6>
                  </div>
                )
              }
            </div>
          </>
        );
      case "Total bills of the month":
      case "Star performer":
      case "Today's sales":
        return (
          <>
            <div className='display-flex'>
              {
                typeof item.count === 'number' ? (
                  <AnimatedCounter start={0} end={item.count} duration={1000} />
                ) : (
                  <h5>{item.count}</h5>
                )
              }
            </div>
          </>
        );



      case "Stock alert":
        return (
          <>
            <p className='fw-semibold'>Low stock</p>
            <AnimatedCounter start={0} end={item.count} duration={1000} />
          </>
        );

      default:
        return <AnimatedCounter start={0} end={item.count} duration={1000} />;
    }
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
        theme="colored"
      />
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

      {(initialPopup && (user_typecode === "TSL" || user_typecode === "TCL" || user_typecode === "FS" || user_typecode === "FOI")) && (<ModalPopup userId={userId} closeModal={closeInitialModal} />)}
      <div className='header-container-db w-100'>
        <h2 className='welcome-st mb-0'>Welcome!</h2>
        <p className='mb-0'>{formattedDate} / Login - {formattedLoginTime}</p>
      </div>
      <div className='body-container-db'>
        <div className="row  w-100 db-cards-st justify-content-center">
          {(() => {
            if (user_typecode === "CS") {
              return csdata.map((item) => (
                <div className="col-12 col-md-6 col-lg-4" style={{ minHeight: "232px", position: "relative" }} key={item.name}>
                  <div className="card text-center bg-light-db p-2 h-100 dbcard-bg position-relative" onClick={() => navigate(item.path, { state: { db_type: item.key } })}>
                    <img src={item.img} className='card-bgimg' alt={item.name} />
                    <h5 className="pt-4 mb-0 db-cardhead-st">{item.name}</h5>
                    <div className="fw-bold mb-0 countst-db" style={{ zIndex: 1000 }}>
                      <AnimatedCounter start={0} end={item.count} duration={1000} />
                    </div>
                  </div>
                  <div className="ribbon"><span></span></div>
                </div>
              ));
            }
            else if (user_typecode === "TCL" || user_typecode === "VA" || user_typecode === "FS") {
              return cardData.map((item) => (
                <div className="col-12 col-md-6 col-lg-4" style={{ minHeight: "232px", position: "relative" }} key={item.name}>
                  <div className="card text-center bg-light-db p-2 h-100 dbcard-bg position-relative" onClick={() => navigate(item.path, { state: { db_type: item.key } })}>
                    <img src={item.img} className='card-bgimg' alt={item.name} />
                    <h5 className="pt-4 mb-0 db-cardhead-st">{item.name}</h5>
                    <div className="fw-bold mb-0 countst-db" style={{ zIndex: 1000 }}>
                      {renderCardContent(item)}
                    </div>
                  </div>
                  <div className="ribbon"><span></span></div>
                </div>
              ));
            } else {
              return cardData.map((item) => (
                <div className="col-12 col-md-6 col-lg-4 hover-medb-st" style={{ minHeight: "232px", position: "relative" }} key={item.name}>
                  <button className="card text-center bg-light-db p-2 h-100 dbcard-bg position-relative w-100" onClick={() => navigate(item.path, { state: { db_type: item.key } })}>
                    <img src={item.img} className='card-bgimg' alt={item.name} />
                    <h5 className="pt-4 mb-0 db-cardhead-st" style={{ fontWeight: "600" }}>{item.name}</h5>
                    <div className="fw-bold mb-0 countst-db" style={{ zIndex: 1000 }}>
                      {renderContentByName(item)}
                    </div>
                  </button>
                  <div className="ribbon"><span></span></div>
                </div>
              ));
            }
          })()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
