/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 25/06/2025
 DESC: It is used to get all lead details
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllLeadDetailsbyid`;

CREATE PROCEDURE `SP_GetAllLeadDetailsbyid`(
    IN userId INT(11)
)
BEGIN

     SET @sQuery = CONCAT("
    SELECT 
        LD.lead_recid AS lead_recid,
        LD.lead_id AS lead_id,
        LD.lead_name AS lead_name,
        LD.age AS age,
        LD.gender AS gender,
        LD.mobile_number AS mobile_number,
        LD.email AS email,
        US.emp_id AS created_by,
        US.name AS handler_name,
        LD.disposition AS disposition,
        LD.disposition_date AS disposition_date,
        LD.created_at AS created_at,
        LD.location AS location,
        LD.country AS country,
        LD.state AS state,
        LD.city AS city
    FROM
        leads AS LD 
    LEFT JOIN users AS US ON US.user_id = LD.created_by  ORDER BY lead_recid DESC ");

    -- SELACT @sQuery;
        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

    
END//
DELIMITER ;
