
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 11/07/2025
 DESC: It is used update the field sale order status
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_PutStatusForCredits`;

CREATE PROCEDURE `SP_PutStatusForCredits`(
     IN P_status  VARCHAR(50)
    ,IN P_order_id  INT(11)
)
BEGIN
    
    SET SQL_SAFE_UPDATES = 0;
        UPDATE fieldshopsales 
        SET status = P_status
        WHERE order_recid = P_order_id;
	SET SQL_SAFE_UPDATES = 1;
    
END//

DELIMITER ;

