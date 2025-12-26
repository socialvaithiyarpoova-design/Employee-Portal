CREATE TABLE `stock` (
  `stock_recid` INT NOT NULL AUTO_INCREMENT,
  `stock_product_id` VARCHAR(30) UNIQUE NOT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `updated_qty` INT DEFAULT 0,
  `min_stock_qty` INT NOT NULL DEFAULT 0,
  `stock_status` ENUM('Available', 'Not Available', 'Low Stock') NOT NULL DEFAULT 'Available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stock_recid`),
  CONSTRAINT fk_stock_product FOREIGN KEY (`stock_product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

DELIMITER //

CREATE TRIGGER trg_stock_status_update
BEFORE INSERT ON stock
FOR EACH ROW
BEGIN
  IF NEW.stock_quantity = 0 THEN
    SET NEW.stock_status = 'Not Available';
  ELSEIF NEW.stock_quantity < NEW.min_stock_qty THEN
    SET NEW.stock_status = 'Low Stock';
  ELSE
    SET NEW.stock_status = 'Available';
  END IF;
END;
//

CREATE TRIGGER trg_stock_status_update_on_update
BEFORE UPDATE ON stock
FOR EACH ROW
BEGIN
  IF NEW.stock_quantity = 0 THEN
    SET NEW.stock_status = 'Not Available';
  ELSEIF NEW.stock_quantity < NEW.min_stock_qty THEN
    SET NEW.stock_status = 'Low Stock';
  ELSE
    SET NEW.stock_status = 'Available';
  END IF;
END;
//

DELIMITER ;
