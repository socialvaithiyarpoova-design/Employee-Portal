/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 05/05/2025
 DESC: It is used insert the lead count
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_PutLeadCount`;

CREATE PROCEDURE `SP_PutLeadCount`(
    IN count       INT(11)
   ,IN userId      INT(11)
)
BEGIN
    
    INSERT INTO leads_count_history (created_by, lead_count ) VALUES (userId, count);

    SELECT * FROM leads_count_history WHERE created_by = userId ORDER BY 1 DESC;
   
END//

DELIMITER ;

