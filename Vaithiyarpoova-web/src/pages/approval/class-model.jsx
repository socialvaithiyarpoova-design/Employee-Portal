import React, { useState} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import configModule from "../../../config.js";
import './approvals.css';
import PropTypes from 'prop-types';

function ClassModel({ onClose, data, orderDetails,isHistoryClicked }) {
  const [loadingap, setLoadingap] = useState(false);
  const [loadingrj, setLoadingrj] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  const classDetails = data[0];
  const config = configModule.config();

  const handleApprove = async () => {

    setLoadingap(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}approveclass`, {
        id: classDetails?.class_register_id,
        status: "Approved",
      });

      if (response.status === 200) {
        toast.success("Class approved successfully!");
        onClose();
        orderDetails();
      }
    } catch (error) {
      toast.error(
        "Failed to approve class: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoadingap(false);
    }
  };

  const handleReject = async () => {
    setLoadingrj(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}rejectclass`, {
        id: classDetails?.class_register_id,
        status: "Decline",
        reason: reason,
        created_by:classDetails?.created_by,
        reg_no:classDetails?.reg_no,
      });

      if (response.status === 200) {
        toast.success("Class reg rejected successfully!");
        onClose();
        orderDetails();
      }
    } catch (error) {
      toast.error(
        "Failed to reject billing: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoadingrj(false);
       setShowReason(false);
    }
  };

   

  return (
    <div className="approvel-modal-overlay">
      <div className="class-modal-container">
        <div className="billing-modal-container-head">
          <button className="fw-500" style={{ fontSize: "22px" }}onClick={onClose}> × </button>
        </div>
        <div className="billing-modal-container-body">
             <div className="">
          <div className="order-modal-section">
            <div className="order-section mb-4">
            <h6 className="fw-bold">Class Details</h6>
           <div className="row-item-cm">
              <span className="label-cm-o">CLass Reg ID :</span>
              <span className="value-cm-o">{classDetails?.reg_no}</span>
            </div>
            <div className="row-item-cm">
              <span className="label-cm-o">CLass Reg date :</span>
              <span className="value-cm-o">
                    {classDetails?.created_at
                      ? new Date(classDetails.created_at).toISOString().slice(0, 19).replace("T", " - ")
                      : ""}
              </span>
            </div>
            
             <div className="row-item-cm">
                <span className="label-cm-o">Handel_by :</span>
                <span className="value-cm-o">{classDetails?.emp_name }</span>
               </div>
             
             
               <div className="row-item-cm">
                <span className="label-cm-o">Branch :</span>
                <span className="value-cm-o">{classDetails?.branch_id || 'Head office '}</span>
               </div>
             
          </div>
          <div className="order-section mb-4">
            <h6 className="fw-bold">Client Details</h6>
            
            <div className="row-item-cm">
              <span className="label-cm-o">Client ID:</span>
              <span className="value-cm-o">{classDetails?.lead_id}</span>
            </div>
            

            <div className="row-item-cm">
              <span className="label-cm-o">Name:</span>
              <span className="value-cm-o">{classDetails?.lead_name}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">Mobile:</span>
              <span className="value-cm-o">{classDetails?.mobile_number}</span>
            </div>
          </div>                              
      
      
            <h6 className='fw-bold'>Payment Details</h6>
           <div className="row-item-cm">
              <span className="label-cm-o">CLass Reg value:</span>
              <span className="value-cm-o">₹{classDetails?.price_value}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">Discount:</span>
              <span className="value-cm-o">₹{classDetails?.discount}</span>
            </div>
{/* 
            <div className="row-item-cm">
              <span className="label-cm-o">Approved by:</span>
              <span className="value-cm-o">{classDetails?.approbved_by || 'Admin'}</span>
            </div> */}

            <div className="row-item-cm">
              <span className="label-cm-o">GST No:</span>
              <span className="value-cm-o">{classDetails?.gst_number || '--'}</span>
            </div>

            <div className="row-item-cm">
              <span className="label-cm-o">HSN:</span>
              <span className="value-cm-o">{classDetails?.hsn_codes || '--'}</span>
            </div>
          
            <div className="row-item-cm">
              <span className="label-cm-o">GST ({(classDetails?.gst_percentage || 0) * 100 || '0'}% ):</span>
              <span className="value-cm-o">{classDetails?.gst_amount || '--'}</span>
            </div>
                              
            <div className="row-item-cm">
            <span className="label-cm-o">Transaction ID:</span>
            <span className="value-cm-o">{classDetails?.transaction_id || '---'}</span>
          </div>

           <div className="row-item-cm">
            <span className="label-cm-o">Payment Mode </span>
            <span className="value-cm-o">{(classDetails?.payment_type) || (classDetails?.payment_mode) || '---'}</span>
          </div>

          <div className="row-item-cm">
            <span className="label-cm-o">Total value:</span>
            <span className="value-cm-o fw-bold">₹{classDetails?.amount_to_pay}</span>
          </div>

          <div className="row-item-cm">
            <span className="label-cm-o">Date:</span>
            <span className="value-cm-o">
              {classDetails?.payment_date}
            </span>
          </div>
          <div className="row-item-cm">
            <span className="label-cm-o">Receipt:</span>
            <span className="value-cm-o">
             {classDetails?.receipt_path && (   
            <img src={classDetails.receipt_path}  onClick={() => window.open(classDetails.receipt_path, "_blank")} alt="Payment Receipt" className="order-modal-receipt" />
             )}
            </span>
          </div>
           
          </div>
      
        </div>
        </div>
        {!isHistoryClicked && (
        <div className="billing-model-footer">
          <div className="gap-2 d-flex">
            <button className="approvel-btn-decline" disabled={loadingrj}  onClick={() => setShowReason(true)}>Decline</button>
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
ClassModel.propTypes = {
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object,
    orderDetails: PropTypes.func.isRequired,   
    isHistoryClicked: PropTypes.func.isRequired,   
}


export default ClassModel;
