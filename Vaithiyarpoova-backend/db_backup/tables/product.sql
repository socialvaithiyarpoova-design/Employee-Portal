CREATE TABLE `product` (
  `product_recid` INT NOT NULL AUTO_INCREMENT,
  `product_id` VARCHAR(30) NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `product_category` VARCHAR(150) NOT NULL,
  `form_factor` VARCHAR(100) NOT NULL,
  `product_type` VARCHAR(100) NOT NULL,
  `package_quantity` INT NOT NULL,
  `units` VARCHAR(100) NOT NULL,
  `selling_price` DECIMAL(10, 2) NOT NULL, 
  `product_description` TEXT NOT NULL,
  `quantity` INT NOT NULL,
  `min_stock_quantity` INT NOT NULL,
  `product_img` VARCHAR(255) NOT NULL,
  `stock_status` ENUM('Available', 'Not Available','Low Stock') NOT NULL DEFAULT 'Available',
  `created_by` VARCHAR(50) NOT NULL,
  `updated_quantity` INT DEFAUL 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`product_recid`),
  UNIQUE (`product_id`)
);

DELIMITER //

CREATE TRIGGER insert_stock_status
BEFORE INSERT ON product
FOR EACH ROW
BEGIN
  IF NEW.quantity >= NEW.min_stock_quantity THEN
    SET NEW.stock_status = 'Available';
  ELSEIF NEW.quantity > 0 AND NEW.quantity < NEW.min_stock_quantity THEN
    SET NEW.stock_status = 'Low Stock';
  ELSEIF NEW.quantity <= 0 THEN
    SET NEW.stock_status = 'Not Available';
  END IF;
END//

DELIMITER ;


DELIMITER //

CREATE TRIGGER update_stock_status
BEFORE UPDATE ON product
FOR EACH ROW
BEGIN
  IF NEW.quantity >= NEW.min_stock_quantity THEN
    SET NEW.stock_status = 'Available';
  ELSEIF NEW.quantity > 0 AND NEW.quantity < NEW.min_stock_quantity THEN
    SET NEW.stock_status = 'Low Stock';
  ELSEIF NEW.quantity <= 0 THEN
    SET NEW.stock_status = 'Not Available';
  END IF;
END//

DELIMITER ;

DELIMITER //

CREATE TRIGGER update_stock
BEFORE UPDATE ON inventory
FOR EACH ROW
BEGIN
  IF NEW.quantity >= NEW.min_stock_quantity THEN
    SET NEW.stock_status = 'Available';
  ELSEIF NEW.quantity > 0 AND NEW.quantity < NEW.min_stock_quantity THEN
    SET NEW.stock_status = 'Low Stock';
  ELSEIF NEW.quantity <= 0 THEN
    SET NEW.stock_status = 'Not Available';
  END IF;
END//

DELIMITER ;
