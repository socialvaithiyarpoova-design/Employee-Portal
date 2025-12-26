
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 01/07/2025
 DESC: It is used save the event
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_SaveEventDetails`;

CREATE PROCEDURE `SP_SaveEventDetails`(
    IN user_id      INT(11),
    IN ev_type      VARCHAR(100),
    IN ev_date      VARCHAR(50),
    IN ev_remark    TEXT,
    IN ev_target    TEXT,
    IN ev_action    TEXT,
    IN emp_id       INT(11)
)
BEGIN
    
    INSERT INTO events ( action, event_date, type, remark, target, created_by, created_to) 
    VALUES (ev_action, ev_date, ev_type, ev_remark, ev_target, user_id, emp_id);

    SELECT * FROM events ORDER BY 1 DESC LIMIT 1;
    
END//
DELIMITER ;

