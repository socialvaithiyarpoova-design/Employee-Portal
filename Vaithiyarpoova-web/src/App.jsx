
import  { useState, useEffect,  } from 'react';
import './App.css';
import { Routes, Route, Navigate,useLocation  } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/auth/PrivateRoute.jsx';
import { useAuth } from './components/context/Authcontext.jsx';
import configModule from '../config.js';
import AdminPage from './admin/admin.jsx';
import MainLayout from './mainlayout.jsx';
import Dashboard from './pages/dashboard/dashboard.jsx';
import Leads from './pages/leads/leads.jsx';
import TodoList from './pages/todo/todo-list.jsx';
import Products from './pages/products/products.jsx';
import ClientsPage from './pages/clientslist/clients.jsx';
import Tracking from './pages/tracking/tracking.jsx';
import Profile from './pages/profile/profile.jsx';
import Accounts from './pages/accounts/accounts.jsx';
import Expenses from './pages/accounts/expenses.jsx';
import Inventory from './pages/inventory/inventory.jsx';
import Inventorydis from './pages/dispatch-list/dispatchlist.jsx';
import InventoryProd from './pages/dispatch-list/inventory-list.jsx';
import Branches from './pages/branches/branches.jsx';
import EmployeeList from './pages/employee/employee-list.jsx';
import AddEmployee from './pages/employee/addemployee-list.jsx';
import EmployeeAssign from './pages/employee/employee-assign.jsx';
import EmployeeAttendance from './pages/employee/employee-attendance.jsx';
import EmployeeLeavePermission from './pages/employee/employee-leavepermission.jsx';
import AddProducts from './pages/products/AddProducts.jsx';
import Stocks from './pages/stocks/stock.jsx';
import NotFound from './components/notfoun.jsx';
import Logoutmodal from './components/logoutmodal.jsx';
import UserProfile from './pages/userprofile/userProfile.jsx';
import Orders from './pages/orders/orders.jsx';
import Orderlist from './pages/orders/order-list.jsx';
import Directory from './pages/directory/directory.jsx';
import PurchasePage from './pages/purchases/purchase.jsx';
import CalendarWithHolidayMarker from './pages/calendar/calendar.jsx';
import CreativeService from './pages/creative-services/creative-services.jsx';
import Payroll from './pages/payroll/payroll.jsx';
import RandD from './pages/randd/randd.jsx';
import AddToCart from './pages/leads/addtocart.jsx';
import OrderForm from './pages/leads/order-form.jsx';
import ClassRegister from './pages/leads/class-register.jsx';
import LeadHistory from './pages/leads/view-history.jsx';
import Appointments from './pages/appointments/appointments.jsx';
import Billing from './pages/billing/billing.jsx';
import Collections from './pages/collections/collections.jsx';
import Creatives from './pages/creatives/creatives.jsx';
import Schedule from './pages/appointments/schedules.jsx';
import Sales from './pages/fieldsale/sales.jsx';
import AddToCartBySale from './pages/fieldsale/addtocart.jsx';
import OrderFormBYFs from './pages/fieldsale/order-form.jsx';
import LeadHistoryByFS from './pages/fieldsale/view-history.jsx';
import Credits from './pages/credits/credits.jsx';
import BillOrderForm from './pages/billing/bill-orderform.jsx';
import LeadsPool from './pages/leads/leads-pool.jsx';
import Reports from './pages/reports/reports.jsx';
import InputsPage from './pages/inputs/inputs.jsx';
import Approvals from './pages/approval/approvals.jsx';
import Billinghistory from './pages/billing/billinghistory.jsx';

