import React, { useState, useEffect } from 'react';
import './appointments.css';
import Pagination from "../../components/Pagination/index.jsx";
import { PropagateLoader } from 'react-spinners';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import configModule from '../../../config.js';
import SvgContent from '../../components/svgcontent.jsx';

function Appointments() {
  const [classdata, setClassdata] = useState([]);
  const [consultDataList, setConsultDataList] = useState([]);
  const [catagory, setCatagory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [needLoading, setNeedLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname;
  const db_today_app = location?.state?.db_type;
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  let db_state = "Todays";
  let db_today_app_st = "Consulting";

  if (db_today_app === "Con_Upcoming") {
    db_state = "Upcoming";
    db_today_app_st = "Consulting";
  } else if (db_today_app === "Class_Upcoming") {
    db_state = "Upcoming";
    db_today_app_st = "Class";
  } else if (db_today_app === "All_Consulting") {
    db_state = "History"; 
    db_today_app_st = "Consulting";
  } else if (db_today_app === "All_Class") {
    db_state = "History"; 
    db_today_app_st = "Class";
  } else if (db_today_app === "Consulting" || db_today_app === "Class") {
    db_state = "Todays";
    db_today_app_st = db_today_app;
  }

  const { user, accessMenu } = useAuth();
  const user_id = user?.userId;
  const user_typecode = user?.user_typecode;

  const [selected, setSelected] = useState(db_today_app_st || 'Consulting');
  const [mainstep, setMainstep] = useState(db_state || 'Todays');
  const config = configModule.config();
  const vaithyarData = selected === "Class" ? classdata : consultDataList;
  const [buttonPermissions, setButtonPermissions] = useState({});

  // Load button permissions for Appointments page
  useEffect(() => {
    if (user && Array.isArray(accessMenu)) {
      const found = accessMenu.find(m => m.path === pathname);
      if (found) {
        setButtonPermissions({
          search: found.search_btn === 1,
          add: found.add_btn === 1,
          schedule: found.schedule_btn === 1,
        });
      } else {
        setButtonPermissions({});
      }
    } else {
      setButtonPermissions({});
    }
  }, [user, accessMenu, pathname]);

  const getAppointmentData = async () => {
    setNeedLoading(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}getAppointmentData`, {
        user_typecode: user_typecode || "",
        user_id: user_id
      });

      const result = response.data;
      if (response.status === 200) {
        setClassdata(result.data);
        setConsultDataList(result.ConsultData);
        setCatagory(result.resultCat);
      } else {
        toast.error("Failed to fetch client data details: " + result.message);
        console.error("Failed to fetch client data details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching user acivity details: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAppointmentData();
    }
  }, [user]);

  function parsePreferredDate(preferredDate) {
    if (!preferredDate) return null;

    if (preferredDate.includes('/')) {
      const [datePart, timePart = '00:00:00'] = preferredDate.split(' ');
      const [day, month, year] = datePart.split('/');
      return new Date(`${year}-${month}-${day}T${timePart}`);
    }

    return new Date(preferredDate);
  }


  const today = new Date();
  today.setHours(0, 0, 0, 0);

const filteredData = vaithyarData.filter(item => {
  const date = parsePreferredDate(item.preferred_date);
  if (!date || isNaN(date.getTime())) {
    return mainstep === "History";
  }

  date.setHours(0, 0, 0, 0);
   if (item.comment_submmited === 1) {
      return mainstep === "History";
    }

  if (mainstep === "Todays") {
    return date.getTime() === today.getTime();
  } else if (mainstep === "Upcoming") {
    return date.getTime() > today.getTime();
  } else if (mainstep === "History") {
    return date.getTime() < today.getTime();
  }
  return true;
});



 const handleSubmitComment = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${config.apiBaseUrl}addComment`, {
          id: selectedItem?.id,
          comment: comment,
        });

        if (response.status === 200) {
          toast.success("Summary of Diagnosis submitted successfully!");
          setShowComment(false);
          setComment("");
          setTimeout(() => {
            navigate("/appointments/add-to-card", {
              state: {
                selectedData: selectedItem, 
                catagory: catagory,
              },
            });
          }, 1200);
        }
        
      } catch (error) {
        toast.error(
          "Failed to submit Summary of Diagnosis: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
    };


 const handleSaveClose = async () => {
      if (!comment || comment.trim() === "") {
        setShowComment(false);
        return;
      }

      setLoading(true);

      try {
        const response = await axios.post(`${config.apiBaseUrl}addComment`, {
          id: selectedItem?.id,
          comment: comment,
        });

        if (response.status === 200) {
          toast.success("Summary of Diagnosis saved successfully!");

          // Update local state with flag
          if (selected === "Class") {
            setClassdata((prevData) =>
              prevData.map((item) =>
                item.id === selectedItem?.id
                  ? { ...item, comment: comment, comment_submmited: 1 }
                  : item
              )
            );
          } else {
            setConsultDataList((prevData) =>
              prevData.map((item) =>
                item.id === selectedItem?.id
                  ? { ...item, comment: comment, comment_submmited: 1 }
                  : item
              )
            );
          }

          setShowComment(false);
          setComment("");
        }
      } catch (error) {
        toast.error(
          "Failed to save comment: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
    };


  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function formatToDDMMYY(dateStr) {
    const [year, month, day] = dateStr.split("-");
    const shortYear = year.slice(0);
    return `${day}/${month}/${shortYear}`;
  }

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
      <div className='appointment-main'>
        <div className='appointment-header-main'>
          <div className="col-lg-6 col-md-4 col-4 d-flex  align-items-center">
            <div className="header-product-pvt">
              <h6 className="mt-0 mb-0 product-header-text">Total Appointments : {(classdata?.length) + (consultDataList?.length)}</h6>
              <div className="checkbox-group-product mt-2 ">
                
                <label className="checkbox-item-product">
                  <input
                    type="checkbox"
                    name="product"
                    value="Consulting"
                    className="custom-checkbox"
                    checked={selected === 'Consulting'}
                    onChange={(e) => setSelected(e.target.value)}
                  />
                  <span className="box"> {selected === 'Consulting' && <span className="dot" />}</span> Consulting : {consultDataList?.length || 0}
                </label>
                <label className="checkbox-item-product ">
                  <input
                    type="checkbox"
                    name="product"
                    value="Class"
                    className="custom-checkbox"
                    checked={selected === 'Class'}
                    onChange={(e) => setSelected(e.target.value)}
                  />
                  <span className="box">{selected === 'Class' && <span className="dot" />}</span> Class : {classdata?.length || 0}
                </label>
              </div>
            </div>
          </div>
          <div className='col-lg-6 col-md-8 col-8 d-flex flex-wrap justify-content-end search-add-wrapper ' >
            {buttonPermissions.search && (
              <div className=''>
                <input type='search' className='appointmnet-search-input' placeholder='Search ' />
              </div>
            )}
            {buttonPermissions.add && (
              <div><button type='button' className='appointmnet-new-btn' onClick={() => navigate('/appointments/create-profile')} >Add</button></div>
            )}
            {buttonPermissions.schedule && (
              <div><button type='button' className='appointmnet-new-btn' onClick={() => navigate('/appointments/schedules')} >Schedules</button></div>
            )}
          </div>
        </div>
        <div className='appointment-header'>
          <button type="button" className={`ap-cbtns ${mainstep === "Todays" ? 'active' : ''}`} onClick={() => setMainstep("Todays")} > Todays </button>
          <button type="button" className={`ap-cbtns ${mainstep === "Upcoming" ? 'active' : ''}`} onClick={() => setMainstep("Upcoming")}> Upcoming </button>
          <button type="button" className={`ap-cbtns ${mainstep === "History" ? 'active' : ''}`} onClick={() => setMainstep("History")}> History</button>
        </div>
        <div className='appointment-main-container' >
          <div className='h-100 w-100'>
            <div className='appointment-table'>
              <div className='ap-table-header display-flex' style={{ minWidth: "1112px" }}>
                <div className={mainstep === "History" ? 'brcommon-col-st w-10' : 'brcommon-col-st w-15'}>S no </div> <span style={{ color: "#129347" }}> | </span>
                <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-15'}> Client ID</div> <span style={{ color: "#129347" }}> | </span>
                <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-15'}>Name</div> <span style={{ color: "#129347" }}> | </span>
                <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-10'}> Gender</div> <span style={{ color: "#129347" }}> | </span>
                <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-15'}> Mobile</div> <span style={{ color: "#129347" }}> | </span>
                <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-15'}>Date</div> <span style={{ color: "#129347" }}> | </span>
                <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-15'}>Time</div> <span style={{ color: "#129347" }}> | </span>
                {mainstep !== "History" && (                
                <div className={mainstep === "History" ? 'brcommon-col-st w-0' : 'brcommon-col-st w-10'}>Cart</div>
               )}
              </div>
              <div className='ap-body-row-st ' style={{ minWidth: "1112px" }} >
                {paginatedData.length > 0 ? paginatedData.map((item, index) => {
                  let preferredTimeDisplay = '';
                  if (selected === "Class") {
                    preferredTimeDisplay = item.preferred_time ? item.preferred_time : '';
                  } else {
                    preferredTimeDisplay = item?.preferred_time;
                  }
                  let preferredDateDisplay = '';
                  if (selected === "Class") {
                    preferredDateDisplay = item?.preferred_date ? item.preferred_date.split(" ")[0] : '';
                  } else {
                    preferredDateDisplay = item?.preferred_date ? formatToDDMMYY(item?.preferred_date) : '';
                  }

                  return (
                    <div key={item.id} className='display-flex br-rowst'>
                      <div className={mainstep === "History" ? 'brcommon-col-st w-10' : 'brcommon-col-st w-15'}>{(currentPage - 1) * itemsPerPage + index + 1}</div>
                      <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-15'}>{item.lead_id}</div>
                      <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-15'}>{item.lead_name}</div>
                      <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-10'}>{item.gender}</div>
                      <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-15'}>{item.mobile_number}</div>
                      <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-15'}>{preferredDateDisplay}</div>
                      <div className={mainstep === "History" ? 'brcommon-col-st w-15' : 'brcommon-col-st w-15'}>{preferredTimeDisplay}</div>
                       {mainstep !== "History" && (
                      <div className={mainstep === "History" ? 'brcommon-col-st w-0' : 'brcommon-col-st w-10'}>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowComment(true);
                          }}
                        >
                          <SvgContent svg_name="cart" />
                        </button>                    
                      </div>
                       )}
                    </div>
                  );
                })
                  : (
                    <div className='h-100 display-flex'>
                      No Appointments data
                    </div>
                  )}
              </div>
            </div>
            <div className='footer-tab-ap'>
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
                count={vaithyarData.length}
                page={currentPage}
                pageSize={itemsPerPage}
                onChange={(pageNo) => setCurrentPage(pageNo)}
              />
            </div>
          </div>
        </div>
      </div>

    {showComment && (
      <div className="reason-popup-overlay">
        <div className="reason-popup">
          <div className='d-flex justify-content-between align-items-center mb-2'           >
            <h6 className="fw-700 mb-0">Enter Diagnosis Description  </h6>
            <button
              className="fw-500"
              style={{
                fontSize: "22px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 0px",
              }}
              onClick={() => setShowComment(false)}
            >
              ×
            </button>
          </div>

          <textarea
            className="reason-textarea"
            rows="5"
            maxLength={150}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type Client Diagnosis Description (max 150 characters)..."
          />

          <div
            className="text-end mt-1"
            style={{ fontSize: "12px", color: "#666" }}
          >
            {comment.length}/150
          </div>

          <div className="d-flex gap-2 mt-3 justify-content-end">
            <button
              className="apreason-cancel-btn"
              onClick={() => {
                handleSaveClose();
                setShowComment(false);
              }}
                disabled={
                loading || comment.trim().length === 0
              }
            >
              Save & Close
            </button>
            <button
              className="apreason-submit-btn"
              onClick={handleSubmitComment}
              disabled={
                loading || comment.trim().length === 0
              }
            >
              {loading ? "Submitting..." : "Save & Proceed"}
            </button>
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
  )
}

export default Appointments
