import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import configModule from '../../../config.js';
import axios from 'axios';
import { toast } from 'react-toastify';

function OrderDetailModal({ order, onClose, type, option }) {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');


    useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose && onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

    if (!order) return null;
  const config = configModule.config();



  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const cleanOrder = {
    order_id: order?.order_id || 'N/A',
    created_at: order?.date_time || 'N/A',
    date: order?.date || 'N/A',
    lead_id: order?.lead_id || 'VPC01',
    handel_by_id:order?.emp_id || '',
    handel_by_name:order?.name || '',
    lead_name: order?.lead_name || 'N/A',
    mobile_number: order?.mobile_number || 'N/A',
    address: order?.address || '',
    district: order?.district || '',
    state: order?.state || '',
    Country: order?.country || '',
    courier: order?.courier || '',
    stick_type: order?.stick_type || '',
    order_value: order?.order_value || '0',
    discount: order?.discount || '0',
    approved_by: order?.approved_by || '',
    gst_no: order?.gst_number || '',
    hsn: order?.hsn_codes|| '',
    gst_percent: order?.gst_percentage || 'X%',
    gst_amount: order?.gst_amount || '',
    total_value: order?.total_value || '0',
    payment_mode: order?.payment_mode ,
    product_list: JSON.parse(order?.product_list) || [],
    payment_type: order?.payment_type || '',
    transaction_id: order?.transaction_id || '',
    payment_date: order?.payment_date || '',
    courier_amount : order?.courier_amount  || '',
    pincode : order?.pincode  || '',
    wallet : order?.wallet  || '',
    branch_id : order?.branch_id  || '',
    brach_name : order?.branch_name  || '',
    reason : order?.reason  || '',
    receipt_image_url: order?.receipt_image_url || 'https://i.imgur.com/6IUbEMV.png',
  };

  const putActionForApproval = async (status, reason = '') => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}putStatus`, {
        status: status,
        order_id: order?.order_recid,
        created_by:order?.created_by,
        orderid:order?.order_id,
         option,
         reason, 
      });
      const result = response.data;

      if (response.status === 200) {
        toast.success("Updated successfully");
         setShowReasonModal(false);
        onClose();

      } else {
        toast.error("Failed to fetch product data: " + result.message);
      }
    } catch (error) {
      toast.error("Error fetching product data: " + (error.response?.data?.message || error.message));
    }
  };

    const handleDecline = () => {
    if (!declineReason.trim()) {
      toast.warn('Please enter a reason before declining.');
      return;
    }
    putActionForApproval('Decline', declineReason);
  };

  return (
    <div className="order-modal-overlay">
      <div className="order-modal-container-or">
         {type !== "print" && (
         <div className='order-modal-container-or-head' >
          <button className='fw-500' style={{fontSize:"22px"}} onClick={onClose}>×</button>
          </div>
           )}
        <div className='order-modal-container-or-body'>
       
        <div className="order-modal-grid">
          <div className="order-modal-section">
            <div className="order-section mb-4">
            <h6 className="fw-bold">Order Details</h6>
           <div className="row-item-cm">
              <span className="label-cm-o">Order ID :</span>
              <span className="value-cm-o">{cleanOrder?.order_id}</span>
            </div>
            <div className="row-item-cm">
              <span className="label-cm-o">Order date :</span>
              <span className="value-cm-o"> {cleanOrder?.created_at}</span>
            </div>
              {type !== "print" && (
             <div className="row-item-cm">
                <span className="label-cm-o">Handel_by :</span>
                <span className="value-cm-o">{cleanOrder?.handel_by_id + " - " + cleanOrder?.handel_by_name}</span>
               </div>
                )}
                 {type !== "print" && (
               <div className="row-item-cm">
                <span className="label-cm-o">Branch :</span>
                <span className="value-cm-o">{cleanOrder?.brach_name || 'Head office '}</span>
               </div>
              )}
          </div>
          <div className="order-section mb-4">
            <h6 className="fw-bold">Client Details</h6>
             {type !== "print" && (
            <div className="row-item-cm">
              <span className="label-cm-o">Client ID:</span>
              <span className="value-cm-o">{cleanOrder?.lead_id}</span>
            </div>
             )}

            <div className="row-item-cm">
              <span className="label-cm-o">Name:</span>
              <span className="value-cm-o">{cleanOrder?.lead_name}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">Mobile no:</span>
              <span className="value-cm-o">{cleanOrder?.mobile_number}</span>
            </div>
          </div> 
      
           <div className="order-section mb-4">
            <h6 className="fw-bold">Delivery Details</h6>

            <div className="row-item-cm">
              <span className="label-cm-o">Address:</span>
              <span className="value-cm-o">{cleanOrder?.address  || '--'}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">District:</span>
              <span className="value-cm-o">{cleanOrder?.district  || '--'}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">State:</span>
              <span className="value-cm-o">{cleanOrder?.state  || '--'}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">Country:</span>
              <span className="value-cm-o">{cleanOrder?.Country  || '--'}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">Courier:</span>
              <span className="value-cm-o">{cleanOrder?.courier  || '--' }</span>
            </div>

             <div className="row-item-cm">
              <span className="label-cm-o">Pincode:</span>
              <span className="value-cm-o">{cleanOrder?.pincode || '--' }</span>
            </div>
          </div>

        {type !== "print" && (
          <div className="order-section mb-4">
            <h6 className="fw-bold">Product Details</h6>
            {cleanOrder?.product_list.length > 0 && (
              cleanOrder?.product_list.map((item) => (
                <div key={item.id} className="row-item-cm">
                  <span className="label-cm-o fw-semibold">
                    {item.id} - {item.name}
                  </span>
                  <span className="value-cm-o">
                     ₹{item.price || 0} * {item.qty || 1}
                  </span>
                </div>
              ))
            )}
          </div>

          )}
            {type !== "print" && (
           <div className="order-section mb-4">
              <div className="row-item-cm">
                <span className="label-cm-o">Package type:</span>
                <span className="value-cm-o">{cleanOrder?.stick_type}</span>
              </div>
            </div>
            )}
          </div>
          {type !== "print" && (
          <div className="order-modal-section">
            <h6 className='fw-bold'>Payment Details</h6>
           <div className="row-item-cm">
              <span className="label-cm-o">Order value:</span>
              <span className="value-cm-o">₹{cleanOrder?.order_value}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">Discount:</span>
              <span className="value-cm-o">₹{cleanOrder?.discount}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">Approved by:</span>
              <span className="value-cm-o">{cleanOrder?.approved_by || '----'}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">GST No:</span>
              <span className="value-cm-o">{cleanOrder?.gst_no || '--'}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">HSN:</span>
              <span className="value-cm-o">{cleanOrder?.hsn || '--'}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">GST ({(cleanOrder?.gst_percent || 0) * 100 || '0'}% ):</span>
              <span className="value-cm-o">₹{cleanOrder?.gst_amount}</span>
            </div>
               <div className="row-item-cm">
              <span className="label-cm-o">Courier amount:</span>
              <span className="value-cm-o">₹{cleanOrder?.courier_amount || '--'}</span>
            </div>   

           {cleanOrder?.wallet && parseFloat(cleanOrder.wallet) > 0 && (
              <div className="row-item-cm">
                <span className="label-cm-o">Wallet used:</span>
                <span className="value-cm-o">₹{cleanOrder?.wallet}</span>
              </div>
            )}        
            <div className="row-item-cm">
            <span className="label-cm-o">Transaction ID:</span>
            <span className="value-cm-o">{cleanOrder?.transaction_id || '---'}</span>
          </div>

           <div className="row-item-cm">
            <span className="label-cm-o">Payment Mode </span>
            <span className="value-cm-o">{(cleanOrder?.payment_type) || (cleanOrder?.payment_mode) || '---'}</span>
          </div>

          <div className="row-item-cm">
            <span className="label-cm-o">Total value:</span>
            <span className="value-cm-o fw-bold">₹{cleanOrder?.total_value}</span>
          </div>

          <div className="row-item-cm">
            <span className="label-cm-o">Date:</span>
            <span className="value-cm-o">
              {cleanOrder?.date || '---'}
            </span>
          </div>
          
          <div className="row-item-cm">
            <span className="label-cm-o">Reason:</span>
            <span className="value-cm-o fw-bold">{cleanOrder?.reason || '---'}</span>
          </div>
        {cleanOrder.receipt_image_url &&
        cleanOrder.receipt_image_url !== "null" &&
                  !cleanOrder.receipt_image_url.includes("filename=null") &&  (
         <div className="row-item-cm">
            <span className="label-cm-o">Receipt:</span>
            <span className="value-cm-o">
           <img
            src={cleanOrder.receipt_image_url}
            alt="Payment Receipt"
            className="order-modal-receipt"
            onClick={() => window.open(cleanOrder.receipt_image_url, "_blank")}
          />
            </span>
          </div>
        )}                  
          </div>
        )}
        </div>
      </div>

      {showReasonModal && (
        <div className="reason-popup-overlay">
          <div className="reason-popup">
            <h5 className="fw-bold mb-3">Decline Order</h5>
            <p className="mb-2">Please provide a reason for declining this order:</p>
            <textarea
              className="reason-textarea"
              rows="5"
              maxLength={150}
              placeholder="Enter your reason here..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            ></textarea>
             <div className="text-end mt-1" style={{ fontSize: "12px", color: "#666" }}>
              {declineReason.length}/150
          </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-secondary" onClick={() => setShowReasonModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDecline}>
                Submit Decline
              </button>
            </div>
          </div>
        </div>
      )}
      {type !== "print" && (
      <div className='order-footer-or'>
       {type !== "history" && (
          <div className="gap-2 d-flex">
            <button className="order-btn-decline" onClick={() => setShowReasonModal(true)}>Decline</button>
            <button className="order-btn-approve" onClick={() => putActionForApproval("Approved")}>Approve</button>
          </div>
        )}
    </div>
        )}
    </div>
    
    </div>
  );
}
OrderDetailModal.propTypes = {
  order: PropTypes.shape({
    order_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    order_recid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    date_time: PropTypes.string,
    date: PropTypes.string,
    lead_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    emp_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    lead_name: PropTypes.string,
    mobile_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    address: PropTypes.string,
    district: PropTypes.string,
    state: PropTypes.string,
    country:PropTypes.string,
    courier: PropTypes.string,
    stick_type: PropTypes.string,
    order_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    approved_by: PropTypes.string,
    gst_number: PropTypes.string,
    hsn_codes: PropTypes.string,
    gst_percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    gst_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    payment_mode: PropTypes.string,
    product_list: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    payment_type: PropTypes.string,
    transaction_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    payment_date: PropTypes.string,
    courier_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pincode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    wallet: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    branch_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    brach_name: PropTypes.string,
    receipt_image_url: PropTypes.string,
    created_by: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onClose: PropTypes.func,
  type: PropTypes.string,
  option: PropTypes.string,
};

export default OrderDetailModal;

