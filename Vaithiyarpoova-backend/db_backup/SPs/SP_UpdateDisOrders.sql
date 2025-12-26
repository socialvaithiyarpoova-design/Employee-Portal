/* ----------------------------------------------------------------------------------------------------------------- 
   NAME: Hariharan S
   DATE: 10/07/2025
   DESC: It is used to update sales or shop sales based on type mode
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_UpdateDisOrders`;
//
CREATE PROCEDURE `SP_UpdateDisOrders`(
    IN p_status VARCHAR(100),
    IN p_order_recid BIGINT,
    IN p_order_id VARCHAR(100),
    IN p_courier VARCHAR(100),
    IN p_tracking_id VARCHAR(100),
    IN p_net_weight VARCHAR(100),
    IN p_type_mode VARCHAR(100)
)
BEGIN
    -- Temporarily disable safe update mode
    SET SQL_SAFE_UPDATES = 0;

    IF p_type_mode = 'sale' THEN
        UPDATE sales
        SET 
            status = p_status,
            courier = p_courier,
            tracking_id = p_tracking_id,
            net_weight = p_net_weight
        WHERE order_id = p_order_id;

        SELECT 
            'sales' AS table_name,
            'UPDATE' AS method,
            p_order_recid AS id,
            'order_recid' AS id_column_name;

    ELSEIF p_type_mode = 'shop' THEN
        UPDATE fieldshopsales
        SET 
            status = p_status,
            courier = p_courier,
            tracking_id = p_tracking_id,
            net_weight = p_net_weight
        WHERE order_id = p_order_id;

        SELECT 
            'fieldshopsales' AS table_name,
            'UPDATE' AS method,
            p_order_recid AS id,
            'order_recid' AS id_column_name;
    END IF;

    -- Re-enable safe updates
    SET SQL_SAFE_UPDATES = 1;
END;
//
DELIMITER ;
