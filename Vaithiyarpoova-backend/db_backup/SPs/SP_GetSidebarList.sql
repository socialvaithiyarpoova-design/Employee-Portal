/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 05/05/2025
 DESC: It is used to get application lists
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetSidebarList`;

CREATE PROCEDURE `SP_GetSidebarList`(
   IN userTypeId      INT(11)
)
BEGIN

    SELECT 
    M.menu_id                            AS menu_id,
    MAX(M.name)                          AS name,
    MAX(M.path)                          AS path,
    MAX(M.icon)                          AS icon,
    MAX(M.exact)                         AS exact,
    MAX(M.created_at)                    AS created_at
FROM
    user_menu AS UM
    LEFT JOIN menu AS M ON M.menu_id = UM.menu_id
WHERE 
    UM.usertype_id = userTypeId
GROUP BY 
    M.menu_id;

   
END//

DELIMITER ;

