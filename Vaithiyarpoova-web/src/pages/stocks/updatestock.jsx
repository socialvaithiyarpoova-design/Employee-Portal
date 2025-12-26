import {useState} from 'react';
import PropTypes from "prop-types";
import axios from 'axios';
import './stocks.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import configModule from '../../../config.js';
function Updatestock({ stocks,onClose,getstocks}) {
 const config = configModule.config();
 const [loading, setLoading] = useState(false);
 const [formData, setFormData] = useState({
  stock_quantity: '',
});

const handleUpdate = async () => {
  setLoading(true);
  try {
    const response = await axios.put(
      `${config.apiBaseUrl}stockupdate/${stocks?.stock_recid}`,
       { stock_quantity: parseInt(formData.stock_quantity), }
    );
    if (response.data.success) {
    toast.success("stock quantity updated successfully");
     const responseData = response.data?.data;
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
    setTimeout(() => {
       onClose();
       getstocks();
    }, 2000);
    } else {
      toast.error(`Update failed: ${response.data.message}`);
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
    toast.error("⚠️ Something went wrong while updating");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="product-modal-overlay">
      <div className="inventry-modal-view">
        <div className="inventry-modal-header ">
          <h5 className="mb-0 inventry-view-header"> Add Quantity</h5>
        </div>
        <div className="inventry-modal-body">
        <div className="d-flex  mt-3">  
          <div className="col-6 "><h6 className="inventry-body-header-txt">Product ID</h6></div>
          <div className="col-6 "><p className="inventry-body-p-txt mb-0">{stocks?.stock_product_id}</p></div>
        </div>
        <div className="d-flex  mt-3">  
          <div className="col-6 "><h6 className="inventry-body-header-txt">Product Name</h6></div>
          <div className="col-6 "><p className="inventry-body-p-txt mb-0">{stocks?.product_name}</p></div>
        </div>
          <div className="d-flex  mt-4">  
          <div className="col-6 "><h6 className="inventry-body-header-txt">Last update</h6></div>
          <div className="col-6 "><p className="inventry-body-p-txt mb-0">{stocks?.updated_at ? new Date(stocks.updated_at).toISOString().split('T')[0] : '--'}</p></div>
        </div>
          <div className="d-flex  mt-4">  
          <div className="col-6 "><h6 className="inventry-body-header-txt"> Last Updated Qty</h6></div>
          <div className="col-6 "><p className="inventry-body-p-txt mb-0">{stocks?.updated_qty}</p></div>
        </div>
          <div className="d-flex  mt-4">  
          <div className="col-6 "><h6 className="inventry-body-header-txt">Selling price</h6></div>
          <div className="col-6 "><p className="inventry-body-p-txt mb-0">₹{stocks?.selling_price}</p></div>
        </div>
          <div className="d-flex justify-content-center align-items-center mt-4 mb-4">
          <p className="hr-iventory mb-0" />
        </div>
          <div className="d-flex  mt-3">  
          <div className="col-6 " style={{display:"flex",alignItems:"center"}}><h6 className="inventry-body-header-txt">Quantity</h6></div>
          <div className="col-6 ">
            <input  type="number" min="0" className="iventry-form-controle" name="stock_quantity"  value={formData.stock_quantity}
             onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} placeholder="Enter quantity"/>
          </div>
        </div>
        </div>
        <div className="inventry-modal-body">
            <div className="iventry-modal-footer mt-4">
              <button className="cancel-button" onClick={onClose} >Cancel</button>
              <button className="inventry-update-btn" disabled={loading}  onClick={handleUpdate}> {loading ? "Updating..." : "Update"}</button>
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

Updatestock.propTypes = {
   onClose: PropTypes.func.isRequired,
   stocks: PropTypes.func.isRequired,
   getstocks: PropTypes.func.isRequired,
};
export default Updatestock;
