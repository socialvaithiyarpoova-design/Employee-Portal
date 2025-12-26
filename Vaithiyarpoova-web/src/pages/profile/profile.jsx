import React, { useState, useEffect } from "react";
import "./profile.css";
import Logoutmodal from "../../components/logoutmodal";
import { useAuth } from "../../components/context/Authcontext.jsx";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import configModule from "../../../config.js";
import CommonSelect from "../../components/common-select.jsx";
import DatePicker from 'react-datepicker';
import { format } from "date-fns";

function Profile() {
  const { user } = useAuth();
  const userId = user?.userId;
  const creat_by = user?.created_by;
  const userTypeCode = user?.user_typecode;
  const hidePerformanceFor = ['CS', 'AC', 'DIS'];
  const shouldShowPerformance = !hidePerformanceFor.includes(userTypeCode);
  const [isShowAlertpopup, setIsShowAlertpopup] = useState(false);
   const [mainstep, setMainstep] = useState(() => {
    return shouldShowPerformance ? 1 : 2;
  });
  const [step, setStep] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [userData, setUserData] = useState(null);
  const [ltype, setLtype] = useState(null);
  const [duration, setDuration] = useState(null);
  const [status, setStatus] = useState(null);
  const config = configModule.config();
  const [achievementsData, setAchievementsData] = useState([]);
  const [incentiveData, setIncentiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const visibleItems = showAll ? achievementsData : achievementsData.slice(0, 2);



  const [leaveForm, setLeaveForm] = useState({
    from_date: '',
    to_date: '',
    reason: '',
  });

  const [permissionForm, setPermissionForm] = useState({
    from_time: null,
    to_time: null,
  });

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (e) => {
    const { name, value } = e.target;
    setPermissionForm(prev => ({ ...prev, [name]: value }));
  };

  const typeleave = [
    { label: 'CL - Casual Leave', value: 'Casual Leave' },
    { label: 'SL - Sick Leave', value: 'Sick Leave' },
    { label: 'LOP - Other', value: 'LOP-Other' },
  ];

  const leaveDuration = [
    { label: 'Full Day', value: 'Full Day' },
    { label: 'Half Day (Morning)', value: '1-half-morning' },
    { label: 'Half Day (Evening)', value: '1-half-evening' },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.post(`${config.apiBaseUrl}getSingleUserData/${userId}`);
        const userDataResponse = response.data.data;
        setUserData(userDataResponse);
    
        if (userDataResponse?.designation) {
          fetchProfileData(userDataResponse.designation);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]); // Only depends on userId

  const fetchProfileData = async (designation) => {
    if (!userId || !designation) return;
    
    setLoading(true);
    try {

      
      // Map designation to user type code based on usertype table
      const designationToUserTypeMap = {
        'Telecalling sales': 'TSL',
        'Telecalling class': 'TCL',
        'Branch head': 'BH',
        'Field Sales': 'FS',
        'Front office incharge': 'FOI',
        'Vaithiyar': 'VA',
        'Admin': 'AD',
        'Creative Services': 'CS',
        'Accountant': 'AC',
        'Distributor': 'DIS'
      };
      
      
      // Try exact match first, then try trimmed match
      let userTypeCode = designationToUserTypeMap[designation];
      
      if (!userTypeCode && designation) {
        // Try with trimmed designation (remove extra whitespace)
        const trimmedDesignation = designation.trim();
        userTypeCode = designationToUserTypeMap[trimmedDesignation];
      }
      
      if (userTypeCode) {
    
        const profileResponse = await axios.post(`${config.apiBaseUrl}getProfileData`, {
          user_id: userId,
          user_typecode: userTypeCode
        });
        
        const { incentive, achievements} = profileResponse.data.data;
        
        setIncentiveData(incentive);
        
                 // Format achievements data to match UI expectations
         const formattedAchievements = achievements.map(item => ({
           amount: `₹ ${parseFloat(item.amount || 0).toLocaleString()}`,
           month: item.month,
           top_performer_name: item.top_performer_name || 'Star performer',
           top_performer_emp_id: item.top_performer_emp_id || ''
         }));
        setAchievementsData(formattedAchievements);
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      toast.error('Failed to fetch profile performance data');
    } finally {
      setLoading(false);
    }
  };


const handleSubmit = async () => {
    if (step === 1) {
      try {
        const payload = {
          ...leaveForm,
          leave_type: ltype,
          duration: duration,
          created_by: creat_by,
          user_id:  userId,
          action: "Leave"
        };
       const response = await axios.post(`${config.apiBaseUrl}insertLeave`, payload);
        const responseData = response?.data?.data;
        toast.success("Leave submitted successfully!");
        resetLeaveForm();
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
        }).catch(err => console.error("Graph update failed:", err));
      }
      } catch (err) {
        console.error(err);
        toast.error("Failed to submit leave.");
      }
    } else if (step === 2) {
      if (!permissionForm.from_time || !permissionForm.to_time) {
        toast.error("Please select both from and to time");
        return;
      }

      if (!permissionForm.reason || permissionForm.reason.trim() === '') {
        toast.error("Please enter a reason for permission");
        return;
      }
      const formattedFrom = format(permissionForm.from_time, "HH:mm");
      const formattedTo = format(permissionForm.to_time, "HH:mm");
      if (userData?.start_work_time && userData?.end_work_time) {
        const startWork = userData.start_work_time.slice(0, 5); 
        const endWork = userData.end_work_time.slice(0, 5); 

        if (formattedFrom < startWork || formattedFrom > endWork) {
          toast.error(`From time must be between ${startWork} and ${endWork}`);
          return;
        }

        if (formattedTo < startWork || formattedTo > endWork) {
          toast.error(`To time must be between ${startWork} and ${endWork}`);
          return;
        }
      }

      // Validate from time is before to time
      if (formattedFrom >= formattedTo) {
        toast.error("From time must be before To time");
        return;
      }

      try {
        const payload = {
          from_time: formattedFrom,
          to_time: formattedTo,
          reason: permissionForm.reason,
          created_by:creat_by,
          user_id:  userId,
          action: "Permission"
        };
        const response = await axios.post(`${config.apiBaseUrl}insertPermission`, payload);
        const responseData = response?.data?.data;
        toast.success("Permission request sent!");
        resetPermissionForm();
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
        }).catch(err => console.error("Graph update failed:", err));
      }
      } catch (err) {
        console.error(err);
        toast.error("Failed to submit permission.");
      }
    }
  };

  const resetLeaveForm = () => {
    setLeaveForm({ from_date: '', to_date: '', reason: '' });
    setLtype(null);
    setDuration(null);
  };

  const resetPermissionForm = () => {
    setPermissionForm({ from_time: '', to_time: '', reason: '' });
  };



  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.post(`${config.apiBaseUrl}getstatus/${userId}`);
        setStatus(response.data.data);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    };
    if (userId && step === 3) {
      fetchStatus();
    }
  }, [userId, step]);


  const statusClassMap = {
    "Approved": "status-label-available",
    "Pending": "status-label-low-stock",
    "Declined": "status-label-not-available"
  };

  const formatDateToYYYYMMDD = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};



  return (
    <div className="common-body-st">
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
      {isShowAlertpopup && (
        <Logoutmodal oncloses={() => setIsShowAlertpopup(false)} />
      )}
      <div className="body-container-profile">
        <div className="header-profile-el">
          {shouldShowPerformance && (
          <button type="button" className={`profile-cbtns ${mainstep === 1 ? 'active' : ''}`} onClick={() => setMainstep(1)} >  Performance </button>
          )}
          <button type="button" className={`profile-cbtns ${mainstep === 2 ? 'active' : ''}`} onClick={() => setMainstep(2)}> Request </button>
          <button type="button" className="profile-cbtns-logout" onClick={() => setIsShowAlertpopup(true)}> Logout</button>
        </div>
        <div className="body-profile-el">
          <div className="row h-100">
            <div className="col-12 col-md-5 col-lg-5 h-100">
              <div className="profile-card-view">
                <div className="p-4 ">
                  <img
                    src={userData?.image_url || null}
                    alt="Employee"
                    className="profile-img-up"
                  />

                </div>
                <div className="profile-details-view">
                  <div className="d-flex mt-3">
                    <div className="col-5 text-white">Emp ID</div>
                    <div className="col-7 text-white">: {userData?.emp_id}</div>
                  </div>
                  <div className="d-flex  mt-3">
                    <div className="col-5 text-white">Name</div>
                    <div className="col-7 text-white">: {userData?.name}</div>
                  </div>
                  <div className="d-flex  mt-3">
                    <div className="col-5 text-white">Branch Head</div>
                    <div className="col-7 text-white">: {userData?.branch_in_charge}</div>
                  </div>
                  <div className="d-flex  mt-3">
                    <div className="col-5 text-white">Branch Id</div>
                    <div className="col-7 text-white">: {userData?.branch_id}</div>
                  </div>
                  <div className="d-flex  mt-3">
                    <div className="col-5 text-white">Branch Name</div>
                    <div className="col-7 text-white">: {userData?.branch_name}</div>
                  </div>
                  <div className="d-flex  mt-3">
                    <div className="col-5 text-white">Designation</div>
                    <div className="col-7 text-white">: {userData?.designation}</div>
                  </div>
                  <div className="d-flex  mt-3">
                    <div className="col-5 text-white">Mobile</div>
                    <div className="col-7 text-white">: {userData?.mobile_number}</div>
                  </div>
                  <div className="d-flex  mt-3">
                    <div className="col-5 text-white">Email</div>
                    <div className="col-7 text-white">
                      : {userData?.email}
                    </div>
                  </div>
                  <div className="d-flex  mt-3">
                    <div className="col-5 text-white">Date of joining</div>
                    <div className="col-7 text-white">: {new Date(userData?.date_of_joining).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-7 col-lg-7  h-100">
              <div className="profile-card-pase">
                {mainstep === 1 && (
                  <div className="h-100">
                    <div className="profile-main-pase-body">
                      {loading && (
                        <div className="text-center py-8">
                          <div className="perfomace-profile-subtxt">Loading performance data...</div>
                        </div>
                      )}
                      {!loading && (
                        <>
                          <section>
                            <h5 className="perfomace-profile-txt mb-3">Incentive earned</h5>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 common-col-st p-6">
                          <div className="flex-1 text-center">
                            <h5 className="text-2xl font-semibold">
                              {loading ? 'Loading...' : `₹ ${incentiveData?.monthly_incentive?.toLocaleString() || '0'}`}
                            </h5>
                            <div className="perfomace-profile-subtxt mt-1">Monthly incentive earned</div>
                          </div>
                          <div className="flex-1 text-center">
                            <h5 className="text-2xl font-semibold">
                              {loading ? 'Loading...' : `₹ ${incentiveData?.total_incentive?.toLocaleString() || '0'}`}
                            </h5>
                            <div className="perfomace-profile-subtxt mt-1">Total incentive earned</div>
                          </div>
                        </div>
                      </section>
                      <section>
                        <h5 className="perfomace-profile-txt mb-3">Milestone</h5>
                        <div className="flex justify-between items-center common-col-st p-6 text-center">
                          <div className="flex-1">
                            <h5 className="text-2xl font-semibold">
                              {loading ? 'Loading...' : `₹ ${incentiveData?.current_milestone?.toLocaleString() || '0'}`}
                            </h5>
                            <div className="perfomace-profile-subtxt mt-1">Current milestone</div>
                          </div>
                          <div className="h-10 w-px bg-gray-300 mx-6"></div>
                          <div className="flex-1">
                            <h5 className="text-2xl font-semibold">
                              {loading ? 'Loading...' : `₹ ${incentiveData?.monthly_target?.toLocaleString() || '0'}`}
                            </h5>
                            <div className="perfomace-profile-subtxt mt-1">Monthly target</div>
                          </div>
                        </div>
                      </section>

                       <section>
                         <div className="d-flex justify-content-between align-items-center mb-3">
                           <h5 className="perfomace-profile-txt mb-0">Achievements</h5>
                         </div>
                         
                         <div className="flex justify-between items-center common-col-st p-6 text-center ">
                            {loading ? (
                              <div className="w-full text-center">
                                <div className="perfomace-profile-subtxt">Loading achievements...</div>
                              </div>
                            ) : visibleItems.length > 0 ? (
                              visibleItems.map((item, index) => (
                                <div
                                  key={item.month}
                                  className="text-center min-w-[160px] flex-shrink-0 col-4"
                                >
                                                                     <div className="perfomace-profile-subtxt text-sm">{item.top_performer_name}</div>
                                  <h5 className="text-2xl font-semibold mt-1">{item.amount}</h5>
                                  <div className="perfomace-profile-subtxt text-sm mt-1">{item.month}</div>
                                </div>
                              ))
                            ) : (
                              <div className="w-full text-center">
                                <div className="perfomace-profile-subtxt">No achievements data available</div>
                              </div>
                            )}

                           {!showAll && visibleItems.length > 2 && (
                             <button
                               className="cursor-pointer fw-500 color-default"
                               onClick={() => setShowAll(true)}
                             >
                               View all
                             </button>
                           )}
                         </div>
                         
                                                   {/* Refresh button in right bottom corner */}
                          <div className="d-flex justify-content-end mt-3">
                            <button 
                              className="vp-btn"
                              onClick={() => fetchProfileData(userData?.designation)}
                              disabled={loading}
                            >
                              {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                          </div>
                       </section>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {mainstep === 2 && (
                  <>
                    <div className="profile-card-pase-head">
                      <div className="tab-group-profile">
                        <button className={`tab-switch-profile ${step === 1 ? 'active' : ''}`} onClick={() => setStep(1)}>Leave</button>
                        <button className={`tab-switch-profile ${step === 2 ? 'active' : ''}`} onClick={() => setStep(2)}>Permission</button>
                        <button className={`tab-switch-profile ${step === 3 ? 'active' : ''}`} onClick={() => setStep(3)}>Status</button>
                      </div>
                    </div>
                    <div className="profile-card-pase-body pt-4">
                      {step === 1 && (
                        <>
                          <div className="row">
                            <div className="col-6">
                              <label htmlFor="date" className="fw-500">From</label>
                               <DatePicker
                                selected={leaveForm.from_date ? new Date(leaveForm.from_date) : null}
                                minDate={new Date()}
                                 onChange={(date) =>
                                    setLeaveForm(prev => ({
                                      ...prev,
                                      from_date: formatDateToYYYYMMDD(date)
                                    }))
                                  }

                                  className="profile-form-controle mt-2"
                                  placeholderText="Select from date"
                                  dateFormat="yyyy-MM-dd"
                                />
                            </div>
                            <div className="col-6">
                              <label htmlFor="date" className="fw-500">To</label>
                               <DatePicker
                                selected={leaveForm.to_date ? new Date(leaveForm.to_date) : null}
                                minDate={new Date()}
                                onChange={(date) =>
                                    setLeaveForm(prev => ({
                                      ...prev,
                                      to_date: formatDateToYYYYMMDD(date)
                                    }))
                                  }

                                className="profile-form-controle mt-2"
                                placeholderText="Select to date"
                                dateFormat="yyyy-MM-dd"
                              />
                              </div>
                          </div>
                          <div className="row mt-4">
                            <div className="col-6">
                              <label htmlFor="ltype" className="fw-500 mb-2">Type</label>
                              <CommonSelect
                                name="ltype"
                                options={typeleave}
                                placeholder="Select leave  type"
                                value={ltype}
                                onChange={(e) => setLtype(e.target.value)} />
                            </div>
                            <div className="col-6">
                              <label htmlFor="duration" className="fw-500 mb-2">Duration</label>
                              <CommonSelect
                                name="duration"
                                options={leaveDuration}
                                placeholder="Select leave duration"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)} />
                            </div>
                          </div>
                          <div className="row mt-4">
                            <div className="col-12">
                              <label htmlFor="reason" className="fw-500">Reason</label>
                              <textarea
                                className="profile-form-controle mt-2"
                                rows="5"
                                name="reason"
                                value={leaveForm.reason}
                                onChange={handleLeaveChange}
                                placeholder="Enter your reason "
                                style={{ resize: 'none' }}
                                required
                              />
                            </div>
                          </div>
                        </>
                      )}
                      {step === 2 && (
                        <div className="row">
                          <div className="col-6">
                            <label htmlFor="time" className="fw-500">From</label>
                             <DatePicker
                                    selected={permissionForm.from_time}
                                    onChange={(time) =>
                                      setPermissionForm(prev => ({ ...prev, from_time: time }))
                                    }
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={15}
                                    timeCaption="Time"
                                    dateFormat="HH:mm"
                                    className="profile-form-controle mt-2"
                                    placeholderText="Select time"
                                    minTime={new Date()}
                                    maxTime={new Date(new Date().setHours(23, 59, 59))}
                                  />
                          </div>
                          <div className="col-6">
                            <label htmlFor="time" className="fw-500 ">To</label>
                              <DatePicker
                              selected={permissionForm.to_time}
                              onChange={(time) =>
                                setPermissionForm(prev => ({ ...prev, to_time: time }))
                              }
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={15}
                              timeCaption="Time"
                              dateFormat="HH:mm"
                              className="profile-form-controle mt-2"
                              placeholderText="Select time"
                              minTime={permissionForm.from_time || new Date()}
                              maxTime={new Date(new Date().setHours(23, 59, 59))}
                            />
                          </div>
                          <div className="col-12 mt-4">
                            <label htmlFor="type_leave" className="fw-500">Reason</label>
                            <textarea
                              className="profile-form-controle mt-2"
                              rows="5"
                              name="reason"
                              onChange={handlePermissionChange}
                              value={permissionForm.reason}
                              placeholder="Enter your Reason "
                              style={{ resize: 'none', backgroundColor: "#ffffff" }}
                              required
                            />
                          </div>
                        </div>
                      )}

                      {step === 3 && (
                        <div className='h-100 w-100  pb-0'>
                          <div className='table-common-profile-st'>
                            <div className='tb-header-row-profile-st display-flex'>
                              <div className='brcommon-col-profile-st w-12'>
                                S.No
                              </div> <span style={{ color: "#129347" }}> | </span>
                              <div className='brcommon-col-profile-st w-22'>
                                Date
                              </div> <span style={{ color: "#129347" }}> | </span>
                              <div className='brcommon-col-profile-st w-22'>
                                Request
                              </div> <span style={{ color: "#129347" }}> | </span>
                              <div className='brcommon-col-profile-st w-22'>
                                Duration
                              </div> <span style={{ color: "#129347" }}> | </span>
                              <div className='brcommon-col-profile-st w-22'>
                                Status
                              </div>
                            </div>
                            <div className='tb-body-row-profile-st'>
                              {status && status.length > 0 ? (
                                status.map((item, index) => (
                                  <div key={item} className='display-flex br-rowst'>
                                    <div className='brcommon-col-profile-st w-12'>{index + 1}</div>
                                    <div className='brcommon-col-profile-st w-22'>{new Date(item.created_at).toISOString().slice(0, 10)}</div>
                                    <div className='brcommon-col-profile-st w-22'>{item.leave_type}</div>
                                    <div className='brcommon-col-profile-st w-22'>{item.duration}</div>
                                    <div className='brcommon-col-profile-st w-22'><span className={statusClassMap[item.user_status] || ""}>{item.user_status}</span></div>
                                  </div>
                                ))
                              ) : (
                                <div className='no-satus-found '>
                                  <div className=' w-100 h100  text-center '>
                                    No status found
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {(step === 1 || step === 2) && (
                    <div className="profile-card-pase-footer">
                      <div className="d-flex justify-content-end gap-3   pt-3" >
                        <button type="button" className="product-cancel-button" onClick={() => { step === 1 ? resetLeaveForm() : resetPermissionForm(); }} >Clear</button>
                        <button type="button" className="product-next-btn" onClick={handleSubmit} >Save</button>
                      </div>
                    </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
