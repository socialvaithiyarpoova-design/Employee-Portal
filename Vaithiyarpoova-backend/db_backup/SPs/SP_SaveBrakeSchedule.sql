DELIMITER //

DROP PROCEDURE IF EXISTS `SP_SaveBrakeSchedule`;

CREATE PROCEDURE `SP_SaveBrakeSchedule`(
    IN p_created_by INT(11),
    IN p_am_break_start TIME,
    IN p_am_break_end TIME,
    IN p_lunch_start TIME,
    IN p_lunch_end TIME,
    IN p_pm_break_start TIME,
    IN p_pm_break_end TIME
)
BEGIN
    DECLARE v_schedule_count INT DEFAULT 0;

    SELECT COUNT(break_schedule_id)
    INTO v_schedule_count
    FROM break_schedule
    WHERE created_by = p_created_by;

    IF v_schedule_count = 0 THEN
        INSERT INTO break_schedule (
            am_break_start, am_break_end, lunch_start, lunch_end,
            pm_break_start, pm_break_end, created_by
        )
        VALUES (
            p_am_break_start, p_am_break_end, p_lunch_start, p_lunch_end,
            p_pm_break_start, p_pm_break_end, p_created_by
        );
    ELSE
        UPDATE break_schedule 
        SET am_break_start = p_am_break_start,
            am_break_end = p_am_break_end,
            lunch_start = p_lunch_start,
            lunch_end = p_lunch_end,
            pm_break_start = p_pm_break_start,
            pm_break_end = p_pm_break_end
        WHERE created_by = p_created_by;
    END IF;

    SELECT * FROM break_schedule WHERE created_by = p_created_by ORDER BY break_schedule_id DESC LIMIT 1;

END //

DELIMITER ;
