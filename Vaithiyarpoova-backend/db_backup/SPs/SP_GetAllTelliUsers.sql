
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 08/08/2025
 DESC: It is used get the users
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAllTelliUsers`;

CREATE PROCEDURE `SP_GetAllTelliUsers`()
BEGIN
    
    SELECT 
        user_id,
        emp_id,
        name,
        email,
        mobile_number,
        password,
        otp,
        usertype_id,
        designation,
        date_of_joining,
        salary,
        incentive_percentage,
        address,
        image_url,
        created_by,
        created_at,
        isDeleted
    FROM
        users
    WHERE
        designation IN ('Telecalling sales' , 'Telecalling class') AND isDeleted = 0;
    
END//
DELIMITER ;

