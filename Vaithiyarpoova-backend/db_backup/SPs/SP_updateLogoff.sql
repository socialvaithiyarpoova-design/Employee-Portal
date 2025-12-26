
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 11/08/2025
 DESC: It is used update the logout time
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_updateLogoff`;

CREATE PROCEDURE `SP_updateLogoff`(
     IN username VARCHAR(100)
)
BEGIN
    
    SET SQL_SAFE_UPDATES = 0;

        UPDATE attendance 
            SET logoff_time = CONVERT_TZ(NOW(), @@session.time_zone, '+05:30')
        WHERE emp_name = username;

    SET SQL_SAFE_UPDATES = 1;
    
END//

DELIMITER ;

