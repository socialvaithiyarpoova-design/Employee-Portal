/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 10/11/2025
 DESC: It is used get the employee list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetEmployeeList`;
CREATE PROCEDURE `SP_GetEmployeeList`(
    IN userId INT(11),
    IN user_typecode VARCHAR(20),
    IN branch_id INT(11),
    IN emp_id    INT(11)
)
BEGIN

    DECLARE sCondition VARCHAR(10000) DEFAULT '';

    IF branch_id IS NOT NULL THEN
        SET sCondition = CONCAT(" AND created_by IN (SELECT branch_incharge_recid FROM branches WHERE branch_recid = ",branch_id,") ");
    END IF;

	IF emp_id IS NOT NULL THEN
		SET sCondition = CONCAT(sCondition, " AND user_id = ", emp_id);
	END IF;
    
    IF user_typecode = 'AD' THEN
            
        SET @sQuery = CONCAT(" SELECT 
        *
        FROM users WHERE designation NOT IN ('Admin') ",sCondition,"
        ORDER BY created_at DESC ");

        -- SELECT @sQuery;
        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

    ELSE
        
        SET @sQuery = CONCAT(" SELECT 
        *
        FROM users
        WHERE designation NOT IN ('Admin') AND created_by = ",userId," ",sCondition,"
        ORDER BY created_at DESC ");

        -- SELECT @sQuery;
        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
    END IF;


END//

DELIMITER ;

