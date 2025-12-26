import React, { useState, useEffect, useRef } from 'react';
import { PropagateLoader } from 'react-spinners';
import '../../assets/styles/todolist.css';
import Pagination from "../../components/Pagination/index.jsx";
import { useAuth } from '../../components/context/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import configModule from '../../../config.js';
import SvgContent from '../../components/svgcontent.jsx';
import DatePicker from 'react-datepicker';
import { useLocation ,useNavigate} from 'react-router-dom';
import AddConsultingModal from '../leads/consulting.jsx';
import filtericon from "../../assets/images/filtericon.svg";
import FilterModal from "../../components/filter-modal.jsx";

function TodoList() {
  const { user, accessMenu } = useAuth();
  const userId = user?.userId;
  const pathname = location?.pathname;
  const user_id = user?.userId;
  const dropdownRef = useRef(null);
  const user_typecode = user?.user_typecode;
  const location = useLocation();
  const db_state_item = location?.state?.db_type;
  const [buttonPermissions, setButtonPermissions] = useState({});
  const config = configModule.config();
  const [needLoading, setNeedLoading] = useState(false);
  const [isBtnClicked, setIsBtnClicked] = useState(db_state_item || "Follow up");
  const [todoDataList, setTodoDataList] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dispositionList, setDispositionList] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [reAssignDate, setReAssignDate] = useState(null);
  const [comments, setComments] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [commentHistoryOpen, setCommentHistoryOpen] = useState(false);
  const [commentHistory, setCommentHistory] = useState([]);
  const dispositionSelectRef = useRef(null);
  const [editableDisposition, setEditableDisposition] = useState({});
  const [hoveredLeadId, setHoveredLeadId] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [walletPopupOpen, setWalletPopupOpen] = useState(false);
  const [methodOption, setMethodOption] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
   const [activeButton, setActiveButton] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState("");
    const [isFilterHover, setIsFilterHover] = useState(false);

  const groupedOptions = user_typecode === "FS" ?
    {
      Interested: ["Sales"],
      base: ["Interested", "Not interested", "Call back", "Follow up", "Call not response"]
    }
    :
    {
      Interested: ["Sales", "Consulting", "Class", "Wallet"],
      base: ["Interested", "Not interested", "Call back", "Follow up", "Call not response"]
    };
  const navigate = useNavigate();
  const [openConsulting, setOpenConsulting] = useState(false);
  const [selectedItems, setSelectedItems] = useState('');
  const [amount, setAmount] = useState("");
  const [callbackDate, setCallbackDate] = useState(null);
  const [wallComments, setWallComments] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [dateTime, setDateTime] = useState(null);


 useEffect(() => {
        if (accessMenu && location.pathname) {
          const menuItem = accessMenu.find(
            (m) => m.path === pathname && m.user_id === user_id
          );
          console.log("Menu Item for Permissions:", menuItem);
    
          if (menuItem) {
            setButtonPermissions({
              sort: menuItem.sort_btn === 1,
              filter: menuItem.filter_btn === 1,
            });
          } else {
            setButtonPermissions({});
          }
        }
      }, [accessMenu, pathname, user]);



  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setEditableDisposition((prev) => ({
          ...prev,
          [(selectedRow?.lead_id || selectedRow?.flead_id)]: null
        }));
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedRow]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".custom-dropdown-wrapper")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  useEffect(() => {
    if (accessMenu && location.pathname) {
      const currentPath = location.pathname;
      const menuItem = accessMenu.find(item => item.path === currentPath);

      if (menuItem) {
        setButtonPermissions({
          sort: menuItem.sort_btn === 1,
          filter: menuItem.filter_btn === 1
        });
      } else {
        setButtonPermissions({});
      }
    }
  }, [accessMenu, location.pathname]);

  const indexOfLastTodo = currentPage * itemsPerPage;
  const indexOfFirstTodo = indexOfLastTodo - itemsPerPage;
  const paginatedTodoes = todoDataList.slice(indexOfFirstTodo, indexOfLastTodo);

  const currentTodoes = paginatedTodoes;

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const DispositionOpt = [
    { label: "Follow up", value: "Follow up" },
    { label: "Call back", value: "Call back" },
    { label: "Interested", value: "Interested" },
    { label: "Not interested", value: "Not interested" },
    { label: "Call not response", value: "Call not response" }
  ];


