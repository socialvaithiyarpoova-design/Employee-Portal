/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 12/08/2025
 DESC: It is used get the branch dispatch list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetBranchDisDetails`;

CREATE PROCEDURE `SP_GetBranchDisDetails`()
BEGIN

    SELECT 
        branch_recid AS id,
        branch_id AS code,
        branch_name AS label,
        branch_name AS value
    FROM
        branches 
    WHERE isDeleted = 0 AND branch_type = "Dispatch"
    ORDER BY 1 DESC;

END//

DELIMITER ;

