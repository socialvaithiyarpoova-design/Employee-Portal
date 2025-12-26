-- /* ----------------------------------------------------------------------------------------------------------------- 
--  NAME: Ajith k
--  DATE: 14/07/2025
--  DESC: It is used to get all cs users
--  ----------------------------------------------------------------------------------------------------------------- */
-- DELIMITER //
-- DROP PROCEDURE IF EXISTS `SP_GetEmployeeListForCS`;

-- CREATE PROCEDURE `SP_GetEmployeeListForCS`()
-- BEGIN
    
--     SELECT user_id AS id , emp_id AS code , CONCAT(emp_id, " - ",name) AS label, name AS value FROM  users WHERE designation IN ("Creative service");

-- END//
-- DELIMITER ;


/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith k
 DATE: 14/07/2025
 DESC: Get Creative Service users based on role (AD/BH)
 ----------------------------------------------------------------------------------------------------------------- */

DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetEmployeeListForCS`//

CREATE PROCEDURE `SP_GetEmployeeListForCS`(
    IN p_user_id INT,
    IN p_user_typecode VARCHAR(10)
)
BEGIN
    DECLARE v_created_by INT DEFAULT NULL;

    /* Get creator only for BH */
    IF p_user_typecode = 'BH' THEN
        SELECT created_by INTO v_created_by
        FROM users
        WHERE user_id = p_user_id
        LIMIT 1;
    END IF;

    /* Single unified query — always returns ONE result set */
    SELECT 
        user_id AS id,
        emp_id AS code,
        CONCAT(emp_id, ' - ', name) AS label,
        name AS value
    FROM users
    WHERE designation = 'Creative service'
      AND (
            p_user_typecode = 'AD'
            OR (p_user_typecode = 'BH' AND created_by = v_created_by)
          );

END//
DELIMITER ;
