/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 25/07/2025
 DESC: It is used to get gst data
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllGSTData`;

CREATE PROCEDURE `SP_GetAllGSTData`()
BEGIN
  
    SELECT id, gst_number, hsn_codes, gst_percentage, created_at, isActiveGST FROM gst_data WHERE isDeleted = 0;
   
END//

DELIMITER ;