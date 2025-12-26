import React,{useState,useEffect} from 'react';
import PropTypes from "prop-types";
import "./inventory.css";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import configModule from '../../../config.js';
function UpdatePrice({ products,onClose,getproduct}) {
 const config = configModule.config();
 const [loading, setLoading] = useState(false);

 const [formData, setFormData] = useState({
  quantity: '',
  min_stock_quantity: ''
});

const handleUpdate = async () => {
  setLoading(true);
  try {
    const response = await axios.put(
      `${config.apiBaseUrl}productinventry/${products?.inventory_recid}`,
      {
        quantity: parseInt(formData.quantity),
        min_stock_quantity: parseFloat(formData.min_stock_quantity)
      }
    );
    if (response.data.success) {
    toast.success("Product updated successfully");
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
       getproduct();
    }, 2000);
    } else {
      toast.error(`Update failed: ${response.data.message}`);
    }
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("⚠️ Something went wrong while updating");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (products) {
      setFormData({
        quantity: '',
        min_stock_quantity: products?.min_stock_quantity?.toString() || ''
      });
    }
  }, [products]);

  return (
    <div className="product-modal-overlay">
      <div className="inventry-modal-view">
        <div className="inventry-modal-header ">
          <h5 className="mb-0 inventry-view-header">Update Quantity</h5>
        </div>
        <div className="inventry-modal-body">
        <div className="d-flex  mt-3">  
          <div className="col-6 "><h6 className="inventry-body-header-txt">Product ID</h6></div>
          <div className="col-6 "><p className="inventry-body-p-txt mb-0">{products?.product_id}</p></div>
        </div>
        <div className="d-flex  mt-3">  
          <div className="col-6 "><h6 className="inventry-body-header-txt">Product Name</h6></div>
          <div className="col-6 "><p className="inventry-body-p-txt mb-0">{products?.product_name}</p></div>
        </div>
          <div className="d-flex  mt-4">  
          <div className="col-6 "><h6 className="inventry-body-header-txt">Last Update</h6></div>
          <div className="col-6 "><p className="inventry-body-p-txt mb-0">{products?.updated_at ? new Date(products.updated_at).toISOString().split('T')[0] : '--'}</p></div>
        </div>
          <div className="d-flex  mt-4">  
          <div className="col-6 "><h6 className="inventry-body-header-txt"> Last Updated Qty</h6></div>
          <div className="col-6 "><p className="inventry-body-p-txt mb-0">{products?.updated_quantity}</p></div>
        </div>
          <div className="d-flex  mt-4">  
          <div className="col-6 "><h6 className="inventry-body-header-txt">Selling Price</h6></div>
          <div className="col-6 "><p className="inventry-body-p-txt mb-0">₹{products?.selling_price}</p></div>
        </div>
          <div className="d-flex justify-content-center align-items-center mt-4 mb-4">
            <p className="hr-iventory mb-0" />
        </div>
          <div className="d-flex  mt-3">  
          <div className="col-6 " style={{display:"flex",alignItems:"center"}}><h6 className="inventry-body-header-txt">Quantity</h6></div>
          <div className="col-6 ">
            <input  type="number" min="0" className="iventry-form-controle" name="quantity"  value={formData.quantity}
             onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="Enter quantity"/>
          </div>
        </div>
        <div className="d-flex  mt-3">  
          <div className="col-6 " style={{display:"flex",alignItems:"center"}}><h6 className="inventry-body-header-txt">Min Stock Qty</h6></div>
          <div className="col-6 " >
            <input  type="number" min="0" className="iventry-form-controle" name="min_stock_quantity"   
            value={formData.min_stock_quantity}
            onChange={(e) => setFormData({ ...formData, min_stock_quantity: e.target.value })}
            placeholder="Enter Buying price"/>
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

UpdatePrice.propTypes = {
   onClose: PropTypes.func.isRequired,
  products: PropTypes.func.isRequired,
   getproduct: PropTypes.func.isRequired,
};
export default UpdatePrice;
