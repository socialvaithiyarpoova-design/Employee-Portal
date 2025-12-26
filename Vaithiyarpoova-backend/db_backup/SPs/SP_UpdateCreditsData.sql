/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 11/07/2025
 DESC: It is used update the field sale order status
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_UpdateCreditsData`;

CREATE PROCEDURE `SP_UpdateCreditsData`(
     IN p_order_recid  VARCHAR(50),
     IN p_paid_status  VARCHAR(50),
     IN p_status       VARCHAR(50)
)
BEGIN
    SET SQL_SAFE_UPDATES = 0;
    
    IF p_status = 'Approved' THEN 
        IF p_paid_status = 'Part payment' THEN
            UPDATE fieldshopsales 
            SET account_status = 'Partial'
            WHERE order_recid = p_order_recid
            LIMIT 1;
        ELSEIF p_paid_status = 'Paid' THEN
            UPDATE fieldshopsales 
            SET account_status = 'Approved'
            WHERE order_recid = p_order_recid;
        END IF;
    ELSE
        UPDATE fieldshopsales 
        SET account_status = p_status
        WHERE order_recid = p_order_recid;
    END IF;
    
    SET SQL_SAFE_UPDATES = 1;
END//

DELIMITER ;
