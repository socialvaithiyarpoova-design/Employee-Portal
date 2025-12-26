DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetTimeSlot`;

CREATE PROCEDURE `SP_GetTimeSlot`(
    IN p_id INT(11),
    IN p_date VARCHAR(100)
)
BEGIN
   
   SELECT appointment_time FROM appointments_list WHERE DATE(appointment_date) = DATE(p_date) AND user_id = p_id AND isDeleted = 0 AND status = 'available'
   ORDER BY STR_TO_DATE(appointment_time, '%h:%i %p') ASC;
    
END//
DELIMITER ;