import React, { useRef, useEffect, useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import Sidebar from './components/sidebar.jsx';
import SvgContent from './components/svgcontent.jsx';
import useWindowWidth from './components/windows-width.jsx';
import { useAuth } from './components/context/Authcontext.jsx';
import Logoutmodal from './components/logoutmodal.jsx';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './assets/styles/logout-dropdown.css';
import bot_logo from './assets/images/bot_logo.svg';
import configModule from '../config.js';
import Chatbot from './pages/chatbot.jsx';
import './assets/styles/notification.css';
import io from 'socket.io-client';
import axios from 'axios';

const pathTitles = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/todo': 'To do list',
  '/products': 'Products',
  '/products/add': 'Add Products',
  '/clients': 'Clients',
  '/tracking': 'Tracking',
  '/user-profile': 'User Profile',
  '/profile': 'Profile',
  '/orders': 'Orders',
  '/inventory': 'Inventory',
  '/accounts': 'Accounts',
  '/accounts/expenses': 'Expenses',
  '/branches': 'Branches',
  '/branches/view': 'Branch View',
  '/employee/list': 'Employee List',
  '/employee/list/add-edit': 'Add/Edit Employee',
  '/employee/assign': 'Assign Employee',
  '/employee/attendance': 'Employee Attendance',
  '/employee/leave-permission': 'Leave & Permission',
  '/purchase': 'Purchases',
  '/calendar': 'Calendar',
  '/creative-service': 'Creative Service',
  '/credits': 'Credits',
  '/payroll': 'Payroll',
  '/randd': 'R&E',
  '/orders-list': 'Orders',
  '/directory': "Directory",
  '/leads/add-to-card': "Add to cart",
  '/leads/add-to-card/order-form': "Add To Cart",
  '/leads/class-register': "Registration",
  '/leads/profile': "History",
  '/clients/profile': "Client History",
  '/collections': "Collections",
  '/creatives': 'Creatives',
  '/appointments': 'Appointments',
  '/appointments/schedules': 'Schedules',
  '/sales': "Field sale",
  '/sales/add-to-card': "Add to cart",
  '/sales/add-to-card/order-form': "Order form",
  '/sales/profile': "Client History",
  '/billing': "Billing",
  '/billing/order-form': "Billing",
  '/leads/pool': 'Leads Pool',
  '/inputs': 'Inputs',
  '/reports': 'Reports',
  '/approvals': 'Approvals',
  '/inventory-list': 'Inventory List',
  '/inventory-list/inventoryproduct': 'Inventory List',
};

