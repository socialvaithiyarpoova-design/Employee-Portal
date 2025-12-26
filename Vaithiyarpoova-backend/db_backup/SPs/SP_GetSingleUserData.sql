/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith S
 DATE: 10/09/2025
 DESC: It is used to get application lists
 ----------------------------------------------------------------------------------------------------------------- */

DELIMITER $$
DROP PROCEDURE IF EXISTS `SP_GetSingleUserData`;
CREATE PROCEDURE SP_GetSingleUserData(IN p_userId INT)
BEGIN
    SELECT 
        emp_id,
        name,
        email,
        mobile_number,
        date_of_joining,
        designation,
        image_url,
        start_work_time,
        end_work_time
    FROM 
        users
    WHERE 
        user_id = p_userId;
END$$

DELIMITER ;


/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith S
 DATE: 10/09/2025
 DESC: It is used to get single user data with branch details
 ----------------------------------------------------------------------------------------------------------------- */

DELIMITER $$
DROP PROCEDURE IF EXISTS `SP_GetSingleUserData`;

CREATE PROCEDURE SP_GetSingleUserData(IN p_userId INT)
BEGIN
    SELECT 
        U.emp_id,
        U.name,
        U.email,
        U.mobile_number,
        U.date_of_joining,
        U.designation,
        U.image_url,
        U.start_work_time,
        U.end_work_time,
        IFNULL(B.branch_name, 'Admin') AS branch_name,
        IFNULL(B.branch_in_charge, 'Admin') AS branch_in_charge,
        IFNULL(B.branch_id, 'VPA001') AS branch_id,
        IFNULL(B.branch_recid, NULL) AS branch_recid,
        IFNULL(B.location, NULL) AS branch_location
    FROM 
        users AS U
    LEFT JOIN 
        branches AS B ON U.branch_rceid = B.branch_recid AND B.isDeleted = 0
    WHERE 
        U.user_id = p_userId;
END$$

DELIMITER ;