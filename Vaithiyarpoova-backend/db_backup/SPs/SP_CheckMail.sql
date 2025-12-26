/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 29/04/2025
 DESC: It is used to check mail
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_CheckMail`;
CREATE PROCEDURE `SP_CheckMail`(
    IN sMail VARCHAR(100)
) 
BEGIN
    DECLARE isExistsCount INT DEFAULT 0;

    SELECT COUNT(user_id) INTO isExistsCount 
    FROM
        users
    WHERE
        email = sMail
    LIMIT 1;

    IF isExistsCount > 0 THEN
        SELECT 
              user_id	    AS userId
            , name		    AS userName
            , email		    AS mail
            , mobile_number	AS mobile_number
            , 200           AS status
        FROM
            users
        WHERE
            email = sMail
        LIMIT 1;
        
    ELSE
        SELECT 202 AS status;
    END IF;
    
END //
DELIMITER ;
