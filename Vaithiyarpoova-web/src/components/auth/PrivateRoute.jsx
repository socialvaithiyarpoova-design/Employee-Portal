import React, { useEffect, useState, useRef } from 'react';
import { Navigate,useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import configModule from '../../../config.js';
import { jwtDecode } from 'jwt-decode';

// 403 Forbidden fallback UI
const ForbiddenView = () => (
  <div style={{ width: '100%', height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '72px', margin: 0, color: '#b00020' }}>403</h1>
      <h3 style={{ marginTop: '8px' }}>Forbidden</h3>
      <p style={{ color: '#666' }}>You don't have access to this page.</p>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const [redirect, setRedirect] = useState(false);
  const location = useLocation();
  const config = configModule.config();
  
  // NEW: Track if permissions have been checked for current session
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [permissionsValid, setPermissionsValid] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [redirectAfterDelay, setRedirectAfterDelay] = useState(false);
  
  // Track current path to avoid re-checking same route
  const currentPathRef = useRef('');
  const hasCheckedPathRef = useRef(false);

  useEffect(() => {
    if (!token) {
      toast.warning('Please login first!', { autoClose: 2000 });
      const timeout = setTimeout(() => {
        setRedirect(true);
      }, 2);
      return () => clearTimeout(timeout);
    }
    
  }, [token]);

  // NEW: One-time permission check - only runs once per session or when path changes
  useEffect(() => {
    if (!token) {
      setPermissionsChecked(true);
      setPermissionsValid(false);
      return;
    }

    const currentPath = location.pathname;
    
    // If we've already checked this exact path, don't check again
    if (currentPathRef.current === currentPath && hasCheckedPathRef.current) {
      return;
    }

    // If we've already checked permissions for this session and path hasn't changed, use cached result
    if (permissionsChecked && currentPathRef.current === currentPath) {
      return;
    }

    // Check if we have cached permissions
    const cachedPermissions = localStorage.getItem('accessSidebarMenu');
    const cachedPermissionsTimestamp = localStorage.getItem('permissionsTimestamp');
    
    // Use cached permissions if they're less than 30 minutes old
    const isCacheValid = cachedPermissions && cachedPermissionsTimestamp && 
      (Date.now() - parseInt(cachedPermissionsTimestamp)) < 30 * 60 * 1000;

    if (isCacheValid && permissionsChecked) {
      // Use cached permissions without API call
      const paths = JSON.parse(cachedPermissions);
      const isAllowed = checkPathAccess(currentPath, paths);
      setPermissionsValid(isAllowed);
      setForbidden(!isAllowed);
      currentPathRef.current = currentPath;
      hasCheckedPathRef.current = true;
      return;
    }

    // Only fetch permissions if we don't have valid cached data
    if (!isCacheValid || !permissionsChecked) {
      fetchPermissionsOnce(currentPath);
    }
  }, [token, location.pathname, permissionsChecked]);

  // NEW: Fetch permissions only once
  const fetchPermissionsOnce = async (currentPath) => {
    try {
      let usertypeId = null;
      try {
        const pms = localStorage.getItem('authPermissions');
        if (pms) { 
          const d = jwtDecode(pms); 
          usertypeId = d?.usertype_id; 
        }
      } catch {}
      
      if (!usertypeId) {
        try { 
          const d = jwtDecode(token); 
          usertypeId = d?.usertype_id; 
        } catch {}
      }
      
      if (!usertypeId) { 
        setPermissionsValid(false);
        setForbidden(true);
        setPermissionsChecked(true);
        return; 
      }
      
      // Fetch permissions from backend only once
      const res = await fetch(`${config.apiBaseUrl}GetSidebarList`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ usertype_id: parseInt(usertypeId) })
      });
      
      const json = await res.json();
      if (res.ok && json?.data) {
        const main = Array.isArray(json.data.mainList) ? json.data.mainList.map(x => x?.path).filter(Boolean) : [];
        const sub = Array.isArray(json.data.subList) ? json.data.subList.map(x => x?.path).filter(Boolean) : [];
        const allowedPaths = [...main, ...sub];
        
        // Cache permissions with timestamp
        localStorage.setItem('accessSidebarMenu', JSON.stringify(allowedPaths));
        localStorage.setItem('permissionsTimestamp', Date.now().toString());
        
        // Check if current path is allowed
        const isAllowed = checkPathAccess(currentPath, allowedPaths);
        setPermissionsValid(isAllowed);
        setForbidden(!isAllowed);
        
        if (!isAllowed) {
          toast.error("Access denied. You don't have permission to view this page.", { 
            autoClose: 3000, 
            pauseOnHover: false 
          });
        }
      } else {
        // If backend fails, block access for security
        setPermissionsValid(false);
        setForbidden(true);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // If there's an error, block access for security
      setPermissionsValid(false);
      setForbidden(true);
    } finally {
      setPermissionsChecked(true);
      currentPathRef.current = currentPath;
      hasCheckedPathRef.current = true;
    }
  };

  // NEW: Helper function to check path access
  const checkPathAccess = (currentPath, allowedPaths) => {
    // Always-allowed routes for all roles
    const alwaysAllowed = ['/profile', '/user-profile', '/dashboard', '/inputs', '/leads/add-to-card/order-form'];
    
    if (alwaysAllowed.some(x => currentPath === x || (x && currentPath.startsWith(x + '/')))) {
      return true;
    }
    
    return allowedPaths.some(x => x === currentPath || (x && currentPath.startsWith(x + '/')));
  };

  // Handle 3-second delay for forbidden access
  useEffect(() => {
    if (token && forbidden) {
      setRedirectAfterDelay(false);
      const timer = setTimeout(() => setRedirectAfterDelay(true), 3000);
      return () => clearTimeout(timer);
    }
    setRedirectAfterDelay(false);
  }, [token, forbidden]);

  if (!token && redirect) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Block rendering protected content until permissions are checked
  if (token && !permissionsChecked) { 
    return null; 
  }

  // Show forbidden view for unauthorized access
  if (token && forbidden) {
    if (!redirectAfterDelay) {
      return <ForbiddenView />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return token ? children : null;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;