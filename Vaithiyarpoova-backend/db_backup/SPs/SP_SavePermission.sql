/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 13/05/2025
 DESC: It is used save the permission data
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_SavePermission`;

CREATE PROCEDURE `SP_SavePermission`(
    IN created_by INT(11),
    IN permission VARCHAR(100)
)
BEGIN

    SELECT COUNT(break_schedule_id) INTO @schedule_id FROM break_schedule WHERE created_by = created_by;
     
    IF  @schedule_id = 0 THEN 
        INSERT INTO break_schedule (
        permission, created_by
        )
        VALUES (
            p_am_break_start, created_by
        );
    ELSE
        SET SQL_SAFE_UPDATES = 0;
            UPDATE break_schedule 
            SET permission = permission
            WHERE created_by = created_by;
        SET SQL_SAFE_UPDATES = 1;
    END IF;

    SELECT * FROM break_schedule ORDER BY 1 DESC LIMIT 1;

END//

DELIMITER ;