function App() {

  const [menuItems, setMenuItems] = useState([]);
  const [isShowAlertpopup, setIsShowAlertpopup] = useState(false);
  const config = configModule.config();
  const { user } = useAuth();
  const usertype_id = user?.usertype_id;
  const location = useLocation();

  useEffect(() => {
      toast.dismiss();
  }, [location.pathname]);
  

  const getSidebarList = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}GetSidebarList`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usertype_id: parseInt(usertype_id) })
      });
      const result = await response.json();
      if (response.ok) {
        const sidebarMenu = formatSidebarMenu(result.data.mainList, result.data.subList);
        localStorage.setItem("authPermissions", result.token);
        setMenuItems(sidebarMenu);
      } else {
        console.error("Server error:" + result.message);
      }
    } catch (error) {
      console.error("Server error:" + error.message);
    }
  };

  useEffect(() => {
    if (user?.usertype_id) {
      getSidebarList();
    }
  }, [user?.usertype_id]);

  const formatSidebarMenu = (mainList, subList) => {
    return mainList.map(main => {
      const subMenuItems = subList
        .filter(sub => sub.menu_id === main.menu_id)
        .map(sub => ({ path: sub.path, name: sub.name }));

      const menuItem = {
        path: main.path,
        name: main.name,
        icon: main.icon,
        ...(main.exact === 1 && { exact: true }),
        ...(subMenuItems.length > 0 && { subMenu: subMenuItems })
      };
      return menuItem;
    });
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AdminPage pathURL="/login" />} />
        <Route path="/login" element={<AdminPage pathURL="/login" />} />
        <Route path="/forgot-password" element={<AdminPage pathURL="/forgot-password" />} />

        {/* Protected Routes with Sidebar */}
        <Route element={<MainLayout menuItems={menuItems} />}>
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/leads" element={<PrivateRoute><Leads /></PrivateRoute>} />
          <Route path="/leads/pool" element={<PrivateRoute><LeadsPool /></PrivateRoute>} />
          <Route path="/leads/add-to-card" element={<PrivateRoute><AddToCart /></PrivateRoute>} />
          <Route path="/appointments/add-to-card" element={<PrivateRoute><AddToCart /></PrivateRoute>} />
           <Route path="/appointments/add-to-card/order-form" element={<PrivateRoute><OrderForm /></PrivateRoute>} />

          <Route path="/credits" element={<PrivateRoute><Credits /></PrivateRoute>} />

          <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
          <Route path="/sales/add-to-card" element={<PrivateRoute><AddToCartBySale /></PrivateRoute>} />
          <Route path="/sales/add-to-card/order-form" element={<PrivateRoute><OrderFormBYFs /></PrivateRoute>} />
          <Route path="/sales/profile" element={<PrivateRoute><LeadHistoryByFS /></PrivateRoute>} />
          <Route path="clients/sales/profile" element={<PrivateRoute><LeadHistoryByFS /></PrivateRoute>} />

          <Route path="/leads/profile" element={<PrivateRoute><LeadHistory /></PrivateRoute>} />
          <Route path="/clients/profile" element={<PrivateRoute><LeadHistory /></PrivateRoute>} />
          <Route path="/todo" element={<PrivateRoute><TodoList /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/employee" element={<Navigate to="/employee/list" replace />} />
          <Route path="/products/add" element={<PrivateRoute><AddProducts /></PrivateRoute>} />
          <Route path="/clients" element={<PrivateRoute><ClientsPage /></PrivateRoute>} />
          <Route path="/tracking" element={<PrivateRoute><Tracking /></PrivateRoute>} />
          <Route path="/user-profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="/inventory-list" element={<PrivateRoute><Inventorydis /></PrivateRoute>} />
          <Route path="/inventory-list/inventoryproduct" element={<PrivateRoute><InventoryProd /></PrivateRoute>} />
          <Route path="/accounts" element={<PrivateRoute><Accounts /></PrivateRoute>} />
          <Route path="/accounts/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
          <Route path="/inputs" element={<PrivateRoute><InputsPage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders/></PrivateRoute>} />
          <Route path="/directory" element={<PrivateRoute><Directory/></PrivateRoute>} />
          <Route path="/purchase" element={<PrivateRoute><PurchasePage/></PrivateRoute>} />
          <Route path="/orders-list" element={<PrivateRoute><Orderlist/></PrivateRoute>} />
          <Route path="/stocks" element={<PrivateRoute><Stocks /></PrivateRoute>} />
          <Route path="/branches" element={<PrivateRoute><Branches /></PrivateRoute>} />
          <Route path="/employee/list" element={<PrivateRoute><EmployeeList /></PrivateRoute>} />
          <Route path="/employee/list/add-edit" element={<PrivateRoute><AddEmployee /></PrivateRoute>} />
          <Route path="/employee/assign" element={<PrivateRoute><EmployeeAssign /></PrivateRoute>} />
          <Route path="/employee/attendance" element={<PrivateRoute><EmployeeAttendance /></PrivateRoute>} />
          <Route path="/employee/leave-permission" element={<PrivateRoute><EmployeeLeavePermission /></PrivateRoute>} />
          <Route path="/calendar" element={<PrivateRoute><CalendarWithHolidayMarker /></PrivateRoute>} />
          <Route path="/creative-service" element={<PrivateRoute><CreativeService /></PrivateRoute>} />
          <Route path="/payroll" element={<PrivateRoute><Payroll /></PrivateRoute>} />
          <Route path="/randd" element={<PrivateRoute><RandD /></PrivateRoute>} />
          <Route path="/leads/add-to-card/order-form" element={<PrivateRoute><OrderForm /></PrivateRoute>} />
          <Route path="/leads/class-register" element={<PrivateRoute><ClassRegister /></PrivateRoute>} />
          <Route path="/appointments/class-register" element={<PrivateRoute><ClassRegister /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
          <Route path="/appointments/create-profile" element={<PrivateRoute><Leads /></PrivateRoute>} />
          <Route path="/approvals" element={<PrivateRoute><Approvals /></PrivateRoute>} />
          <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
          <Route path="/billing/order-form" element={<PrivateRoute><BillOrderForm /></PrivateRoute>} />
           <Route path="/billing/history" element={<PrivateRoute><Billinghistory /></PrivateRoute>} />
          <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
          <Route path="/collections" element={<PrivateRoute><Collections /></PrivateRoute>} />
          <Route path="/creatives" element={<PrivateRoute><Creatives/></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
          <Route path="/appointments/schedules" element={<PrivateRoute><Schedule/></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports/></PrivateRoute>} />
        </Route>

        {/* 404 fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Toast Container for authentication notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="colored"
        limit={1}
      />

      {/* Logout modal */}
      {isShowAlertpopup && (
        <Logoutmodal oncloses={() => setIsShowAlertpopup(false)} />
      )}
    </>
  );
}

export default App;
