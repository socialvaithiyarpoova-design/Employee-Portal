-- /* ----------------------------------------------------------------------------------------------------------------- 
--  NAME: Hariharan S
--  DATE: 23/06/2025
--  DESC: It is used to get all user designation
--  ----------------------------------------------------------------------------------------------------------------- */
-- DELIMITER //
-- DROP PROCEDURE IF EXISTS `SP_GetAllUserType`;

-- CREATE PROCEDURE `SP_GetAllUserType`(
--     IN p_id INT(11),
--     IN p_code VARCHAR(20)
-- )
-- BEGIN

--     IF p_code = "AD" THEN 
        
--         SELECT 
--             usertype_id, user_type, user_typecode
--         FROM
--             usertype WHERE is_deleted = 0 ;
--     ELSE 

--         SELECT 
--             UT.usertype_id AS usertype_id, UT.user_type AS user_type, UT.user_typecode AS user_typecode
--         FROM
--             usertype AS UT 
--             LEFT JOIN users AS US ON US.usertype_id = UT.usertype_id  WHERE UT.is_deleted = 0  AND US.created_by = p_id;
--     END IF;
   
-- END//

-- DELIMITER ;

/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith k
 DATE: 23/06/2025
 DESC: It is used to get all user designation
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllUserType`;

CREATE PROCEDURE `SP_GetAllUserType`(
    IN p_id INT(11),
    IN p_code VARCHAR(20)
)
BEGIN

    DECLARE self_userType_id INT;     
	SELECT usertype_id INTO self_userType_id 
    FROM users 
    WHERE user_id = p_id;
     AND UT.usertype_id <> self_userType_id;
    END IF;

    IF p_code = "AD" THEN 
        
        SELECT 
            usertype_id, user_type, user_typecode
        FROM
            usertype WHERE is_deleted = 0 ;
    ELSE 

        SELECT 
            UT.usertype_id AS usertype_id, UT.user_type AS user_type, UT.user_typecode AS user_typecode
        FROM
            usertype AS UT 
            LEFT JOIN users AS US ON US.usertype_id = UT.usertype_id  WHERE UT.is_deleted = 0  AND US.created_by = p_id AND UT.usertype_id <> self_userType_id;
    END IF;
   
END//

DELIMITER ; 