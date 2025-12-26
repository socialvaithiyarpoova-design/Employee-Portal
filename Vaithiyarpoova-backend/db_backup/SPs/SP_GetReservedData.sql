/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 17/07/2025
 DESC: It is used to get slot
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetReservedData`;

CREATE PROCEDURE `SP_GetReservedData`(
    IN user_id          INT(11)
)

BEGIN
    
    SELECT 
        AL.user_id,
        AL.appointment_id,
        AL.user_typecode,
        AL.appointment_date,
        AL.appointment_time,
        AL.interval_minutes,
        AL.status,
        CASE 
            WHEN COUNT(CA.slot_time) > 0 THEN 'reserved'
            ELSE 'available'
        END AS slot_status,
        GROUP_CONCAT(DISTINCT CA.created_by) AS emp_recid,
        GROUP_CONCAT(DISTINCT US.emp_id) AS emp_id,
        GROUP_CONCAT(DISTINCT CA.owned_by) AS client_id,
        GROUP_CONCAT(DISTINCT LD.lead_id) AS client_id
        
    FROM appointments_list AS AL
    LEFT JOIN consulting_appointments AS CA  ON CA.vaithyar_id = AL.user_id AND CA.slot_date = AL.appointment_date  AND CA.slot_time = AL.appointment_time
    LEFT JOIN users AS US  ON US.user_id = CA.created_by
    LEFT JOIN leads AS LD  ON LD.lead_recid = CA.owned_by
    WHERE AL.isDeleted = 0 AND AL.user_id = user_id
    GROUP BY 
        AL.user_id, 
        AL.appointment_id,
        AL.user_typecode, 
        AL.appointment_date, 
        AL.appointment_time, 
        AL.interval_minutes, 
        AL.status;

END//
DELIMITER ;
