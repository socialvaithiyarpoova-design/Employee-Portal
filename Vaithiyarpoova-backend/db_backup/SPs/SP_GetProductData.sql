/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 14/07/2025
 DESC: It is used to get all products by IDs
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetProductData`;

CREATE PROCEDURE `SP_GetProductData`(
    IN Product_ids VARCHAR(1000)
)
BEGIN
    SELECT * 
    FROM product
    WHERE FIND_IN_SET(product_recid, Product_ids) AND is_deleted = 0;
END //

DELIMITER ;
