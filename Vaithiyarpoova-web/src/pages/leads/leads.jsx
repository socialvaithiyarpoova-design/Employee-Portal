import React, { useState, useEffect, useRef } from 'react';
import '../../assets/styles/leads.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import configModule from '../../../config.js';
import { PropagateLoader } from 'react-spinners';
import { useNavigate, useLocation } from 'react-router-dom';
import CommonSelect from "../../components/common-select.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SvgContent from '../../components/svgcontent.jsx';
import AddConsultingModal from './consulting.jsx';
import locationData from "../../components/districts.json";
import ToggleButton from '../../components/Toggle.jsx';

function Leads() {
  const { user, accessMenu } = useAuth();
  const location = useLocation();
  const [buttonPermissions, setButtonPermissions] = useState({});
  const userId = user?.userId;
  const user_typecode = user?.user_typecode;
  const [loading, setLoading] = useState(false);
  const [catagory, setCatagory] = useState([]);
  const [leadsClData, setLeadsClData] = useState([]);
  const [needLoading, setNeedLoading] = useState(false);
  const config = configModule.config();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editableDisposition, setEditableDisposition] = useState({});
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [hoveredOption, setHoveredOption] = useState(null);
  const [hoveredLeadId, setHoveredLeadId] = useState(null);
  const [showDatePickerFor, setShowDatePickerFor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [walletPopupOpen, setWalletPopupOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState("");
  const [searchClicked, setSearchClicked] = useState(true);
  const [openConsulting, setOpenConsulting] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const customerIDRef = useRef(null);

  const [locationProfile, setLocationProfile] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");

  const [isIndiaOnly, setIsIndiaOnly] = useState(true); // Default to India only

  // Add ONLY these new states for Global mode:
  const [countryOption, setCountryOption] = useState([]);
  const [stateOption, setStateOption] = useState([]);
  const [cityOption, setCityOption] = useState([]);

  const [globalCountry, setGlobalCountry] = useState(null);
  const [globalState, setGlobalState] = useState(null);
  const [globalCity, setGlobalCity] = useState(null);


  // Add useEffect ONLY for global state (not for India)
  useEffect(() => {
    // Only run for global mode
    if (!isIndiaOnly && globalCountry?.target?.id) {
      setStateOption([]);
      setGlobalState(null);
      fetchStatesByCountry(globalCountry.target.id);
    }
  }, [globalCountry]);

  useEffect(() => {
    // Only run for global mode
    if (!isIndiaOnly && globalState?.target?.id) {
      setCityOption([]);
      setGlobalCity(null);
      fetchCityByState(globalState.target.id);
    }
  }, [globalState]);

  const getLocationDetails = async () => {
    try {
      const response = await axios.get(
        `${config.apiBaseUrl}getLocationDetails`
      );

      const result = response.data;
      if (response.status === 200) {
        setCountryOption(result.data);
      } else {
        toast.error("Failed to fetch location details: " + result.message);
        console.error("Failed to fetch location details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching location details: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const fetchCityByState = async (id) => {
    setNeedLoading(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}getCityByState`, {
        state_id: id,
      });

      const result = response.data;
      if (response.status === 200) {
        setCityOption(result.data);
      } else {
        toast.error("Failed to fetch location details: " + result.message);
        console.error("Failed to fetch location details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching location details: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  const fetchStatesByCountry = async (id) => {
    setNeedLoading(true);
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}getStateByCoutry`,
        {
          country_id: id,
        }
      );

      const result = response.data;
      if (response.status === 200) {
        setStateOption(result.data);
      } else {
        toast.error("Failed to fetch location details: " + result.message);
        console.error("Failed to fetch location details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching location details: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    //setLocation('');
    if (user) {
      getLocationDetails();
    }
  }, [user]);

  

  // Load button permissions based on current path
  useEffect(() => {
    if (accessMenu && location.pathname) {
      const currentPath = location.pathname;
      const menuItem = accessMenu.find(
        (item) => item.path === currentPath || item.path === "/leads"
      );

      if (menuItem) {
        setButtonPermissions({
          search: menuItem.search_btn === 1,
          create_profile: menuItem.create_profile_btn === 1,
        });
      }
    }
  }, [accessMenu, location.pathname]);

  //wallet
  const [amount, setAmount] = useState("");
  const [callbackDate, setCallbackDate] = useState(null);
  const [comments, setComments] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [dateTime, setDateTime] = useState(null);

  const countryOptions = Object.keys(locationData).map((c) => ({
    label: c,
    value: c,
  }));

  // STATE OPTIONS (based on selected country)
  const stateOptions =
    country && locationData[country]
      ? Object.keys(locationData[country]).map((s) => ({
          label: s,
          value: s,
        }))
      : [];

  // DISTRICT OPTIONS (based on selected state)
  const districtOptions =
    country && state
      ? locationData[country][state].map((d) => ({
          label: d,
          value: d,
        }))
      : [];

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
    setState("");
    setDistrict("");
  };

  const handleStateChange = (e) => {
    setState(e.target.value);
    setDistrict("");
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
  };

  const validateEmail = (email) => {
    if (email !== email.toLowerCase()) {
      return {
        isValid: false,
        message: "Email must contain only lowercase letters.",
      };
    }
    if (!email.includes("@")) {
      return { isValid: false, message: "Email must contain '@' symbol." };
    }
    const parts = email.split("@");
    if (parts.length !== 2) {
      return {
        isValid: false,
        message: "Email must contain exactly one '@' symbol.",
      };
    }
    const [localPart, domain] = parts;
    if (!localPart || localPart.trim() === "") {
      return { isValid: false, message: "Email must have text before '@'." };
    }
    if (!domain || domain.trim() === "") {
      return { isValid: false, message: "Email must have domain after '@'." };
    }
    if (!domain.includes(".")) {
      return {
        isValid: false,
        message: "Email domain must contain a '.' (e.g., gmail.com).",
      };
    }
    const domainParts = domain.split(".");
    if (domainParts.some((part) => !part || part.trim() === "")) {
      return { isValid: false, message: "Invalid email domain format." };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address." };
    }
    return { isValid: true, message: "" };
  };

  const validateMobileNumber = (mobile) => {
    if (!mobile?.trim()) {
      return { isValid: false, message: "Mobile number is required." };
    }
    const cleanMobile = mobile.trim();
    if (!/^\d+$/.test(cleanMobile)) {
      return {
        isValid: false,
        message: "Mobile number must contain only digits.",
      };
    }
    if (cleanMobile.length !== 10) {
      return {
        isValid: false,
        message: "Mobile number must be exactly 10 digits.",
      };
    }
    if (!/^[6-9]/.test(cleanMobile)) {
      return {
        isValid: false,
        message: "Mobile number must start with 6, 7, 8, or 9.",
      };
    }

    return { isValid: true, message: "" };
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  const handleImageUpload = (e) => {
    setReceipt(e.target.files[0]);
    e.target.value = null;
  };

  const currentDirectory = leadsClData?.filter((item) =>
    `${item.title} ${item.lead_name} ${item.mobile_number} ${item.district}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const groupedOptions = {
    Interested: ["Sales", "Consulting", "Class", "Wallet"],
    base: [
      "Interested",
      "Not interested",
      "Call back",
      "Follow up",
      "Call not response",
    ],
  };

  const getLeadsPage = async () => {
    setNeedLoading(true);
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}getAllLeadsDataForCl`,
        {
          userId: userId,
        }
      );

      const result = response.data;

      if (response.status === 200) {
        setLeadsClData(result.leads);
        setCatagory(result.categories);
      } else {
        toast.error("Failed to fetch designation list: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching designation list: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  const formatDateTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  useEffect(() => {
    if (user) {
      getLeadsPage();
    }
  }, [user]);

  useEffect(() => {
    if (searchInput === "" || searchInput === null) {
      setSearchClicked(false);
    }
  }, [searchInput]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        if (showModal) {
          setShowModal(false);
          setActiveButton(null);
        }
        if (walletPopupOpen) {
          handleCloseWallet();
        }
        if (openConsulting) {
          setOpenConsulting(false);
        }
      }
    };

    if (showModal || walletPopupOpen || openConsulting) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [showModal, walletPopupOpen, openConsulting]);

  function formatDateToMySQL(dateObj) {
    const pad = (n) => String(n).padStart(2, "0");

    const year = dateObj.getFullYear();
    const month = pad(dateObj.getMonth() + 1);
    const day = pad(dateObj.getDate());
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    const seconds = pad(dateObj.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const TypeGender = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  const handleDispositionChange = async (
    leadId,
    newDisposition,
    followupDate = null
  ) => {
    if (newDisposition !== "Interested") {
      try {
        const response = await axios.post(
          `${config.apiBaseUrl}updateDisposition`,
          {
            key: newDisposition,
            id: leadId,
            followup_date: followupDate
              ? formatDateToMySQL(followupDate)
              : null,
          }
        );

        if (response.status === 200) {
          toast.success("Disposition updated");
          getLeadsPage();
        } else {
          toast.error("Failed to update disposition");
        }
      } catch (error) {
        console.error("Error updating disposition:", error);
        toast.error(
          error?.response?.data?.message ||
            error.message ||
            "Error updating disposition"
        );
      }
    }
  };

  const handleDispositionSubChange = (objData, sub) => {
    if (sub === "Sales") {
      user_typecode === "VA"
        ? navigate("/appointments/add-to-card", {
            state: { selectedData: objData, catagory: catagory },
          })
        : navigate("/leads/add-to-card", { state: { selectedData: objData } });
    } else if (sub === "Consulting") {
      setOpenConsulting(true);
      setSelectedItems(objData);
    } else if (sub === "Class") {
      user_typecode === "VA"
        ? navigate("/appointments/class-register", {
            state: { selectedData: objData, catagory: catagory },
          })
        : navigate("/leads/class-register", {
            state: { selectedData: objData, catagory: catagory },
          });
    } else if (sub === "Wallet") {
      setWalletPopupOpen(true);
      setSelectedItems(objData);
    }
  };

  // const handleAddProfile = async () => {
  //   const genderName = gender?.target?.name;
  //   const countryName = country;
  //   const stateName = state;
  //   const cityName = district;

  //   if (!name || !age || !genderName || !mobile) {
  //     toast.error("Please fill in all required fields.");
  //     return;
  //   }

  //   if (!countryName || !stateName || !cityName) {
  //     toast.error("Please fill in address fields.");
  //     return;
  //   }

  //   const mobileValidation = validateMobileNumber(mobile);
  //   if (!mobileValidation.isValid) {
  //     toast.error(mobileValidation.message);
  //     return;
  //   }

  //   if (email && email.trim() !== "") {
  //     const emailValidation = validateEmail(email);
  //     if (!emailValidation.isValid) {
  //       toast.error(emailValidation.message);
  //       return;
  //     }
  //   }
  //   const profileData = {
  //     name,
  //     age,
  //     genderName,
  //     mobile,
  //     email,
  //     countryName,
  //     stateName,
  //     cityName,
  //     locationProfile,
  //     userId,
  //   };

  //   try {
  //     const response = await axios.post(
  //       `${config.apiBaseUrl}createProfileData`,
  //       { profileData }
  //     );
  //     if (response.status === 200) {
  //       toast.success("Profile successfully created.");
  //       getLeadsPage();

  //       setShowModal(false);
  //       setActiveButton(null);
  //       setName("");
  //       setAge("");
  //       setGender("");
  //       setMobile("");
  //       setEmail("");
  //       setLocationProfile("");
  //     } else {
  //       toast.error("Failed to update disposition");
  //     }
  //   } catch (error) {
  //     console.error("Error updating disposition:", error);
  //     const errorMessage =
  //       error?.response?.data?.message ||
  //       error.message ||
  //       "Error updating disposition";
  //     toast.error(errorMessage);
  //   }
  // };

  //new change
  // Update handleAddProfile
  const handleAddProfile = async () => {
    const genderName = gender?.target?.name;

    if (!name || !age || !genderName || !mobile) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Validate location based on mode
    let countryName, stateName, cityName;

    if (isIndiaOnly) {
      // India mode - use existing states
      if (!country || !state || !district) {
        toast.error("Please fill in all address fields.");
        return;
      }
      countryName = country;
      stateName = state;
      cityName = district;
    } else {
      // Global mode - use new global states
      if (
        !globalCountry?.target?.name ||
        !globalState?.target?.name ||
        !globalCity?.target?.name
      ) {
        toast.error("Please fill in all address fields.");
        return;
      }
      countryName = globalCountry.target.name;
      stateName = globalState.target.name;
      cityName = globalCity.target.name;
    }

    const mobileValidation = validateMobileNumber(mobile);
    if (!mobileValidation.isValid) {
      toast.error(mobileValidation.message);
      return;
    }

    if (email && email.trim() !== "") {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.message);
        return;
      }
    }

    const profileData = {
      name,
      age,
      genderName,
      mobile,
      email,
      countryName,
      stateName,
      cityName,
      locationProfile,
      userId,
    };

    try {
      const response = await axios.post(
        `${config.apiBaseUrl}createProfileData`,
        { profileData }
      );
      if (response.status === 200) {
        toast.success("Profile successfully created.");
        getLeadsPage();

        setShowModal(false);
        setActiveButton(null);

        // Reset all fields
        setName("");
        setAge("");
        setGender("");
        setMobile("");
        setEmail("");
        setLocationProfile("");

        // Reset location fields
        setCountry("");
        setState("");
        setDistrict("");
        setGlobalCountry(null);
        setGlobalState(null);
        setGlobalCity(null);
      } else {
        toast.error("Failed to create profile");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Error creating profile";
      toast.error(errorMessage);
    }
  };

  const handleSave = async () => {
    if (!amount || !callbackDate || !comments || !receipt || !dateTime) {
      toast.warn("Please fill all fields before saving.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("callbackDate", formatDateToMySQLQuery(callbackDate));
    formData.append("comments", comments);
    formData.append("receipt", receipt);
    formData.append("folder", "wallet");
    formData.append("transactionId", transactionId);
    formData.append("dateTime", formatDateToMySQLQuery(dateTime));
    formData.append("ownedBy", selectedItems.lead_recid);
    formData.append("createdBy", userId);

    try {
      const response = await axios.post(
        `${config.apiBaseUrl}insertWalletData`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Data saved successfully.");

        setTimeout(() => {
          handleCloseWallet();
          getLeadsPage();

          setSearchQuery(searchInput);

          if (searchInput) {
            setSearchClicked(true);
          }
        }, 2000);
      } else {
        toast.error("Failed to save data.");
      }
    } catch (error) {
      console.error("Error saving data:", error);

      if (
        error?.response?.data?.code === "ER_DUP_ENTRY" ||
        error?.message?.includes("Duplicate entry")
      ) {
        toast.error(
          "Duplicate Transaction ID. Please use a unique Transaction ID."
        );
      } else {
        const errorMessage =
          error?.response?.data?.message ||
          error.message ||
          "Error saving data";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false); // stop loading
    }
  };

  function formatDateToMySQLQuery(date) {
    if (!date) return null;
    const d = new Date(date);
    const pad = (n) => (n < 10 ? "0" + n : n);

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  const handleCloseWallet = () => {
    setWalletPopupOpen(false);
    setEditableDisposition({}); // reset Disposition state
    setSelectedItems("");
    setAmount("");
    setCallbackDate(null);
    setComments("");
    setReceipt(null);
    setTransactionId("");
    setDateTime(null);
    setWalletPopupOpen(false); // clear selected leads if needed
  };

  const handleCloseConsulting = () => {
    setOpenConsulting(false);
    // Reset the disposition state for the selected item
    if (selectedItems?.lead_id) {
      setEditableDisposition((prev) => ({
        ...prev,
        [selectedItems.lead_id]: null,
      }));
    }
    setSelectedItems("");
  };

  // Update handleToggleChange
  const handleToggleChange = () => {
    setIsIndiaOnly(!isIndiaOnly);

    // Reset based on which mode we're LEAVING
    if (isIndiaOnly) {
      // Switching TO Global mode - reset India fields only
      setCountry("");
      setState("");
      setDistrict("");
    } else {
      // Switching TO India mode - reset Global fields only
      setGlobalCountry(null);
      setGlobalState(null);
      setGlobalCity(null);
      setStateOption([]);
      setCityOption([]);
    }
  };
  return (
    <div className="common-body-st">
      {needLoading && (
        <div className="loading-container w-100 h-100">
          <PropagateLoader
            height="100"
            width="100"
            color="#0B9346"
            radius="10"
          />
        </div>
      )}
      <div className="w-100 h-100 p-3">
        <div className="mobile-search-container d-flex shadow-sm rounded ">
          <div className="mobilename-label-st">
            <h5 className="mb-2">Enter mobile number</h5>
            <p className="text-muted mb-0 small">(To check existing entries)</p>
          </div>
          <div
            className="d-flex align-items-center gap-3 "
            style={{ width: "calc(100% - 272px)" }}
          >
            {buttonPermissions.search && (
              <div
                className=" h-100 position-relative"
                style={{
                  width: "calc(100% - 292px)",
                  minWidth: "372px",
                }}
              >
                <input
                  type="number"
                  className="form-control-st mobile-input"
                  placeholder="Enter mobile number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button
                    type="button"
                    className="clear-icon"
                    onClick={clearSearch}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "#999",
                      background: "none",
                      border: "none",
                      padding: 0,
                    }}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            <div className="d-flex gap-2 align-items-center mobilebtn-label-st ">
              {buttonPermissions.search && (
                <button
                  className="search-btn-lead"
                  onClick={() => {
                    setSearchQuery(searchInput);

                    if (searchInput) {
                      setSearchClicked(true);
                    }
                  }}
                >
                  Search
                </button>
              )}
              {buttonPermissions.create_profile && (
                <button
                  className={`search-btn-lead ${
                    activeButton === "createProfile" ? "active" : ""
                  }`}
                  onClick={() => {
                    setShowModal(true);
                    setMobile(searchInput);
                    setActiveButton("createProfile");
                    // Focus on Customer ID field when modal opens
                    setTimeout(() => {
                      if (customerIDRef.current) {
                        customerIDRef.current.focus();
                      }
                    }, 100);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();

                      setShowModal(true);
                      setMobile(searchInput);
                      setActiveButton("createProfile");
                      setTimeout(() => {
                        if (customerIDRef.current) {
                          customerIDRef.current.focus();
                        }
                      }, 100);
                    }
                  }}
                  tabIndex={0}
                  aria-label="Create new profile"
                  disabled={!searchClicked || currentDirectory.length > 0}
                >
                  Create Profile
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="body-containerlead-st">
          {searchClicked && currentDirectory.length > 0 ? (
            <div className="h-100 w-100 pt-2 pb-2 pb-0">
              <div className="table-common-st">
                {/* Table Header */}
                <div className="tb-header-row-st display-flex">
                  <div className="brcommon-col-st w-10">S no</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-20">Client ID</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-20">Name</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-10">Age</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-10">Gender</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-15">Mobile</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-20">Disposition</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-15">Date</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-10">Profile</div>
                </div>

                {/* Table Body */}
                <div className="tb-body-row-st">
                  {currentDirectory && currentDirectory.length > 0 ? (
                    currentDirectory.map((item, index) => (
                      <div
                        className="display-flex br-rowst"
                        key={`${item.lead_id}-${index}`}
                      >
                        <div className="brcommon-col-st w-10">{index + 1}</div>
                        <div className="brcommon-col-st w-20">
                          {item.lead_id}
                        </div>
                        <div className="brcommon-col-st w-20">
                          {item.lead_name}
                        </div>
                        <div className="brcommon-col-st w-10">{item.age}</div>
                        <div className="brcommon-col-st w-10">
                          {item.gender}
                        </div>
                        <div className="brcommon-col-st w-15">
                          {item.mobile_number}
                        </div>
                        <div className="brcommonlead-col-st w-20">
                          <div className="custom-dropdown-wrapper">
                            <button
                              type="button"
                              className="custom-dropdown-trigger display-btflex"
                              aria-haspopup="true"
                              aria-expanded={
                                editableDisposition[item.lead_id] === "__open__"
                              }
                              onClick={() =>
                                setEditableDisposition((prev) => ({
                                  ...prev,
                                  [item.lead_id]:
                                    prev[item.lead_id] === "__open__"
                                      ? null
                                      : "__open__",
                                }))
                              }
                            >
                              {editableDisposition[item.lead_id] &&
                              editableDisposition[item.lead_id] !== "__open__"
                                ? editableDisposition[item.lead_id]
                                : item.disposition || "Select disposition"}
                              <SvgContent svg_name="dropdownDown" />
                            </button>

                            {editableDisposition[item.lead_id] ===
                              "__open__" && (
                              <div className="custom-dropdown-menu">
                                {groupedOptions.base.map((option) => {
                                  const isFollowUpOrCallback =
                                    option === "Follow up" ||
                                    option === "Call back" ||
                                    option === "Call not response";
                                  const isInterested = option === "Interested";

                                  return (
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      key={option}
                                      className="dropdown-item-ldst position-relative"
                                      onMouseEnter={() => {
                                        setHoveredLeadId(item.lead_id);
                                        setHoveredOption(option);
                                        if (isFollowUpOrCallback) {
                                          setShowDatePickerFor(option);
                                        } else {
                                          setShowDatePickerFor(null);
                                        }
                                      }}
                                      onMouseLeave={() => {
                                        setHoveredLeadId(null);
                                        setHoveredOption(null);
                                        setShowDatePickerFor(null);
                                      }}
                                      onClick={() => {
                                        if (
                                          !isInterested &&
                                          !isFollowUpOrCallback
                                        ) {
                                          setEditableDisposition((prev) => ({
                                            ...prev,
                                            [item.lead_id]: option,
                                          }));
                                          handleDispositionChange(
                                            item.lead_recid,
                                            option
                                          );
                                        }
                                      }}
                                    >
                                      {option}

                                      {/* Sales submenu */}
                                      {isInterested &&
                                        hoveredLeadId === item.lead_id &&
                                        hoveredOption === "Interested" && (
                                          <div className="submenu">
                                            {groupedOptions.Interested.map(
                                              (sub) => (
                                                <button
                                                  key={sub}
                                                  type="button"
                                                  className="dropdown-item-ldst"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditableDisposition(
                                                      (prev) => ({
                                                        ...prev,
                                                        [item.lead_id]: sub,
                                                      })
                                                    );
                                                    handleDispositionSubChange(
                                                      item,
                                                      sub
                                                    );
                                                  }}
                                                >
                                                  {sub}
                                                </button>
                                              )
                                            )}
                                          </div>
                                        )}

                                      {/* Date picker calendar */}
                                      {isFollowUpOrCallback &&
                                        hoveredLeadId === item.lead_id &&
                                        hoveredOption === option && (
                                          <div className="p-2 w-100 calc-submenu-st">
                                            <DatePicker
                                              maxDate={
                                                new Date(
                                                  new Date().setDate(
                                                    new Date().getDate() + 15
                                                  )
                                                )
                                              }
                                              selected={
                                                selectedDate
                                                  ? new Date(selectedDate)
                                                  : null
                                              }
                                              minDate={new Date()}
                                              onChange={(date) => {
                                                setSelectedDate(date);
                                                const formattedDate = new Date(
                                                  date
                                                ).toLocaleString();
                                                setEditableDisposition(
                                                  (prev) => ({
                                                    ...prev,
                                                    [item.lead_id]: `${option} (${formattedDate})`,
                                                  })
                                                );
                                                handleDispositionChange(
                                                  item.lead_recid,
                                                  option,
                                                  date
                                                );
                                                setHoveredLeadId(null);
                                                setHoveredOption(null);
                                                setShowDatePickerFor(null);
                                              }}
                                              inline
                                            />
                                          </div>
                                        )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="brcommon-col-st w-15">
                          {formatDateTime(item.created_at)}
                        </div>
                        <div className="brcommon-col-st w-10">
                          <button
                            onClick={() =>
                              navigate("/leads/profile", {
                                state: { selectedData: item },
                              })
                            }
                          >
                            <SvgContent svg_name="eyeopen" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="tb-nodata-row-st display-flex">
                      No lead list
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>No data found</div>
          )}
        </div>
      </div>
      {showModal && buttonPermissions.create_profile && (
        <div className="modal-overlay modal-overlay-position">
          <div
            className="modal-container modal-overlay-position"
            style={{ width: "625px", overflow: "auto", maxHeight: "96%" }}
          >
            <div className="modal-header">
              <h5 className="mb-0 add-new-hdr">Create profile</h5>
            </div>
            <div className="modal-body">
              <div className="commonst-select mb-3">
                <label htmlFor="nameInput" className="form-label">
                  Name
                </label>
                <div className="comm-select-ba">
                  <input
                    type="text"
                    id="nameInput"
                    name="name"
                    className="form-control-st heightset-st location-ip-br"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    required
                  />
                </div>
              </div>

              <div className="commonst-select mb-3">
                <label htmlFor="ageInput" className="form-label">
                  Age
                </label>
                <div className="comm-select-ba">
                  <input
                    type="number"
                    id="ageInput"
                    name="age"
                    className="form-control-st heightset-st location-ip-br"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter age"
                    required
                  />
                </div>
              </div>

              <div className="commonst-select mb-3">
                <label htmlFor="categoryInput" className="form-label">
                  Gender
                </label>
                <div className="comm-select-ba position-relative">
                  <CommonSelect
                    header="Select gender"
                    placeholder="Select gender"
                    name="gender"
                    value={gender}
                    onChange={setGender}
                    options={TypeGender}
                  />
                </div>
              </div>
              <div className="commonst-select mb-3">
                <label htmlFor="mobileInput" className="form-label">
                  Mobile number
                </label>
                <div className="comm-select-ba">
                  <input
                    type="number"
                    id="mobileInput"
                    name="mobile"
                    className="form-control-st heightset-st location-ip-br"
                    value={mobile || searchInput}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter mobile number"
                    // maxLength={10}
                    pattern="[0-9]*"
                    required
                  />
                </div>
              </div>

              <div className="commonst-select mb-3">
                <label htmlFor="emailInput" className="form-label">
                  Email
                </label>
                <div className="comm-select-ba">
                  <input
                    type="email"
                    id="emailInput"
                    name="email"
                    className="form-control-st heightset-st location-ip-br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                  />
                </div>
              </div>

              <ToggleButton
                isToggled={!isIndiaOnly}
                onToggle={handleToggleChange}
              />

              {isIndiaOnly ? (
                <>
                  {/* INDIA MODE */}
                  <div className="container commonst-select mb-3">
                    <h6>Select Country</h6>
                    <div className="comm-select-ba">
                      <CommonSelect
                        header="Select Country"
                        name="country"
                        value={country}
                        onChange={handleCountryChange}
                        options={countryOptions}
                        isSearchable={true}
                      />
                    </div>
                  </div>

                  <div className="container commonst-select mb-3">
                    <h6>Select Province / State</h6>
                    <div className="comm-select-ba">
                      <CommonSelect
                        header="Select State"
                        name="state"
                        value={state}
                        onChange={handleStateChange}
                        options={stateOptions}
                        isSearchable={true}
                      />
                    </div>
                  </div>

                  <div className="container commonst-select mb-3">
                    <h6>Select District</h6>
                    <div className="comm-select-ba">
                      <CommonSelect
                        placeholder="Select District"
                        name="district"
                        value={district}
                        onChange={handleDistrictChange}
                        options={districtOptions}
                        isSearchable={true}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* GLOBAL MODE */}
                  <div className="container commonst-select mb-3">
                    <h6>Select Country</h6>
                    <div className="comm-select-ba">
                      <CommonSelect
                        header="Select country"
                        placeholder="Select country"
                        name="globalCountry"
                        value={globalCountry}
                        onChange={setGlobalCountry}
                        options={countryOption}
                        isSearchable={true}
                      />
                    </div>
                  </div>

                  <div className="container commonst-select mb-3">
                    <h6>Select / State</h6>
                    <div className="comm-select-ba">
                      <CommonSelect
                        header="Select province / state"
                        placeholder="Select province / state"
                        name="globalState"
                        value={globalState}
                        onChange={setGlobalState}
                        options={stateOption}
                        isSearchable={true}
                      />
                    </div>
                  </div>

                  <div className="container commonst-select mb-3">
                    <h6>Select Town / District</h6>
                    <div className="comm-select-ba">
                      <CommonSelect
                        header="Select town / district"
                        placeholder="Select town / district"
                        name="globalCity"
                        value={globalCity}
                        onChange={setGlobalCity}
                        options={cityOption}
                        isSearchable={true}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="container commonst-select mb-3">
                <h6>Enter Location</h6>
                <div className="comm-select-ba">
                  <input
                    type="text"
                    name="location"
                    className="form-control-st heightset-st h-100 location-ip-br"
                    placeholder="Enter location"
                    value={locationProfile}
                    onChange={(e) => setLocationProfile(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setShowModal(false);
                  setActiveButton(null);
                }}
              >
                Cancel
              </button>
              <button className="next-button" onClick={handleAddProfile}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {walletPopupOpen && (
        <div className="wallet-container-pm display-flex">
          <div className="wallet-div-st">
            <div className="wallet-container">
              <div className="wallet-header">
                <h5 className="mb-0 setminwd-wallet-st">Wallet</h5>
              </div>

              <div className="wallet-form-group">
                <label className="setminwd-wallet-st">Amount</label>
                <input
                  type="number"
                  value={amount}
                  placeholder="Enter amount"
                  onChange={(e) => setAmount(e.target.value)}
                  className="wallet-input setminwd-wallet-side"
                />
              </div>

              <div className="wallet-form-group">
                <label className="setminwd-wallet-st">Call back</label>
                <DatePicker
                  selected={callbackDate}
                  maxDate={
                    new Date(new Date().setDate(new Date().getDate() + 15))
                  }
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  onChange={(date) => setCallbackDate(date)}
                  className="wallet-date-input setminwd-wallet-side"
                  placeholderText="DD/MM/YYYY"
                />
              </div>

              <div className="wallet-form-group">
                <label className="setminwd-wallet-st">Comments</label>
                <textarea
                  value={comments}
                  placeholder="Enter your comments"
                  onChange={(e) => setComments(e.target.value)}
                  className="wallet-textarea setminwd-wallet-side"
                />
              </div>

              <div className="wallet-upload-section">
                <h5>Upload receipt</h5>
                <p>Upload screenshot to process the wallet order.</p>
                <label className="wallet-upload-box">
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <SvgContent
                    svg_name="btn_upload"
                    stroke="#0B622F"
                    style={{ zIndex: "999" }}
                  />
                  <span style={{ color: "#121212", zIndex: "0" }}>
                    Upload image
                  </span>
                </label>
                {receipt && (
                  <div
                    className="wallet-file-preview"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <p className="wallet-file-name mb-0">{receipt.name}</p>
                    <button
                      type="button"
                      onClick={() => setReceipt(null)}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "red",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                      aria-label="Remove selected file"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="wallet-form-group">
                <label className="setminwd-wallet-st">Transaction ID</label>
                <input
                  type="text"
                  value={transactionId}
                  placeholder="Enter transaction id"
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="wallet-input"
                />
              </div>

              <div className="wallet-form-group">
                <label className="setminwd-wallet-st">Date and time</label>
                <DatePicker
                  selected={dateTime}
                  minDate={new Date()}
                  onChange={(date) => setDateTime(date)}
                  dateFormat="dd-MM-yyyy h:mm aa"
                  timeFormat="hh:mm aa"
                  showTimeSelect
                  timeIntervals={15}
                  placeholderText="DD/MM/YYYY HH:MM"
                  className="wallet-date-input"
                  popperPlacement="bottom"
                />
              </div>

              <div className="wallet-form-footer">
                <button
                  className="wallet-cancel-btn"
                  onClick={handleCloseWallet}
                >
                  Cancel
                </button>
                <button
                  className="wallet-save-btn"
                  disabled={loading}
                  onClick={handleSave}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openConsulting && (
        <AddConsultingModal
          onClose={handleCloseConsulting}
          rowData={selectedItems}
        />
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
    </div>
  );
}

export default Leads;
