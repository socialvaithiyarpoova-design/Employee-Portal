/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajithkumar
 DATE: 09/05/2025
 DESC: It is used to check mail
 ----------------------------------------------------------------------------------------------------------------- */

DELIMITER $$

DROP PROCEDURE IF EXISTS `SP_GetAllProductTypes`;
CREATE PROCEDURE SP_GetAllProductTypes()
BEGIN
    SELECT 
        product_type_id AS product_type_id ,
        type_name AS label,
        type_name AS value,
        code 
        
    FROM product_types WHERE is_deleted = 0;
END $$

DELIMITER ;

CALL GetAllProductTypes();