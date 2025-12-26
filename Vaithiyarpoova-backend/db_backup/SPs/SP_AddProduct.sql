DELIMITER $$
DROP PROCEDURE IF EXISTS `SP_AddProduct`;
CREATE PROCEDURE SP_AddProduct(
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
    IN p_product_img VARCHAR(255),
    IN p_stock_status ENUM('Available', 'Not Available','Low Stock'),
    IN p_created_by VARCHAR(50) 
)
BEGIN
    -- Set default value for p_stock_status if it's not provided
    IF p_stock_status IS NULL THEN
        SET p_stock_status = 'Available';
    END IF;

    -- Inserting data into the product table
    INSERT INTO product (
        product_id, product_name, brand, product_category, form_factor, 
        product_type, package_quantity, units, selling_price, product_description, 
        quantity, min_stock_quantity, product_img, stock_status, created_by
    )
    VALUES (
        p_product_id, 
        p_product_name, 
        p_brand, 
        p_product_category, 
        p_form_factor, 
        p_product_type, 
        p_package_quantity, 
        p_units, 
        p_selling_price,
        p_product_description, 
        p_quantity, 
        p_min_stock_quantity, 
        p_product_img,
        p_stock_status, 
        p_created_by
    );
END$$

DELIMITER ;
