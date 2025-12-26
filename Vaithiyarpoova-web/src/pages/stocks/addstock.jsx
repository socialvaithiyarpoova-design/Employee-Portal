import {useState, useEffect, useRef} from 'react';
import PropTypes from "prop-types";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import configModule from '../../../config.js';
import './stocks.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
function Addstock({ onClose,getstocks}) {
 const config = configModule.config();
 const [loading, setLoading] = useState(false);
 const productIDRef = useRef(null);
  const { user} = useAuth();
  const userId = user?.userId;

 const [formData, setFormData] = useState({
  stock_product_id: '',
  stock_quantity:'',
  min_stock_qty:'',
});

   // Focus on Product ID input when modal opens
  useEffect(() => {
    if (productIDRef.current) {
      setTimeout(() => {
        productIDRef.current.focus();
      }, 100);
    }
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
        getstocks();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handlesave = async () => {
    if (!formData.stock_product_id || !formData.stock_quantity || !formData.min_stock_qty) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        stock_product_id: formData.stock_product_id,
        stock_quantity: parseInt(formData.stock_quantity),
        min_stock_qty: parseInt(formData.min_stock_qty),
        userId: userId || ''
      };
      const response = await axios.post(`${config.apiBaseUrl}addstocks`, payload);
      if (response.status === 200) {
        toast.success("Stock added successfully");
        const responseData = response.data?.data;
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
        }).catch((err) => console.error("Graph update failed:", err));
      }
        setTimeout(() => {
          onClose();
          getstocks();
        }, 2000);
      } else {
        toast.error(`Add failed: ${response.data.message}`);
      }
    } catch (error) {
    let sqlMsg = error.response?.data?.error?.sqlMessage;
    if (sqlMsg?.includes("Duplicate entry")) {
      sqlMsg = sqlMsg.split(" for key")[0];
    }
    const errorMsg = sqlMsg || error.response?.data?.message || "Something went wrong while Adding";
      console.error("Error:", error);
      toast.error(`⚠️ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="product-modal-overlay">
      <div className="inventry-modal-view">
        <div className="inventry-modal-header ">
          <h5 className="mb-0 inventry-view-header">Add product</h5>
        </div>
        <div className="inventry-modal-body">
       
       <div className="d-flex  mt-3">  
          <div className="col-6 " style={{display:"flex",alignItems:"center"}}><h6 className="inventry-body-header-txt">Product ID</h6></div>
          <div className="col-6 ">
            <input  
              ref={productIDRef}
              type="text"  
              className="iventry-form-controle" 
              name="stock_product_id"  
              value={formData.stock_product_id}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                const allowed = /^[A-Z0-9]*$/;
                if (allowed.test(value)) {
                  setFormData({ ...formData, stock_product_id: value });
                }
              }} 
              placeholder="Enter product id"
            />
          </div>
        </div> 
        <div className="d-flex  mt-3">  
          <div className="col-6 " style={{display:"flex",alignItems:"center"}}><h6 className="inventry-body-header-txt">Quantity</h6></div>
          <div className="col-6 ">
            <input  type="number" min="0" className="iventry-form-controle" name="stock_quantity"  value={formData.stock_quantity}
             onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} placeholder="Enter the quantity"/>
          </div>
        </div> 
         
      
          <div className="d-flex  mt-3">  
          <div className="col-6 " style={{display:"flex",alignItems:"center"}}><h6 className="inventry-body-header-txt">Minimum stock quantity</h6></div>
          <div className="col-6 ">
            <input  type="number" min="0" className="iventry-form-controle" name="min_stock_qty"  value={formData.min_stock_qty}
             onChange={(e) => setFormData({ ...formData, min_stock_qty: e.target.value })} placeholder="Enter min_stock_qty"/>
          </div>
        </div>   
        </div>
        <div className="inventry-modal-body">
            <div className="iventry-modal-footer mt-4">
              <button className="cancel-button" onClick={onClose} >Cancel</button>
              <button className="inventry-update-btn" disabled={loading}  onClick={handlesave}> {loading ? "Adding..." : "Add"}</button>
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

Addstock.propTypes = {
   onClose: PropTypes.func.isRequired,
   getstocks: PropTypes.func.isRequired,
};
export default Addstock;
