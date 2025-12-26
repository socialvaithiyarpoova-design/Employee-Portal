/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajithkumar
 DATE: 28/09/2025
 DESC: Scheduled Event (Executes Every Day at 12:00 AM)
 ----------------------------------------------------------------------------------------------------------------- */

DELIMITER //
SET GLOBAL event_scheduler = ON;
DROP EVENT IF EXISTS disposition_date_at_midnight;

CREATE EVENT IF NOT EXISTS disposition_date_at_midnight
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE + INTERVAL 1 DAY)
DO
BEGIN
  UPDATE vaithiyar_poova.leads
  SET disposition_date = CURDATE() + INTERVAL 1 DAY
  WHERE disposition IN ('Follow up', 'Call back');
END//

DELIMITER ;


DELIMITER //
SET GLOBAL event_scheduler = ON;
DROP EVENT IF EXISTS disposition_date_at_midnight;

CREATE EVENT IF NOT EXISTS disposition_date_at_midnight
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE + INTERVAL 1 DAY)
DO
BEGIN
  UPDATE vaithiyar_poova.fieldleads
  SET disposition_date = CURDATE() + INTERVAL 1 DAY
  WHERE disposition IN ('Follow up', 'Call back');
END//

DELIMITER ;