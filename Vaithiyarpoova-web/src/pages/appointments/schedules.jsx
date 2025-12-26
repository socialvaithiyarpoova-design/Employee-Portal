import React, { useState, useEffect } from 'react';
import './appointments.css';
import { addMinutes, startOfWeek, addDays, format } from 'date-fns';
import grater from '../../assets/images/graterap.svg';
import less from '../../assets/images/lesstheap.svg';
import axios from "axios";
import configModule from '../../../config.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import dayjs from "dayjs";
import SvgContent from '../../components/svgcontent.jsx';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const generateTimeSlots = (interval) => {
  const slots = [];
  let start = new Date();
  start.setHours(0, 0, 0, 0);

  const totalMinutes = 24 * 60;

  for (let i = 0; i < totalMinutes / interval; i++) {
    slots.push(format(addMinutes(start, i * interval), "hh:mm a"));
  }

  return slots;
};

const Schedule = () => {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [interval, setInterval] = useState(60);
  const [isAM, setIsAM] = useState(true);
  const [deletedAppointment, setDeletedAppointment] = useState(false);
  const [editedAppointment, setEditedAppointment] = useState(false);
  const [selectedItems, setSelectedItems] = useState('');
  const [availability, setAvailability] = useState([]);
  const config = configModule.config();
  const { user } = useAuth();
  const user_id = user?.userId;
  const user_typecode = user?.user_typecode;
  const [reAssignDate, setReAssignDate] = useState(null);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const timeSlots = generateTimeSlots(interval, isAM);

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const local = dayjs(isoString);

  return local.format("YYYY-MM-DD");
};


  const fetchAvailability = async () => {
    try {
      const res = await axios.post(`${config.apiBaseUrl}getReservedData`, {
        user_id: user_id
      }
      );

      const result = res.data?.data;

        const resFinal = result.map(a => ({
      ...a,
      appointment_date: formatDateTime(a.appointment_date)
    }));



      if (res.status === 200) {
        setAvailability(resFinal);
      }
    } catch (err) {
      console.error("Error fetching availability", err);
      toast.error("Error fetching availability. Please try again.");
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchAvailability();
    }

  }, [user_id, weekStart, isAM, interval]);

  const formatDateForDB = (date) => {
    const pad = (n) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleSlotClick = async (date, time, action) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const selectedDate = formatDateForDB(date);

    // Convert slot time to Date
    const [hour, minutePart] = time.split(':');
    const [minute, meridian] = minutePart.split(' ');
    let hourInt = parseInt(hour, 10);
    if (meridian === 'PM' && hourInt !== 12) hourInt += 12;
    if (meridian === 'AM' && hourInt === 12) hourInt = 0;

    const slotDateTime = new Date(date);
    slotDateTime.setHours(hourInt, parseInt(minute), 0, 0);

    if (slotDateTime < new Date()) {
      toast.warning("Cannot book past time slots.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        pauseOnHover: true,
        draggable: false,
        theme: "colored"
      });
      return;
    }

    try {
      const res = await axios.post(`${config.apiBaseUrl}slotBookingDetails`, {
        user_id,
        user_typecode,
        date: selectedDate,
        time,
        interval,
        action,
        id: selectedItems?.appointment_id,
        created_by: selectedItems?.emp_recid,
        client_id: selectedItems?.client_id
      });

      const result = res.data;
      if (res.status === 200) {
        if (result.data[0]?.status === 201) {
          toast.warning(result.data[0]?.message);
          return;
        }

        const msg = action === "slotbook" ? "Slot booked successfully." : "Rescheduled successfully.";
        toast.success(msg);
        fetchAvailability();
        setEditedAppointment(false);
      }
    } catch (err) {
      console.error("Slot booking failed", err);
      toast.error("Failed to book slot. Please try again.");
    }
  };

  const handleDelete = async (item) => {
    setDeletedAppointment(true);
    setSelectedItems(item);
  };

  const handleReschedule = async (item) => {
    setEditedAppointment(true);
    setSelectedItems(item);
  };

  const handleRemoveSlot = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}delBookingDetails`, {
        id: selectedItems.appointment_id
      });

      toast.success("Slot removed successfully.");
      setDeletedAppointment(false);
      setEditedAppointment(false);
      fetchAvailability();
    } catch (err) {
      console.error("Failed to remove slot", err);
      toast.error("Failed to remove slot. Please try again.");
    }
  };

const checkAppointmentsStatus = (appointment) => {
  if (!appointment) return { ...appointment, day_status: false };

  const now = dayjs();
  const slotDateTime = dayjs(`${appointment.appointment_date} ${appointment.appointment_time}`, "YYYY-MM-DD hh:mm A");

  const isUpcoming = slotDateTime.isAfter(now);
  return { ...appointment, day_status: isUpcoming };
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
        style={{ zIndex: 9999999 }}
      />
      <div className='appointment-main'>
        <div className='schedule-header-main'>
          <div><h6 className="mt-0 mb-0 product-header-text">Schedules</h6></div>
          <div className="schedule-header">
            <select value={interval} className='schedule-time-select' onChange={(e) => setInterval(Number(e.target.value))}>
              <option value={60}>60 minutes</option>
              <option value={45}>45 minutes</option>
            </select>
            <div className='slect-week-sh'>
              <button type='button' className='slect-week-sh-btn-r' onClick={() => setWeekStart(addDays(weekStart, -7))}>
                <img className='slectless-grater' src={less} alt="less" />
              </button>
              <span>{format(weekStart, 'dd MMM')} - {format(addDays(weekStart, 6), 'dd MMM')}</span>
              <button type='button' className='slect-week-sh-btn' onClick={() => setWeekStart(addDays(weekStart, 7))}>
                <img className='slectless-grater' src={grater} alt="grater" />
              </button>
            </div>
            <select
              value={isAM ? 'AM' : 'PM'}
              onChange={(e) => setIsAM(e.target.value === 'AM')}
              className="schedule-time-select-am"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <div className='schedule-calendor-ap'>
          <div className="schedule-grid-horizontal">
            <div className="time-slot-header">
              <div className="time-slot-cell">Time</div>
              {dates.map((date) => (
                <div key={date} className="time-slot-cell">
                  {format(date, 'dd MMM yyyy')}<br />{format(date, 'EEEE')}
                </div>
              ))}
            </div>
            <div className='time-body-main'>
              {timeSlots.map((slot) => (
                <div key={slot} className="time-slot-row">
                  <div className="time-slot-cell time-label">{slot}</div>
                  {dates.map((date) => {
                    const dateKey = dayjs(date).format("YYYY-MM-DD");

                    const isReserved = availability.some(appt =>
                      appt.appointment_date === dateKey &&
                      appt.appointment_time === slot
                    );

                    const ReservedData = availability.find(appt =>
                      appt.appointment_date === dateKey &&
                      appt.appointment_time === slot
                    );

                    return (
                      <div key={dateKey + slot} className="time-slot-cell" onClick={() => {
                        if ((ReservedData && checkAppointmentsStatus(ReservedData)?.day_status) || !ReservedData) {
                          handleSlotClick(date, slot, "slotbook");
                        }
                      }}>
                        {isReserved ? (
                          <div className={!checkAppointmentsStatus(ReservedData)?.day_status ? 'reserved-body-st reserved-body-past' : (ReservedData?.slot_status === "available" ? 'reserved-body-st reserved-body-availst' : 'reserved-body-st reserved-body-resst')}>
                            <h6 className="label mb-0 res-letter-st" style={!checkAppointmentsStatus(ReservedData)?.day_status ? { color: "rgb(66 67 67 / 50%)" } : (ReservedData?.slot_status === "available" ? { color: "#05823a" } : { color: "rgb(180 112 10)" })} >
                              {!checkAppointmentsStatus(ReservedData)?.day_status ? "Expired" : ReservedData?.slot_status === "available" ? 'Available' : 'Reserved'}
                            </h6>
                            <div className="reserved-overlay">
                              {checkAppointmentsStatus(ReservedData)?.day_status && (
                                ReservedData?.slot_status === "available" ? (
                                  <button className='w-100 h-100 dele-btn' onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(ReservedData);
                                  }}>
                                    <SvgContent svg_name="delete" />
                                  </button>
                                ) : (
                                  <>
                                    <button className='w-100 h-100 edited-btn' onClick={(e) => {
                                      e.stopPropagation();
                                      handleReschedule(ReservedData);
                                    }}>
                                      <SvgContent svg_name="btn_edit" stroke='#fff' />
                                    </button>
                                  </>
                                ))}

                            </div>
                          </div>
                        ) : (
                          ''
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {deletedAppointment && (
        <div className="modal-overlay">
          <div className="modal-container">
            <p>Are you sure you want to remove the availability?</p>
            <div className="popup-buttons popup-buttons-st">
              <button className="cancel-button" type="button" onClick={() => setDeletedAppointment(false)}>No</button>
              <button className="next-button" type="button" onClick={handleRemoveSlot}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {editedAppointment && (
        <div className="modal-overlay">
          <div className="modal-container overflow-auto flex-column" style={{ display: "flex", maxHeight: "75%", gap: "5px", padding: "20px", width: "fit-content" }}>

            {/* Left side: Date Picker */}
            <div className="left-side">
              <div className="container commonst-select mb-3 flex-column align-items-start">
                <h6 className='fw-bold'>Re-assigned Date</h6>
                <div className="w-100">
                  <DatePicker
                    selected={reAssignDate}
                    onChange={(date) => setReAssignDate(date)}
                    placeholderText="DD/MM/YYYY"
                    className="form-control heightset-st"
                    dateFormat="dd-MM-yyyy"
                    minDate={new Date()}
                  />
                </div>
              </div>
            </div>

            {/* Right side: Time Slots */}
            <div className="right-side-app" >
              <h6 className='text-center fw-semibold'>Available Time Slots</h6>
              <div className="slots-grid overflow-auto" style={{ display: "flex", height: "325px", maxHeight: "100%", padding: "0px 20px", flexDirection: "column", gap: "10px" }}>
                {reAssignDate ? (
                  generateTimeSlots(interval).map((slot) => {
                    // Disable past times for today
                    const now = new Date();
                    const selectedDate = new Date(reAssignDate);
                    selectedDate.setHours(0, 0, 0, 0);

                    const [hour, minutePart] = slot.split(':');
                    const [minute, meridiem] = minutePart.split(' ');
                    let hourInt = parseInt(hour);
                    if (meridiem === 'PM' && hourInt !== 12) hourInt += 12;
                    if (meridiem === 'AM' && hourInt === 12) hourInt = 0;

                    const slotDateTime = new Date(reAssignDate);
                    slotDateTime.setHours(hourInt, parseInt(minute), 0, 0);

                    const isDisabled = slotDateTime < now;

                    return (
                      <button
                        key={slot}
                        className={`slot-button cursor-pointer ${selectedItems?.appointment_time === slot ? "time-selected" : ""}`}
                        onClick={() => !isDisabled && setSelectedItems(prev => ({ ...prev, appointment_time: slot }))}
                        disabled={isDisabled}
                        style={{ opacity: isDisabled ? 0.5 : 1 }}
                      >
                        {slot}
                      </button>
                    );
                  })
                ) : (
                  <p className='text-center'>Please select a date</p>
                )}
              </div>
            </div>
            {/* Footer buttons */}
            <div className="popup-buttons popup-buttons-st" style={{ marginTop: "20px", textAlign: "right" }}>
              <button className="cancel-button" type="button" onClick={() => { setEditedAppointment(false); setReAssignDate(null); }}>Close</button>
              <button
                className="next-button"
                type="button"
                disabled={!selectedItems?.appointment_time || !reAssignDate}
                onClick={() => handleSlotClick(reAssignDate, selectedItems?.appointment_time, "reschedule")}
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Schedule;
