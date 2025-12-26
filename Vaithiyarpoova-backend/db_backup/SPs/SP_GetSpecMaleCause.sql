
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 23/07/2025
 DESC: It is used get the male cause
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetSpecMaleCause`;

CREATE PROCEDURE `SP_GetSpecMaleCause`(
    IN id INT(11)
)
BEGIN
    
    SELECT infertility_id, category_id, name, code, created_at FROM male_infertility_causes
    WHERE category_id = id;
    
END//
DELIMITER ;

