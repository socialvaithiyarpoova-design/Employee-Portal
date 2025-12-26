/* ----------------------------------------------------------------------------------------------------------------- 
 NAME:  Ajith
 DATE: 10.11.2025
 DESC: It is used to get all products
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllProductBilling` //
CREATE PROCEDURE `SP_GetAllProductBilling`(
    IN sFilterData VARCHAR(1000),
    IN user_id INT
)
BEGIN
    DECLARE sCondition TEXT DEFAULT '';

    -- Base condition: created_by = user_id
    SET sCondition = CONCAT(" WHERE created_by = ", user_id);

    -- Add category filter if provided
    IF sFilterData IS NOT NULL AND sFilterData != '' THEN
        SET sCondition = CONCAT(sCondition, " AND product_category IN (", sFilterData, ")");
    END IF;

    -- Build final query
    SET @sQuery = CONCAT("
        SELECT 
            stock_recid, 
            stock_product_id, 
            product_name, 
            stock_quantity,
            brand, 
            product_category, 
            form_factor, 
            product_type, 
            package_quantity, 
            units, 
            selling_price, 
            min_stock_qty, 
            product_img, 
            stock_status, 
            created_by, 
            updated_qty, 
            created_at
        FROM stock
        ", sCondition, "
        ORDER BY created_at DESC;
    ");

    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //
DELIMITER ;
