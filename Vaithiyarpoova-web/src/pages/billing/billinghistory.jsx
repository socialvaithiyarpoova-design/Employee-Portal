import React, { useState, useEffect } from "react";
import "../../assets/styles/addtocard.css";
import axios from "axios";
import configModule from "../../../config.js";
import { useAuth } from '../../components/context/Authcontext.jsx';
import Pagination from "../../components/Pagination/index.jsx";
import { toast } from 'react-toastify';
import Billingview from './viewbill.jsx';

function Billinghistory() {
  const [billing, setBilling] = useState([]);
  const [filteredBilling, setFilteredBilling] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const config = configModule.config();
  const { user } = useAuth();
  const userId = user?.userId;

  const getallbilling = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${config.apiBaseUrl}getallbilling`, {
        user_id: userId  
      });
      const result = response.data;
      
      if (response.status === 200) {
        setBilling(result.billing || []);
        setFilteredBilling(result.billing || []);
      } else {
        toast.error("Failed to fetch billing list: " + result.message);
      }
    } catch (error) {
      toast.error("Error fetching billing: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getallbilling();
    }
  }, [userId]);

  // Search functionality
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    const filtered = billing.filter(bill => 
      bill.order_id?.toLowerCase().includes(query) ||
      bill.lead_name?.toLowerCase().includes(query) ||
      bill.mobile?.toLowerCase().includes(query)
    );
    
    setFilteredBilling(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBilling.slice(indexOfFirstItem, indexOfLastItem);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle View Click
  const handleViewClick = async (bill) => {
    try {
      setLoading(true);
      const response = await axios.post(`${config.apiBaseUrl}getBillingDetails`, {
        billing_recid: bill.billing_recid,
      });
       
      if (response.status === 200) {
        const detailData = response.data.data;
        setSelectedItemData(detailData);
        setShowBillingModal(true);
      } else {
        toast.error("Failed to fetch details");
      }
    } catch (error) {
      console.error("Error fetching billing details:", error);
      toast.error("Error loading details: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="common-body-st">
      <div className="header-cart-st" style={{padding:'16px'}}>
        <div>
          <p className="mb-0 fw-medium">History</p>          
        </div>
        <div className="rightcorn-ts-st">
          <div className="display-flex gap-2">
            <div>
              <input
                type="text"
                placeholder="Search by Order, Name, Mobile"
                className="search-input"
                style={{ padding: "7px 28px 7px 12px" }}
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="">
              <button 
                type="button" 
                className="btn-proceed-st" 
                style={{padding:'7px 25px'}}
                onClick={getallbilling}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>        
        </div>
      </div>

      <div className="billing-history-st" style={{padding:'0px 16px 16px 16px', height:'calc(100% - 72px)'}}>
        <div className='h-100 w-100 pt-2 pb-0'>
          <div className='table-common-st'>
            <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
              <div className='brcommon-col-st w-10'>S.No</div>
              <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>Bill NO</div>
              <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-20'>Client Name</div>
              <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-20'>Mobile No</div>
              <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>Order Value</div>
              <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>Date</div>
              <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>View</div> 
            </div>

            <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
              {loading ? (
                <div className='tb-nodata-row-st display-flex'>Loading...</div>
              ) : currentItems.length === 0 ? (
                <div className='tb-nodata-row-st display-flex'>No Billing found.</div>
              ) : (
                currentItems.map((bill, index) => (
                  <div className='display-flex br-rowst' key={bill.billing_recid}>
                    <div className='brcommon-col-st w-10'>
                      {indexOfFirstItem + index + 1}
                    </div>
                    <span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-10'>
                      {bill.order_id}
                    </div>
                    <span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-20'>
                      {bill.lead_name}
                    </div>
                    <span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-20'>
                      {bill.mobile}
                    </div>
                    <span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-15'>
                      ₹ {parseFloat(bill.amount_to_pay).toFixed(2)}
                    </div>
                    <span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-15'>
                      {formatDate(bill.created_at)}
                    </div>
                    <span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-10'>
                      <button 
                        className="btn btn-sm"
                        onClick={() => handleViewClick(bill)}
                        disabled={loading}
                      >
                        View
                      </button>
                    </div>                                           
                  </div>
                ))
              )}
            </div>
          </div>

          <div className='footer-tab-st'>
            <label htmlFor="itemsPerPage" className="me-2">
              Results per page{" "}
              <select
                id="itemsPerPage"
                className="row-per-page-select"
                style={{ width: "60px" }}
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </label>
            
            <Pagination
              count={filteredBilling.length}
              page={currentPage}
              pageSize={itemsPerPage}
              onChange={(pageNo) => setCurrentPage(pageNo)}
            />
          </div>
        </div>
      </div>

      {showBillingModal && (
        <Billingview 
          onClose={() => setShowBillingModal(false)}
          data={selectedItemData}              
        />
      )}
    </div>
  );
}

export default Billinghistory;