/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajithkumar
 DATE: 13/05/2025
 DESC: It is used to check mail
 ----------------------------------------------------------------------------------------------------------------- */

DELIMITER $$

CREATE PROCEDURE SP_ProductBrand()
BEGIN
    SELECT 
        brand_id,
        brand_name AS label,
        brand_name AS value,
        code
    FROM brands WHERE is_deleted = 0;
END $$

DELIMITER ;

call SP_ProductBrand()