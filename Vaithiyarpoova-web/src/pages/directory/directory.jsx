import React, { useState, useEffect, useRef } from "react";
import { PropagateLoader } from "react-spinners";
import CommonSelect from "../../components/common-select.jsx";
import "../../assets/styles/branches.css";
import { useAuth } from "../../components/context/Authcontext.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import configModule from "../../../config.js";
import Pagination from "../../components/Pagination/index.jsx";
import SvgContent from "../../components/svgcontent.jsx";
import { useLocation } from "react-router-dom";

function Directory() {
  const [directoryDataList, setDirectoryDataList] = useState([]);
  const [needLoading, setNeedLoading] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cityOption, setCityOption] = useState(null);
  const [countryOption, setCountryOption] = useState([]);
  const [stateOption, setStateOption] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const { user, accessMenu } = useAuth();
  const userId = user?.userId;
  const config = configModule.config();
  const [open, setOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(13);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef();
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [delConfirmPopup, setDelConfirmPopup] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addName, setAddName] = useState("");
  const [mobile, setMobile] = useState("");
  const [additionalMobile, setAdditionalMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const titleInputRef = useRef(null);
  const [activeButton, setActiveButton] = useState(null);
  const location = useLocation();
  const [buttonPermissions, setButtonPermissions] = useState({});

  // Load button permissions based on current path
  useEffect(() => {
    if (accessMenu && location.pathname) {
      const currentPath = location.pathname;
      const menuItem = accessMenu.find((item) => item.path === currentPath);

      if (menuItem) {
        setButtonPermissions({
          search: menuItem.search_btn === 1,
          add: menuItem.add_btn === 1,
          view: menuItem.view_btn === 1,
          edit: menuItem.edit_btn === 1,
          delete: menuItem.delete_btn === 1,
        });
      } else {
        setButtonPermissions({});
      }
    }
  }, [accessMenu, location.pathname]);

  // Reset activeButton when modals close
  useEffect(() => {
    if (!showModal && !showViewModal && !showEditModal && !showDeleteModal) {
      setActiveButton(null);
    }
  }, [showModal, showViewModal, showEditModal, showDeleteModal]);

  const getDirectoryDetails = async () => {
    setNeedLoading(true);
    try {
      const response = await axios.get(
        `${config.apiBaseUrl}getDirectoryDetails`
      );

      const result = response.data;
      if (response.status === 200) {
        setDirectoryDataList(result.leads);
      } else {
        toast.error("Failed to fetch directory details: " + result.message);
        console.error("Failed to fetch directory details: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching directory details: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getDirectoryDetails();
      getLocationDetails();
    }
  }, [user]);

  useEffect(() => {
    setStateOption([]);
    setState(null);

    if (country) {
      fetchStatesByCountry(country?.target?.id || selectedDirectory.country_id);
    }
  }, [country, showModal]);

  useEffect(() => {
    setCityOption([]);
    setCity(null);

    if (state) {
      fetchCityByState(state?.target?.id || selectedDirectory.state_id);
    }
  }, [state, showModal]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLastDirectory = currentPage * itemsPerPage;
  const indexOfFirstDirectory = indexOfLastDirectory - itemsPerPage;
  const paginatedDirectory = directoryDataList?.slice(
    indexOfFirstDirectory,
    indexOfLastDirectory
  );

  const currentDirectory = paginatedDirectory?.filter((item) =>
    `${item.title} ${item.name} ${item.mobile_no} ${item.district}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const fetchCityByState = async (id) => {
    if (id) {
      setNeedLoading(true);
      try {
        const response = await axios.post(
          `${config.apiBaseUrl}getCityByState`,
          {
            state_id: id,
          }
        );

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
    }
  };

  const fetchStatesByCountry = async (id) => {
    if (id) {
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
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close Directory modals on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        if (showModal) return setShowModal(false);
        if (showViewModal) return setShowViewModal(false);
        if (showEditModal) return setShowEditModal(false);
        if (showDeleteModal) return setShowDeleteModal(false);
        if (delConfirmPopup) return setDelConfirmPopup(false);
      }
    };
    if (
      showModal ||
      showViewModal ||
      showEditModal ||
      showDeleteModal ||
      delConfirmPopup
    ) {
      window.addEventListener("keydown", handleEsc);
      window.addEventListener("keyup", handleEsc);
      return () => {
        window.removeEventListener("keydown", handleEsc);
        window.removeEventListener("keyup", handleEsc);
      };
    }
  }, [
    showModal,
    showViewModal,
    showEditModal,
    showDeleteModal,
    delConfirmPopup,
  ]);

  // Reset active button when modal closes
  useEffect(() => {
    if (!showModal) {
      setActiveButton(null);
    }
  }, [showModal]);

  const confirmDeleteFunc = (item) => {
    setDelConfirmPopup(true);
    setSelectedItem(item);
    setOpen(false);
  };

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

  const handleDelete = async () => {
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}delDirectoryData`,
        {
          dir_id: selectedItem.id,
        }
      );
      const responseData = response.data?.data;

      if (response.status === 200) {
        toast.success(`"${selectedItem.name}" deleted successfully.`);
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

        setDelConfirmPopup(false);

        setTimeout(() => {
          getDirectoryDetails();
          getLocationDetails();
          setNeedLoading(false);
        }, 3000);
      } else {
        toast.error(
          "Failed to delete directory list: " + response.data.message
        );
      }
    } catch (error) {
      toast.error(
        "Error deleting : " + (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (actionType === "Edit" && selectedDirectory) {
      setAddTitle(selectedDirectory.title || "");
      setAddName(selectedDirectory.name || "");
      setMobile(selectedDirectory.mobile_no || "");
      setAdditionalMobile(selectedDirectory.additional_no || "");
      setEmail(selectedDirectory.email || "");
      setAddress(selectedDirectory.address || "");
      setCountry(selectedDirectory.country || "");
      setState(selectedDirectory.state || "");
      setCity(selectedDirectory.district || "");
    } else if (actionType === "Add") {
      // Reset on add
      setAddTitle("");
      setAddName("");
      setMobile("");
      setAdditionalMobile("");
      setEmail("");
      setAddress("");
      setCountry("");
      setState("");
      setCity("");
    }
  }, [actionType, selectedDirectory]);

  const saveDirectoryDetails = async () => {
    if (!addTitle || !addName || !mobile || !country || !state || !city) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        title: addTitle,
        name: addName,
        mobile: mobile,
        additional_mobile: additionalMobile,
        email: email,
        address: address,
        country_id: country?.target?.id,
        state_id: state?.target?.id,
        city_id: city?.target?.id,
        userId: userId,
      };

      const res = await axios.post(`${config.apiBaseUrl}saveDirectoryDetails`, {
        payload,
      });
      const responseData = res?.data?.data;

      if (res.status === 200) {
        toast.success("Directory saved successfully!");
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

        setShowModal(false);
        getDirectoryDetails();
      } else {
        toast.error("Failed to save directory");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (actionType === "Edit") {
      if (selectedDirectory?.district) {
        setCity(selectedDirectory.district);
      }

      if (selectedDirectory?.country) {
        setCountry(selectedDirectory.country);
      }

      if (selectedDirectory?.state) {
        setState(selectedDirectory.state);
      }
    } else {
      setCity("");
      setCountry("");
      setState("");
    }
  }, [selectedDirectory, showModal]);

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
      <div className="header-div-el">
        <div className="header-divpart-el">
          <p className="mb-0 header-titlecount-el">
            Total contact : {currentDirectory?.length || 0}
          </p>
        </div>
        <div className="search-add-wrapper">
          {buttonPermissions.search && (
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
          {buttonPermissions.add && (
            <button
              className={`btn-top-up  ${
                activeButton === "add" ? "active" : ""
              }`}
              onClick={() => {
                setShowModal(true);
                setActionType("Add");
                setActiveButton("add");
                setTimeout(() => {
                  if (titleInputRef.current) {
                    titleInputRef.current.focus();
                  }
                }, 100);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowModal(true);
                  setActionType("Add");
                  setActiveButton("add");
                  setTimeout(() => {
                    if (titleInputRef.current) {
                      titleInputRef.current.focus();
                    }
                  }, 100);
                }
              }}
              tabIndex={0}
              aria-label="Add new directory contact"
            >
              Add new
            </button>
          )}
        </div>
      </div>
      <div className="body-div-el">
        <div className="h-100 w-100 p-2 pb-0">
          <div className="table-common-st">
            <div className="tb-header-row-st display-flex">
              <div className="brcommon-col-st w-15">S no</div>{" "}
              <span style={{ color: "#129347" }}> | </span>
              <div className="brcommon-col-st w-15">Title</div>{" "}
              <span style={{ color: "#129347" }}> | </span>
              <div className="brcommon-col-st w-20">Name</div>{" "}
              <span style={{ color: "#129347" }}> | </span>
              <div className="brcommon-col-st w-20">Mobile</div>{" "}
              <span style={{ color: "#129347" }}> | </span>
              <div className="brcommon-col-st w-15">District</div>{" "}
              <span style={{ color: "#129347" }}> | </span>
              {(buttonPermissions.view ||
                buttonPermissions.edit ||
                buttonPermissions.delete) && (
                <div className="brcommon-col-st w-15">Action</div>
              )}
            </div>

            <div className="tb-body-row-st">
              {currentDirectory && currentDirectory.length > 0 ? (
                currentDirectory.map((item, index) => (
                  <div
                    className="display-flex br-rowst"
                    key={index}
                    onClick={() => {
                      setShowViewModal(true);
                      setSelectedDirectory(item);
                      setOpen(false);
                    }}
                  >
                    <div className="brcommon-col-st w-15">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </div>
                    <div className="brcommon-col-st w-15">{item.title}</div>
                    <div className="brcommon-col-st w-20">{item.name}</div>
                    <div className="brcommon-col-st w-20">{item.mobile_no}</div>
                    <div className="brcommon-col-st w-15">{item.district}</div>
                    {(buttonPermissions.view ||
                      buttonPermissions.edit ||
                      buttonPermissions.delete) && (
                      <div className="brcommon-col-st w-15 cursor-pointer position-relative overflow-visible">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDirectory(item);
                            setOpen((prev) =>
                              prev === item.id ? null : item.id
                            ); // toggle logic
                          }}
                        >
                          <SvgContent svg_name="threedots" />
                        </button>
                        {open && selectedDirectory?.id === item.id && (
                          <div
                            ref={menuRef}
                            className="menu-directry right-0  w-32 bg-white border  rounded z-50"
                          >
                            {buttonPermissions.edit && (
                              <div className="cursor-pointer">
                                <button
                                  className="default-bg w-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowModal(true);
                                    setActionType("Edit");
                                    setActiveButton("edit");
                                    setTimeout(() => {
                                      if (titleInputRef.current) {
                                        titleInputRef.current.focus();
                                      }
                                    }, 100);
                                  }}
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                            {buttonPermissions.delete && (
                              <div className="cursor-pointer">
                                <button
                                  className=" danger-bg w-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDeleteFunc(item);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="tb-nodata-row-st display-flex">
                  No directory list
                </div>
              )}
            </div>
          </div>
          <div className="footer-tab-st">
            <label htmlFor="hfg" className="me-2">
              Results per page{" "}
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="row-per-page-select"
                style={{ width: "60px" }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </label>
            <Pagination
              count={directoryDataList?.length}
              page={currentPage}
              pageSize={itemsPerPage}
              onChange={(pageNo) => setCurrentPage(pageNo)}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay modal-overlay-position">
          <div
            className="modal-container modal-overlay-position overflow-auto"
            style={{ width: "625px" }}
          >
            <div className="modal-header">
              <h5 className="mb-0 add-new-hdr">Add New Directory</h5>
            </div>
            <div className="modal-body w-100">
              {/* Title */}
              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Title</h6>
                <div className="comm-select-ba">
                  <input
                    ref={titleInputRef}
                    type="text"
                    name="title"
                    className="form-control location-ip-br"
                    placeholder="Enter title"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Name */}
              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Name</h6>
                <div className="comm-select-ba">
                  <input
                    type="text"
                    name="name"
                    className="form-control location-ip-br"
                    placeholder="Enter name"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Mobile</h6>
                <div className="comm-select-ba">
                  <input
                    type="text"
                    name="mobile"
                    className="form-control location-ip-br"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>

              {/* Additional Mobile */}
              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">
                  Additional No <span className="color-fade">(Optional)</span>
                </h6>
                <div className="comm-select-ba">
                  <input
                    type="text"
                    name="additional_mobile"
                    className="form-control location-ip-br"
                    placeholder="Enter additional number"
                    value={additionalMobile}
                    onChange={(e) => setAdditionalMobile(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">
                  Email <span className="color-fade"> (Optional)</span>
                </h6>
                <div className="comm-select-ba">
                  <input
                    type="email"
                    name="email"
                    className="form-control location-ip-br"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Address</h6>
                <div className="comm-select-ba">
                  <textarea
                    name="address"
                    className="form-control-st location-ip-br"
                    placeholder="Enter address"
                    rows="4"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Country */}
              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Select Country</h6>
                <div className="comm-select-ba">
                  <CommonSelect
                    header="Select country"
                    placeholder="Select country"
                    name="country"
                    value={country}
                    onChange={setCountry}
                    options={countryOption}
                    isSearchable={true}
                  />
                </div>
              </div>

              {/* State */}
              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Select Province / State</h6>
                <div className="comm-select-ba">
                  <CommonSelect
                    header="Select province / state"
                    placeholder="Select province / state"
                    name="state"
                    value={state}
                    onChange={setState}
                    options={stateOption}
                    isSearchable={true}
                  />
                </div>
              </div>

              {/* City */}
              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Select Town / District</h6>
                <div className="comm-select-ba">
                  <CommonSelect
                    header="Select town / district"
                    placeholder="Select town / district"
                    name="city"
                    value={city}
                    onChange={setCity}
                    options={cityOption}
                    isSearchable={true}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="next-button" onClick={saveDirectoryDetails}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && (
        <div className="modal-overlay modal-overlay-position">
          <div
            className="modal-container modal-overlay-position overflow-auto"
            style={{ width: "625px" }}
          >
            <div className="modal-header">
              <h5 className="mb-0 add-new-hdr">View Directory Contact</h5>
            </div>
            <div className="modal-body w-100">
              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Title</h6>
                <p className="form-control-static">
                  {selectedDirectory?.title || ""}
                </p>
              </div>

              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Name</h6>
                <p className="form-control-static">
                  {selectedDirectory?.name || ""}
                </p>
              </div>

              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Mobile no</h6>
                <p className="form-control-static">
                  {selectedDirectory?.mobile_no || ""}
                </p>
              </div>

              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Additional no</h6>
                <p className="form-control-static">
                  {selectedDirectory?.additional_no || "N/A"}
                </p>
              </div>

              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Email</h6>
                <p className="form-control-static">
                  {selectedDirectory?.email || "N/A"}
                </p>
              </div>

              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Address</h6>
                <p className="form-control-static">
                  {selectedDirectory?.address || "N/A"}
                </p>
              </div>

              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Country</h6>
                <p className="form-control-static">
                  {selectedDirectory?.country || "N/A"}
                </p>
              </div>

              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Province / State</h6>
                <p className="form-control-static">
                  {selectedDirectory?.state || "N/A"}
                </p>
              </div>

              <div className="container commonst-select mb-3 justify-content-start">
                <h6 className="setmin-wdst-dir">Town / District</h6>
                <p className="form-control-static">
                  {selectedDirectory?.district || "N/A"}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {delConfirmPopup && (
        <div className="modal-overlay modal-overlay-position">
          <div className="modal-container">
            <div className="modal-header mb-3">
              <h5 className="mb-0 add-new-hdr">Confirm to delete</h5>
            </div>
            <div className="modal-body mb-2">
              <div className="container commonst-select">
                <p>
                  Are you sure to delete this "{selectedItem.title} -{" "}
                  {selectedItem.name}"?
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setDelConfirmPopup(false)}
              >
                No
              </button>
              <button className="next-button" onClick={handleDelete}>
                Yes
              </button>
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

export default Directory;
