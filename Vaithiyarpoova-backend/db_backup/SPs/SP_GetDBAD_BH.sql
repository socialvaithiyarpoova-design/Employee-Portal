/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: DB Admin Metrics
 DATE: 26/08/2025
 DESC: Aggregated dashboard metrics for admin. Add metrics incrementally.
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetDBAD_BH`;//

CREATE PROCEDURE `SP_GetDBAD_BH`()
BEGIN
    /* Combined total leads from leads and fieldleads */
    SELECT 
        (SELECT COUNT(lead_recid) FROM leads)
        + (SELECT COUNT(flead_recid) FROM fieldleads) AS total_leads;

    /* Total revenue across sales, fieldshopsales, class_register, wallet_data, consulting_appointments */
    SELECT 
        ROUND(
            IFNULL((SELECT SUM(SL.total_value) FROM sales AS SL LEFT JOIN users AS US ON US.user_id = SL.created_by WHERE US.isDeleted = 0), 0)
          + IFNULL((SELECT SUM(FSL.total_value) FROM fieldshopsales AS FSL LEFT JOIN users AS USF ON USF.user_id = FSL.created_by WHERE USF.isDeleted = 0), 0)
          + IFNULL((SELECT SUM(CL.amount_to_pay) FROM class_register AS CL LEFT JOIN users AS UST ON UST.user_id = CL.created_by WHERE UST.isDeleted = 0), 0)
          + IFNULL((SELECT SUM(WL.amount) FROM wallet_data AS WL LEFT JOIN users AS USH ON USH.user_id = WL.created_by WHERE USH.isDeleted = 0), 0)
          + IFNULL((SELECT SUM(CN.price) FROM consulting_appointments AS CN LEFT JOIN users AS USC ON USC.user_id = CN.created_by WHERE USC.isDeleted = 0), 0)
        , 2) AS total_revenue;

    /* Combined pending orders across sales and fieldshopsales (status = 'Pending') */
    SELECT
        (SELECT COUNT(order_recid) FROM sales AS SL LEFT JOIN users AS US ON US.user_id = SL.created_by WHERE US.isDeleted = 0 AND UPPER(SL.status) = 'PENDING')
        + (SELECT COUNT(order_recid) FROM fieldshopsales AS FSL LEFT JOIN users AS USF ON USF.user_id = FSL.created_by WHERE USF.isDeleted = 0 AND UPPER(FSL.status) = 'PENDING') AS total_pending_orders;

    /* Total expenses total_expenses */
    SELECT 
        ROUND(
            IFNULL((SELECT SUM(salary) FROM users WHERE isDeleted = 0), 0)
          + IFNULL((
                SELECT SUM(SL.total_value * (US.incentive_percentage / 100))
                FROM users AS US
                LEFT JOIN sales AS SL ON SL.created_by = US.user_id
                WHERE SL.total_value IS NOT NULL AND US.isDeleted = 0
            ), 0)
          + IFNULL((
                SELECT SUM(FSL.total_value * (FUS.incentive_percentage / 100))
                FROM users AS FUS
                LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = FUS.user_id
                WHERE FSL.total_value IS NOT NULL AND FUS.isDeleted = 0
            ), 0)
          + IFNULL((
                SELECT SUM(electricity_bill) + SUM(wifi_cost) + SUM(mobile_recharge) + SUM(others_amount)
                FROM expenses
            ), 0)
          + IFNULL((SELECT SUM(rent) FROM branches WHERE isDeleted = 0), 0)
        , 2) AS total_expenses;

    /* Total pending leave requests */
    SELECT 
        COUNT(lp_recid) AS total_pending_leave_request
    FROM user_activity 
    WHERE action = 'Leave' AND user_status = 'Pending';

    /* Total pending permission requests */
    SELECT 
        COUNT(lp_recid) AS total_pending_permission_request
    FROM user_activity 
    WHERE action = 'Permission' AND user_status = 'Pending';
END//
DELIMITER ;


