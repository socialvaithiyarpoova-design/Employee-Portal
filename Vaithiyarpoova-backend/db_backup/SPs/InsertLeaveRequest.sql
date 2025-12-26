DELIMITER //
DROP PROCEDURE IF EXISTS `SP_InsertLeaveRequest`;
CREATE PROCEDURE SP_InsertLeaveRequest (
    IN p_from_date DATE,
    IN p_to_date DATE,
    IN p_leave_type VARCHAR(50),
    IN p_duration VARCHAR(50),
    IN p_reason TEXT,
    IN p_user_status ENUM('Approved', 'Declined', 'Pending'),
    IN p_created_by INT
)
BEGIN
    INSERT INTO user_activity (
        from_date,
        to_date,
        leave_type,
        duration,
        from_time,
        to_time,
        Reason,
        user_status,
        created_by
    )
    VALUES (
        p_from_date,
        p_to_date,
        p_leave_type,
        p_duration,
        '00:00:00',         
        '00:00:00',         
        p_reason,
        p_user_status,
        p_created_by
    );
END //

DELIMITER ;
