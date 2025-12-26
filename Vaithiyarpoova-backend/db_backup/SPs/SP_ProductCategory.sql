/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajithkumar
 DATE: 13/05/2025
 DESC: It is used to check mail
 ----------------------------------------------------------------------------------------------------------------- */

DELIMITER $$

CREATE PROCEDURE SP_ProductCategory()
BEGIN
    SELECT 
        category_id,
        category_name AS label,
        category_name AS value,
        code
    FROM categories WHERE is_deleted = 0;
END $$

DELIMITER ;

call SP_ProductCategory()