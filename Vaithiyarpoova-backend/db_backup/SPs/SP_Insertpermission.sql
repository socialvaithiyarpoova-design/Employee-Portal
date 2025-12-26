DELIMITER //

CREATE PROCEDURE SP_InsertPermissionRequest (
    IN p_from_time TIME,
    IN p_to_time TIME,
    IN p_reason TEXT,
    IN p_user_status ENUM('Approved', 'Declined', 'Pending'),
    IN p_created_by INT
)
BEGIN
    INSERT INTO user_activity (
        from_date,
        to_date,
        from_time,
        to_time,
        Reason,
        user_status,
        created_by
    )
    VALUES (
        CURDATE(),            -- assuming today's date
        CURDATE(),            -- same as above
        p_from_time,
        p_to_time,
        p_reason,
        p_user_status,
        p_created_by
    );
END //

DELIMITER ;
