import { useState, useRef, useEffect } from "react"; 
import PropTypes from 'prop-types';
import { FaChevronDown  } from "react-icons/fa";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./inventory.css";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import configModule from '../../../config.js';
import { exportFormattedData } from '../../components/export-page.jsx';
function Export({ onClose, exportFormat = 'xlsx'}) {
 const config = configModule.config();
      const [loading, setLoading] = useState(false);
      const [showPicker, setShowPicker] = useState(false);
      const [range, setRange] = useState([ { startDate: null, endDate: null, key: "selection" }]);
      const pickerRef = useRef(null);
      const dateRangeButtonRef = useRef(null);
      const isInitialFocus = useRef(true);
      const tabCount = useRef(0); 
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (pickerRef.current && !pickerRef.current.contains(event.target)) {
            setShowPicker(false); 
          }
        };
    
        if (showPicker) {
          document.addEventListener("mousedown", handleClickOutside);
        } else {
          document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [showPicker]);

      // Auto-focus on date range button when modal opens
      useEffect(() => {
        if (dateRangeButtonRef.current) {
          // Reset tab count when modal opens
          tabCount.current = 0;
          // Small delay to ensure the modal is fully rendered
          setTimeout(() => {
            if (dateRangeButtonRef.current) {
              dateRangeButtonRef.current.focus();
            }
          }, 200);
        }
      }, []);
    
    
      const prettyRange = range[0].startDate && range[0].endDate
        ? `${format(range[0].startDate, "dd MMM yy")} – ${format(
            range[0].endDate,
            "dd MMM yy"
          )}`
        : "Date range";
      const formatLocalDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

const handleDownload = async () => {
  setLoading(true);
  const localStart = formatLocalDate(range[0].startDate);
  const localEnd = formatLocalDate(range[0].endDate);
  
  try {
    if (exportFormat === 'pdf') {
      // Fetch server-side filtered JSON for the selected date range
      const resJson = await axios.post(
        `${config.apiBaseUrl}inventoryfilter_json`,
        { startDate: localStart, endDate: localEnd },
        { validateStatus: false }
      );

      if (resJson.status === 404) {
        toast.info("No data found for the selected date range.");
        return;
      }

      const list = Array.isArray(resJson.data?.data) ? resJson.data.data : [];
      if (list.length === 0) {
        toast.info("No data found for the selected date range.");
        return;
      }

      const exportData = list.map((item, index) => ({
        "S.No": index + 1,
        "Product ID": item.product_id || '',
        "Product Name": item.product_name || '',
        "Category": item.product_category || '',
        "Selling Price": `₹${item.selling_price || 0}`,
        "Min Qty": item.min_stock_quantity || '',
        "In Stock": item.quantity || '',
        "Status": item.stock_status || ''
      }));

      // Use the enhanced export function for PDF
      exportFormattedData(exportData, `inventory_${localStart}_to_${localEnd}`, 'pdf');
      toast.success("Inventory exported as PDF successfully");
    } else {
      // For Excel, use the existing blob download logic
      const res = await axios.post(
        `${config.apiBaseUrl}inventoryfilter`,
        {
          startDate: localStart,
          endDate: localEnd,     
        },
        { responseType: "blob", validateStatus: false }
      );

      if (res.status === 404) {
        toast.info("No data found for the selected date range.");
        return;
      }
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory_${localStart}_to_${localEnd}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Inventory exported as Excel successfully");
    }
    
    setTimeout(() => {
      onClose();
    }, 1000);
  } catch (err) {
    console.error("Download Error:", err);
    toast.error("Something went wrong 😓");
  } finally {
    setLoading(false);
  }
};

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose && onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('keyup', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('keyup', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="product-modal-overlay">
      <div className="inventry-modal-export">
        <div className="inventry-modal-header ">
          <h5 className="mb-0 inventry-view-header">Export Inventory as {exportFormat.toUpperCase()}</h5>
        </div>
        <div className="inventry-modal-body">
        <div className="  mt-3">  
         <div className="position-relative">
               <button 
                 ref={dateRangeButtonRef}
                 className="lead-pill-export align-items-center" 
                 onClick={() => setShowPicker((prev) => !prev)}
                 onFocus={() => {
                   // Open dropdown when focused (except on initial load)
                   if (!isInitialFocus.current) {
                     setShowPicker(true);
                   }
                   isInitialFocus.current = false;
                 }}
                 onBlur={() => {
                   // Reset tab count when focus moves away
                   tabCount.current = 0;
                 }}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     setShowPicker((prev) => !prev);
                   } else if (e.key === 'Tab') {
                     if (e.shiftKey === false) { // Only on forward tab
                       tabCount.current += 1;
                       
                       if (tabCount.current === 1) {
                         // First tab - open dropdown
                         e.preventDefault();
                         setShowPicker(true);
                       } else if (tabCount.current === 2) {
                         // Second tab - close dropdown and stay on button
                         e.preventDefault();
                         setShowPicker(false);
                       }
                       // Third tab and beyond - let default behavior move to next element
                     }
                   }
                 }}
                 tabIndex={0}
               >
                   {prettyRange} <FaChevronDown className="chevron" />
                 </button>
       
                 {showPicker && (
                   <div ref={pickerRef} className="picker-popover-export shadow">
                     <DateRange
                       ranges={[
                         {
                           startDate: range[0].startDate || new Date(),
                           endDate: range[0].endDate || new Date(),
                           key: "selection"
                         }
                       ]}
                       onChange={(item) => setRange([item.selection])}
                       moveRangeOnFirstSelection={false}
                       maxDate={new Date()}
                     />
                   </div>
                 )}
               </div>
        </div>
        </div>
        <div className="inventry-modal-body">
            <div className="iventry-modal-footer mt-4">
              <button 
                className="cancel-button" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                className="inventry-update-btn" 
                onClick={handleDownload} 
                disabled={loading}
              >
                {loading ? "Exporting..." : "Export"}
              </button>
            </div> 
        </div>
      </div>
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
}

Export.propTypes = {
   onClose: PropTypes.func.isRequired,
   exportFormat: PropTypes.oneOf(['xlsx', 'pdf']),
};
export default Export;
