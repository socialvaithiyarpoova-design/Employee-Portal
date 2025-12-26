DROP PROCEDURE IF EXISTS SP_SaveAccessUserMenu;
DELIMITER $$

CREATE PROCEDURE SP_SaveAccessUserMenu(
    IN p_user_id INT,
    IN p_menu_id INT,
    IN p_active_btn TINYINT,
    IN p_inactive_btn TINYINT,
    IN p_view_btn TINYINT,
    IN p_upload_btn TINYINT,
    IN p_search_btn TINYINT,
    IN p_filter_btn TINYINT,
    IN p_shuffle_btn TINYINT,
    IN p_export_btn TINYINT,
    IN p_add_btn TINYINT,
    IN p_edit_btn TINYINT,
    IN p_delete_btn TINYINT,
    IN p_permission_btn TINYINT,
    IN p_break_btn TINYINT,
    IN p_event_btn TINYINT,
    IN p_history_btn TINYINT,
    IN p_purchase_history_btn TINYINT,
    IN p_consulting_history_btn TINYINT,
    IN p_upgrade_btn TINYINT,
    IN p_gst_btn TINYINT,
    IN p_premium_btn TINYINT,
    IN p_add_target_btn TINYINT,
    IN p_schedule_btn TINYINT,
    IN p_category_btn TINYINT,
    IN p_people_btn TINYINT,
    IN p_shop_btn TINYINT,
    IN p_class_btn TINYINT,
    IN p_wallet_btn TINYINT,
    IN p_update_btn TINYINT,
    IN p_create_profile_btn TINYINT,
    IN p_events_btn TINYINT,
    IN p_leave_permission_btn TINYINT,
    IN p_list_btn TINYINT,
    IN p_attendance_btn TINYINT,
    IN p_add_new_btn TINYINT,
    IN p_add_expense TINYINT
)
BEGIN
    DECLARE existing_record INT DEFAULT 0;
    
    -- Check if record exists
    SELECT COUNT(*) INTO existing_record 
    FROM access_user_menu 
    WHERE user_id = p_user_id AND menu_id = p_menu_id;
    
    IF existing_record > 0 THEN
        -- Update existing record
        UPDATE access_user_menu SET
            active_btn = p_active_btn,
            inactive_btn = p_inactive_btn,
            view_btn = p_view_btn,
            upload_btn = p_upload_btn,
            search_btn = p_search_btn,
            filter_btn = p_filter_btn,
            suffle_btn = p_shuffle_btn,
            export_btn = p_export_btn,
            add_btn = p_add_btn,
            edit_btn = p_edit_btn,
            delete_btn = p_delete_btn,
            permission_btn = p_permission_btn,
            break_btn = p_break_btn,
            event_btn = p_event_btn,
            history_btn = p_history_btn,
            purchase_history_btn = p_purchase_history_btn,
            consulting_history_btn = p_consulting_history_btn,
            upgrade_btn = p_upgrade_btn,
            gst_btn = p_gst_btn,
            premium_btn = p_premium_btn,
            add_target_btn = p_add_target_btn,
            schedule_btn = p_schedule_btn,
            category_btn = p_category_btn,
            people_btn = p_people_btn,
            shop_btn = p_shop_btn,
            class_btn = p_class_btn,
            wallet_btn = p_wallet_btn,
            update_btn = p_update_btn,
            create_profile_btn = p_create_profile_btn,
            events_btn = p_events_btn,
            leave_permission_btn = p_leave_permission_btn,
            list_btn = p_list_btn,
            attendance_btn = p_attendance_btn,
            add_new_btn = p_add_new_btn,
            add_expense = p_add_expense
        WHERE user_id = p_user_id AND menu_id = p_menu_id;
    ELSE
        -- Insert new record
        INSERT INTO access_user_menu (
            user_id, menu_id, active_btn, inactive_btn, view_btn, upload_btn, 
            search_btn, filter_btn, suffle_btn, export_btn, 
            add_btn, edit_btn, delete_btn, permission_btn, break_btn, event_btn, 
            history_btn, purchase_history_btn, consulting_history_btn, upgrade_btn, 
            gst_btn, premium_btn, add_target_btn, schedule_btn, category_btn, 
            people_btn, shop_btn, class_btn, wallet_btn, update_btn, 
            create_profile_btn, events_btn, leave_permission_btn, list_btn, 
            attendance_btn, add_new_btn , add_expense
        ) VALUES (
            p_user_id, p_menu_id, p_active_btn, p_inactive_btn, p_view_btn, p_upload_btn,
            p_search_btn, p_filter_btn, p_shuffle_btn, p_export_btn,
            p_add_btn, p_edit_btn, p_delete_btn, p_permission_btn, p_break_btn, p_event_btn,
            p_history_btn, p_purchase_history_btn, p_consulting_history_btn, p_upgrade_btn,
            p_gst_btn, p_premium_btn, p_add_target_btn, p_schedule_btn, p_category_btn,
            p_people_btn, p_shop_btn, p_class_btn, p_wallet_btn, p_update_btn,
            p_create_profile_btn, p_events_btn, p_leave_permission_btn, p_list_btn,
            p_attendance_btn, p_add_new_btn , p_add_expense
        );
    END IF;

    SELECT * FROM access_user_menu WHERE user_id = p_user_id AND menu_id = p_menu_id;
END$$

DELIMITER ;