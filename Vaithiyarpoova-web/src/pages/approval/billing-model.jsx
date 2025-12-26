import React, { useState} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import configModule from "../../../config.js";
import './approvals.css';
import PropTypes from 'prop-types';

function BillingModel({ onClose, data, orderDetails , isHistoryClicked }) {
  const [loadingap, setLoadingap] = useState(false);
  const [loadingrj, setLoadingrj] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");
  const billingDetails = {
    ...data[0],
    product_list: data[0]?.product_list ? JSON.parse(data[0].product_list) : [],
  };
  const config = configModule.config();

  const handleApprove = async () => {

    setLoadingap(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}approveBilling`, {
        billing_recid: billingDetails.billing_recid,
        status: "Approved",
        type: "billing",
      });

      if (response.status === 200) {
        toast.success("Billing approved successfully!");
        onClose();
        orderDetails();
      }
    } catch (error) {
      toast.error(
        "Failed to approve billing: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoadingap(false);
    }
  };

  // const handleReject = async () => {
  //   setLoadingrj(true);
  //   try {
  //     const response = await axios.post(`${config.apiBaseUrl}rejectBilling`, {
  //       billing_recid: billingDetails?.billing_recid,
  //       status: "Decline",
  //       reason: reason,
  //       created_by:billingDetails?.created_by,
  //       reg_no:billingDetails?.order_id,
  //     });

  //     if (response.status === 200) {
  //       toast.success("Billing rejected successfully!");
  //       onClose();
  //       orderDetails();
  //     }
  //   } catch (error) {
  //     toast.error(
  //       "Failed to reject billing: " +
  //         (error.response?.data?.message || error.message)
  //     );
  //   } finally {
  //     setLoadingrj(false);
  //   }
  // };

    const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };


  return (
    <div className="approvel-modal-overlay">
      <div className="billing-modal-container">
        <div className="billing-modal-container-head">
          <button className="fw-500" style={{ fontSize: "22px" }}onClick={onClose}> × </button>
        </div>
        <div className="billing-modal-container-body">
             <div className="order-modal-grid">
          <div className="order-modal-section">
            <div className="order-section mb-4">
            <h6 className="fw-bold">Billing Details</h6>
           <div className="row-item-cm">
              <span className="label-cm-o">Billing ID :</span>
              <span className="value-cm-o">{billingDetails?.order_id}</span>
            </div>
            <div className="row-item-cm">
              <span className="label-cm-o">Billing date :</span>
              <span className="value-cm-o">
                    {billingDetails?.created_at
                      ? new Date(billingDetails.created_at).toISOString().slice(0, 19).replace("T", " - ")
                      : ""}
              </span>
            </div>
            
             <div className="row-item-cm">
                <span className="label-cm-o">Handel_by :</span>
                <span className="value-cm-o">{billingDetails?.name }</span>
               </div>
             
             
               <div className="row-item-cm">
                <span className="label-cm-o">Branch :</span>
                <span className="value-cm-o">{billingDetails?.branch_id || 'Head office '}</span>
               </div>
             
          </div>
          <div className="order-section mb-4">
            <h6 className="fw-bold">Client Details</h6>
            

            <div className="row-item-cm">
              <span className="label-cm-o">Name:</span>
              <span className="value-cm-o">{billingDetails?.lead_name}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">Mobile:</span>
              <span className="value-cm-o">{billingDetails?.mobile}</span>
            </div>
          </div> 
           
          <div className="order-section mb-4">
            <h6 className="fw-bold">Product Details</h6>
               {billingDetails?.product_list.length > 0 && (
                billingDetails.product_list.map((item) => (
                    <div key={item.id} className="row-item-cm">
                    <span className="label-cm-o fw-semibold">
                        {item.id} - {item.name}
                    </span>
                    <span className="value-cm-o">
                        {item.qty || 1} - ₹{item.price || 0} * {item.qty || 1}
                    </span>
                    </div>
                ))
                )}


          </div>
         
          </div>
     
          <div className="order-modal-section">
            <h6 className='fw-bold'>Payment Details</h6>
           <div className="row-item-cm">
              <span className="label-cm-o">Billing value:</span>
              <span className="value-cm-o">₹{billingDetails?.order_value}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">Discount:</span>
              <span className="value-cm-o">₹{billingDetails?.discount}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">Approved by:</span>
              <span className="value-cm-o">{billingDetails?.approved_by}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">GST No:</span>
              <span className="value-cm-o">{billingDetails?.gst_number|| '--'}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">HSN:</span>
              <span className="value-cm-o">{billingDetails?.hsn_codes|| '--'}</span>
            </div>
           

            <div className="row-item-cm">
              <span className="label-cm-o">GST ({(billingDetails?.gst_percentage || 0) * 100 || '0'}% ):</span>
              <span className="value-cm-o">₹{billingDetails?.gst_amount}</span>
            </div>
                              
            <div className="row-item-cm">
            <span className="label-cm-o">Transaction ID:</span>
            <span className="value-cm-o">{billingDetails?.transaction_id || '---'}</span>
          </div>

           <div className="row-item-cm">
            <span className="label-cm-o">Payment Mode </span>
            <span className="value-cm-o">{(billingDetails?.payment_type) || (billingDetails?.payment_mode) || '---'}</span>
          </div>

          <div className="row-item-cm">
            <span className="label-cm-o">Total value:</span>
            <span className="value-cm-o fw-bold">₹{billingDetails?.total_value}</span>
          </div>

          <div className="row-item-cm">
            <span className="label-cm-o">Date:</span>
            <span className="value-cm-o">
              {billingDetails?.created_at? formatDate(billingDetails?.created_at) : ""}
            </span>
          </div>
          <div className="row-item-cm">
            <span className="label-cm-o">Receipt:</span>
            <span className="value-cm-o">
             {billingDetails?.receipt_path && (   
            <img src={billingDetails.receipt_path}  onClick={() => window.open(billingDetails.receipt_path, "_blank")} alt="Payment Receipt" className="order-modal-receipt" />
             )}
            </span>
          </div>
           
          </div>
      
        </div>
        </div>
        {!isHistoryClicked && (
        <div className="billing-model-footer">
          <div className="gap-2 d-flex">
            {/* <button className="approvel-btn-decline" disabled={loadingrj} onClick={() => setShowReason(true)}>Decline</button> */}
            <button className="approvel-btn-approve" disabled={loadingap}  onClick={() => handleApprove("Approved")}>Approve</button>
          </div>
        </div> 
        )}   

        {showReason && (
      <div className="reason-popup-overlay">
        <div className="reason-popup">
          <h6 className="fw-bold mb-2">Enter Rejection Reason</h6>

          <textarea
            className="reason-textarea"
            rows="5"
            maxLength={150}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Type your reason here (max 150 characters)..."
          />

          <div className="text-end mt-1" style={{ fontSize: "12px", color: "#666" }}>
            {reason.length}/150
          </div>

          <div className="d-flex gap-2 mt-3 justify-content-end">
            <button className="reason-cancel-btn" onClick={() => {
              setShowReason(false);
              setReason('');
            }}>
            Cancel
            </button>
            <button
              className="reason-submit-btn"
              onClick={handleReject}
              disabled={loadingrj || reason.trim().length === 0}
            >
              {loadingrj ? "Rejecting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    )}
   
      </div>
    </div>
  );
}
BillingModel.propTypes = {
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object,
    orderDetails: PropTypes.func.isRequired,   
}

export default BillingModel;
