/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 04/08/2025
 DESC: It is used to get class for vaithiyar
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetConsultDataByApp`;

CREATE PROCEDURE `SP_GetConsultDataByApp`(
	IN p_user_id INT(11)
)
BEGIN

      SELECT 
		 LD.*   
		,CR.id                          AS  id
		,CR.slot_date                   AS  preferred_date
		,CR.slot_time                   AS  preferred_time                       
    FROM
        consulting_appointments AS CR
        LEFT JOIN leads AS LD ON LD.lead_recid = CR.owned_by
    WHERE vaithyar_id = p_user_id;
    
    
END//

DELIMITER ;

