
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 23/07/2025
 DESC: It is used get the Vaithyar data list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetVaithiyarList`;

CREATE PROCEDURE `SP_GetVaithiyarList`()
BEGIN
    
   SELECT user_id, emp_id, name, email, mobile_number, designation, image_url, created_by
   FROM users WHERE designation = "Vaithiyar" AND isDeleted = 0;

    
END//
DELIMITER ;

