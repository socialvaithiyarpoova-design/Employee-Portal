DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetUserPermissionStatus`;
CREATE PROCEDURE SP_GetUserPermissionStatus(
    IN p_user_id INT
)
BEGIN
    SELECT 
        lp_recid,
        from_date,
        to_date,
        leave_type,
        duration,
        from_time,
        to_time,
        reason,
        user_status,
        created_at
    FROM 
        user_activity
    WHERE 
        user_id = p_user_id;
     ORDER BY 
        created_at DESC;    
END //

DELIMITER ;