
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 13/08/2025
 DESC: It is used get the lead usertypes
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_getLeadDesignationData`;

CREATE PROCEDURE `SP_getLeadDesignationData`()
BEGIN
    
   SELECT 
        user_type 		AS label,
        user_type 		AS value,
        usertype_id 	AS id,
        user_typecode 	AS code
    FROM
        usertype
    WHERE
        user_typecode IN ('TSL' , 'TCL', 'FS', 'FOI' , 'VA');
    
END//
DELIMITER ;

