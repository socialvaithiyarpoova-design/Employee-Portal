/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 08/05/2025
 DESC: It is used get the designation list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetDesignationList`;

CREATE PROCEDURE `SP_GetDesignationList`()
BEGIN

    SELECT 
          usertype_id   AS designation_id
        , usertype_id   AS id
        , CONCAT(user_typecode ," - ",user_type)     AS label
        , user_type     AS value
        , user_typecode AS code
    FROM
        usertype
    WHERE 
        user_typecode != "AD" AND is_deleted = 0 ORDER BY 1 DESC;

END//

DELIMITER ;

