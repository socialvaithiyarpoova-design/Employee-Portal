/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 26/04/2025
 DESC: It is used to check either user exist or not using SHA2 encryption
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_LoggedInUser`;

CREATE PROCEDURE `SP_LoggedInUser`(
    IN sUserName VARCHAR(100),
    IN sPassword VARCHAR(100)
)
BEGIN
    IF IFNULL(sUserName, '') <> '' AND IFNULL(sPassword, '') <> '' THEN
       SELECT 
             U.user_id         AS user_id
            ,U.emp_id          AS emp_id
            ,U.name            AS name
            ,U.email           AS email
            ,U.mobile_number   AS mobile_number
            ,U.password        AS password
            ,U.usertype_id     AS usertype_id
            ,U.created_at      AS created_at
            ,UT.user_typecode  AS user_typecode
            ,UT.user_type      AS user_type
            ,U.start_work_time AS start_work_time
            ,U.end_work_time   AS end_work_time
            
        FROM
            users AS U
            LEFT JOIN usertype AS UT ON UT.usertype_id = U.usertype_id
        WHERE
            U.mobile_number = sUserName AND U.isDeleted = 0
            AND U.password = SHA2(sPassword, 256);  
    END IF;
END//

DELIMITER ;
