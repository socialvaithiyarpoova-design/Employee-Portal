import React, { useState, useEffect, useRef } from 'react';
import '../../assets/styles/calendar.css';
import CommonSelect from "../../components/common-select.jsx";
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import configModule from '../../../config.js';
import axios from "axios";
import crack from '../../assets/images/crack.png';
import { PropagateLoader } from 'react-spinners';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarWithHolidayMarker = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [officeBrkTime, setOfficeBrkTime] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const holiday = "Holiday";
  const events = "Events";
  const [btnData, setBtnData] = useState(holiday);
  const [btnDivision, setBtnDivision] = useState(events);
  const [type, setType] = useState("");
  const [remark, setRemark] = useState("");
  const [target, setTarget] = useState("");
  const [permissionType, setPermissionType] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [openEventPopup, setOpenEventPopup] = useState(null);
  const [empList, setEmpList] = useState('');

  const { user, accessMenu } = useAuth();
  const location = useLocation();
  const pathname = location?.pathname;
  const userId = user?.userId;
  const config = configModule.config();
  const [needLoading, setNeedLoading] = useState(false);
  const [buttonPermissions, setButtonPermissions] = useState({});
  const foundMenu = Array.isArray(accessMenu) ? accessMenu.find(item => item.path === pathname && item.user_id === userId) : null;

 const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];


