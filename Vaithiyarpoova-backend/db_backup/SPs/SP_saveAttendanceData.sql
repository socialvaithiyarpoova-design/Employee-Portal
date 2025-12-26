/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 11/08/2025
 DESC: It is used save the branch list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_saveAttendanceData`;

CREATE PROCEDURE `SP_saveAttendanceData`(
    IN p_emp_id VARCHAR(1000),
    IN p_name VARCHAR(100),
    IN p_user_type VARCHAR(50),
    IN p_status VARCHAR(50),
    IN p_duration VARCHAR(50),
    IN p_login_time VARCHAR(50),
    IN p_attendance_status VARCHAR(50)
)
BEGIN
    
   INSERT INTO attendance (
    emp_id,
    emp_name,
    designation,
    work_type,
    duration,
    login_time,
    status,
    date
) 
VALUES (
    p_emp_id,
    p_name,
    p_user_type,
    p_status,
    p_duration,
    CAST(
        STR_TO_DATE(REPLACE(SUBSTRING(p_login_time, 1, 19), 'T', ' '), '%Y-%m-%d %H:%i:%s')
        AS DATETIME
    ),
    p_attendance_status,
    NOW()
);


        
END//

DELIMITER ;


