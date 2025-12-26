import React, { useState, useEffect, useRef } from "react";
import "./registration.css";

const PreferredTimeSelect = ({ timeSlots = [], prTime, setPrTime }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Placeholder text logic
  const placeholder =
    timeSlots.length === 0
      ? "No time slots available"
      : "Select available time";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="reg-class-dropdown" ref={dropdownRef}>
      <div
        className={`reg-class-selected ${timeSlots.length === 0 ? "disabled" : ""}`}
        onClick={() => timeSlots.length > 0 && setOpen(!open)}
      >
        {prTime || placeholder}
      </div>

      {open && timeSlots.length > 0 && (
        <ul className="reg-class-options">
          {timeSlots.map((slot, index) => (
            <li
              key={index}
              className={`reg-class-option ${prTime === slot ? "selected" : ""}`}
              onClick={() => {
                setPrTime(slot);
                setOpen(false);
              }}
            >
              {slot}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PreferredTimeSelect;
