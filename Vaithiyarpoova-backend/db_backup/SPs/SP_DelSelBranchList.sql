
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 21/05/2025
 DESC: It is used delete the specific branch 
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_DelSelBranchList`;

CREATE PROCEDURE `SP_DelSelBranchList`(
    IN branch_id VARCHAR(100)
)
BEGIN
    UPDATE branches
    SET 
        isDeleted = 1
    WHERE
        branch_recid = branch_id
    LIMIT 1;
END//

DELIMITER ;

