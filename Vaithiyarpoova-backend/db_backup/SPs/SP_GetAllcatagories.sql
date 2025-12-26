
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 01/07/2025
 DESC: It is used get the catagories
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAllcatagories`;

CREATE PROCEDURE `SP_GetAllcatagories`()
BEGIN
    
    SELECT category_id, category_name, code FROM categories WHERE is_deleted = 0;
    
END//
DELIMITER ;

