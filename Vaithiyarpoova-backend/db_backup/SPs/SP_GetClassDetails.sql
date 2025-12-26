/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith
 DATE: 24/10/2025
 DESC: It is used to get class details by class_register_id
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetClassDetails`;
//
CREATE PROCEDURE `SP_GetClassDetails`(
    IN class_register_id INT
)
BEGIN
    DECLARE sCondition VARCHAR(500);

    -- ✅ Add condition only if class_register_id is provided
    IF class_register_id IS NOT NULL AND class_register_id <> 0 THEN
        SET sCondition = CONCAT(" WHERE CR.class_register_id = ", class_register_id);
    ELSE
        SET sCondition = "";
    END IF;

    -- ✅ Main query
    SET @sQuery = CONCAT("
        SELECT 
            CR.class_register_id      AS class_register_id,
            CR.owned_by               AS leads_id,
            CT.lead_name              AS lead_name,
            CT.lead_id                AS lead_id,
            CT.mobile_number              AS mobile_number,
            CR.reg_no                 AS reg_no,
            CR.discount               AS discount,
            CR.approved_by            AS approved_by,
            CR.price_value            AS price_value,
            CR.amount_to_pay          AS amount_to_pay,
            CR.gst_id                 AS gst_id,
            CR.gst_amount             AS gst_amount,
            GD.gst_number             AS gst_number,
            GD.hsn_codes              AS hsn_codes,
            GD.gst_percentage         AS gst_percentage,
            CR.receipt_path           AS receipt_path,
            CR.transaction_id         AS transaction_id,
            CR.created_at             AS created_at,
            CR.status                 AS status,
            CR.created_by             AS created_by,
            CR.class_type             AS class_type,
            CR.preferred_date         AS preferred_date,
            CR.preferred_time         AS preferred_time,
            CR.payment_date           AS payment_date,
            CR.payment_mode           AS payment_mode,
            US.emp_id                 AS emp_id,
            US.name                   AS emp_name,
            US.branch_rceid           AS branch_rceid,
            BR.branch_id              AS branch_id,
            BR.branch_name            AS branch_name
        FROM
            class_register AS CR
            LEFT JOIN leads AS CT ON CT.lead_recid = CR.owned_by
            LEFT JOIN users AS US ON US.user_id = CR.created_by
            LEFT JOIN branches AS BR ON BR.branch_recid = US.branch_rceid
            LEFT JOIN gst_data AS GD ON GD.id = CR.gst_id
        ", sCondition, "
        ORDER BY CR.created_at DESC
    ");

    -- ✅ Execute dynamic SQL
    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END//
DELIMITER ;
