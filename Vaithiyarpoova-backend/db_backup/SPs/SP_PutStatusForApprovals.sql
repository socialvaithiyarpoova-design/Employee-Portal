/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 14/07/2025
 DESC: It is used to update order status and reason in sales or field shop tables
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_PutStatusForApprovals`;
//
CREATE PROCEDURE `SP_PutStatusForApprovals`(
    IN sStatus  VARCHAR(50),
    IN orderId  INT,
    IN sOption  VARCHAR(20),
    IN reason   VARCHAR(200)
)
BEGIN
    SET SQL_SAFE_UPDATES = 0;

    IF sOption = 'shop' THEN
        UPDATE fieldshopsales 
        SET status = sStatus,
              reason = reason
        WHERE order_recid = orderId;
    ELSE
        UPDATE sales 
        SET status = sStatus,
              reason = reason
        WHERE order_recid = orderId;
    END IF;

    SET SQL_SAFE_UPDATES = 1;
END //
DELIMITER ;
