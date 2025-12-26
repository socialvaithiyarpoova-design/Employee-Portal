import React, { useState, useEffect, useRef } from 'react';
import { PropagateLoader } from 'react-spinners';
import '../../assets/styles/accounts.css';
import '../../assets/styles/user-profile.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import configModule from '../../../config.js';
import Pagination from "../../components/Pagination/index.jsx";
import SvgContent from '../../components/svgcontent.jsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CommonSelect from "../../components/common-select.jsx";
import { ExportButton, exportFormattedData } from '../../components/export-page.jsx';
import FilterModal from '../../components/filter-modal.jsx';
import filtericon from '../../assets/images/filtericon.svg';

function Accounts() {
  const [accountHeaderDataList, setAccountHeaderDataList] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [desigationList, setDesigationList] = useState([]);
  const [expensesHeadData, setExpensesHeadData] = useState([]);
  const [targetAmount, setTargetAmount] = useState('');
  const [othersParticular, setOthersParticular] = useState('');
  const [accountsData, setAccountsData] = useState([]);
  const [needLoading, setNeedLoading] = useState(false);
  const { user, accessMenu } = useAuth();
  const location = useLocation();
  const db_type = location?.state?.db_type || '';
  const pathname = location?.pathname;
  const [buttonPermissions, setButtonPermissions] = useState({});
  const user_id = user?.userId;
  const usertype_code = user?.user_typecode;
  const config = configModule.config();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState(db_type || "revenue");
  const isActive = status === "revenue";
  const allAccountsData = isActive ? accountsData : expensesData;
  const [openGstModal, setOpenGstModal] = useState(null);
  const [gstData, setGstData] = useState('');
  const [percentage, setPercentage] = useState('');
  const [gstListDetails, setGstListDetails] = useState([]);
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [handleOffGST, setHandleOffGST] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [clientType, setClientType] = useState('');
  const [selectLevel, setSelectLevel] = useState('');
  const [premAmount, setPremAmount] = useState('');
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedExpRowData, setSelectedExpRowData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isExpPopupOpen, setIsExpPopupOpen] = useState(false);
  const [addTargetOpen, setAddTargetOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [department, setDepartment] = useState('');
  const [image, setImage] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [locationData, setLocationData] = useState("");
  const [selectedDataByBranch, setSelectedDataByBranch] = useState("");
  const [openOtherExpensesData, setOpenOtherExpensesData] = useState(false);
  const [othersExpData, setOthersExpData] = useState('');
  const [isPremiumButtonActive, setIsPremiumButtonActive] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const premiumButtonRef = useRef(null);
  const clientTypeSelectRef = useRef(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState('');
  const popupRef = useRef();
  const [openViewGSTDatas, setOpenViewGSTDatas] = useState(null);
  const [gstHSNDetails, setGstHSNDetails] = useState([]);
  const [openConfirmGstHsn, setOpenConfirmGstHsn] = useState(null);
  const [selectedItems, setSelectedItems] = useState('');
  const [hsnValue, setHsnValue] = useState('');
  const [gstValue, setGstValue] = useState('');
  const [isFilterHover, setIsFilterHover] = useState(false);
  const [editableHSNIndex, setEditableHSNIndex] = useState(null);
  const [editableGSTIndex, setEditableGSTIndex] = useState(null);
  const [hsnNewData, setHsnNewData] = useState({});
  const [gstNewData, setGstNewData] = useState({});
  const hsnInputRefs = useRef([]);
  const gstInputRefs = useRef([]);
  const [billType, setBillType] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentmode, setPaymentmode] = useState("");

  const ClientType = [{ label: "People", value: "People" }, { label: "Store", value: "Store" }];
  const SelectLevel = [{ label: "Bronze", value: "Bronze" }, { label: "Silver", value: "Silver" }, { label: "Gold", value: "Gold" }];
  const billTypeOptions = [
    { label: "Electricity Bill", value: "Electricity Bill" },
    { label: "Recharge", value: "Recharge" },
    { label: "Wifi", value: "Wifi" },
    { label: "Other", value: "Other" },
  ];
  const paymentModeOptions = [
    { label: "Online", value: "Online" },
    { label: "Cash", value: "Cash" },
  ];


  useEffect(() => {
  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      handleClosePopup();
    }
  };

  if (isPopupOpen || isExpPopupOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isPopupOpen, isExpPopupOpen]);

  const handleReset = () => {
    setOpenGstModal(null);
    setGstData('');
    setPercentage('');
    setHandleOffGST(false);
    setPremiumOpen(false);
    setAddTargetOpen(false);
    setAddExpenseOpen(false);
    setClientType('');
    setSelectLevel('');
    setPremAmount('');
    setGstValue('');
    setHsnValue('');
    setBillType('');
    setPaymentmode('');
    setAmount('');
    setDateTime('');
  };

  function mergeRevenues(saleRevenue, classRevenue, walletRevenue, consultRevenue,BillRevenue) {
    const mergedMap = new Map();

    const getKey = (item) => item.user_recid;

    const addOrUpdate = (item, updates) => {
      const key = getKey(item);
      if (!mergedMap.has(key)) {
        mergedMap.set(key, {
          branch_id: item.branch_id,
          user_types: item.user_types,
          user_recid: item.user_recid,
          location: item.location,
          ...updates
        });
      } else {
        Object.assign(mergedMap.get(key), updates);
      }
    };

   saleRevenue.forEach(item => {
        addOrUpdate(item, {
            // Map the fields directly from the API response
            sale_total_amount: parseFloat(item.total_amount || 0).toFixed(2),
        });
    });

    classRevenue.forEach(item => {
      addOrUpdate(item, {
        class_total_amount: item.cl_total_amount,
        class_paid_amount: item.cl_paid_amount,
        class_discount: item.cl_discount
      });
    });

    walletRevenue.forEach(item => {
      addOrUpdate(item, {
        wallet_total_amount: item.wl_total_amount
      });
    });

    consultRevenue.forEach(item => {
      addOrUpdate(item, {
        consult_total_amount: item.con_total_amount
      });
    });
    BillRevenue.forEach(item => {
      addOrUpdate(item, {
        Billing_total_amount: item.amount_to_pay
      });
    });

    return Array.from(mergedMap.values());
  };

  const getAccountsData = async (objFilter = '') => {
    setNeedLoading(true);
    setOpenViewGSTDatas(null);

    try {
      const response = await axios.post(`${config.apiBaseUrl}getAccountsData`, {
        startDate: objFilter?.startDate || '',
        endDate: objFilter?.endDate || '',
        branch_id: objFilter?.branch_id || null,
        employee_id: objFilter?.employee_id || null,
        user_id: user_id || null,
        usertype_code: usertype_code || ''
      });

      const result = response.data;
      if (response.status === 200) {
        setAccountHeaderDataList(result.accountsData);
        const mergedRevenue = mergeRevenues(result.saleRevenue, result.classRevenue, result.walletRevenue, result.consultRevenue , result.BillRevenue);
        setAccountsData(mergedRevenue);
        handleReset();
      } else {
        toast.error("Failed to fetch  details: " + result.message);
        console.error("Failed to fetch  details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching  details: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
      setShowFilterModal(false);
    }
  };

  const getLeadDesignationData = async () => {
    setNeedLoading(true);

    try {
      const response = await axios.get(`${config.apiBaseUrl}getLeadDesignationData`);

      const result = response.data;
      if (response.status === 200) {
        setDesigationList(result.data);

      } else {
        toast.error("Failed to fetch  details: " + result.message);
        console.error("Failed to fetch  details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching  details: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  const getAccountsExpenseData = async (objFilter = '') => {
    setNeedLoading(true);

    try {
      const response = await axios.post(`${config.apiBaseUrl}getAccountsExpenseData`, {
        startDate: objFilter?.startDate || '',
        endDate: objFilter?.endDate || '',
        branch_id: objFilter?.branch_id || null,  
        employee_id: objFilter?.employee_id || null,
        user_id: user_id || null,
        usertype_code: usertype_code || ''
      });

      const result = response.data;
      if (response.status === 200) {
        setExpensesHeadData(result.data);
        setExpensesData(result.brExpData);

      } else {
        toast.error("Failed to fetch  details: " + result.message);
        console.error("Failed to fetch  details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching  details: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAccountsData();
      getLeadDesignationData();
      getAccountsExpenseData();
    }
  }, [user]);

  // Load button permissions for Accounts page
  useEffect(() => {
    if (user && Array.isArray(accessMenu)) {
      const foundMenu = accessMenu.find((m) => m.path === pathname && m.user_id === user_id);
      if (foundMenu) {
        setButtonPermissions({
          gst: foundMenu.gst_btn === 1,
          search: foundMenu.search_btn === 1,
          premium: foundMenu.premium_btn === 1,
          export: foundMenu.export_btn === 1,
          addTarget: foundMenu.add_target_btn === 1,
          filter: foundMenu.filter_btn === 1
        });
      } else {
        setButtonPermissions({});
      }
    } else {
      setButtonPermissions({});
    }
  }, [user, accessMenu, pathname]);


  useEffect(() => {
    if (editableHSNIndex !== null && hsnInputRefs.current[editableHSNIndex]) {
      const input = hsnInputRefs.current[editableHSNIndex];
      input.focus();
      input.setSelectionRange(0, input.value.length); // highlight all
    }
  }, [editableHSNIndex]);

  useEffect(() => {
    if (editableGSTIndex !== null && gstInputRefs.current[editableGSTIndex]) {
      const input = gstInputRefs.current[editableGSTIndex];
      input.focus();
      input.setSelectionRange(0, input.value.length);
    }
  }, [editableGSTIndex]);

  useEffect(() => {
    const getGstDataFunc = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}getGSTListDetails`);

        const result = response.data;
        if (response.status === 200) {

          setGstHSNDetails(result.data);

          const formattedData = result.data.map(item => ({
            label: item.gst_number,
            value: item.gst_number,
            id: item.id,
            code: item.hsn_codes
          }));

          const formattedDataHSN = result.data.map(item => ({
            label: item.hsn_codes,
            value: item.hsn_codes,
            id: item.id,
            code: item.gst_number
          }));

          setGstListDetails(formattedData);


          const hasActiveGST = Array.isArray(result.data) && result.data.some(item => item.isActiveGST === 1);
          setIsGstEnabled(hasActiveGST);
        } else {
          toast.error("Failed to fetch gst details: " + result.message);
          console.error("Failed to fetch gst details: " + result.message);
        }
      } catch (error) {
        toast.error(
          "Error fetching get gst details: " +
          (error.response?.data?.message || error.message)
        );
      }
    }

    getGstDataFunc();
  }, []);

  // Close any open Accounts popups on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (isPopupOpen) return handleClosePopup();
        if (premiumOpen) return setPremiumOpen(false);
        if (addExpenseOpen) return setAddExpenseOpen(false);
        if (addTargetOpen) return setAddTargetOpen(false);
        if (openGstModal) { setOpenGstModal(null); setIsGstEnabled(!isGstEnabled); return; }
        if (handleOffGST) return setHandleOffGST(false);
      }
    };
    if (openGstModal || handleOffGST || addTargetOpen || addExpenseOpen || premiumOpen || isPopupOpen) {
      window.addEventListener('keydown', handleEsc);
      window.addEventListener('keyup', handleEsc);
      return () => {
        window.removeEventListener('keydown', handleEsc);
        window.removeEventListener('keyup', handleEsc);
      };
    }
  }, [openGstModal, handleOffGST, addTargetOpen, addExpenseOpen, premiumOpen, isPopupOpen, isGstEnabled]);

  // Reset premium button active state when modal closes
  useEffect(() => {
    if (!premiumOpen) {
      setIsPremiumButtonActive(false);
    }
  }, [premiumOpen]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLastAccountsData = currentPage * itemsPerPage;
  const indexOfFirstAccountsData = indexOfLastAccountsData - itemsPerPage;
  const paginatedAccountsData = allAccountsData.slice(indexOfFirstAccountsData, indexOfLastAccountsData);

  const currentAccountsData = paginatedAccountsData.filter((item) =>
    `${item.branch_id} ${item.location} ${item.sale_vp_paid_amount} ${item.sale_gr_paid_amount} ${item.class_paid_amount} ${item.wallet_total_amount} ${item.consult_total_amount}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const onGstforPurchase = async (type = "OFF") => {
    const gst_number = gstData?.target?.value || null;

    const percentage_num = (parseFloat(percentage) / 100) || null;

    if (!percentage_num && !gst_number && type === "ON") {
      toast.error("All fields are required");
      return;
    }

    try {
      setNeedLoading(true);

      const response = await axios.post(`${config.apiBaseUrl}onGstforPurchase`, {
        percentage: percentage_num,
        gst_number: gst_number,
        type: type
      });

      const result = response.data;
      if (response.status === 200) {
        toast.success(type === "OFF" ? "Turned off gst" : "Turned on gst");

        setTimeout(() => {
          setOpenGstModal(null);
          setHandleOffGST(false);
          setNeedLoading(false);

          getAccountsData();
          setIsGstEnabled(type !== "OFF");
        }, 2000);
      } else {
        toast.error("Failed to on gst: " + result.message);
        console.error("Failed to on gst: " + result.message);
        setNeedLoading(false);
      }
    } catch (error) {
      toast.error(
        "Error on gst details: " +
        (error.response?.data?.message || error.message)
      );
      setNeedLoading(false);
    }
  };

  const savePremiumData = async () => {
    if (!clientType || !selectLevel || !premAmount) {
      toast.error("All fields are required");
      return;
    }

    try {
      const response = await axios.post(`${config.apiBaseUrl}savePremiumData`, {
        clientType: clientType?.target?.value || '',
        selectLevel: selectLevel?.target?.value || '',
        premAmount: parseFloat(premAmount || 0)
      });

      const responseData = response?.data?.data;

      if (response.status === 200) {
        toast.success("Premium amount saved successfully");

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
          setPremiumOpen(false);
          getAccountsData();
        }, 1500);
      } else {
        toast.error("Failed to save premium data: " + result.message);
        console.error("Error saving premium:", result.message);
      }

    } catch (error) {
      toast.error(
        "Error saving premium data: " +
        (error.response?.data?.message || error.message)
      );
    }
  };

  const handleRowClick = async (item, type) => {
    if (!item) return;

    let apiEndPoint = type === "REV" ? "getAccountsDataByEmp" : "getAccountsEXPDataByEmp";

    try {
      const response = await axios.post(`${config.apiBaseUrl}${apiEndPoint}`, {
        user_id: type === "REV" ? item?.user_recid : Number(item?.br_userid ?? -1)
      });

      const result = response.data;

      if (response.status === 200) {
        // Merge logic starts

        if (type === "REV") {
          const mergedMap = new Map();

          const mergeByEmpRecid = (array) => {
            array?.forEach(entry => {
              const empId = entry.emp_recid;
              if (!mergedMap.has(empId)) {
                mergedMap.set(empId, { ...entry });
              } else {
                const existing = mergedMap.get(empId);
                mergedMap.set(empId, {
                  ...existing,
                  ...entry,
                });
              }
            });
          };

          mergeByEmpRecid(result.saleData || []);
          mergeByEmpRecid(result.classData || []);
          mergeByEmpRecid(result.walletData || []);
          mergeByEmpRecid(result.consultData || []);
          mergeByEmpRecid(result.BillData || []);

          const mergedArray = Array.from(mergedMap.values());
          setSelectedRowData(mergedArray);
          setIsPopupOpen(true);
        } else {
          setIsExpPopupOpen(true);
          setSelectedExpRowData(result.data);
          setLocationData(item?.location || '');
          setSelectedDataByBranch(item || '');
        }

      } else {
        toast.error("Failed to get emp revenue data: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error get emp revenue data: " +
        (error.response?.data?.message || error.message)
      );
      console.error("API error:", error);
    }
  };


  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setIsExpPopupOpen(false);
    setSelectedRowData(null);
    setSelectedExpRowData(null);
  };

  const handleExport = (data, fileName, fileType) => {
    const exportData = currentAccountsData.map((item, index) => ({
      "S No": (currentPage - 1) * itemsPerPage + index + 1,
      "Branch ID": item.branch_id || '',
      "Location": item.location || '',
      "Sales": item.sale_total_amount || 0,
      "Billing": item.Billing_total_amount || 0,
      "Class": item.class_paid_amount || 0,
      "Wallet": item.wallet_total_amount || 0,
      "Consult": item.consult_total_amount || 0,
      "Total Value": (
        parseFloat(item.sale_total_amount || 0) +
        parseFloat(item.Billing_total_amount || 0) +
        parseFloat(item.class_paid_amount || 0) +
        parseFloat(item.wallet_total_amount || 0) +
        parseFloat(item.consult_total_amount || 0)
      ).toFixed(2)
    }));

    // Use the enhanced export function directly
    exportFormattedData(exportData, fileName || 'AccountsData', fileType);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setImage(file);
    } else {
      toast.error('Please upload a valid JPEG or PNG image.');
    }
  };


    const handleSaveExpense = async () => {
    try {
      if (!billType || !dateTime) {
        toast.error("Please fill all required fields");
        return;
      }

      // Validation for amount fields
      if (billType !== "Other" && !amount) {
        toast.error("Please enter amount");
        return;
      }

      if (billType === "Other" && (!othersParticular)) {
        toast.error("Please enter Particular");
        return;
      }

      if (paymentmode === "Online") {
        if (!transactionId || !image) {
          toast.error("Please upload receipt & enter transaction ID");
          return;
        }
      }

      const formData = new FormData();
      formData.append(
        "billType",
        billType?.target?.value === "Other"
          ? othersParticular
          : billType?.target?.value || ""
      );
      formData.append("amount", amount);
      formData.append("transaction_id", transactionId || null);
      formData.append( "date_time", dateTime ? dateTime.toISOString().slice(0, 19).replace("T", " ") : "" );
      formData.append("folder", "expense");
      if (image) formData.append("receipt_image", image);
      formData.append("user_id", user_id);

      const res = await axios.post(`${config.apiBaseUrl}saveExpenseAmountMonth`,formData);

      if (res.status === 200) {
        toast.success(res.data?.message || "Expense saved successfully");

        setAddExpenseOpen(false);
        setBillType("");
        setAmount("");
        setPaymentmode("");
        setTransactionId("");
        setOthersParticular("");
        setDateTime("");
        setImage(null);
      } else {
        toast.error(res.data?.message || "Failed to save expense");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message
          ? err.response.data.message
          : "Failed to save expense"
      );
    }
  };


  const handleGSTSave = async () => {
    let changes = [];
    setNeedLoading(true);

    gstHSNDetails.forEach((item, index) => {
      const newValGST = gstNewData[index];
      const newValHSN = hsnNewData[index];

      const gstChanged = newValGST !== undefined && newValGST !== item.gst_number;
      const hsnChanged = newValHSN !== undefined && newValHSN !== item.hsn_codes;

      if (gstChanged || hsnChanged) {
        changes.push({
          id: item.id,
          key_gst: "gst_number",
          new_value_gst: gstChanged ? newValGST : item.gst_number,
          key_hsn: "hsn_codes",
          new_value_hsn: hsnChanged ? newValHSN : item.hsn_codes,
        });
      }
    });

    if (changes.length === 0) {
      toast.info("No changes detected.");
      setNeedLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${config.apiBaseUrl}updateGSTHSNData`,
        changes
      );

      if (response.status === 200) {
        setEditableHSNIndex(null);
        setEditableGSTIndex(null);
        setHsnNewData({});
        setGstNewData({});
        setOpenViewGSTDatas(null);

        toast.success("Successfully updated.");

        setTimeout(() => {
          window.location.reload();
          setNeedLoading(false);
        }, 2000);
      } else {
        toast.error("Failed to update: " + response.data.message);
        setNeedLoading(false);
      }
    } catch (error) {
      toast.error(
        "Error updating data: " +
        (error.response?.data?.message || error.message)
      );
      console.error("API error:", error);
      setNeedLoading(false);
    }
  };

  const handleTarget = async () => {
    try {
      if (!department || !targetAmount) {
        toast.error("Please fill all required fields");
        return;
      }

      const res = await axios.post(`${config.apiBaseUrl}saveTragetAmount`, {
        department: department?.target?.id,
        code_des: department?.target?.code,
        targetAmount: targetAmount
      });

      if (res.status === 200) {
        toast.success("Target saved successfully");
        setDepartment('');
        setTargetAmount('');
        setAddTargetOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save target");
    }
  };

  const openOtherExpallData = async (branch_id) => {
    try {
      if (!branch_id) {
        toast.error("Can not find Id's");
        return;
      }

      const res = await axios.post(`${config.apiBaseUrl}getOtherExpAllData`, {
        user_id: branch_id
      });

      const result = res.data;
      if (res.status === 200) {
        setOpenOtherExpensesData(true);
        setOthersExpData(result.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Cannot get other expenses");
      setOpenOtherExpensesData(false);
    }
  };

  const onFilterDataFunc = (items) => {
    setSelectedFilters(items);
    getAccountsData(items);
    getAccountsExpenseData(items);
  };

  const handleFltReset = () => {
    setSelectedFilters('');
    getAccountsData();
    getAccountsExpenseData();
    setActiveButton(null);
  };

  const handleGSTDelete = async () => {
    setNeedLoading(true);

    try {
      const res = await axios.post(`${config.apiBaseUrl}handlDeleteGstHsn`, {
        id: selectedItems?.id || '',
      });

      if (res.status === 200) {
        toast.success("Deleted successfully");

        setEditableHSNIndex(null);
        setEditableGSTIndex(null);
        setHsnNewData({});
        setGstNewData({});
        setOpenViewGSTDatas(null);

        setTimeout(() => {
          window.location.reload();
          setNeedLoading(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save target");
    }
  };

  const addGSTHSNValues = async () => {
    setNeedLoading(true);

    try {
      const res = await axios.post(`${config.apiBaseUrl}addGSTHSNValues`, {
        gst: gstValue || '',
        hsn: hsnValue || '',
      });

      if (res.status === 200) {
        toast.success("Successfully added gst.");

        setEditableHSNIndex(null);
        setEditableGSTIndex(null);
        setHsnNewData({});
        setGstNewData({});
        setOpenViewGSTDatas(null);

        setTimeout(() => {
          window.location.reload();
          setNeedLoading(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save gst");
    }
  }

  return (
    <div className='common-body-st'>
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
      <div className='header-div-ac'>
        <div className='header-divpart-el'>
          <div className='d-flex gap-2 mb-2'>
            <p className='mb-0 header-titlecount-el'>Accounts</p>
          </div>

          <div className="status-toggle-up">
            <label htmlFor="status-active" className="custom-radio">
              <input
                type="radio"
                name="status"
                id="status-active"
                value="revenue"
                checked={status === "revenue"}
                onChange={(e) => setStatus(e.target.value)}
              />
              <span className="radio-button"></span> Revenue
            </label>

            <label htmlFor="status-inactive" className="custom-radio">
              <input
                type="radio"
                name="status"
                id="status-inactive"
                value="expense"
                checked={status === "expense"}
                onChange={(e) => setStatus(e.target.value)}
              />
              <span className="radio-button"></span> Expenses
            </label>
          </div>
        </div>
        <div className="search-add-wrapper">
          {status === "revenue" && buttonPermissions.gst && (
            <div className="checkbox-wrapper-7">
              <input
                className="tgl tgl-ios"
                id="cb2-7"
                type="checkbox"
                checked={isGstEnabled}
                onChange={(e) => {
                  const value = e.target.checked;
                  if (value) {
                    setIsGstEnabled(true);
                    setOpenGstModal("Select");
                  } else {
                    setHandleOffGST(true);
                  }
                }}
              />
              <label className="tgl-btn" htmlFor="cb2-7"></label>
            </div>
          )}

          {buttonPermissions.search && (
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}

          {status === "revenue" && buttonPermissions.premium && (
            <button
              ref={premiumButtonRef}
              className={`btn-top-up ${isPremiumButtonActive ? 'active' : ''}`}
              onClick={() => {
                setPremiumOpen(true);
                setIsPremiumButtonActive(true);
                // Focus on client type dropdown when modal opens
                setTimeout(() => {
                  if (clientTypeSelectRef.current) {
                    clientTypeSelectRef.current.focus();
                  }
                }, 100);
              }}
            >
              <span>Premium</span>
            </button>
          )}

          {status === "revenue" && buttonPermissions.addTarget && (
            <button className="btn-top-up" onClick={() => setAddTargetOpen(true)} >
              <span>Add target</span>
            </button>
          )}

          {status === "expense" && (
            <button className="btn-top-up" onClick={() => setAddExpenseOpen(true)} >
              <span>Expense</span>
            </button>
          )}

          {buttonPermissions.export && (
            <div className="filter-container-up">
              <ExportButton
                data={currentAccountsData}
                fileName="AccountsData"
                onExport={handleExport}
                disabled={!currentAccountsData || currentAccountsData.length === 0}
              />
            </div>
          )}

          {buttonPermissions.filter && (
            <div className='filter-container-up position-relative'>
              <button
                className={`product-filter-btns ${activeButton === 'filter' ? 'active' : ''}`}
                style={{ color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}
                onClick={() => { setShowFilterModal(true); setActiveButton('filter'); }}
                  onMouseEnter={() => setIsFilterHover(true)}
                  onMouseLeave={() => setIsFilterHover(false)}
              >
                 <img src={filtericon} alt="img" style={{ filter: (activeButton === 'filter' || isFilterHover) ? 'invert(1) brightness(2)' : 'none' }} />
                  <span style={{ marginLeft: 6, color: (activeButton === 'filter' || isFilterHover) ? '#ffffff' : '#0B9346' }}>Filter</span>
              </button>

              {activeButton === 'filter' && (
                <button className='filter-clear-st' onClick={handleFltReset} >
                  &times;
                </button>
              )}
            </div>
          )}

        </div>
      </div>
      <div className='body-div-ac'>
        <div className='h-100 w-100 p-2 pb-0'>
          {status === "revenue" ? (
            <div className='bodyhead-ac'>
              <div className='col-3 bodyhead-div-ac flex-column'>
                <h5 className='mb-0'>₹ {accountHeaderDataList?.todays_revenue || 0}</h5>
                <p className='mb-0' style={{ color: "rgb(152 152 152)" }}>Today’s revenue</p>
              </div>
              <div className='col-3 bodyhead-div-ac flex-column'>
                <h5 className='mb-0'>₹ {accountHeaderDataList?.monthly_revenue || 0}</h5>
                <p className='mb-0' style={{ color: "rgb(152 152 152)" }}>Monthly revenue</p>
              </div>
              <div className='col-3 bodyhead-div-ac flex-column'>
                <h5 className='mb-0'>₹ {accountHeaderDataList?.total_revenue || 0}</h5>
                <p className='mb-0' style={{ color: "rgb(152 152 152)" }}>Total revenue</p>
              </div>
              <div className='col-3 bodyhead-div-ac flex-column'>
                <div className='w-100 h-100 db-ac'>
                  <div className='inner-adjustacst'>
                    <div className='d-flex gap-2'>
                      <div style={{ minWidth: "58px" }}>
                        Sales
                      </div>
                      <div>
                        ₹ {accountHeaderDataList?.total_sale_revenue || 0}
                      </div>
                    </div>
                    <div className='d-flex gap-2'>
                      <div style={{ minWidth: "58px" }}>
                        Class
                      </div>
                      <div>
                        ₹ {accountHeaderDataList?.total_class_revenue || 0}
                      </div>
                    </div>
                    <div className='d-flex gap-2'>
                      <div style={{ minWidth: "58px" }}>
                        Wallet
                      </div>
                      <div>
                        ₹ {accountHeaderDataList?.total_wallet_revenue || 0}
                      </div>
                    </div>
                    <div className='d-flex gap-2'>
                      <div style={{ minWidth: "58px" }}>
                        Consult
                      </div>
                      <div>
                        ₹ {accountHeaderDataList?.total_consult_revenue || 0}
                      </div>
                    </div>
                     <div className='d-flex gap-2'>
                      <div style={{ minWidth: "58px" }}>
                        Billing
                      </div>
                      <div>
                        ₹ {accountHeaderDataList?.total_billing_revenue || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='bodyhead-ac'>
              <div className='col-4 bodyhead-div-ac flex-column'>
                <h5 className='mb-0'>₹ {expensesHeadData?.monthly_total_expenses || 0}</h5>
                <p className='mb-0' style={{ color: "rgb(152 152 152)" }}>Monthly expense</p>
              </div>
              <div className='col-4 bodyhead-div-ac flex-column'>
                <h5 className='mb-0'>₹ {expensesHeadData?.total_expenses || 0}</h5>
                <p className='mb-0' style={{ color: "rgb(152 152 152)" }}>Total expense</p>
              </div>
              <div className='col-4 bodyhead-div-ac flex-column'>
                <div className='w-100 h-100 db-ac'>
                  <div className='inner-adjustacst'>
                    <div className='d-flex gap-2'>
                      <div style={{ minWidth: "85px" }}>
                        Salary
                      </div>
                      <div>
                        ₹ {expensesHeadData?.total_salery_expenses || 0}
                      </div>
                    </div>
                    <div className='d-flex gap-2'>
                      <div style={{ minWidth: "85px" }}>
                        Incentives
                      </div>
                      <div>
                        ₹ {expensesHeadData?.total_incentive_expenses || 0}
                      </div>
                    </div>
                    <div className='d-flex gap-2'>
                      <div style={{ minWidth: "85px" }}>
                        Rent
                      </div>
                      <div>
                        ₹ {expensesHeadData?.total_rent_expenses || 0}
                      </div>
                    </div>
                    <div className='d-flex gap-2'>
                      <div style={{ minWidth: "85px" }}>
                        Other
                      </div>
                      <div>
                        ₹ {expensesHeadData?.total_other_expenses || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "revenue" ? (
            <div className='table-common-st table-common-ac' >
              <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
                <div className='brcommon-col-st w-5'>
                  S no
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  Branch ID
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-10'>
                  Location
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-10'>
                 Sales
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-10'>
                 Billing
                </div> <span style={{ color: "#129347" }}> | </span>                
                <div className='brcommon-col-st w-10'>
                  Class
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-10'>
                  Wallet
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-10'>
                  Consult
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  Total value
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-5'>
                  <SvgContent svg_name="col_info" />
                </div>
              </div>

              <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
                {currentAccountsData && currentAccountsData.length > 0 ? (currentAccountsData.map((item, index) => (
                  <div className='display-flex br-rowst cursor-pointer' key={item.user_recid} onClick={() => handleRowClick(item, "REV")}  >
                    <div className='brcommon-col-st w-5'>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-15'>
                      {item.branch_id || ''}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-10'>
                      {item.location || 'ccc'}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-10'>
                      {item.sale_total_amount  || 0}
                    </div><span style={{ color: "#ffffffff" }}> | </span>   
                     <div className='brcommon-col-st w-10'>
                      {item.Billing_total_amount  || 0}
                    </div><span style={{ color: "#ffffffff" }}> | </span>                   
                    <div className='brcommon-col-st w-10'>
                      {item.class_paid_amount || 0}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-10'>
                      {item.wallet_total_amount || 0}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-10'>
                      {item.consult_total_amount || 0}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-15'>
                      {
                        (
                          parseFloat(item.sale_total_amount || 0) +
                           parseFloat(item.Billing_total_amount || 0) +
                          parseFloat(item.class_paid_amount || 0) +
                          parseFloat(item.wallet_total_amount || 0) +
                          parseFloat(item.consult_total_amount || 0)
                        ).toFixed(2)
                      }
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-5'>
                      <SvgContent svg_name="info" />
                    </div>
                  </div>
                ))) : (
                  <div className='tb-nodata-row-st  display-flex'>
                    No Revenue list
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className='table-common-st table-common-ac' >
              <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
                <div className='brcommon-col-st w-7'>
                  S no
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  Branch ID
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-12'>
                  Location
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-14'>
                  Salary
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  Incentive 
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-10'>
                  Rent
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-12'>
                  Others
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-10'>
                  Total value
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-5'>
                  <SvgContent svg_name="col_info" />
                </div>
              </div>

              <div className='tb-body-row-st' style={{ minWidth: "1112px" }}>
                {currentAccountsData && currentAccountsData.length > 0 ? (currentAccountsData.map((item, index) => (
                  <div className='display-flex br-rowst cursor-pointer' key={item.br_userid} onClick={() => handleRowClick(item, "EXP")}  >
                    <div className='brcommon-col-st w-7'>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </div>
                    <div className='brcommon-col-st w-15'>
                      {item.branch_id || item.emp_id}
                    </div>
                    <div className='brcommon-col-st w-12'>
                      {item.location || 'Head office'}
                    </div>
                    <div className='brcommon-col-st w-14'>
                      {item.total_salary || 0}
                    </div>
                    <div className='brcommon-col-st w-15'>
                      {(parseFloat(item.sl_monthly_incentive || 0) + parseFloat(item.fs_monthly_incentive || 0) + parseFloat(item.wd_monthly_incentive || 0) + parseFloat(item.ca_monthly_incentive || 0)).toFixed(2)}
                    </div>
                    <div className='brcommon-col-st w-10'>
                      {item.monthly_rent || 0}
                    </div>
                    <div className='brcommon-col-st w-12'>
                      {item.monthly_other_expenses || 0}
                    </div>
                    <div className='brcommon-col-st w-10'>
                      {
                        (
                          parseFloat(item.total_salary || 0) +
                          parseFloat(item.sl_monthly_incentive || 0) +
                          parseFloat(item.fs_monthly_incentivet || 0) +
                          parseFloat(item.wd_monthly_incentive || 0) +
                          parseFloat(item.ca_monthly_incentive || 0) +
                          parseFloat(item.monthly_rent || 0) +
                          parseFloat(item.monthly_other_expenses || 0)
                        ).toFixed(2)
                      }
                    </div>
                    <div className='brcommon-col-st w-5'>
                      <SvgContent svg_name="info" />
                    </div>
                  </div>
                ))) : (
                  <div className='tb-nodata-row-st display-flex'>
                    No Expenses list
                  </div>
                )}

              </div>
            </div>
          )}
          <div className='footer-tab-st'>
            <label htmlFor="hfg" className="me-2">
              Results per page{" "}
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="row-per-page-select"
                style={{ width: "60px" }}
              >
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </label>
            <Pagination
              count={allAccountsData.length}
              page={currentPage}
              pageSize={itemsPerPage}
              onChange={(pageNo) => setCurrentPage(pageNo)}
            />
          </div>
        </div>
      </div>

      {handleOffGST && (
        <div className="modal-overlay modal-overlay-position">
          <div className="modal-container modal-overlay-position" style={{ width: "625px" }}>
            <div className="modal-header">
              <h5 className="mb-0 add-new-hdr">Confirm to turn off GST %</h5>
            </div>
            <div className="modal-body">
              <div className="container commonst-select mb-3">
                Are you sure to turn off GST?
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={() => { setHandleOffGST(false); }} >No</button>
              <button className="next-button" onClick={() => onGstforPurchase("OFF")} >Yes</button>
            </div>
          </div>
        </div>
      )}

      {addTargetOpen && (
        <div className="modal-overlay modal-overlay-position">
          <div className="modal-container modal-overlay-position" style={{ width: "625px" }}>
            <div className="modal-header">
              <h5 className="mb-0 add-new-hdr">Add monthly target</h5>
            </div>
            <div className="modal-body">
               <div className="container commonst-select mb-3">
                <h6>Select department</h6>
                <div className="comm-select-ba">
                  <CommonSelect
                    header="Select department"
                    placeholder="Select department"
                    name="department"
                    value={department}
                    onChange={setDepartment}
                    options={desigationList}
                  />
                </div>
              </div>
              <div className="container commonst-select mb-3">
                <h6>Enter target</h6>
                <div className="comm-select-ba">
                  <input
                    type="text"
                    name="target"
                    className="form-control location-ip-br "
                    placeholder="Enter target"
                    value={targetAmount}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      setTargetAmount(onlyNums);
                    }}
                    required
                  />
                </div>
              </div>            
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={() => { setAddTargetOpen(false) }} >Close</button>
              <button className="next-button" onClick={handleTarget} >Save</button>
            </div>
          </div>
        </div>
      )}

      {addExpenseOpen && (
        <div className="modal-overlay modal-overlay-position">
          <div
            className="modal-container modal-overlay-position"
            style={{ width: "625px", overflow: "auto", maxHeight: "95%" }}
          >
            <div className="modal-header mb-2">
              <h5 className="mb-0 fw-semibold" style={{ color: "#0B622F" }}>
                Expenses
              </h5>
            </div>
            <hr className="mt-2 mb-4" />
            <div className="modal-body">
              <div>
                <div className="form-group mb-3">
                  <label htmlFor="billType">Bill Type</label>

                  <CommonSelect
                    header="Select Bill Type"
                    placeholder="Select Bill Type"
                    name="billType"
                    value={billType}
                    onChange={setBillType}
                    options={billTypeOptions}
                  />
                </div>

                
                {billType.target?.value === "Other" && (
                  <>                 
                    <div className="form-group mb-3 w-100">
                      <label> Particular</label>
                      <textarea
                        className="form-control w-100"
                        placeholder="Enter description"
                        style={{ minHeight: "80px" }}
                        value={othersParticular}
                        onChange={(e) => setOthersParticular(e.target.value)}
                      />
                    </div>
                  </>
                )}
                  <div className="form-group mb-3">
                    <label>Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>          
              </div>
        
              <div className="form-group mb-3">
                <label htmlFor="paymentmode">Payment Type</label>

                <CommonSelect
                  header="Select Payment Type"
                  placeholder="Select Payment Type"
                  name="paymentmode"
                  value={paymentmode}
                  onChange={setPaymentmode}
                  options={paymentModeOptions}
                />
              </div>

              <div className="w-100">
                <label htmlFor="datetime">Date and time</label>
                <DatePicker
                  selected={dateTime}
                  onChange={(date) => setDateTime(date)}
                  placeholderText="DD/MM/YYYY"
                  className="form-control-st datpick-select-of w-100"
                  dateFormat="dd-MM-yyyy"
                />
              </div>

              {paymentmode?.target?.value === "Online" && (
                <>
                  {/* Upload Receipt */}
                  <div className="w-100 mt-2">
                    <h6 className="upload-title">Upload receipt</h6>
                    <label htmlFor="imageUpload" className="upload-box">
                      <input
                        type="file"
                        id="imageUpload"
                        onChange={handleImageChange}
                        accept="image/jpeg, image/png"
                        hidden
                      />
                      <SvgContent svg_name="btn_upload" stroke="#0B622F" />
                      <span style={{ color: "#121212", zIndex: "6" }}>
                        Upload image
                      </span>
                    </label>

                    {image && (
                      <p className="uploaded-file">Selected: {image.name}</p>
                    )}
                  </div>

                  {/* Transaction ID + Date */}
                  <div className="form-row gap-2 mt-3">
                    <div className="w-100">
                      <label>Transaction ID</label>
                      <input
                        type="text"
                        className="form-control-st commcb-select-of w-100"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter transaction ID"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* ======================================================= */}

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setAddExpenseOpen(false);
                }}
              >
                Close
              </button>
              <button className="next-button" onClick={handleSaveExpense}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {premiumOpen && (
        <div className="modal-overlay modal-overlay-position">
          <div className="modal-container modal-overlay-position" style={{ width: "625px" }}>
            <div className="modal-header">
              <h5 className="mb-0 add-new-hdr">Premium</h5>
            </div>
            <div className="modal-body">
              <p>Enter amount to segregate premium members</p>
              <div className="container commonst-select mb-3">
                <h6>Client type</h6>
                <div className="comm-select-ba">
                  <CommonSelect
                    ref={clientTypeSelectRef}
                    header="Select type"
                    placeholder="Select type"
                    name="client_type"
                    value={clientType}
                    onChange={setClientType}
                    options={ClientType}
                  />
                </div>
              </div>
              <div className="container commonst-select mb-3">
                <h6>Select Level</h6>
                <div className="comm-select-ba">
                  <CommonSelect
                    header="Select level"
                    placeholder="Select level"
                    name="level"
                    value={selectLevel}
                    onChange={setSelectLevel}
                    options={SelectLevel}
                  />
                </div>
              </div>
              <div className="container commonst-select mb-3">
                <h6>Enter amount</h6>
                <div className="comm-select-ba">
                  <input
                    type="text"
                    name="percentage"
                    className="form-control location-ip-br"
                    placeholder="Enter amount"
                    value={premAmount}
                    onChange={(e) => setPremAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setPremiumOpen(false);
                  setIsPremiumButtonActive(false);
                }}
              >
                Close
              </button>
              <button
                className="next-button"
                onClick={() => {
                  savePremiumData();
                  setIsPremiumButtonActive(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {openGstModal &&
        (openGstModal === "Select" ?
          (
            <div className="modal-overlay modal-overlay-position">
              <div className="modal-container modal-overlay-position" style={{ width: "625px" }}>
                <div className="modal-header">
                  <h5 className="mb-0 add-new-hdr">GST %</h5>

                  <div className='d-flex gap-2 justify-content-center align-items-center'>
                    <button className='common-gst-add' onClick={() => setOpenGstModal("Add")} >
                      <SvgContent svg_name="add_gst" className="svg-class-gst" />
                    </button>
                    <button className='common-gst-add' onClick={() => setOpenViewGSTDatas(true)} >
                      <SvgContent svg_name="eye_gst" className="svg-class-gst" />
                    </button>
                  </div>
                </div>
                <div className="modal-body">
                  <div className="container commonst-select-gst mb-3 common-gst-input">
                    <h6 className="min-wdset-gst">Select GST no</h6>
                    <div className="comm-select-ba h-auto" style={{ width: "calc(100% - 200px)" }}>
                      <CommonSelect
                        header="Select gst no"
                        placeholder="Select gst no"
                        name="gst_no"
                        value={gstData}
                        onChange={setGstData}
                        options={gstListDetails}
                      />
                    </div>
                  </div>
                  {gstData &&
                    (
                      <div className="container commonst-select-gst mb-3 common-gst-input">
                        <h6 className="min-wdset-gst">Selected HSN</h6>
                        <div className="comm-select-ba h-auto " style={{ width: "calc(100% - 200px)" }}>
                          <input
                            type="text"
                            name="Select HSN"
                            className="form-control location-ip-br h-100"
                            value={gstData?.target?.code || ''}
                            readOnly
                          />
                        </div>
                      </div>
                    )}
                  <div className="container commonst-select-gst mb-3 common-gst-input">
                    <h6 className="min-wdset-gst">Enter percentage (%)</h6>
                    <div className="comm-select-ba" style={{ width: "calc(100% - 200px)" }}>
                      <input
                        type="text"
                        name="percentage"
                        className="form-control location-ip-br h-100"
                        placeholder="Enter percentage"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="cancel-button" onClick={() => { setOpenGstModal(false); setIsGstEnabled(!isGstEnabled); setGstData(''); }} >Close</button>
                  <button className="next-button" onClick={() => onGstforPurchase("ON")} >Save</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="modal-overlay modal-overlay-position">
              <div className="modal-container modal-overlay-position" style={{ width: "625px" }}>
                <div className="modal-header">
                  <h5 className="mb-0 add-new-hdr">Add GST %</h5>
                </div>
                <div className="modal-body">
                <div className="container commonst-select-gst mb-3 common-gst-input">
                    <h6 className="min-wdset-gst">Enter GST No</h6>
                    <div className="comm-select-ba" style={{ width: "calc(100% - 200px)" }}>
                      <input
                        type="text"
                        name="percentage"
                        className="form-control location-ip-br h-100"
                        placeholder="Enter percentage"
                        value={gstValue || ''}
                        onChange={(e) => setGstValue(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="container commonst-select-gst mb-3 common-gst-input">
                    <h6 className="min-wdset-gst">Enter HSN No</h6>
                    <div className="comm-select-ba" style={{ width: "calc(100% - 200px)" }}>
                      <input
                        type="text"
                        name="percentage"
                        className="form-control location-ip-br h-100"
                        placeholder="Enter percentage"
                        value={hsnValue || ''}
                        onChange={(e) => setHsnValue(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="cancel-button" onClick={() => { setOpenGstModal(false); setIsGstEnabled(!isGstEnabled); setGstData(''); }} >Close</button>
                  <button className="next-button" onClick={addGSTHSNValues} >Save</button>
                </div>
              </div>
            </div>
          ))
      }

      {isPopupOpen && (
        <div className="accountpp-modal-overlay">
          <div className="accountpp-modal-container" ref={popupRef}>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <div className='d-flex  align-items-center'>
                <h5 className='mb-0 fw-bold'>{selectedRowData[0]?.branch_id} -&nbsp;</h5>
                <h5 className='mb-0'> {selectedRowData[0]?.location} </h5>
              </div>
              <button className="accountpp-close-btn" onClick={handleClosePopup}>X</button>
            </div>
            
            <div className='table-common-st table-common-ac' >
              <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
                <div className='brcommon-col-st w-10'>
                  S no
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  Emp ID
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  sales
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-10'>
                  Billing
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-10'>
                  Class
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  Wallet
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  Consult
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  Total value
                </div>
              </div>

              <div className='tb-body-row-st' style={{ minWidth: "1112px", minHeight: "392px" }}>
                {selectedRowData && selectedRowData.length > 0 ? (selectedRowData.map((item, index) => (
                  <div className='display-flex br-rowst cursor-pointer' key={`${item.user_recid}-${index}`} >
                    <div className='brcommon-col-st w-10'>
                      {index + 1}
                    </div>
                    <div className='brcommon-col-st w-15'>
                      {item.emp_id || ''}
                    </div>
                    <div className='brcommon-col-st w-15'>
                     {item.total_sale_amount || 0}
                    </div>
                    <div className='brcommon-col-st w-10'>
                      {item.Bill_total_amount || 0}
                    </div>
                    <div className='brcommon-col-st w-10'>
                      {item.cl_paid_amount || 0}
                    </div>
                    <div className='brcommon-col-st w-15'>
                      {item.wl_total_amount || 0}
                    </div>
                    <div className='brcommon-col-st w-15'>
                      {item.con_total_amount || 0}
                    </div>
                    <div className='brcommon-col-st w-15'>
                      {
                        (
                          parseFloat(item.total_sale_amount || 0) +
                          parseFloat(item.cl_paid_amount || 0) +
                          parseFloat(item.wl_total_amount || 0) +
                           parseFloat(item.Bill_total_amount || 0) +
                          parseFloat(item.con_total_amount || 0)
                        ).toFixed(2)
                      }
                    </div>
                  </div>
                ))) : (
                  <div className='tb-nodata-row-st display-flex '>
                    No Accounts list
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {isExpPopupOpen && (
        <div className="accountpp-modal-overlay">
          <div className="accountpp-modal-container  h-100" style={{width:'95%'}}  ref={popupRef}>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <div className='d-flex  align-items-center'>
                <h5 className='mb-0 fw-bold'>{selectedExpRowData[0]?.branch_id || selectedDataByBranch?.emp_id}&nbsp;</h5>
                <h5 className='mb-0'>
                  {locationData ? (` - ` + locationData) : ''}
                </h5>
              </div>
              <button className="accountpp-close-btn" onClick={handleClosePopup}>X</button>
            </div>

            <div className='d-flex justify-content-between align-items-center mb-3 setheight-acst flex-wrap overflow-auto' style={{ border: "1px solid #ededed", borderRadius: "6px" }} >
              <div className='bodyhead-div-ac flex-column'>
                <h5 className='mb-0'>₹ {selectedDataByBranch?.total_salary || 0}</h5>
                <p className='mb-0' style={{ color: "rgb(152 152 152)" }}>Salary</p>
              </div>
              <div className='bodyhead-div-ac flex-column'>
                <h5 className='mb-0'>₹ {(parseFloat(selectedDataByBranch.sl_monthly_incentive || 0) + parseFloat(selectedDataByBranch.fs_monthly_incentive || 0) + parseFloat(selectedDataByBranch.ca_monthly_incentive || 0) + parseFloat(selectedDataByBranch.wd_monthly_incentive || 0)).toFixed(2)}</h5>
                <p className='mb-0' style={{ color: "rgb(152 152 152)" }}>Incentive</p>
              </div>
              <div className='bodyhead-div-ac flex-column'>
                <h5 className='mb-0'>₹ {selectedDataByBranch?.monthly_rent || 0}</h5>
                <p className='mb-0' style={{ color: "rgb(152 152 152)" }}>Rent</p>
              </div>
              <div className='bodyhead-div-ac flex-column'>
                <h5 className='mb-0'>₹ {selectedDataByBranch?.monthly_other_expenses || 0}</h5>
                <div className='display-flex gap-1'>
                  <p className='mb-0' style={{ color: "rgb(152 152 152)" }}>
                    Others
                  </p>
                  <button onClick={() => openOtherExpallData(selectedDataByBranch?.br_userid)}>
                    <SvgContent svg_name="info_acc" width={18} height={18} />
                  </button>
                </div>
              </div>
              <div className='bodyhead-div-ac flex-column'>
                <h5 className='mb-0'>₹
                  {
                    (
                      parseFloat(selectedDataByBranch.total_salary || 0) +
                      parseFloat(selectedDataByBranch.monthly_rent || 0) +
                      parseFloat(selectedDataByBranch.sl_monthly_incentive || 0) +
                      parseFloat(selectedDataByBranch.fs_monthly_incentive || 0) +
                      parseFloat(selectedDataByBranch.monthly_other_expenses || 0)
                    ).toFixed(2)
                  }
                </h5>
                <p className='mb-0' style={{ color: "rgb(152 152 152)" }}>Total</p>
              </div>
            </div>

            <div className='table-common-st table-common-ac' style={{ height: "calc(100% - 122px) !important" }} >
              <div className='tb-header-row-st display-flex' style={{ minWidth: "1112px" }}>
                <div className='brcommon-col-st w-8'>
                  S no
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  Emp ID
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-14'>
                  Designation
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-8'>
                  Inc (%)
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-15'>
                  Amount
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-18'>
                  Incentive 
                </div> <span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-10'>
                  Salary
                </div><span style={{ color: "#129347" }}> | </span>
                <div className='brcommon-col-st w-12'>
                  Total <br/>Salary + Incentive 
                </div>
              </div>

              <div className='tb-body-row-st overflow-auto' style={{ minWidth: "1112px", minHeight: "392px" }}>
                {selectedExpRowData && selectedExpRowData.length > 0 ? (selectedExpRowData.map((item, index) => (
                  <div className='display-flex br-rowst cursor-pointer' key={`${item.user_recid}-${index}`} >
                    <div className='brcommon-col-st w-8'>
                      {index + 1}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-15'>
                      {item.emp_id || ''}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-14'>
                      {item.designation || 0}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-8'>
                      {item.incentive_percentage || 0}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-15'>
                     {(parseFloat(item.sl_monthly_value || 0) + parseFloat(item.fsl_monthly_value|| 0) + parseFloat(item.ca_monthly_value|| 0) + parseFloat(item.wd_monthly_value|| 0)).toFixed(2) }
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-18'>
                      {(parseFloat(item.sl_monthly_incentive || 0) + parseFloat(item.fsl_monthly_incentive|| 0) + parseFloat(item.ca_monthly_incentive|| 0) + parseFloat(item.wd_monthly_incentive|| 0)).toFixed(2) }
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-10'>
                      {item.salary || 0}
                    </div><span style={{ color: "#ffffffff" }}> | </span>
                    <div className='brcommon-col-st w-12'>
                      {
                        (
                          parseFloat(item.fsl_monthly_incentive || 0) +
                          parseFloat(item.sl_monthly_incentive || 0) +
                          parseFloat(item.ca_monthly_incentive || 0) +
                          parseFloat(item.wd_monthly_incentive || 0) +
                          parseFloat(item.salary || 0)
                        ).toFixed(2)
                      }
                    </div>
                  </div>
                ))) : (
                  <div className='tb-nodata-row-st display-flex'>
                    No data list
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

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

      {openOtherExpensesData && (
        <div className="accountpp-modal-overlay">
          <div className="accountpp-modal-othercontainer" >
            <div className='' style={{height:'calc(100% - 60px)',padding:'20px 20px 0px 20px ', width:"600px"}}>
                {othersExpData && othersExpData.length > 0 ? (
            <div className="common-overall-container h-100" >
             <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-th">
                  <tr className=' table-th-row'>
                    <th>S.No</th>
                    <th>Bill Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                   </tr>
                </thead>
                <tbody className="tbody-responsive">
                  {othersExpData.map((item, index) => (
                    <tr key={item.id} style={{ position: "relative" }}>
                      <td>{ index + 1}</td>
                      <td> {item.bill_type || ''}</td>                     
                      <td>₹{item.amount || ''}</td>
                      <td>{new Date(item.date_time).toISOString().split('T')[0]}</td>                                                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
            ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div style={{ textAlign: 'center', color: '#999' }}>
                <p style={{ fontSize: '16px', marginBottom: '10px' }}>📋 No Data Found</p>
                <p style={{ fontSize: '14px' }}>No other expenses recorded yet</p>
              </div>
            </div>
          )}
            </div>
            
            <div style={{height:'60px'}}  className="d-flex align-iterms-center justify-content-end p-3">
            <div >
              <button className="cancel-button" onClick={() => setOpenOtherExpensesData(false)} >Close</button>
            </div>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <FilterModal onFilterData={onFilterDataFunc} selectedFilters={selectedFilters}
          onClose={() => { setShowFilterModal(false); setActiveButton(null); }}
        />
      )}

      {openViewGSTDatas && (
        <div className="modal-overlay modal-overlay-position">
          <div className="modal-container modal-overlay-position" style={{ width: "fit-content", minWidth: "342px" }}>
            <div className="modal-header">
              <h5 className="mb-0 add-new-hdr">GST & HSN</h5>
            </div>

            <div className="modal-body">
              {gstHSNDetails && gstHSNDetails.map((item, index) => (
                <div className="d-flex justify-content-between align-items-center mb-2 " key={index}>
                  <input
                    type="text"
                    ref={(el) => (gstInputRefs.current[index] = el)}
                    className="form-control location-ip-br h-100"
                    value={gstNewData[index] ?? item.gst_number}
                    onChange={(e) =>
                      setGstNewData({ ...gstNewData, [index]: e.target.value })
                    }
                    readOnly={editableGSTIndex !== index}
                  />

                  <div className="d-flex gap-2 justify-content-center align-items-center">
                    <button
                      className="common-gst-add common-gst-add-st"
                    >
                    </button>
                  </div>

                  <input
                    type="text"
                    ref={(el) => (hsnInputRefs.current[index] = el)}
                    className="form-control location-ip-br h-100"
                    value={hsnNewData[index] ?? item.hsn_codes}
                    onChange={(e) =>
                      setHsnNewData({ ...hsnNewData, [index]: e.target.value })
                    }
                    readOnly={editableHSNIndex !== index || editableGSTIndex !== index}
                  />

                  <div className="d-flex gap-2 justify-content-center align-items-center ms-2">
                    <button
                      className="common-gst-add"
                      onClick={() => {
                        setEditableHSNIndex(editableHSNIndex === index ? null : index);
                        setEditableGSTIndex(editableGSTIndex === index ? null : index);
                      }
                      }
                    >
                      <SvgContent
                        svg_name={editableHSNIndex === index ? "save_gst" : "pen_gst"}
                        className="svg-class-gst"
                      />
                    </button>
                    <button className="common-gst-add" onClick={() => { setOpenConfirmGstHsn(true); setSelectedItems(item); }}>
                      <SvgContent svg_name="del_gst" className="svg-class-gst" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setOpenViewGSTDatas(null);
                  setEditableHSNIndex(null);
                  setEditableGSTIndex(null);
                  setHsnNewData({});
                }}
              >
                Close
              </button>
              <button className="next-button" onClick={() => handleGSTSave()}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {openConfirmGstHsn && (
        <div className="modal-overlay modal-overlay-position">
          <div className="modal-container modal-overlay-position" style={{ width: "fit-content", minWidth: "342px" }}>
            <div className="modal-header mb-3">
              <h5 className="mb-0 add-new-hdr fw-semibold">Confirm to delete</h5>
            </div>

            <div className="modal-body">
              <h6 className="mb-0 add-new-hdr lh-lg">Are you sure to delete this <br /> GST: "{selectedItems?.gst_number}" - HSN: "{selectedItems?.hsn_codes}" ?</h6>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setOpenConfirmGstHsn(null);
                }}
              >
                Close
              </button>
              <button className="next-button" onClick={() =>
                handleGSTDelete()
              }  >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
}

export default Accounts;
