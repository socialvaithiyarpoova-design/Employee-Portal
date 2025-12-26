/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith K
 DATE: 18/11/2025
 DESC: It is used get the branch data
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAllBranchData`;

CREATE PROCEDURE `SP_GetAllBranchData`(
    IN p_id INT(11),
    IN p_code VARCHAR(100)
)
BEGIN

    IF p_code = 'BH' THEN

        SELECT 
            branch_id AS code,
            branch_recid AS id,
            branch_name AS label,
            branch_name AS value
        FROM branches
        WHERE branch_incharge_recid = p_id;

    ELSEIF p_code = 'Dis' THEN

              SELECT 
            b.branch_id AS code,
            b.branch_recid AS id,
            b.branch_name AS label,
            b.branch_name AS value
        FROM branches b
        INNER JOIN branches d ON b.assign_dispatch = d.branch_recid   
        WHERE d.branch_type = 'Dispatch' 
          AND d.branch_incharge_recid = p_id
          AND b.assign_dispatch IS NOT NULL;

    ELSE

        SELECT 
            branch_id AS code,
            branch_recid AS id,
            branch_name AS label,
            branch_name AS value
        FROM branches;

    END IF;

END//
DELIMITER ;
