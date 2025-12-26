
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 01/07/2025
 DESC: It is used get the emp data
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetEmployeeData`;

CREATE PROCEDURE `SP_GetEmployeeData`(
    IN rec_id INT(11)
)
BEGIN
    
    IF rec_id IS NOT NULL THEN
				SELECT 
					emp_id AS code, user_id AS id, name AS value, name AS label
				FROM
					users
				WHERE
					created_by IN (SELECT 
							branch_incharge_recid
						FROM
							branches
						WHERE
							branch_recid = rec_id);
		
	ELSE
		SELECT 
				emp_id AS code, user_id AS id, name AS value, name AS label
			FROM
				users ;
	END IF;

    
END//
DELIMITER ;

