import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState, useEffect, useRef } from "react";
import "./export-page.css";

export const exportFormattedData = (data, fileName = "Export", fileType = "xlsx") => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("No data to export.");
    return;
  }

  if (fileType === "xlsx") {
    exportToExcel(data, fileName);
  } else if (fileType === "pdf") {
    exportToPDF(data, fileName);
  }
};

const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

const exportToPDF = (data, fileName) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("No data to export to PDF.");
    return;
  }

  // Create new PDF document
  const doc = new jsPDF();
  
  // Get column headers from the first data object
  const headers = Object.keys(data[0]);
  
  // Convert data to array format for autoTable
  const tableData = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Handle different data types
      if (value === null || value === undefined) return '';
      if (typeof value === 'number') return value.toString();
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      return value.toString();
    })
  );

  // Add title
  const title = `${fileName} Report`;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Create table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [11, 147, 70], // Green color matching the theme
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      // Make all columns auto-width
    },
    margin: { top: 40, right: 14, bottom: 14, left: 14 },
    didDrawPage: function (data) {
      // Add page number
      doc.setFontSize(8);
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    },
  });

  // Save the PDF
  doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Enhanced export component with dropdown
export const ExportButton = ({ data, fileName = "Export", onExport, className = "", disabled = false , btnClass="'" }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleExport = async (fileType) => {
    if (!data || data.length === 0) {
      console.error("No data to export.");
      return;
    }

    setIsExporting(true);
    setShowDropdown(false);

    try {
      if (onExport) {
        await onExport(data, fileName, fileType);
      } else {
        exportFormattedData(data, fileName, fileType);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`export-button-container ${className}`} ref={dropdownRef}>
      <button
        className={`btn-top-up btn-bg-filled export-btn ${btnClass} ${isExporting ? 'exporting' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled || isExporting}
        style={{ position: 'relative' }}
      >
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        {!isExporting && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              marginLeft: '8px',
              transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        )}
      </button>

      {showDropdown && !isExporting && (
        <div className="export-dropdown">
          <button
            className="export-option"
            onClick={() => handleExport('xlsx')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Export as Excel
          </button>
          <button
            className="export-option"
            onClick={() => handleExport('pdf')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
};

// Legacy functions for backward compatibility
export const exportToExcelLegacy = (data, fileName) => {
  exportFormattedData(data, fileName, "xlsx");
};

export const exportToPDFLegacy = (data, fileName) => {
  exportFormattedData(data, fileName, "pdf");
};
