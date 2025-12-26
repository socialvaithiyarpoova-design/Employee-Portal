/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith
 DATE: 24/10/2025
 DESC: It is used to get wallet details by wallet_id
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetWalletDetails`;
//
CREATE PROCEDURE `SP_GetWalletDetails`(
    IN wallet_id INT
)
BEGIN
    DECLARE sCondition VARCHAR(500);

    -- ✅ Add condition only if wallet_id is provided
    IF wallet_id IS NOT NULL AND wallet_id <> 0 THEN
        SET sCondition = CONCAT(" WHERE WT.wallet_id = ", wallet_id);
    ELSE
        SET sCondition = "";
    END IF;

    -- ✅ Main query construction
    SET @sQuery = CONCAT("
        SELECT 
            WT.wallet_id             AS wallet_id,
            CT.lead_id               AS lead_id,
            CT.lead_name             AS lead_name,
            CT.mobile_number         AS mobile,
            WT.amount                AS amount,
            WT.receipt_path          AS receipt_path,
            WT.transaction_id        AS transaction_id,
            WT.transaction_datetime  AS transaction_datetime,
            WT.created_at            AS created_at,
            WT.status                AS status,
            WT.created_by            AS created_by,
            WT.owned_by              AS owned_by,
            WT.type                  AS type,
            US.emp_id                AS emp_id,
            US.name                  AS emp_name,
            US.branch_rceid          AS branch_rceid,
            BR.branch_id             AS branch_id,
            BR.branch_name           AS branch_name,
            WT.date_time             AS date_time
        FROM
            wallet_data AS WT
            LEFT JOIN leads AS CT ON CT.lead_recid = WT.owned_by
            LEFT JOIN users AS US ON US.user_id = WT.created_by
            LEFT JOIN branches AS BR ON BR.branch_recid = US.branch_rceid
        ", sCondition, "
        ORDER BY WT.created_at DESC;
    ");

    -- ✅ Execute query
    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END//
DELIMITER ;
