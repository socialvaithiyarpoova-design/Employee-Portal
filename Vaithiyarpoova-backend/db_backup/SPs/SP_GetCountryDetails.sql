
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 16/05/2025
 DESC: It is used to get all countries
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetCountryDetails`;

CREATE PROCEDURE `SP_GetCountryDetails`()
BEGIN
    
    SELECT 
         country_id AS id
        ,name       AS label
        ,name       AS value
        ,iso2       AS code 
    FROM
        countries
        ORDER BY name;

END//

DELIMITER ;

