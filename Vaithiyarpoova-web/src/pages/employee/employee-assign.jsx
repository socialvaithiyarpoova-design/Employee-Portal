import React, { useEffect, useState } from 'react';
import '../../assets/styles/employee-assign.css';
import { useAuth } from '../../components/context/Authcontext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import configModule from '../../../config.js';
import SvgContent from '../../components/svgcontent.jsx';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function EmployeeAssign() {
    const { user } = useAuth();
    const user_typecode = user?.user_typecode;
    const userId = user?.userId;
    const [allPages, setAllPages] = useState([]);
    const [allDesignation, setAllDesignation] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedItems, setselectedItems] = useState([]);
    const [accessRights, setAccessRights] = useState({});
    const [accessHistory, setAccessHistory] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const config = configModule.config();
    const [navigateNext, setNavigateNext] = useState(false);
    const [accessTokenData, setAccessTokenData] = useState([]);
     const navigate = useNavigate();
    // Function to generate dynamic permissions based on "YES"/"NO" values
    const generateDynamicPermissions = (pageData) => {
        const permissions = [];
        
        // Get all permission columns (ending with _btn)
        const permissionFields = Object.keys(pageData).filter(key => 
            key.endsWith('_btn') && pageData[key] === 'YES'
        );
        
        permissionFields.forEach(permission => {
            // Convert permission key to label (e.g., "search_btn" -> "Search")
            const label = permission
                .replace('_btn', '')
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            permissions.push({
                key: permission.replace('_btn', ''), // Remove _btn suffix for consistency
                label: label,
                default: false
            });
        });
        
        return permissions;
    };


    const safeDecodeArray = (raw) => {
        try {
            if (!raw) return [];
            if (typeof raw === 'string' && raw.split('.').length === 3) {
                const d = jwtDecode(raw);
                if (Array.isArray(d?.mainList)) return d.mainList; // common for accessMenu
                return Array.isArray(d) ? d : (d.data || d.rows || d.items || d.access || []);
            }
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (Array.isArray(parsed?.mainList)) return parsed.mainList;
            return Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || parsed.items || []);
        } catch {
            return [];
        }
    };

    const safeDecodeObject = (raw) => {
        try {
            if (!raw) return {};
            if (typeof raw === 'string' && raw.split('.').length === 3) {
                const d = jwtDecode(raw);
                return typeof d === 'object' && d !== null ? d : {};
            }
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch {
            return {};
        }
    };

    const loadAssignData = async () => {
        try {
            // decode access flags from accessMenu token
            const accessMenuToken = localStorage.getItem('accessMenu');
            const decodedAccess = safeDecodeObject(accessMenuToken);
            const tokenRows = Array.isArray(decodedAccess?.mainList) ? decodedAccess.mainList : safeDecodeArray(accessMenuToken);
            setAccessTokenData(tokenRows);

            // fetch lists from API
            const res = await axios.post(`${config.apiBaseUrl}getAssignDetails`,{
                id: userId,
                code: user_typecode || "AD"
            });
            if (res?.status === 200 && res.data) {
                const { pages = [], userTypes = [], users = [] } = res.data;
                setAllPages(pages);
                setAllDesignation(userTypes);
                setAllUsers(users);
            } else {
                toast.error('Failed to load assign data');
            }
        } catch (e) {
            toast.error('Failed to load assign data');
            console.error('loadAssignData error:', e);
        }
    };

    const buildAccessFromToken = (userId) => {
        const effective = {};
        allPages.forEach(page => {
            const row = accessTokenData.find(r => r.user_id === userId && r.menu_id === page.menu_id) || {};
            
            // Generate dynamic permissions for this page
            const dynamicPermissions = generateDynamicPermissions(page);
            const pageAccess = {};
            
            // Only set permissions that are available for this page
            dynamicPermissions.forEach(permission => {
                const dbKey = `${permission.key}_btn`;
                pageAccess[permission.key] = row[dbKey] === 1 || row[dbKey] === 'YES';
            });
            
            effective[page.menu_id] = pageAccess;
        });
        return effective;
    };

    useEffect(() => {
        if (user) {
            loadAssignData();
        }
    }, [user]);

    useEffect(() => {
        if (selectedUser?.user_id && allPages.length > 0) {
            const map = buildAccessFromToken(selectedUser.user_id);
            setAccessRights(map);
            setAccessHistory(map);
        }
    }, [selectedUser?.user_id, allPages, accessTokenData]);

    const goNextAssignPage = (itemData) => {
        setNavigateNext(true);
        setselectedItems(itemData);
        const firstMatch = allUsers.find(u => !itemData.usertype_id || u.usertype_id === itemData.usertype_id) || null;
        setSelectedUser(firstMatch);
    };

    const handleUserSelection = (userData) => {
        if (selectedUser && selectedUser.emp_id === userData.emp_id) {
            setSelectedUser(null);
            return;
        }
        setSelectedUser(userData);
    };

    const handleAccessChange = (menuId, accessKey, value) => {
        setAccessRights(prev => ({
            ...prev,
            [menuId]: {
                ...prev[menuId],
                [accessKey]: value,
            }
        }));
    };

    const isAccessChanged = (menuId, accessKey) => {
        const original = accessHistory[menuId];
        if (!original) return false;
        const current = accessRights[menuId]?.[accessKey];
        return current !== original[accessKey];
    };

    const handleSave = async () => {
        if (!selectedUser) {
            toast.warning("Please select a user to assign access to");
            return;
        }
        try {
            const changes = [];
            allPages.forEach(page => {
                const menuId = page.menu_id;
                const current = accessRights[menuId] || {};
                const original = accessHistory[menuId] || {};
                let modified = false;
                
                // Generate dynamic permissions for this page
                const dynamicPermissions = generateDynamicPermissions(page);
                const changeData = { menu_id: menuId };
                
                // Check if any permissions have changed
                dynamicPermissions.forEach(permission => {
                    const currentValue = current[permission.key] || false;
                    const originalValue = original[permission.key] || false;
                    
                    if (currentValue !== originalValue) {
                        modified = true;
                    }
                    
                    // Add to change data
                    const dbKey = `${permission.key}_btn`;
                    changeData[dbKey] = currentValue ? 1 : 0;
                });
                
                if (modified) {
                    changes.push(changeData);
                }
            });

            if (changes.length === 0) {
                toast.info('No changes to save');
                return;
            }

            const payload = { user_id: selectedUser.user_id, changes };
            const res = await axios.post(`${config.apiBaseUrl}saveAccessMenu`, payload);
            if (res.status === 200) {
                toast.success('Access saved');
                setAccessHistory(accessRights);
            } else {
                toast.error('Failed to save');
            }
        } catch (e) {
            toast.error('Failed to save');
            console.log('faild')
        }
    };

    const handleCancel = () => {
        setNavigateNext(false);
        setSelectedUser(null);
        setAccessRights({});
    };

    const filteredUsers = allUsers.filter(user =>
        (!selectedItems.usertype_id || user.usertype_id === selectedItems.usertype_id) &&
        (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.emp_id?.toString().includes(searchQuery))
    );

    return (
        <div className='common-body-st'>
            <div className='header-div-el'>
                <div className='header-divpart-el'>
                    <p className='mb-0 header-titlecount-el'>Assign Access</p>
                    <div className="d-flex align-items-center">
                        <button onClick={() => { navigate("/employee/list") }}>
                            <p className='mb-0 nav-btn-top'>
                                Employee &gt; Assign 
                            </p>
                        </button>
                        {navigateNext && (
                            <button>
                                &nbsp;{">"}&nbsp;
                                <p className='mb-0 nav-btn-top'>
                                    {selectedItems.user_type}
                                </p>
                            </button>
                        )}
                    </div>
                </div>
                {!navigateNext && (
                    <div className="search-add-wrapper">
                        <input
                            type="text"
                            placeholder="Search"
                            className="search-input"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}
            </div>
            <div className='phone-header-div-el'>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                    <div className="d-flex align-items-center">
                        <button onClick={() => { setNavigateNext(false); }}>
                            <p className='mb-0 nav-btn-top'>
                                Employee &gt; Assign
                            </p>
                        </button>
                    </div>
                    <p className='mb-0 header-titlecount-el'>Assign access</p>
                </div>
                <div className="search-add-wrapper justify-content-end mb-3">
                    <input
                        type="text"
                        placeholder="Search"
                        className="search-input"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className='body-div-el'>
                {!navigateNext && (
                    <div className="row justify-content-center allpages-main-ap" >
                        {allDesignation && allDesignation.map((item) => (
                            <button
                                className="col-3 col-sm-6 col-lg-3 col-xl-3 col-xs-6 mb-4 assign-box-st"
                                key={item.usertype_id || item.user_typecode}
                                onClick={() => goNextAssignPage(item)}
                            >
                                <div className="assign-subbox-st w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                                    <div className="assign-icon-ap" >
                                        <SvgContent svg_name="employee" width="100%" height="100%" stroke="#05823a" />
                                    </div>
                                    <div className="menu-name hyphen-wrap text-center">{item.user_type}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {navigateNext && (
                    <div className='w-100 assign-pro-ap'>
                        {/* Left Sidebar - User Selection */}
                        <div className='assign-body-list-lft' >
                            <div className='' style={{ height: '115px' }}>
                            <div className=' ' >
                            <button className="btn btn-success w-100 mb-3 fw-bold btn-gradient-green">
                                {selectedItems.user_type}
                            </button>
                            </div>
                            {/* Search for users */}
                            <div className="mb-2">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="form-control"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                          </div>
                            <div className='innerbody-body-ap' style={{ height: 'calc(100% - 115px)' }}>
                                <div className="employee-list p-2">
                                    {filteredUsers && filteredUsers.length > 0 ? (
                                        filteredUsers.map((user, index) => (
                                            <div
                                                key={user.user_id || user.emp_id || index}
                                                className={`d-flex align-items-center emp-listcont-st ${selectedUser?.emp_id === user.emp_id ? 'selected-user' : ''}`}
                                                onClick={() => handleUserSelection(user)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="user-select"
                                                    className="emp-checkbox me-2"
                                                    checked={selectedUser?.emp_id === user.emp_id}
                                                    onChange={() => handleUserSelection(user)}
                                                />
                                                <span className="emp-label">
                                                    {user.name || 'Emp name'} (ID: {user.emp_id})
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-users-msg">No users found for this designation</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Main Content - Access Rights */}
                        <div className='assign-body-list-rit '>
                            <div className='p-4'style={{ height: 'calc(100% - 70px)',overflowY: 'auto' }}>
                            {selectedUser ? (
                                <>
                                <div className="mb-4 p-2 bg-light rounded">
                                        <h5 className="mb-2">Assigning access to:</h5>
                                        <p className="mb-0"><strong>{selectedUser.name}</strong> (ID: {selectedUser.emp_id})</p>
                                        <small className="">Designation: {selectedItems.user_type}</small>
                                    </div>

                                    {allPages && allPages.map((item, index) => (
                                        <div key={item.menu_id || index} className='mb-4'>
                                            <h6 className='fw-bold'>
                                                {item.name}
                                            </h6>
                                            <div className="d-flex flex-wrap gap-3 mt-2">
                                                {generateDynamicPermissions(item).map(access => {
                                                    const currentValue = accessRights[item.menu_id]?.[access.key] || false;
                                                    const hasChanged = isAccessChanged(item.menu_id, access.key);

                                                    return (
                                                        <label
                                                            key={access.key}
                                                            className={`custom-form-check ${hasChanged ? 'permission-changed' : ''}`}
                                                            htmlFor={`check-${item.menu_id}-${access.key}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="custom-checkbox-ap"
                                                                id={`check-${item.menu_id}-${access.key}`}
                                                                checked={currentValue}
                                                                onChange={(e) => handleAccessChange(item.menu_id, access.key, e.target.checked)}
                                                            />
                                                            <span className="text-capitalize">
                                                                {access.label} 
                                                                {hasChanged && (
                                                                    <span className="badge bg-warning ms-1">Modified</span>
                                                                )}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-center p-5">
                                    <h5 className="text-muted">Please select a user from the left panel to assign access</h5>
                                    <p className="text-muted">Choose a user to see their current access rights and make changes</p>
                                </div>
                            )}
                          </div>
                          <div className='d-flex align-iterms-center  justify-content-end p-3' style={{ height: '70px' }}>
                            {selectedUser && (
                                <div className="">
                                    <button
                                        className="assign-close-ae"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                    <button className="ms-2 assign-save-ae" onClick={handleSave}>
                                     Save Access
                                    </button>
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                )}
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
        </div>
    );
}

export default EmployeeAssign;
