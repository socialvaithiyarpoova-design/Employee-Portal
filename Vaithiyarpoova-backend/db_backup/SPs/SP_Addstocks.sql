DELIMITER $$
DROP PROCEDURE IF EXISTS `SP_Addstocks`;
CREATE PROCEDURE SP_Addstocks(
  IN p_stock_product_id VARCHAR(30),
  IN p_stock_quantity INT,
  IN p_min_stock_qty INT,
  IN p_stock_status ENUM('Available', 'Not Available', 'Low Stock'),
  IN P_userId INT
)
BEGIN
  INSERT INTO stock (
    stock_product_id,
    stock_quantity,
    min_stock_qty,
    product_name,
    stock_status,
    brand,
    product_category,
    form_factor,
    product_type,
    units,
    selling_price,
    product_img,
    package_quantity,
    created_by
  )
  SELECT 
    p_stock_product_id,
    p_stock_quantity,
    p_min_stock_qty,
    p.product_name,
    p_stock_status,
    p.brand,
    p.product_category,
    p.form_factor,
    p.product_type,
    p.units,
    p.selling_price,
    p.product_img,
    p.package_quantity,
    P_userId
  FROM product p
  WHERE p.product_id = p_stock_product_id;
  
  -- Optional: Check if product exists and raise error if not
  IF ROW_COUNT() = 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Product ID not found in products';
  END IF;
END $$

DELIMITER ;
