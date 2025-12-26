/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 04/08/2025
 DESC: It is used to get class for vaithiyar
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetClassDataByApp`;

CREATE PROCEDURE `SP_GetClassDataByApp`(
	IN user_id INT(11)
)
BEGIN

    SELECT 
		 LD.*   
		,CR.class_register_id                AS  id
		,CR.preferred_date                   AS  preferred_date
		,CR.preferred_time                   AS  preferred_time                       
    FROM
        class_register AS CR
        LEFT JOIN leads AS LD ON LD.lead_recid = CR.owned_by
    WHERE assigned_to = user_id;
    
END//

DELIMITER ;

