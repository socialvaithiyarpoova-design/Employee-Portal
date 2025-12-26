
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 01/07/2025
 DESC: It is used get the formfactor data
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAllFormfactData`;

CREATE PROCEDURE `SP_GetAllFormfactData`()
BEGIN
    
     SELECT 
        code AS code,
        form_factor_id AS id,
        form_name AS label,
        form_name AS value
    FROM
        form_factors;
    
END//
DELIMITER ;

