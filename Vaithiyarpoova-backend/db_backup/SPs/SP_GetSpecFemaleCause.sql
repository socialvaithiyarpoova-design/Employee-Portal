
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 23/07/2025
 DESC: It is used get the female cause
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetSpecFemaleCause`;

CREATE PROCEDURE `SP_GetSpecFemaleCause`(
    IN id INT(11)
)
BEGIN
    
    SELECT infertility_id, category_id, name, code, created_at FROM female_infertility_causes
    WHERE category_id = id;
    
END//
DELIMITER ;

