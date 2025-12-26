import { jwtDecode } from 'jwt-decode';

// Helper function to safely decode JWT tokens
const safeDecodeArray = (raw) => {
    try {
        if (!raw) return [];
        if (typeof raw === 'string' && raw.split('.').length === 3) {
            const d = jwtDecode(raw);
            if (Array.isArray(d?.mainList)) return d.mainList;
            return Array.isArray(d) ? d : (d.data || d.rows || d.items || d.access || []);
        }
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed?.mainList)) return parsed.mainList;
        return Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || parsed.items || []);
    } catch {
        return [];
    }
};

// Get user permissions from localStorage
export const getUserPermissions = () => {
    try {
        const accessMenuToken = localStorage.getItem('accessMenu');
        const tokenRows = safeDecodeArray(accessMenuToken);
        return tokenRows || [];
    } catch (error) {
        console.error('Error getting user permissions:', error);
        return [];
    }
};

// Check if user has permission for a specific module and action
export const hasPermission = (moduleName, action) => {
    try {
        const permissions = getUserPermissions();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.user_id;

        // Find the permission record for this user and module
        const permission = permissions.find(p => 
            p.user_id === userId && 
            p.menu_name?.toLowerCase() === moduleName?.toLowerCase()
        );

        if (!permission) return false;

        // Map action names to database column names
        const actionMap = {
            'active': 'active_btn',
            'inactive': 'inactive_btn',
            'view': 'view_btn',
            'upload': 'upload_btn',
            'search': 'search_btn',
            'sort': 'sort_btn',
            'filter': 'filter_btn',
            'shuffle': 'suffle_btn',
            'export': 'export_btn',
            'add': 'add_btn',
            'edit': 'edit_btn',
            'delete': 'delete_btn',
            'permission': 'permission_btn',
            'break': 'break_btn',
            'event': 'event_btn',
            'history': 'history_btn',
            'purchase_history': 'purchase_history_btn',
            'consulting_history': 'consulting_history_btn',
            'upgrade': 'upgrade_btn',
            'gst': 'gst_btn',
            'premium': 'premium_btn',
            'add_target': 'add_target_btn',
            'schedule': 'schedule_btn',
            'category': 'category_btn',
            'people': 'people_btn',
            'shop': 'shop_btn',
            'class': 'class_btn',
            'wallet': 'wallet_btn',
            'update': 'update_btn',
            'create_profile': 'create_profile_btn',
            'events': 'events_btn',
            'leave_permission': 'leave_permission_btn',
            'list': 'list_btn',
            'attendance': 'attendance_btn',
            'add_new': 'add_new_btn'
        };

        const columnName = actionMap[action];
        if (!columnName) return false;

        return permission[columnName] === 1;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
};

// Check multiple permissions at once
export const hasAnyPermission = (moduleName, actions) => {
    return actions.some(action => hasPermission(moduleName, action));
};

export const hasAllPermissions = (moduleName, actions) => {
    return actions.every(action => hasPermission(moduleName, action));
};

// Get all permissions for a specific module
export const getModulePermissions = (moduleName) => {
    try {
        const permissions = getUserPermissions();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.user_id;

        const permission = permissions.find(p => 
            p.user_id === userId && 
            p.menu_name?.toLowerCase() === moduleName?.toLowerCase()
        );

        if (!permission) return {};

        return {
            active: permission.active_btn === 1,
            inactive: permission.inactive_btn === 1,
            view: permission.view_btn === 1,
            upload: permission.upload_btn === 1,
            search: permission.search_btn === 1,
            sort: permission.sort_btn === 1,
            filter: permission.filter_btn === 1,
            shuffle: permission.suffle_btn === 1,
            export: permission.export_btn === 1,
            add: permission.add_btn === 1,
            edit: permission.edit_btn === 1,
            delete: permission.delete_btn === 1,
            permission: permission.permission_btn === 1,
            break: permission.break_btn === 1,
            event: permission.event_btn === 1,
            history: permission.history_btn === 1,
            purchase_history: permission.purchase_history_btn === 1,
            consulting_history: permission.consulting_history_btn === 1,
            upgrade: permission.upgrade_btn === 1,
            gst: permission.gst_btn === 1,
            premium: permission.premium_btn === 1,
            add_target: permission.add_target_btn === 1,
            schedule: permission.schedule_btn === 1,
            category: permission.category_btn === 1,
            people: permission.people_btn === 1,
            shop: permission.shop_btn === 1,
            class: permission.class_btn === 1,
            wallet: permission.wallet_btn === 1,
            update: permission.update_btn === 1,
            create_profile: permission.create_profile_btn === 1,
            events: permission.events_btn === 1,
            leave_permission: permission.leave_permission_btn === 1,
            list: permission.list_btn === 1,
            attendance: permission.attendance_btn === 1,
            add_new: permission.add_new_btn === 1
        };
    } catch (error) {
        console.error('Error getting module permissions:', error);
        return {};
    }
};
