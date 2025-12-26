/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith
 DATE: 24/10/2025
 DESC: It is used to get Billing Details by billing_recid
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetBillingDetails`;
//
CREATE PROCEDURE `SP_GetBillingDetails`(
    IN billing_recid INT
)
BEGIN
    DECLARE sCondition VARCHAR(500);

    -- ✅ Add condition only if billing_recid is provided
    IF billing_recid IS NOT NULL AND billing_recid <> 0 THEN
        SET sCondition = CONCAT(" WHERE BL.billing_recid = ", billing_recid);
    ELSE
        SET sCondition = "";
    END IF;

    -- ✅ Main query construction
    SET @sQuery = CONCAT("
        SELECT 
            BL.billing_recid        AS billing_recid,
            BL.order_value          AS order_value,
            BL.order_id             AS order_id,
            BL.lead_name            AS lead_name,
            BL.gst_amount           AS gst_amount,
            BL.discount             AS discount,
            BL.approved_by          AS approved_by,
            BL.mobile              AS mobile,
            BL.gst_id               AS gst_id,
            BL.total_value          AS total_value,
            BL.quantity             AS quantity,
            BL.amount_to_pay        AS amount_to_pay,
            BL.receipt_path         AS receipt_path,
            BL.transaction_id       AS transaction_id,
            BL.created_at           AS date_time,
            BL.status               AS status,
            BL.created_by           AS created_by,
            BL.type                 AS type,
            US.emp_id               AS emp_id,
            US.name                 AS name,
            US.branch_rceid         AS branch_rceid,
            BR.branch_id            AS branch_id,
            BR.branch_name          AS branch_name,
            GD.gst_number           AS gst_number,
            GD.hsn_codes            AS hsn_codes,
            GD.gst_percentage       AS gst_percentage,
            BL.product_list         AS product_list,
            BL.date_time            AS date,
            BL.payment_mode         AS payment_mode,
            BL.created_at         AS created_at
        FROM
            billing AS BL
            LEFT JOIN users AS US ON US.user_id = BL.created_by
            LEFT JOIN branches AS BR ON BR.branch_recid = US.branch_rceid
            LEFT JOIN gst_data AS GD ON GD.id = BL.gst_id
        ", sCondition, "
        ORDER BY BL.created_at DESC;
    ");

    -- ✅ Execute dynamic SQL safely
    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END//
DELIMITER ;