const [values, setValues] = useState({
  amStart: null,
  amEnd: null,
  lunchStart: null,
  lunchEnd: null,
  pmStart: null,
  pmEnd: null,
});

  const handleChange = (key, newValue) => {
    setValues((prev) => ({ ...prev, [key]: newValue }));
  };

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];

    const startDay = date.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  const handleYearSelect = (year) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearSelector(false);
  };

  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setShowMonthSelector(false);
  };

  const isSameDay = (d1, d2) =>
    d1 && d2 &&
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  const daysArray = getDaysInMonth(year, currentDate.getMonth());

  const startYear = year - 3;
  const yearRange = Array.from({ length: 7 }, (_, i) => startYear + i);

  const TypeHolidayOptions = [
    { label: "Government holiday", value: "Government holiday" },
    { label: "Religious holiday", value: "Religious holiday" },
    { label: "Company leave", value: "Company leave" },
    { label: "Week off", value: "Week off" }
  ];

 

  const changeMethodEvent = () => {
     const newDivision = btnDivision === "Holiday" ? events : holiday;
  const newData = btnData === "Holiday" ? events : holiday;

  setBtnDivision(newDivision);
  setBtnData(newData);

  setType("");
  setRemark("");
  setTarget("");
  setEmpList("");
  };

  const permissionHour = [
    { label: "1 HOUR", value: "1 HOUR" },
    { label: "2 HOUR", value: "2 HOUR" },
    { label: "3 HOUR", value: "3 HOUR" },
    { label: "4 HOUR", value: "4 HOUR" },
    { label: "5 HOUR", value: "5 HOUR" }
  ];

  useEffect(() => {
    if (foundMenu) {
      setButtonPermissions({
        event: foundMenu.event_btn === 1,
        break: foundMenu.break_btn === 1,
        permission: foundMenu.permission_btn === 1,
        update: foundMenu.update_btn === 1,
      });
    } else {
      setButtonPermissions({});
    }
  }, [foundMenu]);



  const getEventDetails = async () => {
    setNeedLoading(true);

    try {
      const response = await axios.get(`${config.apiBaseUrl}getEventDetails`);

      const result = response.data;
      if (response.status === 200) {
        setEventData(result.data);
      } else {
        toast.error("Failed to fetch details: " + result.message);
        console.error("Failed to fetch details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching details: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    getEventDetails();
    getBreakSchedule();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const formData = {
      date: dayjs(selectedDate).hour(dayjs().hour()).minute(dayjs().minute()).second(dayjs().second()).format("YYYY-MM-DD HH:mm:ss"),
      type: type?.target?.value || 0,
      remark,
      target,
      action: btnData.toLowerCase() || '',
      user_id: userId || -1,
      emp_id: empList?.target?.id
    };

  

    try {
      const res = await axios.post(`${config.apiBaseUrl}saveEventDetails`, formData);
      if (res?.status === 200) {
        const responseData = res.data?.data;
        toast.success("Event created successfully!");
        if (responseData) {
          fetch(`${config.apiBaseUrlpy}graph_update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tablename: responseData.table_name,
              type: responseData.method,
              id: responseData.id,
              column_name: responseData.id_column_name,
            }),
          }).catch((err) => console.error("Graph update failed:", err));
        }

        // Reset form
        setType("");
        setTarget("");
        setRemark("");
        setSelectedDate(new Date());
      } else {
        toast.error(res.data.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Something went wrong while saving event");
    }finally {
    setSubmitLoading(false);
  }
  };

// ✅ Add this function to fetch break schedule data
const getBreakSchedule = async () => {
  try {
    const response = await axios.get(`${config.apiBaseUrl}getbreak`, {
      params: { user_id: userId }
    });
    
    if (response.status === 200 && response.data?.data) {
      const data = response.data.data;

      setValues({
        amStart: data.am_break_start ? parseTimeToDate(data.am_break_start) : null,
        amEnd: data.am_break_end ? parseTimeToDate(data.am_break_end) : null,
        lunchStart: data.lunch_start ? parseTimeToDate(data.lunch_start) : null,
        lunchEnd: data.lunch_end ? parseTimeToDate(data.lunch_end) : null,
        pmStart: data.pm_break_start ? parseTimeToDate(data.pm_break_start) : null,
        pmEnd: data.pm_break_end ? parseTimeToDate(data.pm_break_end) : null,
      });
    }
  } catch (error) {
    console.error("Error fetching break schedule:", error);
    toast.error("Failed to fetch break schedule");
  }
};

useEffect(() => {
  if (officeBrkTime === "Break") {
    getBreakSchedule();
  }
}, [officeBrkTime]);
const parseTimeToDate = (timeString) => {
  if (!timeString) return null;
  
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds || 0, 0);
  return date;
};



 const formatTimeForAPI = (date) => {
  if (!date) return null; // ✅ This handles null values
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};
  const handleBreakSave = async (type) => {
    setSaveLoading(true);
    try {

      let payload = {};
      let apiName = '';

      if (type === "Break") {
        payload = {
           am_break_start: formatTimeForAPI(values.amStart),
          am_break_end: formatTimeForAPI(values.amEnd),
          lunch_start: formatTimeForAPI(values.lunchStart),
          lunch_end: formatTimeForAPI(values.lunchEnd),
          pm_break_start: formatTimeForAPI(values.pmStart),
          pm_break_end: formatTimeForAPI(values.pmEnd),
          created_by: user?.userId,
        };
        apiName = "saveBrakeSchedule";
      } else {
        payload = {
          permission: permissionType?.target?.value || '',
          created_by: user?.userId
        };
        apiName = "savePermission";
      }
      const res = await axios.post(`${config.apiBaseUrl}${apiName}`, payload);
      const responseData = res?.data?.data;
      if (res.status === 200) {
        toast.success(res?.data?.message || "Saved successfully!");
        if (responseData?.table_name && responseData?.method && responseData?.id && responseData?.id_column_name) {
          fetch(`${config.apiBaseUrlpy}graph_update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tablename: responseData.table_name,
              type: responseData.method,
              id: responseData.id,
              column_name: responseData.id_column_name,
            }),
          }).catch((err) => console.error("Graph update failed:", err));
        }
      } else {
        toast.error(res?.data?.message || "Failed to save schedule");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving break schedule");
    }  finally {
    setSaveLoading(false);
    setOfficeBrkTime(null);
  }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (officeBrkTime) return setOfficeBrkTime(false);
      }
    };
    if (officeBrkTime) {
      window.addEventListener('keydown', handleEsc);
      window.addEventListener('keyup', handleEsc);
      return () => {
        window.removeEventListener('keydown', handleEsc);
        window.removeEventListener('keyup', handleEsc);
      };
    }
  }, [officeBrkTime]);

  const getEventForDate = (date) => {
    if (!date || eventData.length === 0) return [];
    return eventData.filter(ev =>
      new Date(ev.event_date).toDateString() === date.toDateString()
    );
  };
 


  return (
    <div className="common-body-st p-4">
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

      <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
        <div className='d-flex align-items-center note-border-st '>
          <h6 className='mb-0 fw-semibold' style={{ color: "#f69d0d" }}>NOTE: &nbsp;</h6>
          <h6 className='mb-0' style={{ color: "#f69d0d" }}> Double click to view Events.</h6>
        </div>

        <div className="d-flex justify-content-end gap-2">
          {buttonPermissions.event && (
            <button className="btn-events btn-top-up" onClick={changeMethodEvent} >{btnDivision}</button>
          )}
          {buttonPermissions.permission && (
            <button className="btn-events btn-top-up" onClick={() => setOfficeBrkTime("Permission")}>Permission</button>
          )}
          {buttonPermissions.break && (
            <button className="btn-events btn-top-up" onClick={() => setOfficeBrkTime("Break")}>Break</button>
          )}
        </div>
      </div>

      <div className="main-calc-st">
        {/* Calendar Section */}
        <div
          className={`${buttonPermissions.event ? "col-md-6" : "col-12"} border-end p-0  bg-col-st`} >
          <div className="calendar-wrapper w-100 h-100" >
            <div className="calendar-hook"></div>
            <img src={crack} alt="crack" className="calendar-hook image-hook" />
            <div className="swing-group">
              <div className="calendar-hook display-flex innerhook-st">
                <div className='hookpin-st'>
                </div>
                <div className='hookpin-st-rgt' >
                </div>
              </div>
              <div className="calendar-thread"></div>
              <div className="calendar-content" style={buttonPermissions.event ? {} : { width: "82%", height: "100%" }}>
                <div className='w-100 calendar-bgst h-100' >
                  <div className="calc-header-st d-flex justify-content-between align-items-center px-3 py-2 mb-3 border-bottom calc-header-st" style={{ borderRadius: "8px 8px 0px 0px" }}>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMonthSelector(!showMonthSelector)}
                        className="fw-bold cursor-pointer bg-transparent border-0 p-0 color-white"
                      >
                        {monthName}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowYearSelector(!showYearSelector)}
                        className="fw-bold cursor-pointer bg-transparent border-0 p-0 color-white"
                      >
                        {year}
                      </button>

                    </div>
                    <div>
                      <button
                        type="button"
                        className="me-3 cursor-pointer bg-transparent border-0 p-0 color-white"
                        onClick={() => changeMonth(-1)}
                        aria-label="Previous Month"
                      >
                        &#x25C0;
                      </button>

                      <button
                        type="button"
                        className="cursor-pointer bg-transparent border-0 p-0 color-white"
                        onClick={() => changeMonth(1)}
                        aria-label="Next Month"
                      >
                        &#x25B6;
                      </button>

                    </div>
                  </div>

                  {/* Month Dropdown */}
                  {showMonthSelector && (
                    <div
                      className="month-dropdown border rounded shadow p-2 bg-white position-absolute z-3"
                      style={{ top: '70px', left: '30px', width: '200px' }}
                    >
                      <div
                        className="d-grid"
                        style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}
                      >
                        {monthNames.map((month, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleMonthSelect(idx)}
                            className={`py-1 px-2 rounded text-center ${idx === currentDate.getMonth() ? 'bg-primary-vp text-white' : ''}`}
                            style={{ cursor: 'pointer' }}
                          >
                            {month.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Year Dropdown */}
                  {showYearSelector && (
                    <div
                      className="year-dropdown border rounded shadow p-2 bg-white position-absolute z-3"
                      style={{ top: '70px', left: '100px' }}
                    >
                      {yearRange.map((yr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleYearSelect(yr)}
                          className={`py-1 px-2 rounded text-start w-100 ${yr === year ? 'bg-primary-vp text-white' : 'text-dark'}`}
                          style={{ cursor: 'pointer' }}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Weekdays */}
                  <div className="d-grid calendar-grid text-center mb-2">
                    {days.map((day, idx) => (
                      <div key={idx} className="fw-semibold text-muted">{day}</div>
                    ))}
                  </div>

                  {/* Dates */}
                  <div className="d-grid calendar-grid text-center" style={buttonPermissions.event ? {} : { height: "72%" }}>
                    {daysArray.map((date, idx) => {
                      const isToday = date && isSameDay(date, new Date());
                      const isSelected = date && isSameDay(date, selectedDate);
                      const eventsForDate = getEventForDate(date); // <-- FIX: scoped here

                      return (
                        <button
                          key={idx}
                          disabled={!date}
                          className={`btn btn-sm calendar-day m-1 
                                        ${isToday ? 'border border-primary text-primary-st fw-bold' : ''}
                                        ${isSelected ? 'bg-primary-vp text-white fw-bold' : ''}
                                        ${eventsForDate.length > 0 ? 'bg-active-ev position-relative' : ''}
                                        ${!date ? 'bg-transparent-st text-white fw-bold' : ''}
                                    `}
                          onClick={() => {
                            if (date) {
                              setSelectedDate(new Date(date));
                            }
                          }}
                          onDoubleClick={() => {
                            if (date && eventsForDate.length > 0) {
                              setOpenEventPopup(eventsForDate);
                            }
                          }}
                          title={
                            eventsForDate.length > 0
                              ? eventsForDate
                                .map(ev => `Type: ${ev.type}\nReason: ${ev.remark}\nTarget: ${ev.target}`)
                                .join("\n\n")
                              : ''
                          }
                        >
                          {date ? date.getDate() : ''}
                          {eventsForDate.length > 0 && <div className='dot-selectev-st'></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Holiday Form */}
        {buttonPermissions.event && (
          <div className="col-md-6 h-100 bg-white" style={{borderRadius:"8px"}}>
            <div className='evente-header'>
            <h5 className="mb-4">{btnData} Marker</h5>
            </div>
            <div className='evente-body'>
            <form >
              <div className="mb-3">
                <label className="form-label">Date</label>
                <input
                  type="text"
                  className="form-control"
                  readOnly
                  value={selectedDate.toLocaleDateString('en-GB')}
                />
              </div>
           {btnData === "Holiday" && (
              <div className="mb-3">
                <label className="form-label">Type</label>

                <div className="comm-select-ba w-100">
                  <CommonSelect
                    header="Select type"
                    placeholder="Select type"
                    name="type"
                    value={type}
                    onChange={setType}
                    options={btnData === "Holiday" ? TypeHolidayOptions : []}
                  />
                </div>
              </div>
            )}

            
          {btnData === "Holiday" && (
              <div className="mb-3">
                <label className="form-label">Remark</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder='Enter your Holiday remark'
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>
          )}

             {btnData === "Events" && (
              <>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder='Enter your event remark'
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>

               <div className="mb-4">
                  <label className="form-label">Discription</label>
                  <input type="text" placeholder='Enter your event discription' className="form-control" value={target}
                    onChange={(e) => setTarget(e.target.value)} />
                </div>
                </>
          )}

                  {btnData === "Holiday" && (
                <div className="mb-4">
                  <label className="form-label">Target</label>
                  <input type="text" className="form-control" value={target}
                    onChange={(e) => setTarget(e.target.value)} />
                </div>
                  )}
             
            </form>
            </div>
            <div className='evente-footer'>
             <div className="d-flex justify-content-end gap-3">
                <button type="button" className="cancel-button">Cancel</button>
                <button type="submit" onClick={handleSubmit} className="btn-primary-vp"  disabled={submitLoading}>{submitLoading ? "Saving..." : "Save"}</button>
              </div>
              </div>
          </div>
        )}

        {openEventPopup !== null && (
          <div className="cal-modal-overlay modal-overlay-position">
            <div className="modal-container overflow-auto">
              <div className="modal-header mb-3">
                <h5 className="mb-0 fw-bold">
                  Events on {selectedDate.toDateString()}
                </h5>
              </div>
              <div className="modal-body-cal" style={{ height: "calc(100% - 95px)" }}>
                {openEventPopup.map(ev => (
                  <div key={ev.event_id} className="border rounded p-2 mb-1 w-100">
                    <p className='d-flex w-100'><span className="fw-bold" style={{ minWidth: "110px" }} >Type:</span> {ev.type}</p>
                    <p className='d-flex w-100'><span className="fw-bold" style={{ minWidth: "110px" }} >Remark:</span> {ev.remark}</p>
                    <p className='d-flex w-100'><span className="fw-bold" style={{ minWidth: "110px" }} >Target:</span> {ev.target}</p>
                    <p className='d-flex w-100'><span className="fw-bold" style={{ minWidth: "110px" }} >Action:</span> {ev.action}</p>
                  </div>
                ))}
              </div>
              <div className="modal-footer-cal p-0" style={{ height: "calc(100% - 35px)" ,padding:"0px !important"}}>
                <button className="cancel-button" onClick={() => setOpenEventPopup(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {officeBrkTime && (
        <div className="cal-modal-overlay modal-overlay-position">
          <div className="modal-container">
            <div className="modal-header mb-3">
              <h5 className="mb-0 add-new-hdr">{officeBrkTime}</h5>
            </div>

            {officeBrkTime === "Permission" && (
              <div className="modal-body mb-2">
                <div className="container commonst-select">
                  <p>Set permission duration for the employee per month</p>
                </div>
                <div className="container commonst-select mb-3">
                  <p>{officeBrkTime} time</p>
                  <div className="calc-select-ba">
                    <CommonSelect
                      header="Select hour"
                      placeholder="Select hour"
                      name="type"
                      value={permissionType}
                      onChange={setPermissionType}
                      options={permissionHour}
                    />
                  </div>
                </div>
              </div>
            )}

            {officeBrkTime === "Break" && (
              <div className="modal-body mb-4 position-relative">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div className="flex flex-col gap-6">

                    {/* Break AM */}
                    <div className="flex items-center gap-6 d-flex align-items-center justify-content-between mb-3">
                      <div className="w-32 font-medium text-gray-700">Break (AM)</div>

                      <div className='display-flex gap-2' style={{ width: "calc(100% - 162px)" }}>
                       <DatePicker
                        selected={values.amStart}
                        onChange={(time) => handleChange("amStart", time)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        className="form-control"
                        placeholderText="Start time"
                      />
                      <DatePicker
                        selected={values.amEnd}
                        onChange={(time) => handleChange("amEnd", time)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        className="form-control"
                        placeholderText="End time"
                      />
                      </div>
                    </div>

                    {/* Lunch */}
                    <div className="flex items-center gap-6 d-flex align-items-center justify-content-between mb-3">
                      <div className="w-32 font-medium text-gray-700">Lunch</div>

                      <div className='display-flex gap-2' style={{ width: "calc(100% - 162px)" }}>
                        <DatePicker
                        selected={values.lunchStart}
                        onChange={(time) => handleChange("lunchStart", time)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        className="form-control"
                        placeholderText="Start time"
                      />
                      <DatePicker
                        selected={values.lunchEnd}
                        onChange={(time) => handleChange("lunchEnd", time)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        className="form-control"
                        placeholderText="End time"
                      />
                      </div>
                    </div>

                    {/* Break PM */}
                    <div className="flex items-center gap-6 d-flex align-items-center justify-content-between mb-3">
                      <div className="w-32 font-medium text-gray-700">Break (PM)</div>

                      <div className='display-flex gap-2' style={{ width: "calc(100% - 162px)" }}>
                         <DatePicker
                        selected={values.pmStart}
                        onChange={(time) => handleChange("pmStart", time)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        className="form-control"
                        placeholderText="Start time"
                      />
                      <DatePicker
                        selected={values.pmEnd}
                        onChange={(time) => handleChange("pmEnd", time)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="HH:mm"
                        className="form-control"
                        placeholderText="End time"
                      />
                      </div>
                    </div>
                  </div>
                </LocalizationProvider>
              </div>
            )}

            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setOfficeBrkTime(null)} >Cancel</button>
              <button className="next-button" onClick={() => handleBreakSave(officeBrkTime)}  disabled={saveLoading} >{saveLoading ? "Saving..." : "Save"}</button>
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
};

export default CalendarWithHolidayMarker;
