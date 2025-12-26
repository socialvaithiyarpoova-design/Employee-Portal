/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith
 DATE: 24/10/2025
 DESC: It is used to get wallet details by id
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetConsultingDetails`;
//
CREATE PROCEDURE `SP_GetConsultingDetails`(
    IN id INT
)
BEGIN
    DECLARE sCondition VARCHAR(500);

    -- ✅ Add condition only if id is provided
    IF id IS NOT NULL AND id <> 0 THEN
        SET sCondition = CONCAT(" WHERE CP.id = ", id);
    ELSE
        SET sCondition = "";
    END IF;

    -- ✅ Main query construction
    SET @sQuery = CONCAT("
        SELECT 
            CP.id                    AS id,
            CT.lead_id              AS lead_id,
            CT.lead_name             AS lead_name,
            CT.mobile_number          AS mobile,
            CP.price                  AS amount,
            CP.receipt_path          AS receipt_path,
            CP.transaction_id        AS transaction_id,
            CP.created_at            AS created_at,
            CP.status                AS status,
            CP.created_by            AS created_by,
            CP.owned_by              AS owned_by,
            CP.type                  AS type,
            US.emp_id                AS emp_id,
            US.name                  AS emp_name,
            US.branch_rceid          AS branch_rceid,
            BR.branch_id             AS branch_id,
            BR.branch_name           AS branch_name,
            CP.date_time             AS date_time
        FROM
            consulting_appointments AS CP
            LEFT JOIN leads AS CT ON CT.lead_recid = CP.owned_by
            LEFT JOIN users AS US ON US.user_id = CP.created_by
            LEFT JOIN branches AS BR ON BR.branch_recid = US.branch_rceid
        ", sCondition, "
        ORDER BY CP.created_at DESC;
    ");

    -- ✅ Execute query
    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END//
DELIMITER ;
