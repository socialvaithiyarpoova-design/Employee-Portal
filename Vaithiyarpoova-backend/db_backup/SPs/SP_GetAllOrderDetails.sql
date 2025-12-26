/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 11/07/2025
 DESC: It is used to get all orders
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllOrderDetails`;

CREATE PROCEDURE `SP_GetAllOrderDetails`(
    IN sFilterData VARCHAR(1000)
)

BEGIN

    DECLARE sCondition VARCHAR(1000) DEFAULT '';

    IF sFilterData != null OR sFilterData != "" THEN 
        SET sCondition = CONCAT(sCondition, IF(sCondition <> "", CONCAT(" AND status = '",sFilterData,"' ") , CONCAT(" WHERE UPPER(status) = UPPER('",sFilterData,"') ")));
    END IF;

     SET @sQuery = CONCAT("
        SELECT 
            order_recid, order_id, order_name, order_qty, order_value, order_date, order_type, customer_id, medication_period, courier, status
        FROM
            orders  ", IFNULL(sCondition, ''), " ORDER BY order_recid DESC ");

    -- SELECT @sQuery;
        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

END//
DELIMITER ;
