/* -------------------------------------------------------------------------------------
   NAME: ajith
   DESC: Fetch creative service records by employee ID
-------------------------------------------------------------------------------------- */

DROP PROCEDURE IF EXISTS `SP_GetCreativesDetails`;
DELIMITER //

CREATE PROCEDURE `SP_GetCreativesDetails`(
    IN p_emp_id INT
)
BEGIN
    SELECT 
        creative_id,
        emp_id,
        title,
        description,
        date_to_post,
        type,
        created_at,
        status,
        total_working_time
    FROM creativeservice
    WHERE emp_id = p_emp_id;
END //

DELIMITER ;
