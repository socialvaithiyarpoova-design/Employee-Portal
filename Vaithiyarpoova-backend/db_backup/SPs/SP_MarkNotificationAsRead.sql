DELIMITER //
CREATE PROCEDURE SP_MarkNotificationAsRead(IN p_notification_id BIGINT)
BEGIN
    UPDATE notifications
    SET read = 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE notification_id = p_notification_id;
    SELECT ROW_COUNT() AS affected_rows;
END //
DELIMITER ;