const handleReset = () => {
      setSelectedFilters("");
      setActiveButton(null);
      getLeadsPage();
    };
    const onFilterDataFunc = (items) => {
      setSelectedFilters(items);
      getLeadsPage(items);
    };
    useEffect(() => {
      if (user) {
        getLeadsPage();
      }
    }, [user, isBtnClicked]);

  const getLeadsPage = async () => {
    setNeedLoading(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}getTodoList`, {
        userId: userId,
        isBtnClicked: isBtnClicked,
        user_typecode: user_typecode,
        disposition: filterParams?.disposition || "",
      });

      const result = response.data;

      if (response.status === 200) {
        setTodoDataList(result.leads);
      } else {
        toast.error("Failed to fetch designation list: " + result.message);
      }
    } catch (error) {
      toast.error("Error fetching designation list: " + (error.response?.data?.message || error.message));
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getLeadsPage();
    }
  }, [user, isBtnClicked]);

  const formatDateTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const updateLeadsData = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}updateLeads`, {
        disposition: methodOption || '',
        date: reAssignDate ? formatDateToMySQL(reAssignDate) : formatDateToMySQL(new Date()),
        comment: comments || '',
        lead_id: selectedRow.flead_recid || selectedRow.lead_recid,
        userId: userId,
        user_typecode: user_typecode
      });

      const result = response.data;

      if (response.status === 200) {
        toast.success("Updated successfully.");

        setTimeout(() => {
          setShowModal(false);
          setEditableDisposition({});  
          setMethodOption('');
          setComments('');
          setReAssignDate(null);
          getLeadsPage();
        }, 2000);
      } else {
        toast.error("Failed to fetch designation list: " + result.message);
      }
    } catch (error) {
      toast.error("Error fetching designation list: " + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDateToMySQL = (dateObj) => {
    const pad = (n) => String(n).padStart(2, '0');
    const year = dateObj.getFullYear();
    const month = pad(dateObj.getMonth() + 1);
    const day = pad(dateObj.getDate());
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    const seconds = pad(dateObj.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (selectedRow) {
      const defaultDisposition = DispositionOpt.find(opt => opt.value === selectedRow?.disposition);
      setDispositionList(
        { target: { name: defaultDisposition?.value, value: defaultDisposition?.value } }
      );
    }
  }, [selectedRow]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (showModal) {
          setShowModal(false);
          setWalletPopupOpen(false);
        }
      }
    };
    if (showModal) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showModal]);

  const handleCommentsHistory = async (objItem) => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}getCommentsHistory`, {
        lead_recid: objItem?.lead_recid || objItem?.flead_recid,
        code: user_typecode || ""
      });

      const result = response.data;

      if (response.status === 200) {
        setCommentHistory(result.data);
      } else {
        toast.error("Failed to fetch data list: " + result.message);
      }
    } catch (error) {
      toast.error("Error fetching data list: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDispositionSubChange = (objData, sub) => {
    // close Update To-Do modal first
    setShowModal(false);

    setEditableDisposition((prev) => ({
      ...prev,
      [objData.lead_id || objData.flead_id]: null,
    }));

    if (sub === "Sales") {
      let path = "/leads/add-to-card";
      if (user_typecode === "FS") {
        path = "/sales/add-to-card";
      }
      navigate(path, { state: { selectedData: objData, catagory: objData.category } });
    }
    else if (sub === "Consulting") {
      setOpenConsulting(true);
      setSelectedItems(objData);
    }
    else if (sub === "Class") {
      navigate("/leads/class-register", { state: { selectedData: objData, catagory: objData.catagory } });
    }
    else if (sub === "Wallet") {
      setWalletPopupOpen(true);
      setSelectedItems(objData);
    }
  };

  const resetForm = () => {
    setAmount("");
    setCallbackDate(null);
    setWallComments("");
    setReceipt(null);
    setTransactionId("");
    setDateTime(null);
    setWalletPopupOpen(false);
    setMethodOption('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
    }
    e.target.value = null;
  };


  function formatDateToMySQLQuery(date) {
    if (!date) return null;
    const d = new Date(date);
    const pad = (n) => (n < 10 ? '0' + n : n);

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  const handleSave = async () => {
    if (!amount || !callbackDate || !wallComments || !receipt || !transactionId || !dateTime) {
      toast.warn("Please fill all fields before saving.");
      return;
    }

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("callbackDate", formatDateToMySQLQuery(callbackDate));
    formData.append("comments", wallComments);
    formData.append("receipt", receipt);
    formData.append("folder", "wallet");
    formData.append("transactionId", transactionId);
    formData.append("dateTime", formatDateToMySQLQuery(dateTime));
    formData.append("ownedBy", (selectedItems.lead_recid || selectedItems.flead_recid));
    formData.append("createdBy", userId);

    try {
      const response = await axios.post(`${config.apiBaseUrl}insertWalletData`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success("Data saved successfully.");

        setTimeout(() => {
          resetForm();
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

      if (error?.response?.data?.code === 'ER_DUP_ENTRY' || 
          error?.message?.includes('Duplicate entry')) {
        toast.error("Duplicate Transaction ID. Please use a unique Transaction ID.");
      } else {
        const errorMessage = error?.response?.data?.message || error.message || "Error saving data";
        toast.error(errorMessage);
      }
    }
  };

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
      <div className='d-flex align-items-center gap-2 tarket-px-ox' style={{ height: "72px" }}>
        <button className={`filter-btn-st ${isBtnClicked === "Follow up" ? "bg-color-std" : ""}`} onClick={() => setIsBtnClicked("Follow up")} >Today’s Follow-ups</button>
        <button className={`filter-btn-st ${isBtnClicked === "Call back" ? "bg-color-std" : ""}`} onClick={() => setIsBtnClicked("Call back")}>Today’s Call Back</button>
        <button className={`filter-btn-st ${isBtnClicked === "Call not response" ? "bg-color-std" : ""}`} onClick={() => setIsBtnClicked("Call not response")}>Today’s Call Not Response</button>
        <button className={`filter-btn-st ${isBtnClicked === "Leads" ? "bg-color-std" : ""}`} onClick={() => setIsBtnClicked("Leads")}>Total Leads</button>
      </div>
      <div style={{ height: "calc(100% - 72px)" }} className='pe-2 ps-2'>
        <div className='h-100 w-100 p-2 pb-0'>
          <div className='table-common-st'>
            <div className='tb-header-row-st display-flex'>
              <div className='brcommon-col-st w-10'>
                S.No
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Client ID
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Mobile
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-15'>
                Disposition
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-25'>
                Comments
              </div> <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Date
              </div>  <span style={{ color: "#129347" }}> | </span>
              <div className='brcommon-col-st w-10'>
                Action
              </div>
            </div>

            <div className='tb-body-row-st'>
              {currentTodoes && currentTodoes.length > 0 ? (currentTodoes.map((item, index) => (
                <div className='display-flex br-rowst' key={user_typecode === "FS" ? item.flead_id : item.lead_id}>
                  <div className='brcommon-col-st w-10'>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </div>
                  <div className='brcommon-col-st w-15'>
                    {user_typecode === "FS" ? item.flead_id : item.lead_id}
                  </div>
                  <div className='brcommon-col-st w-15'>
                    {item.mobile_number}
                  </div>
                  <div className='brcommon-col-st w-15'>
                    {item.disposition}
                  </div>
                  <div className='brcommon-col-st w-25'>
                    {item.comments}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    {formatDateTime(item.disposition_date)}
                  </div>
                  <div className='brcommon-col-st w-10'>
                    <button style={{ marginRight: "15px" }} onClick={() => {
                      setShowModal(true);
                      setSelectedRow(item);

                      setTimeout(() => {
                        if (dispositionSelectRef.current) {
                          dispositionSelectRef.current.focus();
                        }
                      }, 100);
                    }}>
                      <SvgContent svg_name="btn_edit" />
                    </button>
                    <button onClick={() => { setCommentHistoryOpen(true); handleCommentsHistory(item); }}>
                      <SvgContent svg_name="info" />
                    </button>
                  </div>
                </div>
              ))) : (
                <div className='tb-nodata-row-st display-flex'>
                  No to do list
                </div>
              )}

            </div>
          </div>
          <div className='footer-tab-st'>
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
              count={todoDataList.length}
              page={currentPage}
              pageSize={itemsPerPage}
              onChange={(pageNo) => setCurrentPage(pageNo)}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay modal-overlay-position" >
          <div className="modal-container modal-overlay-position" style={{ width: "625px" }}>
            <div className="modal-header">
              <h5 className="mb-0 add-new-hdr">Update To Do list</h5>
            </div>
            <div className="modal-body">
              <div className="container commonst-select mb-3">
                <h6>Disposition</h6>
                <div className="comm-updateselect-ba">
                  <div className="custom-dropdown-wrapper w-100">
                    <button
                      type="button"
                      className="custom-dropdown-trigger display-btflex w-100"
                      aria-haspopup="true"
                      aria-expanded={
                        openDropdownId === (selectedRow.lead_id || selectedRow.flead_id)
                      }
                      onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === (selectedRow.lead_id || selectedRow.flead_id)
                            ? null
                            : (selectedRow.lead_id || selectedRow.flead_id)
                        )
                      }
                    >
                      {editableDisposition[(selectedRow.lead_id || selectedRow.flead_id)] ||
                        selectedRow.disposition ||
                        "Select disposition"}
                      <SvgContent svg_name="dropdownDown" />
                    </button>

                    {openDropdownId === (selectedRow.lead_id || selectedRow.flead_id) && (
                      <div className="custom-dropdown-menu">
                        {groupedOptions.base.map((option) => {
                          const isInterested = option === "Interested";

                          return (
                            <div
                              key={option}
                              className="dropdown-item-ldst position-relative"
                              onMouseEnter={() => {
                                setHoveredLeadId(
                                  selectedRow.lead_id || selectedRow.flead_id
                                );
                                setHoveredOption(option);
                              }}
                              onMouseLeave={() => {
                                setHoveredLeadId(null);
                                setHoveredOption(null);
                              }}
                              onClick={() => {
                                if (!isInterested) {
                                  setEditableDisposition((prev) => ({
                                    ...prev,
                                    [selectedRow.lead_id || selectedRow.flead_id]: option,
                                  }));
                                  setMethodOption(option);
                                  setOpenDropdownId(null); // close after select
                                }
                              }}
                            >
                              {option}

                              {/* Submenu for Interested */}
                              {isInterested &&
                                hoveredLeadId ===
                                (selectedRow.lead_id || selectedRow.flead_id) &&
                                hoveredOption === "Interested" && (
                                  <div className="submenu">
                                    {groupedOptions.Interested.map((sub) => (
                                      <button
                                        key={sub}
                                        type="button"
                                        className="dropdown-item-ldst"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditableDisposition((prev) => ({
                                            ...prev,
                                            [selectedRow.lead_id || selectedRow.flead_id]:
                                              sub,
                                          }));
                                          handleDispositionSubChange(selectedRow, sub);
                                          setOpenDropdownId(null); // close after select
                                        }}
                                      >
                                        {sub}
                                      </button>
                                    ))}
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="container commonst-select mb-3">
                <h6>Re-assigned Date</h6>
                <div className="comm-select-ba">
                  <DatePicker
                    selected={reAssignDate}
                    onChange={(date) => setReAssignDate(date)}
                    placeholderText="dd/mm/yyyy"
                    className="form-control heightset-st"
                    dateFormat="dd-MM-yyyy"
                    maxDate={new Date(new Date().setDate(new Date().getDate() + 15))}
                    minDate={new Date()}
                  />
                </div>
              </div>
              <div className="container commonst-select mb-3">
                <h6>Comments</h6>
                <div style={{ width: "calc(100% - 212px)" }}>
                  <textarea
                    name="comments"
                    className="form-control location-ip-br"
                    placeholder="Enter comments"
                    style={{ minHeight: "182px" }}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    required
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="next-button" onClick={updateLeadsData} disabled={isUpdating} > {isUpdating ? "Updating..." : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      {commentHistoryOpen && (
        <div className="modal-overlay modal-overlay-position">
          <div className="modal-container modal-overlay-position" style={{ width: "800px" }}>
            <div className="modal-header">
              <h5 className="mb-0 add-new-hdr">Comments History</h5>
            </div>
            <div className="modal-body" style={{ maxWidth: "800px", overflow: "auto" }}>
              <div className='w-100 d-flex align-items-center tb-header-row-st' style={{ minWidth: "725px" }}>
                <div style={{ minWidth: "72px" }} className="historytab-st">
                  S.No
                </div>
                <div style={{ minWidth: "112px" }} className="historytab-st">
                  Lead ID
                </div>
                <div style={{ minWidth: "112px" }} className="historytab-st">
                  Lead name
                </div>
                <div style={{ minWidth: "112px" }} className="historytab-st" >
                  Date
                </div>
                <div style={{ minWidth: "132px" }} className="historytab-st">
                  Disposition
                </div>
                <div style={{ minWidth: "212px" }} className="historytab-st">
                  Comments
                </div>
              </div>

              <div className='hist-tab-body-st'>
                {commentHistory && commentHistory.map((item, idx) => (
                  <div className='w-100 d-flex align-items-center overflow-auto' key={item.id} style={{ minWidth: "725px" }}>
                    <div style={{ minWidth: "72px" }} className="historytab-st">
                      {idx + 1 || 0}
                    </div>
                    <div style={{ minWidth: "112px" }} className="historytab-st">
                      {item.lead_id || item.flead_id}
                    </div>
                    <div style={{ minWidth: "112px" }} className="historytab-st">
                      {item.lead_name || item.flead_name}
                    </div>
                    <div style={{ minWidth: "112px" }} className="historytab-st" >
                      {item?.date_value ? formatDateTime(item.date_value) : ''}
                    </div>
                    <div style={{ minWidth: "132px" }} className="historytab-st">
                      {item.disposition}
                    </div>
                    <div style={{ minWidth: "212px" }} className="historytab-st">
                      {item.comment}
                    </div>
                  </div>
                ))}

                {commentHistory.length === 0 && (
                  <div style={{ minWidth: "212px" }} className="historytab-st">
                    No data found
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setCommentHistoryOpen(false)}>Close</button>
            </div>

          </div>
        </div>
      )}



        <div className="ms-auto">
              {buttonPermissions?.filter && (
                <div className="filter-container-up position-relative">
                  <button
                    className={`product-filter-btns ${
                      activeButton === "filter" ? "active" : "" }`}
                    style={{
                      color:
                        activeButton === "filter" || isFilterHover
                          ? "#ffffff"
                          : "#0B9346",
                    }}
                    onClick={() => {
                      setShowFilterModal(true);
                      setActiveButton("filter");
                    }}
                    onMouseEnter={() => setIsFilterHover(true)}
                    onMouseLeave={() => setIsFilterHover(false)}
                  >
                    <img
                      src={filtericon}
                      alt="img"
                      style={{
                        filter:
                          activeButton === "filter" || isFilterHover
                            ? "invert(1) brightness(2)"
                            : "none",
                      }}
                    />
                    <span
                      style={{
                        marginLeft: 6,
                        color:
                          activeButton === "filter" || isFilterHover
                            ? "#ffffff"
                            : "#0B9346",
                      }}
                    >
                      Filter
                    </span>
                  </button>
    
                  {activeButton === "filter" && (
                    <button className="filter-clear-st" onClick={handleReset}>
                      &times;
                    </button>
                  )}
                </div>
              )}
            </div>
   

      {openConsulting && (
        <AddConsultingModal onClose={() => setOpenConsulting(false)} rowData={selectedItems} />
      )}

      {
        walletPopupOpen && (
          <div className='wallet-container-pm display-flex'>
            <div className='wallet-div-st'>
              <div className="wallet-container">
                <div className="wallet-header">
                  <h5 className='mb-0 setminwd-wallet-st'>Wallet</h5>
                </div>

                <div className="wallet-form-group">
                  <label className='setminwd-wallet-st'>Amount</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='Enter amount'
                    className="wallet-input setminwd-wallet-side"
                  />
                </div>

                <div className="wallet-form-group">
                  <label className='setminwd-wallet-st' htmlFor='callbackDateg1'>Call back</label>
                  <DatePicker
                    id='callbackDate1'
                    selected={callbackDate}
                    maxDate={new Date(new Date().setDate(new Date().getDate() + 15))}
                    minDate={new Date()}
                    onChange={(date) => setCallbackDate(date)}
                    className="wallet-date-input setminwd-wallet-side"                    
                    placeholderText="DD/MM/YYYY"
                  />
                </div>

                <div className="wallet-form-group">
                  <label className='setminwd-wallet-st'>Comments</label>
                  <textarea
                    value={wallComments}
                    onChange={(e) => setWallComments(e.target.value)}
                    placeholder='Enter your comments'
                    className="wallet-textarea setminwd-wallet-side"
                  />
                </div>

                <div className="wallet-upload-section">
                  <h6 className='fw-600'>Upload receipt</h6>
                  <p>Collect screenshot from client and upload to place the order</p>
                  <label className="wallet-upload-box">
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    <SvgContent svg_name="btn_upload" stroke="#0B622F" style={{ zIndex: "999" }} />
                    <span style={{ color: "#121212", zIndex: "0" }}>Upload image</span>
                  </label>
                  {receipt && (
                    <div className="wallet-file-preview">
                      <span className="wallet-file-name">{receipt.name}</span>
                      <span
                        className="wallet-remove-span"
                        onClick={() => setReceipt(null)}
                      >
                        &times;
                      </span>
                    </div>
                  )}

                </div>

                <div className="wallet-form-group">
                  <label className='setminwd-wallet-st'>Transaction ID</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="wallet-input"
                     placeholder='Enter transaction id'
                  />
                </div>

                <div className="wallet-form-group">
                  <label className='setminwd-wallet-st' htmlFor="wallet-date-time">Date and time</label>
                  <DatePicker
                    id="wallet-date-time"
                    selected={dateTime}
                     minDate={new Date()} 
                    onChange={(date) => setDateTime(date)}
                    showTimeSelect 
                    timeIntervals={15}
                    placeholderText="DD/MM/YYYY HH:MM"
                    className="wallet-date-input"
                    popperPlacement="bottom"
                    dateFormat="dd-MM-yyyy h:mm aa"                 
                  />
                </div>

                <div className="wallet-form-footer">
                  <button className="wallet-cancel-btn" onClick={resetForm}>Cancel</button>
                  <button className="wallet-save-btn" onClick={handleSave}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }



{showFilterModal && (
        <FilterModal
          onFilterData={onFilterDataFunc}
          selectedFilters={selectedFilters}
          onClose={() => {
            setShowFilterModal(false);
            setActiveButton(null);
          }}
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

export default TodoList;
