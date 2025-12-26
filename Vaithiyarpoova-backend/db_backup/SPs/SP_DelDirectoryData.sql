/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 18/07/2025
 DESC: It is used to delete directory data
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_DelDirectoryData`;

CREATE PROCEDURE `SP_DelDirectoryData`(
    IN dir_id       INT(11)
)
BEGIN
  
    SET SQL_SAFE_UPDATES = 0;
        UPDATE directory 
        SET isDeleted = 1
        WHERE id = dir_id;
	SET SQL_SAFE_UPDATES = 1;

   
END//

DELIMITER ;