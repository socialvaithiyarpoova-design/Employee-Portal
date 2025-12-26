
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 16/05/2025
 DESC: It is used to get selective cities using state id
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetCityByState`;

CREATE PROCEDURE `SP_GetCityByState`(
    IN sState_id INT(11)
)
BEGIN

    SELECT 
          city_id   AS id
        , name      AS label
        , name      AS value
        , state_code AS code
    FROM
        cities
    WHERE
        state_id = sState_id
    ORDER BY name;

END//

DELIMITER ;

