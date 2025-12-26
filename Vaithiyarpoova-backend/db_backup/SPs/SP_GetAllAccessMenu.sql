/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 25/07/2025
 DESC: It is used to get all access menu 
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllAccessMenu`//
CREATE PROCEDURE `SP_GetAllAccessMenu`(
    IN p_user_id INT
)
BEGIN
    DECLARE v_designation VARCHAR(50);

    -- Get designation of the user
    SELECT designation 
    INTO v_designation
    FROM users 
    WHERE user_id = p_user_id;

    -- If admin, show all menu

    IF v_designation = 'Admin' || v_designation = 'Branch head' THEN 

        SELECT 
            AM.*,
            M.path AS path
        FROM access_user_menu AS AM
        LEFT JOIN menu AS M ON M.menu_id = AM.menu_id;
    ELSE 
        -- Otherwise, only show that user's menu
        SELECT 
            AM.*,
            M.path AS path
        FROM access_user_menu AS AM
        LEFT JOIN menu AS M ON M.menu_id = AM.menu_id
        WHERE AM.user_id = p_user_id;
    END IF;
END//
DELIMITER ;
