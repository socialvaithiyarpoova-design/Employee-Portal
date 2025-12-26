/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 23/06/2025
 DESC: It is used to get all pages
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllPages`;

CREATE PROCEDURE `SP_GetAllPages`()
BEGIN
    SELECT 
        *
    FROM menu 
    WHERE exact = 0;
END//
DELIMITER ;
