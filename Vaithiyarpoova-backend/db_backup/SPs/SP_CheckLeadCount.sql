/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 05/05/2025
 DESC: It is used check lead count
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_CheckLeadCount`;

CREATE PROCEDURE `SP_CheckLeadCount`(
   IN userId      INT(11)
)
BEGIN

    SELECT * FROM leads_count_history WHERE created_by = userId AND DATE(created_at) = DATE(NOW()) ORDER BY 1 DESC;
   
END//

DELIMITER ;

