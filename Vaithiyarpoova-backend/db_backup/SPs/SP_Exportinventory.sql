DELIMITER //

CREATE PROCEDURE SP_Exportinventory(
    IN input_date_range JSON
)
BEGIN
    DECLARE start_date DATE;
    DECLARE end_date DATE;

    SET start_date = JSON_UNQUOTE(JSON_EXTRACT(input_date_range, '$.startDate'));
    SET end_date = JSON_UNQUOTE(JSON_EXTRACT(input_date_range, '$.endDate'));

    SELECT 
        product_id,
        product_name,
        brand,
        product_category,
        selling_price,
        quantity,
        stock_status,
        created_at
    FROM product
    WHERE DATE(created_at) BETWEEN start_date AND end_date
    AND is_deleted = 0;
END //

DELIMITER ;
