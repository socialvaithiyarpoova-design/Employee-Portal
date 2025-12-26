/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 24/06/2025
 DESC: It is used to get all users
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllUsers`;

CREATE PROCEDURE `SP_GetAllUsers`(
    IN p_id INT(11),
    IN p_code VARCHAR(20)
)
BEGIN

    IF p_code = "AD" THEN 
        SELECT 
            user_id, emp_id, name, email, mobile_number , usertype_id, designation, date_of_joining, salary, incentive_percentage, address, image_url, created_by, created_at
        FROM
            users 
        WHERE isDeleted = 0 ;
    ELSE 

        SELECT 
            user_id, emp_id, name, email, mobile_number , usertype_id, designation, date_of_joining, salary, incentive_percentage, address, image_url, created_by, created_at
        FROM
            users 
        WHERE isDeleted = 0  AND created_by = p_id;
    END IF;
   
END//

DELIMITER ;

