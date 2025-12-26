import React, { useEffect, useRef, useState } from "react";

const AnimatedCounter = ({ start = 0, end = 100, duration = 1000 }) => {
  const ref = useRef(null);
  const [displayValue, setDisplayValue] = useState(start);

  useEffect(() => {
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);
      setDisplayValue(currentValue);
      if (ref.current) {
        ref.current.innerHTML = currentValue;
      }
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [start, end, duration]);

  return (
    <h2
      className=""
      style={{ zIndex: "1000" }}
      ref={ref}
      aria-live="polite"
    >
      {displayValue}
    </h2>
  );
};

export default AnimatedCounter;
