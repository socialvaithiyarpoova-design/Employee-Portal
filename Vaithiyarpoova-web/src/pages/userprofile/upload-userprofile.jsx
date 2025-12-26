import React, { useRef, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import SvgContent from "../../components/svgcontent";
import configModule from '../../../config.js';

function UploadModal({ show, onClose }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const config = configModule.config();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    readExcel(file);
  };

  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setParsedData(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}InsertLeadBulk`, { leads: parsedData });
      alert("Upload successful");
      setParsedData([]);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      alert("Upload failed");
      console.error(error);
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!show) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose && onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [show, onClose]);

  return (
    show && (
      <div className="upload-modal-overlay">
        <div className="upload-modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload records</h5>
            <button type="button" className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>

          <div className="upload-drop-area" onClick={() => fileInputRef.current.click()}>
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {selectedFile ? (
              <div className="file-preview">
                {selectedFile.name}
                <button className="delete-file-btn" onClick={() => { setSelectedFile(null); setParsedData([]); }}>
                  <SvgContent svg_name="btn_dlt" />
                </button>
              </div>
            ) : (
              <div className="text-center d-flex align-items-center justify-content-center gap-2">
                <SvgContent svg_name="upload" />
                <div style={{ color: "#121212" }} >Upload <br />(Excel)</div>
              </div>
            )}
          </div>

          {/* {parsedData.length > 0 && (
            <div className="preview-table">
              <table className="table table-bordered table-sm mt-3">
                <thead>
                  <tr>
                    {Object.keys(parsedData[0]).map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )} */}

          <div className="modal-footer">
            <button className="btn btn-light" onClick={onClose}>Cancel</button>
            <button className="btn btn-success" onClick={handleUpload} disabled={!parsedData.length}>Upload</button>
          </div>
        </div>
      </div>
    )
  );
}

export default UploadModal;
