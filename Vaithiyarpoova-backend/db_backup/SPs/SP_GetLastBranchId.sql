/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 17/05/2025
 DESC: It is used get the branch last id
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetLastBranchId`;

CREATE PROCEDURE `SP_GetLastBranchId`(
    IN sState   VARCHAR(100),
    IN sLocation    VARCHAR(100)
)
BEGIN

    SELECT 
        branch_recid
    FROM
        branches
    WHERE
        state = sState AND location = sLocation
    ORDER BY created_at DESC
    LIMIT 1;

END//

DELIMITER ;

