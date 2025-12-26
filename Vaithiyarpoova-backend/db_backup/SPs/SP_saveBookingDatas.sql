/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 17/07/2025
 DESC: It is used to save slot
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_saveBookingDatas`;

CREATE PROCEDURE `SP_saveBookingDatas`(
  
    IN p_user_id        INT(11),
    IN p_user_typecode  VARCHAR(20),
    IN p_date           DATETIME,
    IN p_time           VARCHAR(20),
    IN p_interval       INT(11),
    IN p_action         VARCHAR(20),
    IN id               INT(11)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_start DATETIME;
    DECLARE v_end DATETIME;

    -- Build the start datetime from input date + time
    SET v_start = STR_TO_DATE(CONCAT(DATE(p_date), ' ', p_time), '%Y-%m-%d %h:%i %p');
    SET v_end = DATE_ADD(v_start, INTERVAL p_interval MINUTE);

    -- Check overlap
    SELECT COUNT(appointment_id) INTO v_count
    FROM appointments_list
    WHERE isDeleted = 0

    // here the change
      AND 
(
    v_start < DATE_ADD(
                STR_TO_DATE(
                    CONCAT(DATE(appointment_date), ' ', appointment_time),
                    '%Y-%m-%d %h:%i %p'
                ),
                INTERVAL interval_minutes MINUTE
             )
    AND
    v_end > STR_TO_DATE(
              CONCAT(DATE(appointment_date), ' ', appointment_time),
              '%Y-%m-%d %h:%i %p'
           )
)
// end change

    IF v_count > 0 THEN 
        SELECT 201 AS status, 'Slot already set' AS message;
    ELSE
        IF p_action = "reschedule" THEN
            SELECT 
                appointment_date, 
                appointment_time, 
                user_id
            INTO 
                @date, 
                @time, 
                @userid
            FROM appointments_list
            WHERE appointment_id = id;
            
            UPDATE appointments_list SET appointment_date = p_date , appointment_time = p_time WHERE appointment_id = id LIMIT 1;
            UPDATE consulting_appointments SET slot_date = p_date, slot_time = p_time  WHERE DATE(slot_date) = DATE(@date) AND slot_time = @time LIMIT 1;
        ELSE 
            INSERT INTO appointments_list 
            (user_id, user_typecode, appointment_date, appointment_time, interval_minutes, status, isDeleted)
            VALUES (p_user_id, p_user_typecode, p_date, p_time, p_interval, 'available', 0);
        END IF;

        SELECT 200 AS status, LAST_INSERT_ID() AS appointment_id;
    END IF;
END//
DELIMITER ;