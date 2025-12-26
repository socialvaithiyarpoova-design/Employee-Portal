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
import locationData from "../../components/districts.json";
import ToggleButton from "../../components/Toggle.jsx";

function Sales() {
  const { user, accessMenu } = useAuth();
  const userId = user?.userId;
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();
  const [buttonPermissions, setButtonPermissions] = useState({});
  const [catagory, setCatagory] = useState([]);
  const [leadsClData, setLeadsClData] = useState([]);
  const [needLoading, setNeedLoading] = useState(false);
  const config = configModule.config();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editableDisposition, setEditableDisposition] = useState({});
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [shopName, setShopName] = useState("");
  const [shopKeeper, setShopKeeper] = useState("");
  const [shopType, setShopType] = useState("");
  const [shopTypeOther, setShopTypeOther] = useState("");
  const [mobile, setMobile] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gst, setGst] = useState("");
  const [shopImage, setShopImage] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [hoveredLeadId, setHoveredLeadId] = useState(null);
  const [showDatePickerFor, setShowDatePickerFor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [walletPopupOpen, setWalletPopupOpen] = useState(false);
  const [searchClicked, setSearchClicked] = useState(true);
  const [openConsulting, setOpenConsulting] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const nameInputRef = useRef(null);

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

   useEffect(() => {
      //setLocation('');
      if (user) {
        getLocationDetails();
      }
    }, [user]);
    
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

  useEffect(() => {
    if (accessMenu && location.pathname) {
      const currentPath = location.pathname;
      const menuItem = accessMenu.find(
        (item) => item.path === currentPath && item.user_id === user?.userId
      );
      console.log(menuItem);

      if (menuItem) {
        setButtonPermissions({
          search: menuItem.search_btn === 1,
          createProfile: menuItem.create_profile_btn === 1,
        });
      } else {
        setButtonPermissions({});
      }
    }
  }, [accessMenu, location.pathname]);

  useEffect(() => {
    if (!showModal) {
      setActiveButton(null);
    }
  }, [showModal]);

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setSearchClicked(false);
  };

  // const countryOptions = Object.keys(locationData).map((c) => ({
  //   label: c,
  //   value: c,
  // }));

  // // STATE OPTIONS (based on selected country)
  // const stateOptions =
  //   country && locationData[country]
  //     ? Object.keys(locationData[country]).map((s) => ({
  //         label: s,
  //         value: s,
  //       }))
  //     : [];

  // // DISTRICT OPTIONS (based on selected state)
  // const districtOptions =
  //   country && state
  //     ? locationData[country][state].map((d) => ({
  //         label: d,
  //         value: d,
  //       }))
  //     : [];

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

  const fileInputRef = useRef(null);

  const handleShopImageUpload = (e) => {
    setShopImage(e.target.files[0]);
    e.target.value = "";
  };

  const handleRemoveShopImage = () => {
    setShopImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentDirectory = leadsClData?.filter((item) =>
    `${item.title} ${item.lead_name} ${item.mobile_number} ${item.district}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const groupedOptions = {
    Interested: ["Sales"],
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
      const response = await axios.get(`${config.apiBaseUrl}getAllSalesByFs`);

      const result = response.data;

      if (response.status === 200) {
        setLeadsClData(result.leads || []);
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

  // Reset create profile button active state when modal closes
  useEffect(() => {
    if (!showModal && activeButton === "createProfile") {
      setActiveButton(null);
    }
  }, [showModal, activeButton]);

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
        }
        if (walletPopupOpen) {
          setWalletPopupOpen(false);
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

  const handleDispositionChange = async (
    leadId,
    newDisposition,
    followupDate = null
  ) => {
    if (newDisposition !== "Interested") {
      try {
        const response = await axios.post(
          `${config.apiBaseUrl}updateDispositionByFS`,
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
      navigate("/sales/add-to-card", {
        state: { selectedData: objData, catagory: catagory },
      });
    }
  };

  const handleAddShopProfile = async () => {
    if (!shopName?.trim()) {
      toast.error("Shop name is required.");
      return;
    }
    if (!shopKeeper?.trim()) {
      toast.error("Shop keeper name is required.");
      return;
    }
    if (!shopType?.target?.name && !shopType) {
      toast.error("Shop type is required.");
      return;
    }
    if (shopType?.target?.value === "Other" && !shopTypeOther?.trim()) {
      toast.error("Please specify the other shop type.");
      return;
    }
    if (!mobile?.trim()) {
      toast.error("Mobile number is required.");
      return;
    }

    const mobileValidation = validateMobileNumber(mobile);
    if (!mobileValidation.isValid) {
      toast.error(mobileValidation.message);
      return;
    }

    if (alternateNumber && alternateNumber.trim() !== "") {
      const alternateValidation = validateMobileNumber(alternateNumber);
      if (!alternateValidation.isValid) {
        toast.error(`Alternate number: ${alternateValidation.message}`);
        return;
      }
    }

    let country, state, district;
    if (isIndiaOnly) {
      if (!country || !state || !district) {
        toast.error("Please fill in all address fields.");
        return;
      }
      country = country;
      state = state;
      city = district;
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
      country = globalCountry?.target?.name;
      state = globalState?.target?.name;
      district = globalCity?.target?.name;
    }

    // if (!address?.trim() && district && state && country) {
    //   toast.error("Address is required.");
    //   return;
    // }

    const shopData = {
      folder: "salesprofile",
      flead_name: shopName,
      shop_keeper: shopKeeper,
      shop_type:
        shopType?.target?.name === "Other"
          ? shopTypeOther
          : shopType?.target?.value || "",
      mobile_number: mobile,
      alternate_number: alternateNumber,
      email: email,
      gst: gst,
      image: shopImage,
      created_by: userId,
      country: country,
      state: state,
      city: district,
      location: address,
    };

    setIsSaving(true);
    try {
      const formData = new FormData();
      Object.keys(shopData).forEach((key) => {
        if (key === "image" && shopImage) {
          formData.append("image", shopImage);
        } else if (shopData[key] !== null && shopData[key] !== undefined) {
          formData.append(key, shopData[key]);
        }
      });

      const response = await axios.post(
        `${config.apiBaseUrl}createShopProfileByFS`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (
        (response.status === 200 || response.status === 201) &&
        response.data.message
      ) {
        toast.success(
          response.data.message || "Shop profile successfully created."
        );
        getLeadsPage();

        setShowModal(false);
        setActiveButton(null);
        resetShopForm();
      } else {
        toast.error("Failed to create shop profile");
      }
    } catch (error) {
      console.error("Error creating shop profile:", error);

      let errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message ||
        "Error creating shop profile";

      // ✅ Customize known DB errors
      if (errorMessage.includes("mobile_number_UNIQUE")) {
        errorMessage = "Mobile number already exists.";
      } else if (errorMessage.includes("email_UNIQUE")) {
        errorMessage = "Email already exists.";
      } else if (errorMessage.includes("flead_id_UNIQUE")) {
        errorMessage = "Shop ID already exists.";
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const resetShopForm = () => {
    setShopName("");
    setShopKeeper("");
    setShopType("");
    setMobile("");
    setAlternateNumber("");
    setEmail("");
    setAddress("");
    setGst("");
    setShopImage(null);
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
              {buttonPermissions.createProfile && (
                <button
                  className={`search-btn-lead ${
                    activeButton === "createProfile" ? "active" : ""
                  }`}
                  style={{
                    background:
                      activeButton === "createProfile"
                        ? "linear-gradient(3deg, #0B622F, #18934B) !important"
                        : "transparent",
                    color:
                      activeButton === "createProfile"
                        ? "white !important"
                        : "#05823a",
                    borderColor:
                      activeButton === "createProfile"
                        ? "#18934B !important"
                        : "#05823a",
                    boxShadow:
                      activeButton === "createProfile"
                        ? "0 2px 8px rgba(11, 98, 47, 0.3)"
                        : "none",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => {
                    setMobile(searchInput || "");
                    setShowModal(true);
                    setActiveButton("createProfile");
                    // Focus on Shop name input when modal opens
                    setTimeout(() => {
                      if (nameInputRef.current) {
                        nameInputRef.current.focus();
                      }
                    }, 100);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setMobile(searchInput || "");
                      setShowModal(true);
                      setActiveButton("createProfile");
                      setTimeout(() => {
                        if (nameInputRef.current) {
                          nameInputRef.current.focus();
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
                  <div className="brcommon-col-st w-15">Shop ID</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-20">Name</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-10">Shop Keeper</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-10">Type</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-15">Mobile</div>{" "}
                  <span style={{ color: "#129347" }}>|</span>
                  <div className="brcommon-col-st w-25">Disposition</div>{" "}
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
                        key={`${item.flead_recid}-${index}`}
                      >
                        <div className="brcommon-col-st w-10">{index + 1}</div>
                        <div className="brcommon-col-st w-15">
                          {item.lead_id}
                        </div>
                        <div className="brcommon-col-st w-20">
                          {item.lead_name}
                        </div>
                        <div className="brcommon-col-st w-10">
                          {item.shop_keeper}
                        </div>
                        <div className="brcommon-col-st w-10">
                          {item.shop_type}
                        </div>
                        <div className="brcommon-col-st w-15">
                          {item.mobile_number}
                        </div>
                        <div className="brcommonlead-col-st w-25">
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
                                    option === "Call back";
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
                                              minDate={new Date()}
                                              selected={
                                                selectedDate
                                                  ? new Date(selectedDate)
                                                  : null
                                              }
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
                              navigate("/sales/profile", {
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
      {showModal && (
        <div className="modal-overlay modal-overlay-position">
          <div
            className="modal-container modal-overlay-position"
            style={{
              width: "625px",
              height: "100%",
              maxHeight: "90%",
              padding: "0px",
            }}
          >
            <div className="modal-sale-header">
              <div className="modal-header mb-0">
                <h5 className="mb-0 add-new-hdr">Create profile</h5>
              </div>
            </div>
            <div className="modal-sale-container">
              <div className="modal-body">
                <div className="commonst-select mb-3">
                  <label htmlFor="shopNameInput" className="form-label">
                    Shop name
                  </label>
                  <div className="comm-select-ba">
                    <input
                      ref={nameInputRef}
                      type="text"
                      id="shopNameInput"
                      name="shop_name"
                      className="form-control location-ip-br"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Enter shop name"
                      required
                    />
                  </div>
                </div>

                <div className="commonst-select mb-3">
                  <label htmlFor="shopKeeperInput" className="form-label">
                    Shop keeper
                  </label>
                  <div className="comm-select-ba">
                    <input
                      type="text"
                      id="shopKeeperInput"
                      name="shop_keeper"
                      className="form-control location-ip-br"
                      value={shopKeeper}
                      onChange={(e) => setShopKeeper(e.target.value)}
                      placeholder="Enter shop keeper name"
                      required
                    />
                  </div>
                </div>

                <div className="commonst-select mb-3">
                  <label htmlFor="shopTypeInput" className="form-label">
                    Shop type
                  </label>
                  <div className="comm-select-ba position-relative">
                    <CommonSelect
                      header="Select shop type"
                      placeholder="Select shop type"
                      name="shop_type"
                      value={shopType}
                      onChange={setShopType}
                      options={[
                        { label: "Retail", value: "Retail" },
                        { label: "Wholesale", value: "Wholesale" },
                        { label: "Medical Store", value: "Medical Store" },
                        { label: "General Store", value: "General Store" },
                        { label: "Other", value: "Other" },
                      ]}
                    />
                  </div>
                </div>

                {shopType?.target?.value === "Other" && (
                  <div className="commonst-select mb-3">
                    <label htmlFor="shopTypeOther" className="form-label">
                      Please specify
                    </label>
                    <div className="comm-select-ba">
                      <input
                        type="text"
                        id="shopTypeOther"
                        name="shop_type_other"
                        className="form-control location-ip-br"
                        value={shopTypeOther}
                        onChange={(e) => setShopTypeOther(e.target.value)}
                        placeholder="Enter shop type"
                      />
                    </div>
                  </div>
                )}

                <div className="commonst-select mb-3">
                  <label htmlFor="mobileInput" className="form-label">
                    Mobile
                  </label>
                  <div className="comm-select-ba">
                    <input
                      type="number"
                      id="mobileInput"
                      name="mobile_number"
                      className="form-control location-ip-br"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                </div>

                <div className="commonst-select mb-3">
                  <label htmlFor="alternateNumberInput" className="form-label">
                    Alternate no
                  </label>
                  <div className="comm-select-ba">
                    <input
                      type="number"
                      id="alternateNumberInput"
                      name="alternate_number"
                      className="form-control location-ip-br"
                      value={alternateNumber}
                      onChange={(e) => setAlternateNumber(e.target.value)}
                      placeholder="Enter alternate number"
                      maxLength={10}
                      pattern="[0-9]*"
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
                      required
                      className="form-control location-ip-br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
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

                <div className="commonst-select mb-4">
                  <label htmlFor="addressInput" className="form-label">
                    Address with landmark
                  </label>
                  <div className="comm-select-ba">
                    <textarea
                      id="addressInput"
                      name="address"
                      className="form-control  "
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter address with landmark"
                      rows="5"
                      style={{
                        resize: "none",
                        height: "100px",
                        minHeight: "52px",
                      }}
                    />
                  </div>
                </div>

                <div className="commonst-select mb-3">
                  <label htmlFor="gstInput" className="form-label">
                    GST
                  </label>
                  <div className="comm-select-ba">
                    <input
                      type="text"
                      id="gstInput"
                      name="gst"
                      className="form-control location-ip-br"
                      value={gst}
                      onChange={(e) => setGst(e.target.value)}
                      placeholder="Enter GST number"
                    />
                  </div>
                </div>

                <div className="commonst-select mb-1">
                  <label htmlFor="imageInput" className="form-label pt-2 mb-0">
                    Image
                  </label>
                  <div className="comm-select-ba">
                    <label
                      className="wallet-upload-box"
                      style={{
                        border: "2px dashed #0B622F",
                        padding: "15px",
                        textAlign: "center",
                        cursor: "pointer",
                        borderRadius: "8px",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        hidden
                        accept="image/jpeg,image/png"
                        onChange={handleShopImageUpload}
                      />
                      <SvgContent
                        svg_name="btn_upload"
                        stroke="#0B622F"
                        style={{ zIndex: "999" }}
                      />
                      <span
                        style={{
                          color: "#121212",
                          zIndex: "0",
                          display: "block",
                          marginTop: "8px",
                        }}
                      >
                        Upload image
                      </span>
                      <span
                        style={{
                          color: "#666",
                          fontSize: "12px",
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        (JPEG, PNG)
                      </span>
                    </label>
                    {shopImage && (
                      <div
                        style={{
                          marginTop: "8px",
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <p
                          style={{
                            color: "#0B622F",
                            fontSize: "12px",
                            marginBottom: "0",
                          }}
                        >
                          {shopImage.name}
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveShopImage}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#ff4d4f",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "16px",
                            lineHeight: "1",
                          }}
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-sale-footer">
              <div className="modal-footer ">
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowModal(false);
                    setActiveButton(null);
                    resetShopForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="next-button"
                  disabled={isSaving}
                  onClick={() => {
                    handleAddShopProfile();
                    setActiveButton(null);
                  }}
                >
                  {" "}
                  {isSaving ? "Saving..." : "Save"}
                </button>
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
    </div>
  );
}

export default Sales;
