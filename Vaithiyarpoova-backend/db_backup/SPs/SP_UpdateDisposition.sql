
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 11/07/2025
 DESC: It is used update the disposition in lead
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_UpdateDisposition`;

CREATE PROCEDURE `SP_UpdateDisposition`(
     IN sKey VARCHAR(50)
    ,IN iId  INT(11)
    ,IN sDate VARCHAR(100)
)
BEGIN
    
    SET SQL_SAFE_UPDATES = 0;
        UPDATE leads 
        SET disposition = sKey, disposition_date = sDate  
        WHERE lead_recid = iId;
	SET SQL_SAFE_UPDATES = 1;
    
END//

DELIMITER ;

