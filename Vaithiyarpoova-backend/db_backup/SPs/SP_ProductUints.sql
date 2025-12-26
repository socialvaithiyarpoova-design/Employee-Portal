/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajithkumar
 DATE: 09/05/2025
 DESC: It is used to get units
 ----------------------------------------------------------------------------------------------------------------- */

DELIMITER $$

CREATE PROCEDURE SP_ProductUints()
BEGIN
    SELECT 
        unit_id,
        unit_name AS label,
        unit_name AS value,
        code 
        
    FROM units WHERE is_deleted = 0;
END $$

DELIMITER ;

CALL SP_ProductUints();