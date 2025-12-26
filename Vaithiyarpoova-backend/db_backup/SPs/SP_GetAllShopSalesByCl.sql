/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 14/07/2025
 DESC: It is used to get all shop sales
 ----------------------------------------------------------------------------------------------------------------- */

DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllShopSalesByCl`;

CREATE PROCEDURE `SP_GetAllShopSalesByCl`(
     IN btn_data   VARCHAR(20),
    IN branch_id  INT,
    IN employee_id INT,
    IN startDate  VARCHAR(50),
    IN endDate    VARCHAR(50),
    IN status     VARCHAR(20)
)

BEGIN

    DECLARE sCondition VARCHAR(1000) DEFAULT '';

    IF btn_data = 'Reset' THEN 
        SET sCondition = CONCAT(" WHERE status = 'Pending' "); 
    ELSE
        SET sCondition = CONCAT(" WHERE status IN ('Approved', 'Decline')  ");
    END IF;

    IF startDate <> '' AND endDate <> '' THEN 
        SET sCondition = CONCAT(sCondition," AND DATE(SL.date_time) BETWEEN '",startDate,"' AND '",endDate,"' "); 
    END IF;

    IF status <> '' THEN 
        SET sCondition = CONCAT(sCondition," AND status = '",status,"' "); 
    END IF;

    IF branch_id <> null AND employee_id = null THEN
        SELECT user_id INTO @sEmployeeId FROM users WHERE created_by IN (SELECT branch_incharge_recid FROM branches WHERE branch_recid = branch_id);

        SET sCondition = CONCAT(sCondition," AND created_by IN (",@sEmployeeId,") "); 
    END IF;

    IF employee_id <> null THEN
        SET sCondition = CONCAT(sCondition," AND created_by = ",@employee_id," "); 
    END IF;

    SET @sQuery = CONCAT("
        SELECT 
            SL.order_recid         AS  order_recid
            ,SL.leads_id            AS  leads_id
            ,SL.direct_pickup           AS  direct_pickup
            ,SL.additional_number           AS  additional_number
            ,SL.address         AS  address
            ,SL.district            AS  district
            ,SL.state           AS  state
            ,SL.country         AS  country
            ,SL.courier         AS  courier
            ,SL.order_id            AS  order_id
            ,SL.order_value         AS  order_value
            ,SL.discount            AS  discount
            ,SL.approved_by         AS  approved_by
            ,SL.wallet          AS  wallet
            ,SL.total_value         AS  total_value
            ,SL.quantity            AS  quantity
            ,SL.payment_type        AS payment_type
            ,SL.amount_to_pay           AS  amount_to_pay
            ,SL.receipt_image_url           AS  receipt_image_url
            ,SL.transaction_id          AS  transaction_id
			,SL.created_at          AS  date_time
            ,SL.status          AS  status
            ,SL.created_by          AS  created_by
            ,CT.mobile_number       AS mobile_number
            ,CT.flead_id       AS lead_id
            ,CT.flead_name       AS order_name
            ,CT.flead_name       AS lead_name
			,US.emp_id    AS emp_id
			,US.name       AS name
            ,US.branch_rceid       AS branch_rceid
            ,BR.branch_id          AS branch_id
            ,BR.branch_name        AS branch_name
            ,GD.gst_number  AS gst_number
			,GD.hsn_codes  AS hsn_codes
		    ,GD.gst_percentage  AS gst_percentage
            ,SL.product_id     AS product_id
            ,SL.product_list       AS product_list
			,SL.courier_amount       AS  courier_amount
            ,SL.gst_amount        AS  gst_amount
            ,SL.stick_type     AS stick_type
            ,SL.date_time      AS date
            ,SL.pincode      AS pincode
            ,SL.payment_mode     AS payment_mode
            ,SL.reason     AS reason
        FROM
            fieldshopsales AS SL
            LEFT JOIN fieldleads AS CT ON CT.flead_id = SL.leads_id 
            LEFT JOIN users AS US ON US.user_id = SL.created_by
            LEFT JOIN branches AS BR ON BR.branch_recid = US.branch_rceid
            LEFT JOIN gst_data AS GD ON GD.id = SL.gst_id
            ",IFNULL(sCondition, '')," ORDER BY SL.created_at DESC ");
            

            PREPARE stmt FROM @sQuery;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

END//
DELIMITER ;



