import React, { useState, useRef, useEffect } from "react";
import "../assets/styles/filter-modal.css";
import CommonSelect from "../components/common-select.jsx";
import { useAuth } from '../components/context/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import configModule from '../../config.js';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';
import { FiCalendar } from 'react-icons/fi';
import PropTypes from 'prop-types';
import locationData from "../../src/components/districts.json";

const FilterSidebar = ({ onClose, onFilterData, selectedFilters }) => {
  const { user } = useAuth();
  const usertype_code = user?.user_typecode;
  const userId = user?.userId;
  const location = useLocation();
  const pathname = location?.pathname;
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");

  const [showPicker, setShowPicker] = useState(false);
  const [range, setRange] = useState(null); 
  const [tempRange, setTempRange] = useState(null); 
  const pickerRef = useRef(null);

  const isAdminOnUserProfile = pathname === "/user-profile";
  const isAdminOnLeadsPool = pathname === "/leads/pool";
  const isAdminOnEmployeeList = pathname === "/employee/list";
  const isAdminOnEmployeeAttendance = pathname === "/employee/attendance";
  const isAdminOnEmployeePermission = pathname === "/employee/leave-permissions";
  const isEmployeeLeavePermission = pathname === "/employee/leave-permission";
  const isBranchPermission = pathname === "/branches";
  const isInventory = pathname === "/inventory";
  const isAccounts = pathname === "/accounts" ||  pathname === "/randd" ;
  const isPurchase = pathname === "/purchase";
  const isClients = pathname === "/clients";
  const restrictedBranchEmp = isClients && ["TCL", "TSL", "FS", "FOI", "VA"].includes(usertype_code);
  const isCreativeService = pathname === "/creative-service";
  const isProductFilter = pathname === "/products";
  const isTrackingFilter = pathname === "/tracking";
  const isCollectionPage = pathname === "/collections";
  const isOrders = pathname === "/orders";
  const isOrdersList = pathname === "/orders-list";
  const isExpensesApproved = pathname === "/accounts/expenses";
  const isPayroll = pathname === "/payroll";
  const isCredits = pathname === "/credits";
  const isStocks = pathname === "/stocks";
  const isReports = pathname === "/reports";
  const approvals = pathname === "/approvals";
  const isTodo = pathname === "/todo";

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [branchList, setBranchList] = useState('');
  const [empList, setEmpList] = useState('');
  const [category, setCategory] = useState('');
  const [formFactor, setFormFactor] = useState('');
  const [disposition, setDisposition] = useState('');
  const [status, setStatus] = useState('');
  const [premium, setPremium] = useState('');
  const config = configModule.config();
  const [branchOption, setBranchOption] = useState([]);
  const [empOption, setEmpOption] = useState([]);
  const [categoryOption, setCategoryOption] = useState([]);
  const [formOption, setFormOption] = useState([]);
  const [type, setType] = useState('');
  const [type2, setType2] = useState('');


const countryOptions = Object.keys(locationData).map((c) => ({
      label: c,
      value: c,
    }));

    const stateOptions =
      country && locationData[country]
        ? Object.keys(locationData[country]).map((s) => ({
            label: s,
            value: s,
          }))
        : [];
    const districtOptions =
      country && state
        ? locationData[country][state].map((d) => ({
            label: d,
            value: d,
          }))
        : [];

const handleCountryChange = (valueOrEvent) => {
  if (valueOrEvent?.target) {
    setCountry(valueOrEvent.target.value);
  } else {
    setCountry(valueOrEvent); 
  }
  setState("");
  setDistrict("");
};

const handleStateChange = (valueOrEvent) => {
  if (valueOrEvent?.target) {
    setState(valueOrEvent.target.value);
  } else {
    setState(valueOrEvent);
  }
  setDistrict("");
};

const handleDistrictChange = (valueOrEvent) => {
  if (valueOrEvent?.target) {
    setDistrict(valueOrEvent.target.value);
  } else {
    setDistrict(valueOrEvent);
  }
};



  const DispositionOption = [
    { label: "Interested", value: "Interested" },
    { label: "Call not response", value: "Call not response" },
    { label: "Follow up", value: "Follow up" },
    { label: "Call back", value: "Call back" },
    { label: "Not interested", value: "Not interested" }
  ];

    const TypeOption = [
    { label: "Class", value: "class" },
    { label: "Wallet", value: "wallet" },
    { label: "Consulting", value: "consulting" },
    { label: "Billing", value: "billing" }
  ];

 const TypeOption2 = 
    pathname === "/creative-service" ? [
    { label: "Youtube", value: "youtube" },
    { label: "Facebook", value: "facebook" },
    { label: "Instagram", value: "instagram" },
    { label: "Whatsapp", value: "whatsapp" },
    { label: "others", value: "others"}
  ]: 
    pathname === "/employee/leave-permission" ?
    [
      { label: "Leave", value: "Leave" },
      { label: "Permission", value: "Permission" },
    ] : [];


const StatusOption =
  pathname === "/employee/attendance" ? [
    { label: "Present", value: "Present" },
    { label: "Absent", value: "Absent" },
    { label: "Leave", value: "Leave" },
    { label: "Permission", value: "Permission" }
  ] : (
    pathname === "/employee/attendance" ? [
      { label: "Approved", value: "Approved" },
      { label: "Decline", value: "Decline" }
    ] : (
      pathname === "/purchase" ? [
        { label: "Pending", value: "Pending" },
        { label: "Approved", value: "Approved" },
        { label: "Decline", value: "Decline" },
        { label: "Dispatched", value: "Dispatched" },
        { label: "In transit", value: "In transit" }
      ] : (
        pathname === "/orders-list" ? [
          { label: "Pending", value: "Approved" },
          { label: "Dispatched", value: "Dispatched" },
          { label: "In transit", value: "In transit" }
        ] : (
          pathname === "/creative-service" ? [
            { label: "In progress", value: "In progress" },
            { label: "Hold", value: "Hold" },
            { label: "Completed", value: "Completed" },
            { label: "Correction", value: "Correction" },
            { label: "Uploaded", value: "Uploaded" }
          ] : (
            pathname === "/tracking" ? [
              { label: "Pending", value: "Pending" },
              { label: "Approved", value: "Approved" },
              { label: "Decline", value: "Decline" },
              { label: "Dispatched", value: "Dispatched" },
              { label: "In transit", value: "In transit" }
            ] : (
              pathname === "/orders" || pathname === "/accounts/expenses" ? [
                { label: "Pending", value: "Pending" },
                { label: "Approved", value: "Approved" },
                { label: "Decline", value: "Decline" }
              ] : (
                pathname === "/employee/leave-permission" ? [
                 { label: "Approved", value: "Approved" },
                 { label: "Decline", value: "Decline" },
                  { label: "Expired", value: "Expired" }
                ] : [
                  { label: "Available", value: "Available" },
                  { label: "Low Stock", value: "Low Stock" }
                ]
              )
            )
          )
        )
      )
    )
  );

  const PremiumOption = [
    { label: "Gold", value: "Gold" },
    { label: "Silver", value: "Silver" },
    { label: "Bronze", value: "Bronze" }
  ];

  useEffect(() => {
    if (selectedFilters) {
      setStartDate(selectedFilters.startDate || null);
      setEndDate(selectedFilters.endDate || null);
      setCategory(selectedFilters.category || '');
      setBranchList(selectedFilters.branch_id || '');
      setEmpList(selectedFilters.employee_id || '');
      setDisposition(selectedFilters.disposition || '');
      setFormFactor(selectedFilters.formFactor_id || '');
      setStatus(selectedFilters.status || '');
      setType2(selectedFilters.type2 || '');
      setPremium(selectedFilters.premium || '');
      setType(selectedFilters.type || '');
    }
  }, []);

  const getFilterOption = async () => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}getFilterOption`, {
        user_id: userId || -1,
        code: usertype_code || "AD"
      });

      const result = response.data;
      if (response.status === 200) {
        setBranchOption(result.branch);
        setFormOption(result.formfactor);
        setCategoryOption(result.category);
      } else {
        toast.error("Failed to fetch data list: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching data list: " +
        (error.response?.data?.message || error.message)
      );
    }
  };

  const getEmployeeOption = async () => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}getEmployeeOption`, {
        rec_id: branchList?.target?.id || -1
      });

      const result = response.data;
      if (response.status === 200) {
        setEmpOption(result.data);
      } else {
        toast.error("Failed to fetch data list: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching data list: " +
        (error.response?.data?.message || error.message)
      );
    }
  };

  useEffect(() => {
    if (user) {
      getFilterOption();
    }
  }, [user]);

  useEffect(() => {
    if (branchList?.target?.value) {
      getEmployeeOption();
    }
  }, [branchList]);

  const handleDateRangeChange = () => {
    setRange(tempRange);
    setShowPicker(false);

    if (tempRange?.startDate) {
      const startDate = formatDateTime(tempRange?.startDate)
      const endDate = formatDateTime(tempRange?.endDate)


      setStartDate(startDate);
      setEndDate(endDate);
    }
  };

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }


  const filterHandleFunc = () => {
    const data = {
      startDate: startDate,
      endDate: endDate,
      category: category?.target?.value,
      branch_id: branchList?.target?.id,
      employee_id: empList?.target?.id,
      disposition: disposition?.target?.value,
      formFactor_id: formFactor?.target?.id,
      form_factor: formFactor?.target?.value,
      status: status?.target?.value,
      type2: type2?.target?.value,
      premium: premium?.target?.value,
      type: type?.target?.value,
      country: country,
      state: state,
      district: district,
    };

    const filterData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    );

    onFilterData(filterData);

  };


  // DATE FILTER
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleCancel = () => {
    setTempRange(range);
    setShowPicker(false);
  };

  const handleOpenPicker = () => {
    setTempRange(range ?? {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    });
    setShowPicker(true);
  };

  const getButtonLabel = () => {
    if (range?.startDate && range?.endDate) {
      return `${format(range.startDate, 'dd/MM/yyyy')} - ${format(range.endDate, 'dd/MM/yyyy')}`;
    }
    return 'Select from & to date';
  };

  return (
    <div className="modal-overlay modal-overlay-position" >
      <div className="modal-container" style={{ maxHeight: "96%", overflow: "auto" }}>
        <div className="modal-header">
          <h5 className="mb-0 add-new-hdr">Filter</h5>
        </div>
        <div className="modal-body overflow-auto">
          {(approvals || !isAdminOnEmployeeList && !isStocks  &&  !isTodo &&  !isBranchPermission && !isProductFilter && !isInventory) && (
            <div className="form-group d-flex">
              <label  style={{ display: "flex",  alignItems: "center", minWidth: "142px" }} >Date</label>
              <div className="date-range w-100">

                <div style={{ position: 'relative', display: 'inline-block' }} className="w-100 hest-50px" >
                  <button
                    className={`date-btn datepicker-btn-cm w-100 h-100`}
                    onClick={handleOpenPicker}
                  >
                    <FiCalendar size={18} />
                    {getButtonLabel()}
                  </button>
                </div>
              </div>
            </div>
          )}

          {(isProductFilter || isClients) && (
            <div className="form-group-pp mb-3">
              <label style={{ display: "flex", alignItems: "center" }} htmlFor="category">Category</label>
              <CommonSelect
                header="Select category"
                placeholder="Select category"
                name="category"
                value={category}
                onChange={setCategory}
                options={categoryOption}
              />
            </div>
          )}

          {/* Branch field - visible for all except admin on employee attendance */}
          {!restrictedBranchEmp && (approvals || !isReports &&   !isTodo &&  !isStocks  && !isTrackingFilter && !isCollectionPage && !isProductFilter && !isInventory && !isAdminOnEmployeePermission) && (
            <div className="form-group-pp mb-3">
              <label style={{ display: "flex", alignItems: "center" }} htmlFor="branch_name">Branch</label>
              <CommonSelect
                header="Select branch"
                placeholder="Select branch"
                name="Branch_ID"
                value={branchList}
                onChange={setBranchList}
                options={branchOption}
              />
            </div>
          )}


          {/* Employee field - visible for all except admin on employee attendance */}
          { !restrictedBranchEmp && (approvals ||!isAdminOnEmployeeAttendance &&   !isTodo &&  !isReports && !isStocks && !isExpensesApproved && !isTrackingFilter && !isCollectionPage && !isProductFilter && !isInventory  &&  !isBranchPermission && !isAdminOnEmployeePermission) && (
            <div className="form-group-pp mb-3">
              <label style={{ display: "flex", alignItems: "center" }} htmlFor="employee">Employee</label>
              <CommonSelect
                header="Select employee"
                placeholder="Select employee"
                name="emp_id"
                value={empList}
                onChange={setEmpList}
                options={empOption}
              />
            </div>
          )}

         {
                    !isReports &&
                    !isPurchase &&
                    !isTrackingFilter &&
                    !isCredits &&
                    !isPayroll &&
                     !isTodo && 
                    !isOrdersList &&
                    !isEmployeeLeavePermission &&
                    !isAdminOnEmployeeAttendance &&
                    !isCollectionPage &&
                    !isProductFilter &&
                    !isCreativeService &&
                    !isInventory &&
                    !isAccounts &&                 
                    !isAdminOnLeadsPool &&
                    !isAdminOnEmployeeList &&
                    !isExpensesApproved &&
                    !approvals && (
                      <div className="form-group-pp mb-3">
                        <label
                          style={{ display: "flex", alignItems: "center" }}
                          htmlFor="branch_name"
                        >
                          Country
                        </label>
                        <CommonSelect
                          header="Select country"
                          placeholder="Select country"
                          name="country"
                          value={country}
                          onChange={handleCountryChange}
                          options={countryOptions}
                          isSearchable={true}
                        />
                      </div>
                    )}
        
                  {
                    !isReports &&
                    !isPurchase &&
                    !isCredits &&
                     !isTrackingFilter &&
                      !isTodo && 
                    !isPayroll &&
                    !isOrdersList &&
                    !isEmployeeLeavePermission &&
                    !isAdminOnEmployeeAttendance &&
                    !isCollectionPage &&
                    !isProductFilter &&
                    !isCreativeService &&
                    !isInventory &&
                    !isAccounts &&
                    !isAdminOnLeadsPool &&
                    !isAdminOnEmployeeList &&
                    !isExpensesApproved &&
                    !approvals && (
                      <div className="form-group-pp mb-3">
                        <label
                          style={{ display: "flex", alignItems: "center" }}
                          htmlFor="branch_name"
                        >
                          State
                        </label>
                        <CommonSelect
                          header="Select state"
                          placeholder="Select state"
                          name="state"
                          value={state}
                          onChange={handleStateChange}
                          options={stateOptions}
                          isSearchable={true}
                        />
                      </div>
                    )}
        
                  {
                    !isReports &&
                    !isPurchase &&
                    !isCredits &&
                     !isTodo && 
                    !isPayroll &&
                    !isTrackingFilter &&
                    !isOrdersList &&
                    !isCreativeService &&
                    !isInventory &&
                    !isEmployeeLeavePermission &&
                    !isAdminOnEmployeeAttendance &&
                    !isCollectionPage &&
                    !isProductFilter &&
                    !isAccounts &&
                    !isAdminOnLeadsPool &&
                    !isAdminOnEmployeeList &&
                    !isExpensesApproved &&
                    !approvals && (
                      <div className="form-group-pp mb-3">
                        <label
                          style={{ display: "flex", alignItems: "center" }}
                          htmlFor="branch_name"
                        >
                          District
                        </label>
                        <CommonSelect
                          header="Select district"
                          placeholder="Select district"
                          name="district"
                          value={district}
                          onChange={handleDistrictChange}
                          options={districtOptions}
                          isSearchable={true}
                        />
                      </div>
                    )}
        

          {/* Disposition field - visible for admin on user profile, hidden for admin on leads pool and employee attendance */}
          {!isEmployeeLeavePermission && !isAdminOnLeadsPool &&  !isTodo &&  !isReports && !isStocks && !isCredits && !isPayroll && !isExpensesApproved && !isTrackingFilter && !isOrdersList && !isOrders && !isCollectionPage && !isInventory && !isProductFilter && !isCreativeService && !isPurchase && !isAccounts && !isClients && !isBranchPermission && !isAdminOnEmployeeList && !isAdminOnEmployeeAttendance && !isAdminOnEmployeePermission && !approvals && (
            <div className="form-group-pp mb-3">
              <label style={{ display: "flex", alignItems: "center" }} htmlFor="Disposition">Disposition</label>
              <CommonSelect
                header="Select Form factor"
                placeholder="Select option"
                name="Disposition"
                value={disposition}
                onChange={setDisposition}
                options={DispositionOption}
              />
            </div>
          )}

          {!isAdminOnUserProfile && !isReports && !isCredits &&   !isTodo &&  !isPayroll && !isBranchPermission && !isCollectionPage && !isProductFilter && !isAccounts && !isClients && !isAdminOnLeadsPool && !isAdminOnEmployeeList && !approvals && (
            <div className="form-group-pp mb-3">
              <label style={{ display: "flex", alignItems: "center" }} htmlFor="Status">Status</label>
              <CommonSelect
                header="Select status"
                placeholder="Select status"
                name="Status"
                value={status}
                onChange={setStatus}
                options={StatusOption}
              />
            </div>
          )}

           {approvals && (
            <div className="form-group-pp mb-3">
              <label style={{ display: "flex", alignItems: "center" }} htmlFor="Type">Type</label>
              <CommonSelect
                header="Select type"
                placeholder="Select type"
                name="Type"
                value={type}
                onChange={setType}
                options={TypeOption}
              />
            </div>
          )}
          {/* Additional fields - only visible for non-admin users or non-specific admin pages */}
          {!isEmployeeLeavePermission && !isAdminOnUserProfile &&  !isTodo &&  !isReports && !isStocks && !isCredits && !isPayroll && !isExpensesApproved && !isTrackingFilter && !isOrdersList && !isOrders && !isCollectionPage && !isCreativeService && !isPurchase && !isInventory && !isClients && !isAccounts && !isBranchPermission && !isAdminOnLeadsPool && !isAdminOnEmployeeList && !isAdminOnEmployeeAttendance && !isAdminOnEmployeePermission && !approvals &&  (
          
              <div className="form-group-pp mb-3">
                <label style={{ display: "flex", alignItems: "center" }} htmlFor="category">Form factor</label>
                <CommonSelect
                  header="Select Form factor"
                  placeholder="Select form factor"
                  name="Formfactor"
                  value={formFactor}
                  onChange={setFormFactor}
                  options={formOption}
                />
              </div>
       
          )}
          { !isEmployeeLeavePermission  && !isAdminOnUserProfile &&  !isTodo &&  !isReports && !isStocks && !isCredits && !isPayroll && !isExpensesApproved && !isTrackingFilter && !isOrdersList && !isOrders && !isCollectionPage && !isCreativeService && !isProductFilter && !isPurchase && !isInventory && !isAccounts && !isBranchPermission && !isAdminOnLeadsPool && !isAdminOnEmployeeList && !isAdminOnEmployeeAttendance && !isAdminOnEmployeePermission  && !approvals&& (
    
              <div className="form-group-pp mb-3">
                <label style={{ display: "flex", alignItems: "center" }} htmlFor="Premium">Premium</label>
                <CommonSelect
                  header="Select Form factor"
                  placeholder="Select option"
                  name="Premium"
                  value={premium}
                  onChange={setPremium}
                  options={PremiumOption}
                />
              </div>
      
          )}

           {!isAdminOnUserProfile &&
            !isReports &&
            !isPurchase &&
             !isTodo && 
             !isTrackingFilter &&
            !isCredits &&
            !isPayroll &&           
            !isOrdersList &&
            !isAdminOnEmployeeAttendance &&
            !isBranchPermission &&
            !isCollectionPage &&
            !isProductFilter &&
            !isInventory &&
            !isAccounts &&
            !isClients &&
            !isAdminOnLeadsPool &&
            !isAdminOnEmployeeList &&
            !isExpensesApproved &&
            !approvals && (
              <div className="form-group-pp mb-3">
              <label style={{ display: "flex", alignItems: "center" }} htmlFor="Status">Type</label>
              <CommonSelect
                header="Select Type"
                placeholder="Select Types"
                name="Type"
                value={type2}
                onChange={setType2}
                options={TypeOption2}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Close</button>
          <button className="next-button" onClick={filterHandleFunc} >Filter</button>
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

      {showPicker && (
        <div ref={pickerRef} className="date-picker-stmain">
          <div
            className='showpicker-cm'
          >
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setTempRange(item.selection)}
              moveRangeOnFirstSelection={false}
              ranges={[tempRange]}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button onClick={handleCancel} className='datepick-nocm-st'>
                Cancel
              </button>
              <button onClick={handleDateRangeChange} className='datepick-okcm-st' >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

FilterSidebar.propTypes = {
  onClose: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  selectedFilters: PropTypes.object,
};

export default FilterSidebar;
