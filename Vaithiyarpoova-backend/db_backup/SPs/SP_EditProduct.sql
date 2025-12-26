DELIMITER $$

DROP PROCEDURE IF EXISTS `SP_EditProduct`;
CREATE PROCEDURE `SP_EditProduct` (
    IN p_product_recid INT,
    IN p_product_id VARCHAR(30),
    IN p_product_name VARCHAR(150),
    IN p_brand VARCHAR(100),
    IN p_product_category VARCHAR(150),
    IN p_form_factor VARCHAR(100),
    IN p_product_type VARCHAR(100),
    IN p_package_quantity INT,
    IN p_units VARCHAR(100),
    IN p_selling_price DECIMAL(10, 2),
    IN p_product_description TEXT,
    IN p_quantity INT,
    IN p_min_stock_quantity INT,
    IN p_product_img VARCHAR(255)
)
BEGIN
    UPDATE product
    SET
        product_id = p_product_id,
        product_name = p_product_name,
        brand = p_brand,
        product_category = p_product_category,
        form_factor = p_form_factor,
        product_type = p_product_type,
        package_quantity = p_package_quantity,
        units = p_units,
        selling_price = p_selling_price,
        product_description = p_product_description,
        quantity = p_quantity,
        min_stock_quantity = p_min_stock_quantity,
        product_img = p_product_img

    WHERE product_recid = p_product_recid;
END $$

DELIMITER ;
