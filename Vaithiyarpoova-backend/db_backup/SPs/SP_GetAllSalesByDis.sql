/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 17/07/2025
 DESC: Get all orders for dispatcher (sales + fieldshopsales)
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllSalesByDis` //
CREATE PROCEDURE `SP_GetAllSalesByDis`(
    IN startDate    VARCHAR(100),
    IN endDate      VARCHAR(100),
    IN p_status     VARCHAR(100),
    IN branch_id    INT,
    IN employee_id  INT,
    IN p_user_id    INT       -- dispatch_id
)
BEGIN
    DECLARE sCondition TEXT DEFAULT '';
    DECLARE sBranchEmployees TEXT DEFAULT NULL;
    DECLARE sQuery TEXT;

    /* ------------------------ DATE FILTER ------------------------ */
    IF startDate <> '' AND endDate <> '' THEN
        SET sCondition = CONCAT(
            sCondition,
            " AND DATE(A.date_time) BETWEEN '", startDate, "' AND '", endDate, "' "
        );
    END IF;

    /* ------------------------ STATUS FILTER ------------------------ */
    IF p_status <> '' THEN
        SET sCondition = CONCAT(
            sCondition,
            " AND A.status = '", p_status, "' "
        );
    END IF;

    /* ------------------------ BRANCH FILTER ------------------------ */
    IF branch_id IS NOT NULL AND branch_id <> 0 THEN
        SELECT GROUP_CONCAT(user_id) INTO sBranchEmployees
        FROM users 
        WHERE created_by IN (
            SELECT branch_incharge_recid FROM branches WHERE branch_recid = branch_id
        );

        IF sBranchEmployees IS NOT NULL THEN
            SET sCondition = CONCAT(
                sCondition,
                " AND A.created_by IN (", sBranchEmployees, ") "
            );
        END IF;
    END IF;

    /* ------------------------ EMPLOYEE FILTER ------------------------ */
    IF employee_id IS NOT NULL AND employee_id <> 0 THEN
        SET sCondition = CONCAT(
            sCondition,
            " AND A.created_by = ", employee_id, " "
        );
    END IF;

    /* ------------------------ DISPATCH FILTER ------------------------ */
    IF p_user_id IS NOT NULL THEN
        SET sCondition = CONCAT(
            sCondition,
            " AND A.dispatch_id = ", p_user_id, " "
        );
    END IF;

    /* ------------------------ FINAL QUERY ------------------------ */
    SET sQuery = CONCAT("
        SELECT * FROM (
            /* ---------------- SALES ---------------- */
            SELECT 
                SL.order_recid,
                SL.leads_id,
                SL.direct_pickup,
                SL.additional_number,
                SL.address,
                SL.district,
                SL.state,
                SL.country,
                SL.courier,
                SL.order_id,
                CT.lead_name AS order_name,
                SL.order_value,
                SL.discount,
                SL.approved_by,
                SL.payment_mode,
                SL.wallet,
                SL.total_value,
                SL.quantity,
                SL.amount_to_pay,
                SL.medication_period,
                SL.receipt_image_url,
                SL.transaction_id,
                SL.date_time,
                SL.status,
                SL.created_by,
                SL.created_at,
                SL.courier_amount,
                CT.mobile_number,
                US.emp_id,
                US.name,
                GD.gst_number,
                GD.hsn_codes,
                GD.gst_percentage,
                CT.lead_id,
                SL.product_id,
                SL.gst_amount,
                SL.product_list,
                SL.gst_id,
                SL.pincode,
                SL.stick_type,
                SL.type AS type_mode,
                SL.net_weight,
                SL.tracking_id,
                SL.reason,
                SL.dispatch_id
            FROM sales SL
            LEFT JOIN leads CT ON CT.lead_id = SL.leads_id
            LEFT JOIN users US ON US.user_id = SL.created_by
            LEFT JOIN gst_data GD ON GD.id = SL.gst_id
            WHERE SL.status NOT IN ('Decline', 'Pending')

            UNION ALL

            /* ---------------- FIELD SHOP SALES ---------------- */
            SELECT 
                FSL.order_recid,
                FSL.leads_id,
                FSL.direct_pickup,
                FSL.additional_number,
                FSL.address,
                FSL.district,
                FSL.state,
                FSL.country,
                FSL.courier,
                FSL.order_id,
                FCT.flead_name AS order_name,
                FSL.order_value,
                FSL.discount,
                FSL.approved_by,
                FSL.payment_mode,
                FSL.wallet,
                FSL.total_value,
                FSL.quantity,
                FSL.amount_to_pay,
                '' AS medication_period,
                FSL.receipt_image_url,
                FSL.transaction_id,
                FSL.date_time,
                FSL.status,
                FSL.created_by,
                FSL.created_at,
                FSL.courier_amount,
                FCT.mobile_number,
                US.emp_id,
                US.name,
                GD.gst_number,
                GD.hsn_codes,
                GD.gst_percentage,
                FCT.flead_id AS lead_id,
                FSL.product_id,
                FSL.gst_amount,
                FSL.product_list,
                FSL.gst_id,
                FSL.pincode,
                FSL.stick_type,
                FSL.type AS type_mode,
                FSL.net_weight,
                FSL.tracking_id,
                FSL.reason,
                FSL.dispatch_id
            FROM fieldshopsales FSL
            LEFT JOIN fieldleads FCT ON FCT.flead_id = FSL.leads_id
            LEFT JOIN users US ON US.user_id = FSL.created_by
            LEFT JOIN gst_data GD ON GD.id = FSL.gst_id
            WHERE FSL.status NOT IN ('Decline', 'Pending')

        ) AS A
        WHERE A.order_recid IS NOT NULL
    ", sCondition, "
        ORDER BY A.created_at DESC
    ");

    /* assign local sQuery into a user variable for PREPARE */
    SET @sQuery = sQuery;

    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END//
DELIMITER ;

