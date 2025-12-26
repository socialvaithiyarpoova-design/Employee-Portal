import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permission, setPermission] = useState(null);
  const [accessMenu, setAccessMenu] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUser({
        userId: decodedToken.userId,
        username: decodedToken.username,
        userType: decodedToken.user_type,
        mobile_number: decodedToken.mobile_number,
        usertype_id: decodedToken.usertype_id,
        user_typecode: decodedToken.user_typecode,
        created_by: decodedToken.created_by,
        loginTime: decodedToken.loginTime
      });
    }

    const tokenPms = localStorage.getItem("authPermissions");
    if (tokenPms) {
      const decodedToken = jwtDecode(tokenPms);
      setPermission({
        menuList: decodedToken.mainList,
        subMenuList: decodedToken.subList,
        usertype_id: decodedToken.usertype_id
      });
    }

    const tokenAccess = localStorage.getItem("accessMenu");
    if (tokenAccess) {
      const decoded = jwtDecode(tokenAccess);
      setAccessMenu(decoded?.mainList);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("authToken", token);
    const decodedToken = jwtDecode(token);
    setUser({
      userId: decodedToken.userId,
      username: decodedToken.username,
      userType: decodedToken.user_type,
      mobile_number: decodedToken.mobile_number,
      usertype_id: decodedToken.usertype_id,
      user_typecode: decodedToken.user_typecode,
      created_by: decodedToken.created_by,
      loginTime: decodedToken.loginTime
    });
  };

  const permissions = (tokenPms) => {
    localStorage.setItem("authPermissions", tokenPms);
    const decodedToken = jwtDecode(tokenPms);
    setPermission({
      menuList: decodedToken.mainList,
      subMenuList: decodedToken.subList,
      usertype_id: decodedToken.usertype_id
    });
  };

  const accessMenus = (tokenAccess) => {
    localStorage.setItem("accessMenu", tokenAccess);
    const decoded = jwtDecode(tokenAccess);
    setAccessMenu(decoded?.mainList);
  };

  const contextValue = useMemo(() => ({
    user,
    login,
    permission,
    accessMenu,
    permissions,
    accessMenus
  }), [user, permission, accessMenu]);

  return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