function MainLayout({ menuItems }) {
  const config = configModule.config();
  const location = useLocation();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const sidebarRef = useRef(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isShowAlertpopup, setIsShowAlertpopup] = useState(false);
  const [isShowLogoutDropdown, setIsShowLogoutDropdown] = useState(false);
  const [showChatbotIcon, setShowChatbotIcon] = useState(true);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showChatbotTab, setShowChatbotTab] = useState(false);
  const { user } = useAuth();
  const userId = user?.userId;
  const path = pathTitles[location.pathname] || '';
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io(`${config.apiBaseUrl}`, {
      withCredentials: true,
      extraHeaders: { 'Access-Control-Allow-Origin': '*' }
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      if (userId) socket.emit('joinRoom', userId);
    });

    socket.on('productAdded', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('productEdited', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('productDeleted', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('LeaveAdded', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('PermissionAdded', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });
    socket.on('Approved', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('GSTNotification', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('creativeadd', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('Newbranchassign', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('NewExpense', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('orderupdate', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('LowStockAlert', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('saveconsultingappointment', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('classadded', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('leadAssigned', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('orders', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('dispatch', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

    socket.on('eventReminder', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });

     socket.on('reschedule', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });
       socket.on('status', (data) => {
      setNotifications((prev) => [{ notification_id: Date.now(), ...data, read: false }, ...prev]);
    });


    socket.on('disconnect', () => console.log('Disconnected from Socket.IO server'));

    return () => socket.disconnect();
  }, [userId]);


  useEffect(() => {
    if (userId) {
      axios.get(`${config.apiBaseUrl}getnotifications/${userId}`)
        .then(res => {
          const fetched = res.data.data.map(n => ({
            notification_id: n.notification_id,
            message: n.message,
            read: !!n.read,
            timestamp: n.created_at
          }));
          setNotifications(fetched);
        })
        .catch(err => console.error('Error fetching notifications:', err));
    }
  }, [userId]);


  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) setSidebarVisible(false);
      if (isShowLogoutDropdown && !event.target.closest('.notify-tb')) setIsShowLogoutDropdown(false);
      if (showNotifyModal && !event.target.closest('.notify-tb')) setShowNotifyModal(false);
    };
    if (sidebarVisible || isShowLogoutDropdown || showNotifyModal) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarVisible, isShowLogoutDropdown, showNotifyModal]);


  const handleMarkAsRead = async () => {
    try {
      await axios.put(`${config.apiBaseUrl}notifications/${userId}/read`);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleShowNotifyModal = () => {
    setShowNotifyModal(!showNotifyModal);
    if (!showNotifyModal && notifications.length > 0) {
      notifications.filter((n) => !n.read).forEach(() => handleMarkAsRead());
    }
  };


  return (
    <div className='d-flex w-100 h-100 position-relative'>
      {/* Sidebar - Desktop */}
      {width > 1024 && <Sidebar menuItems={menuItems} />}

      {/* Sidebar - Mobile */}
      {width <= 1024 && sidebarVisible && (
        <div className='sidebar-div' ref={sidebarRef}>
          <button className='close-sidemenu' onClick={toggleSidebar} style={{ zIndex: 99999 }}>
            <SvgContent svg_name="close" />
          </button>
          <Sidebar menuItems={menuItems} />
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, background: 'rgb(228 237 230 / 54%)', width: 'calc(100% - 245px)' }}>
        <div className='page-header-common justify-content-between'>
          <div className="animated-text-container tabphone-view-container">
            <button className='sidemenu-hide' onClick={toggleSidebar}>
              <SvgContent svg_name="sidemenu" height={20} width={20} />
            </button>
            <h4 className="animated-text mb-0">{path}</h4>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className='notify-tb cursor-pointer position-relative' onClick={handleShowNotifyModal}>
              <SvgContent svg_name="Notification" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="notification-badge">{notifications.filter((n) => !n.read).length}</span>
              )}
              {showNotifyModal && (
                <>
                  <div className='notification-overlay' onClick={() => setShowNotifyModal(false)}></div>
                  <div className='notification-popover' onClick={(e) => e.stopPropagation()}>
                    <div className='notification-header'>
                      <h6 className='notification-title'>Notification</h6>
                      <button className='notification-close' onClick={(e) => { e.stopPropagation(); setShowNotifyModal(false); }}>×</button>
                    </div>
                    <div className='notification-list'>
                      {notifications.length > 0 ? (
                        notifications.map((notif, index) => (
                          <div key={index} className='notification-item' onClick={() => !notif.read && handleMarkAsRead(notif.notification_id)}>
                            {notif.message}
                            {!notif.read && <span style={{ color: 'green' }}> (New)</span>}
                            <p className='time-notification'>({new Date(notif.timestamp).toLocaleTimeString()})</p>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', color: '#666' }}>No Notification</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className='notify-tb cursor-pointer' title={user?.user_typecode === "AD" ? "Logout" : "Profile"}>
              {user?.user_typecode === "AD" ? (
                <div className="position-relative">

                  <button className='profile-head-st' onClick={() => setIsShowLogoutDropdown(!isShowLogoutDropdown)}>
                    {user?.user_typecode
                      ? <h6 className='mb-0 designation-st' >{user.user_typecode}</h6>
                      : <SvgContent svg_name="Profile" />
                    }
                    <h6 className='mb-0 a-fontst'> {user?.username || ''}</h6>
                  </button>
                  {isShowLogoutDropdown && (
                    <div className="logout-dropdown">
                      <div className="dropdown-item inputs-item gap-2" onClick={() => {
                        navigate('/inputs');
                        setIsShowLogoutDropdown(false);
                      }}>
                        <SvgContent svg_name="input_btn" width={18} height={18} />
                        <span className='ad-label-out'>Inputs</span>
                      </div>
                      <div className="dropdown-item p-2 logout-item" onClick={() => {
                        setIsShowAlertpopup(true);
                        setIsShowLogoutDropdown(false);
                      }}>
                        <SvgContent svg_name="pow_btn" width={18} height={18} />
                        <span className='ad-label-out'>Logout</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to='/profile'>
                  <div className='profile-head-st'>
                    {user?.user_typecode
                      ? <h6 className='mb-0 designation-st'>{user.user_typecode}</h6>
                      : <SvgContent svg_name="Profile" />
                    }
                    <h6 className='mb-0 a-fontst'> {user?.username || ''}</h6>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        <Outlet />
      </div>
      {isShowAlertpopup && (
        <Logoutmodal oncloses={() => setIsShowAlertpopup(false)} />
      )}

      {/* Notifications popover rendered near bell icon above */}

      {/* Toast Container for notifications */}
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


      {(showChatbotIcon && user?.user_typecode === "AD") && (
        <div className='chatbot-st'>
          <div className='image-chatbot-st' onClick={() => setShowChatbotTab(true)}>
            <button
              className='close-chat-st'
              onClick={(e) => {
                e.stopPropagation();
                setShowChatbotIcon(false);
              }}
            >
              &times;
            </button>
            <img src={bot_logo} className="w-100 h-100 chatbot-img-st" alt="bot" />
          </div>
        </div>
      )}

      {(showChatbotTab && user?.user_typecode === "AD") && (
        <Chatbot ShowChatbotTab={() => setShowChatbotTab(false)} />
      )}

    </div>
  );
}
MainLayout.propTypes = {
  menuItems: PropTypes.array.isRequired,
};
export default MainLayout;
