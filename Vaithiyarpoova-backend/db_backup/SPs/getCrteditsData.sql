/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 23/06/2025
 DESC: It is used to get all user credits
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `getCrteditsData`;

CREATE PROCEDURE `getCrteditsData`(
    IN startDate VARCHAR(100),
    IN endDate  VARCHAR(100),
    IN p_branch_id  INT(11),
    IN p_emp_id  INT(11)
)
BEGIN
     DECLARE sCondition VARCHAR(1000) DEFAULT '';

    IF startDate <> '' AND endDate <> '' THEN 
        SET sCondition = CONCAT(" AND DATE(FS.date_time) BETWEEN '",startDate,"' AND '",endDate,"' "); 
    END IF;

    IF p_branch_id IS NOT NULL THEN
        SET sCondition = CONCAT(sCondition, " AND US.user_id IN (
                    SELECT user_id FROM users AS USI LEFT JOIN branches AS BRI ON BRI.branch_incharge_recid = USI.created_by WHERE branch_recid = ",p_branch_id,"
                    ) ");
    END IF;
        
    IF p_emp_id IS NOT NULL THEN
        SET sCondition = CONCAT(sCondition, " AND US.user_id = ",p_emp_id," ");
    END IF;

    SET @sQuery = CONCAT("SELECT 
        FS.order_recid,
        FS.leads_id,
        FS.direct_pickup,
        FS.additional_number,
        FS.address,
        FS.district,
        FS.state,
        FS.country,
        FS.courier,
        FS.order_id,
        FS.order_name,
        FS.order_value,
        FS.discount,
        FS.approved_by,
        FS.wallet,
        FS.gst_amount,
        FS.courier_amount,
        FS.total_value,
        FS.quantity,
        FS.product_id,
        FS.amount_to_pay,
        FS.payment_type,
        FS.receipt_image_url,
        FS.transaction_id,
        FS.stick_type,
        FS.date_time,
        FS.status,
        FS.created_by,
        FS.created_at,
        FS.salescol,
        FS.tracking_id,
        FS.net_weight,
        FS.product_list,
        FS.gst_id,
		GD.gst_number,
		GD.hsn_codes,
		GD.gst_percentage,
        FS.paid_status,
        FS.account_status AS account_status,
        US.emp_id,
        US.name,
        FL.flead_name AS lead_name,
        FL.shop_keeper AS shop_keeper,
        FL.shop_type AS shop_type,
        FL.mobile_number AS mobile_number,
        B.branch_id,
        B.branch_name
    FROM
        fieldshopsales AS FS
        LEFT JOIN fieldleads AS FL ON FL.flead_id = FS.leads_id
        LEFT JOIN users AS US ON US.user_id = FS.created_by
        LEFT JOIN branches AS B ON B.branch_recid = US.branch_rceid
		LEFT JOIN gst_data AS GD ON GD.id = FS.gst_id
    WHERE
        FS.payment_type = 'Credit' AND FS.status != 'Decline' ",sCondition," ");

    -- SELECT @sQuery;
    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
END//

DELIMITER ;