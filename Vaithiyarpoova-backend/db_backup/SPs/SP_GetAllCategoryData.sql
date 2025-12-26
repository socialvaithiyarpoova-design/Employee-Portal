
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 01/07/2025
 DESC: It is used get the category data
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAllCategoryData`;

CREATE PROCEDURE `SP_GetAllCategoryData`()
BEGIN
    
    SELECT 
        code AS code,
        category_id AS id,
        category_name AS label,
        category_name AS value
    FROM
        categories;
    
END//
DELIMITER ;

