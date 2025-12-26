import React, { useState, useEffect } from "react";
import axios from "axios";

export default function LocationFromPolygon() {
  const [location, setLocation] = useState("");

  const coords = [
    { lat: 11.011014, lon: 76.979989 },
    { lat: 11.009717, lon: 76.980142 },
    { lat: 11.009683, lon: 76.980099 },
    { lat: 11.009717, lon: 76.979915 }
  ];

  const getCenterPoint = (points) => {
    let latSum = 0;
    let lonSum = 0;
    points.forEach(p => {
      latSum += p.lat;
      lonSum += p.lon;
    });
    return {
      lat: latSum / points.length,
      lon: lonSum / points.length
    };
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const center = getCenterPoint(coords);
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lon}`
        );
        setLocation(res.data.display_name || "Unknown location");
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchLocation();
  }, []);

  return (
    <div>
      <h2>Exact Location from Coordinates</h2>
      <p>📍 {location}</p>
    </div>
  );
}
