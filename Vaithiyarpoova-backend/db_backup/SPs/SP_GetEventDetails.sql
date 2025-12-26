/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 14/07/2025
 DESC: It is used to get all events
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetEventDetails`;

CREATE PROCEDURE `SP_GetEventDetails`()
BEGIN
   
   SELECT event_id, action, event_date, type, remark, target, created_by, created_at from events ORDER BY 1 DESC;

END//
DELIMITER ;
