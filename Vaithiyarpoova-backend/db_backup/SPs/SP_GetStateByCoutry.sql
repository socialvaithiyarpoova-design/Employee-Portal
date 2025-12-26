
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 16/05/2025
 DESC: It is used to get selective states using country id
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetStateByCoutry`;

CREATE PROCEDURE `SP_GetStateByCoutry`(
    IN sCountry_id INT(11)
)
BEGIN

    SELECT 
         state_id AS id
        ,name       AS label
        ,name       AS value
        ,iso2       AS code 
    FROM
        states
	WHERE
        country_id = sCountry_id
    ORDER BY name;

END//

DELIMITER ;

