DELIMITER //
DROP PROCEDURE IF EXISTS `SP_Getstocks`;
CREATE PROCEDURE SP_Getstocks(
    IN in_brand VARCHAR(150),
    IN p_status VARCHAR(100)
)
BEGIN
    DECLARE sSql TEXT;

    -- Base query
    SET sSql = 
        "SELECT 
            s.stock_recid,
            s.stock_product_id,
            p.product_name,
            p.product_category,
            p.selling_price,
            p.units,
            s.stock_quantity,
            s.updated_qty,
            s.min_stock_qty,
            s.stock_status,
            s.created_at,
            s.updated_at
        FROM stock s
        JOIN product p ON s.stock_product_id = p.product_id
        WHERE 1=1 ";

    -- Brand filter
    IF in_brand IS NOT NULL AND in_brand <> '' THEN
        SET sSql = CONCAT(sSql, " AND p.brand = '", in_brand, "' ");
    END IF;

    -- Status filter
    IF p_status IS NOT NULL AND p_status <> '' THEN
        SET sSql = CONCAT(sSql, " AND s.stock_status = '", p_status, "' ");
    END IF;

    -- Order
    SET sSql = CONCAT(sSql, " ORDER BY s.stock_recid DESC");

    -- Debug (optional)
    -- SELECT sSql;

	SET @sSql = sSql;
    -- Prepare & Execute
    PREPARE stmt FROM @sSql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;
