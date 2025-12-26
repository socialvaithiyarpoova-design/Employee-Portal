import React  from 'react';
import '../../assets/styles/ordersummary.css';
import PropTypes from 'prop-types';

const OrderSummaryPopup = ({ order, onClose }) => {

    const parsedProductList = React.useMemo(() => {
    if (!order?.product_list) return [];
    if (Array.isArray(order.product_list)) return order.product_list;
    try {
        return JSON.parse(order.product_list);
    } catch {
        return [];
    }
}, [order?.product_list]);


    return (
        <div className="ordersum-overlay">
            <div className="ordersum-popup ">
              <div className='' style={{height:'calc(100% - 60px)',padding:' 5px 20px',overflow:'auto'}}>
                <div className='d-flex justify-content-end' style={{alignItems:"center"}}>
                   <button   style={{fontSize:'30px',fontWeight:'700px'}} onClick={onClose}>×</button>    
                   </div>        
                <div className="ordersum-grid">
                    {/* Left Column */}
                    <div className="ordersum-col ordersum-left-print">
                        <h4>Order Details</h4>
                        <div className="row-item-cm">
                         <span className="label-cm-o">Order ID</span>
                          <span className="value-cm-o">{order?.order_id}</span>
                        </div>
                        <div className="row-item-cm">
                         <span className="label-cm-o">Order date</span>
                          <span className="value-cm-o">{(order?.created_at
                                ? new Date(order.created_at).toISOString().slice(0, 19).replace("T", " - ")
                                : "")}</span>
                        </div>
                             <div className="row-item-cm">
                            <span className="label-cm-o">Handeled by</span>
                            <span className="value-cm-o">{order?.emp_id + " - " + order?.name}</span>
                        </div>
                        

                        <h4>Client Details</h4>
                        <div className="row-item-cm">
                            <span className="label-cm-o">Client ID</span>
                            <span className="value-cm-o">{order?.lead_id}</span>
                        </div>
                          <div className="row-item-cm">
                            <span className="label-cm-o">Name</span>
                            <span className="value-cm-o">{order?.order_name}</span>
                        </div>
                        <div className="row-item-cm">
                            <span className="label-cm-o">Mobile</span>
                            <span className="value-cm-o">{order?.mobile_number}</span>
                        </div>

                        <h4>Delivery Details</h4>
                        <div className="row-item-cm">
                            <span className="label-cm-o">Address:</span>
                            <span className="value-cm-o">{order?.address  || '--'}</span>
                            </div>

                            <div className="row-item-cm">
                            <span className="label-cm-o">District:</span>
                            <span className="value-cm-o">{order?.district  || '--'}</span>
                            </div>

                            <div className="row-item-cm">
                            <span className="label-cm-o">State:</span>
                            <span className="value-cm-o">{order?.state  || '--'}</span>
                            </div>
                               <div className="row-item-cm">
                            <span className="label-cm-o">country:</span>
                            <span className="value-cm-o">{order?.country  || '--'}</span>
                            </div>
                            <div className="row-item-cm">
                            <span className="label-cm-o">Courier:</span>
                            <span className="value-cm-o">{order?.courier  || '--' }</span>
                            </div>

                            <div className="row-item-cm">
                            <span className="label-cm-o">Pin code:</span>
                            <span className="value-cm-o">{order?.pincode || '--' }</span>
                            </div>

                        <h4>Package Details</h4>
                          <div className="row-item-cm">
                            <span className="label-cm-o">Type:</span>
                            <span className="value-cm-o">{order?.stick_type}</span>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="ordersum-col">
                        <h4>Product Details</h4>
                       {parsedProductList.length > 0 && (
                            parsedProductList.map((item) => (
                                <div key={item.id} className="row-item-cm">
                                    <span className="label-cm-o ">
                                        {item.id} - {item.name}
                                    </span>
                                    <span className="value-cm-o">
                                        {item.qty || 1} - ₹{item.price || 0} * {item.qty || 1}
                                    </span>
                                </div>
                            ))
                        )}

                        
                        <h4>Payment Details</h4>
                         <div className="row-item-cm">
                            <span className="label-cm-o">Order value:</span>
                            <span className="value-cm-o">₹{order?.order_value}</span>
                            </div>

                            <div className="row-item-cm">
                            <span className="label-cm-o">Discount:</span>
                            <span className="value-cm-o">₹{order?.discount}</span>
                            </div>

                            <div className="row-item-cm">
                            <span className="label-cm-o">Approved by:</span>
                            <span className="value-cm-o">{order?.approved_by || '---'}</span>
                            </div>
                            <div className="row-item-cm">
                            <span className="label-cm-o">Courier charge:</span>
                            <span className="value-cm-o">₹{order?.courier_amount || '--'}</span>
                            </div>
                            <div className="row-item-cm">
                            <span className="label-cm-o">GST No:</span>
                            <span className="value-cm-o">{order?.gst_number|| '--'}</span>
                            </div>

                            <div className="row-item-cm">
                            <span className="label-cm-o">HSN:</span>
                            <span className="value-cm-o">{order?.hsn_codes || '--'}</span>
                            </div>

                            <div className="row-item-cm">
                            <span className="label-cm-o">GST ({(order?.gst_percentage || 0) * 100 || '0'}%):</span>
                            <span className="value-cm-o">₹{order?.gst_amount}</span>
                            </div>
                              

                          {order?.wallet && parseFloat(order.wallet) > 0 && (
                            <div className="row-item-cm">
                                <span className="label-cm-o">Wallet used:</span>
                                <span className="value-cm-o">₹{order?.wallet}</span>
                            </div>
                            )}        
                           
                        <div className="row-item-cm">
                            <span className="label-cm-o">Payment Mode </span>
                            <span className="value-cm-o">{(order?.payment_type) || (order?.payment_mode) || '---'}</span>
                        </div>

                        <div className="row-item-cm">
                            <span className="label-cm-o">Total value:</span>
                            <span className="value-cm-o fw-bold">₹{order?.total_value}</span>
                        </div>
                        <div className="row-item-cm">
                            <span className="label-cm-o">Reason:</span>
                            <span className="value-cm-o ">{order?.reason || '----'}</span>
                        </div>
                    </div>
                </div>
              </div>
                <div className='' style={{height:'60px'}}>
                    <div className='d-flex  justify-content-end  ' style={{alignItems:"center",padding:' 10px 15px'}}>
                      <button className="ordersum-print" onClick={() => window.print()}>Print</button>
                </div>
                </div>
            </div>
        </div>
    );
};

OrderSummaryPopup.propTypes = {
    order: PropTypes.shape({
        order_id: PropTypes.string,
        created_at: PropTypes.string,
        emp_id: PropTypes.string,
        name: PropTypes.string,
        lead_id: PropTypes.string,
        order_name: PropTypes.string,
        mobile_number: PropTypes.string,
        address: PropTypes.string,
        district: PropTypes.string,
        state: PropTypes.string,
        courier: PropTypes.string,
        pincode: PropTypes.string,
        stick_type: PropTypes.string,
        product_list: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array
        ]),
        order_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        approved_by: PropTypes.string,
        courier_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        gst_number: PropTypes.string,
        hsn_codes: PropTypes.string,
        gst_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        gst_percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        wallet: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        payment_type: PropTypes.string,
        payment_mode: PropTypes.string,
        total_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    onClose: PropTypes.func.isRequired,
};

OrderSummaryPopup.defaultProps = {
    order: null,
};

export default OrderSummaryPopup;
