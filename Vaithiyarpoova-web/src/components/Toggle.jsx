import React from "react";

function ToggleButton({ isToggled, onToggle }) {
  return (
    <div
      className="toggle-container mb-3"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        justifyContent: "center",
      }}
    >
      <label style={{ marginBottom: 0, fontWeight: "500" }}>
        India
        </label>
      <div
        onClick={onToggle}
        style={{
          width: "50px",
          height: "24px",
          backgroundColor: isToggled ? "#0B9346" : "#ccc",
          borderRadius: "12px",
          position: "relative",
          cursor: "pointer",
          transition: "background-color 0.3s",
          border: "1px solid #ddd",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: "white",
            borderRadius: "50%",
            position: "absolute",
            top: "1px",
            left: isToggled ? "27px" : "1px",
            transition: "left 0.3s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </div>
      <label style={{ marginBottom: 0, fontWeight: "500" }}>Other Countries</label>
    </div>
  );
}

export default ToggleButton;
