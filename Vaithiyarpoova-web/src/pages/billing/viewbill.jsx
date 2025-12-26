import React from "react";
import PropTypes from 'prop-types';

function Billingview({ onClose, data,  }) {

  const billingDetails = {
    ...data[0],
    product_list: data[0]?.product_list ? JSON.parse(data[0].product_list) : [],
  };
 

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
              {billingDetails?.date? formatDate(billingDetails?.date) : ""}
            </span>
          </div>
         
           
          </div>
      
        </div>
        </div>
       

      </div>
    </div>
  );
}
Billingview.propTypes = {
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object,
    orderDetails: PropTypes.func.isRequired,   
}

export default Billingview;
