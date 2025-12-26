import React, { useState, useEffect } from 'react';
import configModule from '../../../config.js';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../components/context/Authcontext.jsx';
import CommonSelect from '../../components/common-select.jsx';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import SvgContent from '../../components/svgcontent.jsx';
import { PropagateLoader } from 'react-spinners';
import '../../assets/styles/orders.css';
import PropTypes from 'prop-types';
function CreditapprovalModal({ order, onClose, type }) {
  if (!order) return null;
  const { user } = useAuth();
 
  const [paymentType, setPaymentType] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [dateTime, setDateTime] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [needLoading, setNeedLoading] = useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(null);
  const config = configModule.config();



  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose && onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const cleanOrder = {
    // Handle both Credits data structure and Collections data structure
    order_id: order?.order_id || '',
    hangdel_by_id: order?.branch_name || '',
    created_at: order?.created_at || '',
    handel_by_id:order?.emp_id || '',
    handel_by_name:order?.name || '',
    date_time: order?.date_time || '',
    lead_id: order?.lead_id || order?.leads_id || '',
    lead_name: order?.lead_name || order?.flead_name || '',
    shop_keeper: order?.shop_keeper || order?.shop_keeper || '',
    mobile_number: order?.mobile_number || '',
    address: order?.address || '',
    district: order?.district || '',
    state: order?.state || '',
    courier: order?.courier || '',
    stick_type: order?.stick_type || '',
    order_value: order?.order_value || '',
    discount: order?.discount || '',
    approved_by: order?.approved_by || '',
    courier_amount:order?.courier_amount|| 0,
    gst_no: order?.gst_number|| '',
    hsn: order?.hsn_codes|| '',
    gst_amount:order?.gst_amount || '',
    gst_percentage: order?.gst_percentage || '',
    total_value: order?.total_value || '',
    payment_mode: order?.payment_mode || '',
    transaction_id: order?.transaction_id || '',
    payment_date: order?.payment_date || '',
    image_url: order?.image_url || '',
    product_list: JSON.parse(order?.product_list) || [],
    paid_status: order?.paid_status || '',
    account_status: order?.account_status || '',
    amount_to_pay: order?.amount_to_pay || '',
  };

  const handleClear = () => {
    setPaymentType('');
    setAmount('');
    setPaymentMode('');
    setTransactionId('');
    setDateTime(null);
    setImageFile(null);
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    const pad = (n) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };


  const handleSave = async () => {
    if ( !paymentMode || !paymentType) {
      toast.error("Please fill all required fields");
      return;
    }
    if (paymentType?.torget?.value === "Part") {

  if (!amount) {
    toast.error("Amount is required for part payment");
    return;
  }

  if (!nextFollowUpDate) {
    toast.error("Next collection date is required for part payment");
    return;
  }
}

    const formData = new FormData();
    formData.append("order_recid", order?.order_recid);
    formData.append("payment_type", paymentType?.target?.value);
    formData.append("amount", amount);
    formData.append("transaction_id", transactionId);
    formData.append("dateTime",nextFollowUpDate ? formatDateTime(nextFollowUpDate) : null) ;
    formData.append("payment_mode", paymentMode?.target?.value);
    formData.append("collection_date",  dateTime ? formatDateTime(dateTime) : null);
    formData.append("folder", "collection_payment");

    // Append image if present
    if (imageFile) {
      formData.append("receipt_image_url", imageFile);
    }

    setNeedLoading(true);

    try {
      const res = await axios.post(`${config.apiBaseUrl}updateCollection`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.status === 200) {
        toast.success("Collected successfully");
        setTimeout(() => {
          setNeedLoading(false);
          onClose();
        }, 2000);
      } else {
        toast.error("Failed to place order");
        setNeedLoading(false);
      }
    } catch (err) {
      toast.error("Error while placing order", err?.response?.data?.message || err.message);
      setNeedLoading(false);
    }
  };

  const handleSaveForCredits = async (sAction) => {

    setNeedLoading(true);

    try {
      const res = await axios.post(`${config.apiBaseUrl}updateCreditsData`, {
        order_recid: order?.order_recid || -1,
        paid_status: order?.paid_status || '',
        status: sAction || ''
      });

      if (res.status === 200) {
        toast.success("Status updated successfully");
        setTimeout(() => {
          setNeedLoading(false);
          onClose();
        }, 2000);
      } else {
        toast.error("Failed to place order");
        setNeedLoading(false);
      }
    } catch (err) {
      toast.error("Error while placing order", err?.response?.data?.message || err.message);
      setNeedLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);   
    }
  };

  const paymentTypeOptions = [
    { label: "Part", value: "Part" },
    { label: "Full", value: "Full" }
  ];

  const paymentModeOptions = [
    { label: "Online", value: "Online" },
    { label: "Cash", value: "Cash" },
    { label: "Cheque", value: "Cheque" }
  ];

  return (
    <div className="order-modal-overlay">
      {needLoading && (
        <div className='loading-container w-100 h-100'>
          <PropagateLoader
            height="100"
            width="100"
            color="#0B9346"
            radius="10"
          />
        </div>
      )}
      <div className="order-modal-container-ap">
        <div className='model-header-orer-ap'>
         <h5 className='mb-0 fw-600 '>Order Summary</h5>
         <button className="fw-500" style={{fontSize:"25px"}} onClick={onClose}>×</button>
        </div>
        
        <div className="order-modal-content-ap">
          <div className="order-modal-grid">
            {/* Left Column */}
            <div className="order-modal-left">
            
              <div className="order-section">
                <h6 className="fw-bold" >Order Details</h6>
               <div className="row-item-cm ">
                <span className="label-cm-o">Order ID</span>
                <span className="value-cm-o">{cleanOrder?.order_id}</span>
              </div>
                <div className="row-item-cm">
                <span className="label-cm-o">Order date</span>
                <span className="value-cm-o">
                    {cleanOrder?.created_at
                      ? new Date(cleanOrder.created_at).toISOString().slice(0, 19).replace("T", " - ")
                      : ""}
                  </span>
               </div>
                <div className="row-item-cm">
                <span className="label-cm-o">Handel_by</span>
                <span className="value-cm-o">{cleanOrder?.handel_by_id + " - " + cleanOrder?.handel_by_name}</span>
               </div>
               <div className="row-item-cm">
                <span className="label-cm-o">Branch</span>
                <span className="value-cm-o">{cleanOrder?.hangdel_by_id || 'Head office '}</span>
               </div>
              </div>
          
              <div className="order-section">
                <h6 className="fw-bold">Client Details</h6>
                <div className="row-item-cm">
                  <span className="label-cm-o">Shop ID</span>
                  <span className="value-cm-o">{cleanOrder?.lead_id}</span>
                </div>
                <div className="row-item-cm">
                  <span className="label-cm-o">Shop name</span>
                  <span className="value-cm-o">{cleanOrder?.lead_name}</span>
                </div>
                <div className="row-item-cm">
                  <span className="label-cm-o">Shop keeper</span>
                  <span className="value-cm-o">{cleanOrder?.shop_keeper}</span>
                </div>
                <div className="row-item-cm">
                  <span className="label-cm-o">Mobile</span>
                  <span className="value-cm-o">{cleanOrder?.mobile_number}</span>
                </div>
              </div>

              <div className="order-section">
              <h6 className="fw-bold">Delivery Details</h6>

              <div className="row-item-cm">
                <span className="label-cm-o">Address</span>
                <span className="value-cm-o">{cleanOrder?.address || '--'}</span>
              </div>
              <div className="row-item-cm">
                <span className="label-cm-o">District</span>
                <span className="value-cm-o">{cleanOrder?.district || '--'}</span>
              </div>
              <div className="row-item-cm">
                <span className="label-cm-o">State</span>
                <span className="value-cm-o">{cleanOrder?.state || '--'}</span>
              </div>
            </div>


             <div className="order-section">
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


              <div className="order-section">
                <h6 className="fw-bold" >Package Details</h6>
               <div className="row-item-cm">
                <span className="label-cm-o">Package type:</span>
                <span className="value-cm-o">{cleanOrder?.stick_type}</span>
              </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="order-modal-right">
              <div className="order-section">
                <h6 className="fw-bold" >Payment Details</h6>
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
                  <span className="value-cm-o">{cleanOrder?.approved_by}</span>
                </div>
                <div className="row-item-cm">
                  <span className="label-cm-o">Courier charge:</span>
                  <span className="value-cm-o">₹{cleanOrder?.courier_amount || 0}</span>
                </div>
                <div className="row-item-cm">
                  <span className="label-cm-o">GST:</span>
                  <span className="value-cm-o">{cleanOrder?.gst_no || '--'}</span>
                </div>
                <div className="row-item-cm">
                  <span className="label-cm-o">HSN:</span>
                  <span className="value-cm-o">{cleanOrder?.hsn || '--'}</span>
                </div>
                <div className="row-item-cm">
                  <span className="label-cm-o">GST ({(cleanOrder?.gst_percentage || 0) * 100}%):</span>
                  <span className="value-cm-o">₹{cleanOrder?.gst_amount || 0}</span>
                </div>
                <div className="row-item-cm">
                  <span className="label-cm-o">Payment status:</span>
                  <span className="value-cm-o"><strong>{cleanOrder?.paid_status || ''}</strong></span>
                </div>
                <div className="row-item-cm">
                  <span className="label-cm-o">Payment type:</span>
                  <span className="value-cm-o"><strong>Credit</strong></span>
                </div>
                <div className="row-item-cm">
                  <span className="label-cm-o">Total value:</span>
                  <span className="value-cm-o"><strong>₹{cleanOrder?.amount_to_pay}</strong></span>
                </div>
                <div className="row-item-cm">
                  <span className="label-cm-o">Collection date:</span>
                  <span className="value-cm-o"><strong>{formatDate(cleanOrder?.date_time)}</strong></span>
                </div>
                {type !== "collections" && cleanOrder?.paid_status !== "Pending" && ((cleanOrder?.paid_status === "Part payment" && cleanOrder?.account_status !== "Partial") || (cleanOrder?.paid_status === "Paid" && cleanOrder?.account_status !== "Approved")) &&
                  (
                    <>
                      <p>Receipt:</p>
                      <img src={cleanOrder?.image_url || ''} alt='image' />
                    </>
                  )}
              </div>

              {type === "collections" && (
                <>
                  <div className="order-section">
                    <h6 className="fw-bold" >Payment</h6>
                    <div className="form-group">
                      <label htmlFor=''>Payment type:</label>
                      <CommonSelect
                        options={paymentTypeOptions}
                        name="paymentTypeOptions"
                        value={paymentType}
                        onChange={setPaymentType}
                        placeholder="Select payment type"
                      />
                    </div>

                    {paymentType?.target?.value === 'Part' && (
                      <div className="conditional-field">
                        <div className="form-group">
                          <label htmlFor='text'>
                            Enter amount:                             
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"                         
                            min="1"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor='followup-date'>Next Follow-up/Collection Date:</label>
                          <DatePicker
                            selected={nextFollowUpDate}
                            minDate={new Date()}
                            onChange={(date) => setNextFollowUpDate(date)}
                            placeholderText="Select follow-up date"
                            className="form-control"
                            dateFormat="dd-MM-yyyy"
                          />
                        </div>
                      </div>
                    )}

                      {paymentType?.target?.value === 'Full' && (
                        <div className="form-group">
                          <label htmlFor='followup-date'> Full payment Collection Date:</label>
                          <DatePicker
                            selected={nextFollowUpDate}
                            minDate={new Date()}
                            onChange={(date) => setNextFollowUpDate(date)}
                            placeholderText="Select follow-up date"
                            className="form-control"
                            dateFormat="dd-MM-yyyy"
                          />
                        </div>
                      )}


                    <div className="form-group">
                      <label htmlFor='Payment Mode'>Payment Mode:</label>
                      <CommonSelect
                        options={paymentModeOptions}
                        name="paymentModeOptions"
                        value={paymentMode}
                        onChange={setPaymentMode}
                        placeholder="Select payment mode"
                      />
                    </div>
                  </div>

                    {paymentMode?.target?.value === 'Online' && (
                       <>
                       <div className="order-section">
                        <h6 className="fw-bold" >Upload receipt</h6>
                        <p className="upload-note">Collect screenshot from client and upload to place the order</p>
                        <label className="upload-box">
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                          <SvgContent svg_name="btn_upload" stroke="#0B622F" style={{ zIndex: "999" }} />
                          <span style={{ color: "#121212", zIndex: "0" }}>Upload image</span>
                        </label>
                        {imageFile && <p className="file-name">Selected: {imageFile.name}</p>}
                  </div>

                  <div className="order-section">
                    <div className="form-group">
                      <label htmlFor='text'>Transaction ID:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter transaction ID"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor='date'>Date and time:</label>
                      <DatePicker
                        selected={dateTime}
                        onChange={(date) => setDateTime(date)}
                        maxDate={new Date()} 
                        minDate={new Date(new Date().setDate(new Date().getDate() - 2))}
                        showTimeSelect
                        dateFormat="dd-MM-yyyy h:mm aa"
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        placeholderText="DD/MM/YYYY HH:MM"
                        className="form-control-st "
                        popperPlacement="bottom"
                      />
                    </div>
                  </div>
                       </>
                   )}

                  {(paymentMode?.target?.value === 'Cash' || paymentMode?.target?.value === 'Cheque') && (
                  <>
                    <div className="order-section">
                      <h6 className="fw-bold">Upload receipt</h6>
                      <p className="upload-note">Collect screenshot from client and upload to place the order</p>
                      <label className="upload-box">
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <SvgContent svg_name="btn_upload" stroke="#0B622F" style={{ zIndex: "999" }} />
                        <span style={{ color: "#121212", zIndex: "0" }}>Upload image</span>
                      </label>
                      {imageFile && <p className="file-name">Selected: {imageFile.name}</p>}
                    </div>
                  </>
                )}
            
                </>
              )}

            </div>
          </div>

     
        </div>
        <div className='order-model-footer-ap'>
           {type !== "collections" && cleanOrder?.paid_status !== "Pending" && ((cleanOrder?.paid_status === "Part payment" && cleanOrder?.account_status !== "Partial") || (cleanOrder?.paid_status === "Paid" && cleanOrder?.account_status !== "Approved")) && (
            <div className="order-modal-actions-ap">
              <button className="btn-clear" onClick={() => handleSaveForCredits("Decline")}>Decline</button>
              <button className="btn-save" onClick={() => handleSaveForCredits("Approved")}>Approve</button>
            </div>
          )}
          {type === "collections" && (
            <div className="order-modal-actions-ap">
              <button className="btn-clear" onClick={handleClear}>Clear</button>
              <button className="btn-save" onClick={handleSave}>Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

CreditapprovalModal.propTypes = {
  order: PropTypes.shape({
    order_recid: PropTypes.number,
    order_id: PropTypes.string,
    created_at: PropTypes.string,
    emp_id: PropTypes.string,
    name: PropTypes.string,
    date_time: PropTypes.string,
    lead_id: PropTypes.string,
    leads_id: PropTypes.string,
    lead_name: PropTypes.string,
    flead_name: PropTypes.string,
    shop_keeper: PropTypes.string,
    mobile_number: PropTypes.string,
    address: PropTypes.string,
    district: PropTypes.string,
    state: PropTypes.string,
    courier: PropTypes.string,
    stick_type: PropTypes.string,
    order_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    approved_by: PropTypes.string,
    courier_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    gst_number: PropTypes.string,
    hsn_codes: PropTypes.string,
    gst_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    gst_percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    payment_mode: PropTypes.string,
    transaction_id: PropTypes.string,
    payment_date: PropTypes.string,
    image_url: PropTypes.string,
    product_list: PropTypes.string,
    paid_status: PropTypes.string,
    account_status: PropTypes.string,
    product_id: PropTypes.string,
    branch_id: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  type: PropTypes.string,
};

CreditapprovalModal.defaultProps = {
  order: null,
  type: '',
};

export default CreditapprovalModal;
