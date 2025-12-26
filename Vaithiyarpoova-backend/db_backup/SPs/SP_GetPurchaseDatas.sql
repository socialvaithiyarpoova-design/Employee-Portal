/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 29/07/2025
 DESC: It is used to get all sales with distinct aggregation
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetPurchaseDatas`;

CREATE PROCEDURE `SP_GetPurchaseDatas`(
    IN startDate    VARCHAR(100),
    IN endDate      VARCHAR(100),
    IN branch_id    INT(11),
    IN emp_id       INT(11),
    IN sStatus      VARCHAR(100),
    IN type_code    VARCHAR(20),
    IN p_user_id    INT(11)
)
BEGIN
    DECLARE sCondition TEXT DEFAULT '';
    
    IF endDate IS NOT NULL AND startDate IS NOT NULL AND startDate <> '' AND endDate <> '' THEN 
        SET sCondition = CONCAT(" AND DATE(SL.date_time) BETWEEN '",startDate,"' AND '",endDate,"' "); 
    END IF;

    IF branch_id IS NOT NULL THEN
        SET sCondition = CONCAT(sCondition," AND SL.created_by IN ( SELECT US.user_id FROM branches AS BR 
        LEFT JOIN users AS US ON US.created_by = BR.branch_incharge_recid WHERE BR.branch_recid = ",branch_id," )"); 
        
    ELSEIF type_code = 'BH' THEN
     SET sCondition = CONCAT(sCondition," AND SL.created_by IN ( SELECT user_id FROM users WHERE created_by = ",p_user_id," )"); 
    END IF;

    IF emp_id IS NOT NULL THEN
        SET sCondition = CONCAT(sCondition," AND SL.created_by = ", emp_id); 
    END IF;

    IF sStatus <> '' THEN
        SET sCondition = CONCAT(sCondition," AND SL.status = '", sStatus,"' "); 
    END IF;
    

    IF type_code = 'AD' THEN
  
        SET @sQuery = CONCAT(" 
            SELECT * FROM (
                SELECT 
                    SL.order_recid                                        AS order_recid,
                    GROUP_CONCAT(DISTINCT SL.leads_id)                    AS leads_id,
                    GROUP_CONCAT(DISTINCT SL.direct_pickup)               AS direct_pickup,
                    GROUP_CONCAT(DISTINCT SL.additional_number)           AS additional_number,
                    GROUP_CONCAT(DISTINCT SL.address)                     AS address,
                    GROUP_CONCAT(DISTINCT SL.district)                    AS district,
                    GROUP_CONCAT(DISTINCT SL.state)                       AS state,
                    GROUP_CONCAT(DISTINCT SL.country)                     AS country,
                    GROUP_CONCAT(DISTINCT SL.courier)                     AS courier,
                    GROUP_CONCAT(DISTINCT SL.order_id)                    AS order_id,
                    GROUP_CONCAT(DISTINCT SL.order_name)                  AS order_name,
                    GROUP_CONCAT(DISTINCT SL.order_value)                 AS order_value,
                    GROUP_CONCAT(DISTINCT SL.discount)                    AS discount,
                    GROUP_CONCAT(DISTINCT SL.approved_by)                 AS approved_by,
                    GROUP_CONCAT(DISTINCT SL.payment_mode)                AS payment_mode,
                    GROUP_CONCAT(DISTINCT SL.wallet)                      AS wallet,
                    GROUP_CONCAT(DISTINCT SL.gst_id)                      AS gst_id,
                    GROUP_CONCAT(DISTINCT SL.total_value)                 AS total_value,          
                    GROUP_CONCAT(DISTINCT SL.quantity)                    AS quantity,
                    GROUP_CONCAT(DISTINCT SL.product_id)                  AS product_id,
                    GROUP_CONCAT(DISTINCT SL.product_list)                AS product_list,
                    GROUP_CONCAT(DISTINCT SL.amount_to_pay)               AS amount_to_pay,
                    GROUP_CONCAT(DISTINCT SL.status)                      AS status,
                    GROUP_CONCAT(DISTINCT SL.date_time)                   AS date_time,
                    GROUP_CONCAT(DISTINCT SL.gst_amount)                  AS gst_amount,
                    GROUP_CONCAT(DISTINCT SL.courier_amount)              AS courier_amount,
                    GROUP_CONCAT(DISTINCT SL.created_at)                  AS created_at,
                    GROUP_CONCAT(DISTINCT US.emp_id)                      AS emp_id,
                    GROUP_CONCAT(DISTINCT US.branch_rceid)                AS branch_rceid,
                    GROUP_CONCAT(DISTINCT BR.branch_id)                   AS branch_id,
                    GROUP_CONCAT(DISTINCT LD.lead_name)                   AS lead_name,
                    GROUP_CONCAT(DISTINCT LD.mobile_number)               AS mobile_number,
                    GROUP_CONCAT(DISTINCT GD.gst_number)                  AS gst_number,
                    GROUP_CONCAT(DISTINCT GD.hsn_codes)                   AS hsn_codes,
                    GROUP_CONCAT(DISTINCT GD.gst_percentage)              AS gst_percentage,
                    GROUP_CONCAT(DISTINCT SL.reason)                      AS reason,

                    -- Gramiyam values
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.order_value ELSE 0 END),2)     AS gr_total_amount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.discount ELSE 0 END),2)        AS gr_discount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.total_value ELSE 0 END),2)     AS gr_paid_amount,

                    -- Vaithiyar Poova values
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.order_value ELSE 0 END),2)   AS vp_total_amount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.discount ELSE 0 END),2)      AS vp_discount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.total_value ELSE 0 END),2)   AS vp_paid_amount,
                    'Sale' AS purchase_type

                FROM
                    sales                 AS SL
                    LEFT JOIN users       AS US ON US.user_id = SL.created_by
                    LEFT JOIN leads       AS LD ON LD.lead_id = SL.leads_id
                    LEFT JOIN purchased_product AS PP ON PP.order_recid = SL.order_recid
                    LEFT JOIN product     AS PR ON PR.product_recid = PP.product_recid
                    LEFT JOIN branches AS BR ON BR.branch_recid= US.branch_rceid
                    LEFT JOIN gst_data    AS GD ON GD.id = SL.gst_id
                WHERE
                    SL.product_id IS NOT NULL ",IFNULL(sCondition, ''),"
                GROUP BY SL.order_recid  

                UNION ALL

                SELECT 
                    SL.order_recid                                        AS order_recid,
                    GROUP_CONCAT(DISTINCT SL.leads_id)                    AS leads_id,
                    GROUP_CONCAT(DISTINCT SL.direct_pickup)               AS direct_pickup,
                    GROUP_CONCAT(DISTINCT SL.additional_number)           AS additional_number,
                    GROUP_CONCAT(DISTINCT SL.address)                     AS address,
                    GROUP_CONCAT(DISTINCT SL.district)                    AS district,
                    GROUP_CONCAT(DISTINCT SL.state)                       AS state,
                    GROUP_CONCAT(DISTINCT SL.country)                     AS country,
                    GROUP_CONCAT(DISTINCT SL.courier)                     AS courier,
                    GROUP_CONCAT(DISTINCT SL.order_id)                    AS order_id,
                    GROUP_CONCAT(DISTINCT SL.order_name)                  AS order_name,
                    GROUP_CONCAT(DISTINCT SL.order_value)                 AS order_value,
                    GROUP_CONCAT(DISTINCT SL.discount)                    AS discount,
                    GROUP_CONCAT(DISTINCT SL.approved_by)                 AS approved_by,
                    GROUP_CONCAT(DISTINCT SL.payment_mode)                AS payment_mode,
                    GROUP_CONCAT(DISTINCT SL.wallet)                      AS wallet,
                    GROUP_CONCAT(DISTINCT SL.gst_id)                      AS gst_id,
                    GROUP_CONCAT(DISTINCT SL.total_value)                 AS total_value,
                    GROUP_CONCAT(DISTINCT SL.quantity)                    AS quantity,
                    GROUP_CONCAT(DISTINCT SL.product_id)                  AS product_id,
                    GROUP_CONCAT(DISTINCT SL.product_list)                AS product_list,
                    GROUP_CONCAT(DISTINCT SL.amount_to_pay)               AS amount_to_pay,
                    GROUP_CONCAT(DISTINCT SL.status)                      AS status,
                    GROUP_CONCAT(DISTINCT SL.date_time)                   AS date_time,
                    GROUP_CONCAT(DISTINCT SL.gst_amount)                  AS gst_amount,
                    GROUP_CONCAT(DISTINCT SL.courier_amount)              AS courier_amount,
                    GROUP_CONCAT(DISTINCT SL.created_at)                  AS created_at,             
                    GROUP_CONCAT(DISTINCT US.emp_id)                      AS emp_id,
                    GROUP_CONCAT(DISTINCT US.branch_rceid)                AS branch_rceid,
                    GROUP_CONCAT(DISTINCT BR.branch_id)                   AS branch_id,
                    GROUP_CONCAT(DISTINCT FLD.flead_name)                 AS lead_name,
                    GROUP_CONCAT(DISTINCT FLD.mobile_number)              AS mobile_number,
                    GROUP_CONCAT(DISTINCT GD.gst_number)                  AS gst_number,
                    GROUP_CONCAT(DISTINCT GD.hsn_codes)                   AS hsn_codes,
                    GROUP_CONCAT(DISTINCT GD.gst_percentage)              AS gst_percentage,
                    GROUP_CONCAT(DISTINCT SL.reason)                      AS reason,
                    
                    -- Gramiyam values
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.order_value ELSE 0 END),2)     AS gr_total_amount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.discount ELSE 0 END),2)        AS gr_discount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.total_value ELSE 0 END),2)     AS gr_paid_amount,

                    -- Vaithiyar Poova values
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.order_value ELSE 0 END),2)   AS vp_total_amount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.discount ELSE 0 END),2)      AS vp_discount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.total_value ELSE 0 END),2)   AS vp_paid_amount,
                    'Field sale' AS purchase_type

                FROM
                    fieldshopsales        AS SL
                    LEFT JOIN users       AS US ON US.user_id = SL.created_by
                    LEFT JOIN fieldleads  AS FLD ON FLD.flead_id = SL.leads_id
                    LEFT JOIN purchased_product AS PP ON PP.order_recid = SL.order_recid
                    LEFT JOIN product     AS PR ON PR.product_recid = PP.product_recid
                    LEFT JOIN branches AS BR ON BR.branch_recid= US.branch_rceid
                    LEFT JOIN gst_data    AS GD ON GD.id = SL.gst_id
                WHERE
                    SL.product_id IS NOT NULL ",IFNULL(sCondition, ''),"
                GROUP BY SL.order_recid  
            ) AS A 
            ORDER BY 1 DESC ");

        -- SELECT @sQuery;
        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    ELSEIF branch_id IS NOT NULL || type_code = 'BH'  THEN
        SET @sQuery = CONCAT(" 
            SELECT * FROM (
                SELECT 
                    SL.order_recid                                        AS order_recid,
                    GROUP_CONCAT(DISTINCT SL.leads_id)                    AS leads_id,
                    GROUP_CONCAT(DISTINCT SL.direct_pickup)               AS direct_pickup,
                    GROUP_CONCAT(DISTINCT SL.additional_number)           AS additional_number,
                    GROUP_CONCAT(DISTINCT SL.address)                     AS address,
                    GROUP_CONCAT(DISTINCT SL.district)                    AS district,
                    GROUP_CONCAT(DISTINCT SL.state)                       AS state,
                    GROUP_CONCAT(DISTINCT SL.country)                     AS country,
                    GROUP_CONCAT(DISTINCT SL.courier)                     AS courier,
                    GROUP_CONCAT(DISTINCT SL.order_id)                    AS order_id,
                    GROUP_CONCAT(DISTINCT SL.order_name)                  AS order_name,
                    GROUP_CONCAT(DISTINCT SL.order_value)                 AS order_value,
                    GROUP_CONCAT(DISTINCT SL.discount)                    AS discount,
                    GROUP_CONCAT(DISTINCT SL.approved_by)                 AS approved_by,
                    GROUP_CONCAT(DISTINCT SL.payment_mode)                AS payment_mode,
                    GROUP_CONCAT(DISTINCT SL.wallet)                      AS wallet,
                    GROUP_CONCAT(DISTINCT SL.gst_id)                      AS gst_id,
                    GROUP_CONCAT(DISTINCT SL.total_value)                 AS total_value,          
                    GROUP_CONCAT(DISTINCT SL.quantity)                    AS quantity,
                    GROUP_CONCAT(DISTINCT SL.product_id)                  AS product_id,
                    GROUP_CONCAT(DISTINCT SL.product_list)                AS product_list,
                    GROUP_CONCAT(DISTINCT SL.amount_to_pay)               AS amount_to_pay,
                    GROUP_CONCAT(DISTINCT SL.status)                      AS status,
                    GROUP_CONCAT(DISTINCT SL.date_time)                   AS date_time,
                    GROUP_CONCAT(DISTINCT SL.gst_amount)                  AS gst_amount,
                    GROUP_CONCAT(DISTINCT SL.courier_amount)              AS courier_amount,
                    GROUP_CONCAT(DISTINCT SL.created_at)                  AS created_at,
                    GROUP_CONCAT(DISTINCT US.emp_id)                      AS emp_id,
                    GROUP_CONCAT(DISTINCT US.branch_rceid)                AS branch_rceid,
                    GROUP_CONCAT(DISTINCT BR.branch_id)                   AS branch_id,
                    GROUP_CONCAT(DISTINCT LD.lead_name)                   AS lead_name,
                    GROUP_CONCAT(DISTINCT LD.mobile_number)               AS mobile_number,
                    GROUP_CONCAT(DISTINCT GD.gst_number)                  AS gst_number,
                    GROUP_CONCAT(DISTINCT GD.hsn_codes)                   AS hsn_codes,
                    GROUP_CONCAT(DISTINCT GD.gst_percentage)              AS gst_percentage,
                    GROUP_CONCAT(DISTINCT SL.reason)                      AS reason,

                    -- Gramiyam values
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.order_value ELSE 0 END),2)     AS gr_total_amount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.discount ELSE 0 END),2)        AS gr_discount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.total_value ELSE 0 END),2)     AS gr_paid_amount,

                    -- Vaithiyar Poova values
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.order_value ELSE 0 END),2)   AS vp_total_amount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.discount ELSE 0 END),2)      AS vp_discount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.total_value ELSE 0 END),2)   AS vp_paid_amount,
                    'Sale' AS purchase_type

                FROM
                    sales                 AS SL
                    LEFT JOIN users       AS US ON US.user_id = SL.created_by
                    LEFT JOIN leads       AS LD ON LD.lead_id = SL.leads_id
                    LEFT JOIN purchased_product AS PP ON PP.order_recid = SL.order_recid
                    LEFT JOIN product     AS PR ON PR.product_recid = PP.product_recid
                    LEFT JOIN branches AS BR ON BR.branch_recid= US.branch_rceid
                    LEFT JOIN gst_data    AS GD ON GD.id = SL.gst_id
                WHERE
                    SL.product_id IS NOT NULL ",IFNULL(sCondition, ''),"
                GROUP BY SL.order_recid  

                UNION ALL

                SELECT 
                    SL.order_recid                                        AS order_recid,
                    GROUP_CONCAT(DISTINCT SL.leads_id)                    AS leads_id,
                    GROUP_CONCAT(DISTINCT SL.direct_pickup)               AS direct_pickup,
                    GROUP_CONCAT(DISTINCT SL.additional_number)           AS additional_number,
                    GROUP_CONCAT(DISTINCT SL.address)                     AS address,
                    GROUP_CONCAT(DISTINCT SL.district)                    AS district,
                    GROUP_CONCAT(DISTINCT SL.state)                       AS state,
                    GROUP_CONCAT(DISTINCT SL.country)                     AS country,
                    GROUP_CONCAT(DISTINCT SL.courier)                     AS courier,
                    GROUP_CONCAT(DISTINCT SL.order_id)                    AS order_id,
                    GROUP_CONCAT(DISTINCT SL.order_name)                  AS order_name,
                    GROUP_CONCAT(DISTINCT SL.order_value)                 AS order_value,
                    GROUP_CONCAT(DISTINCT SL.discount)                    AS discount,
                    GROUP_CONCAT(DISTINCT SL.approved_by)                 AS approved_by,
                    GROUP_CONCAT(DISTINCT SL.payment_mode)                AS payment_mode,
                    GROUP_CONCAT(DISTINCT SL.wallet)                      AS wallet,
                    GROUP_CONCAT(DISTINCT SL.gst_id)                      AS gst_id,
                    GROUP_CONCAT(DISTINCT SL.total_value)                 AS total_value,
                    GROUP_CONCAT(DISTINCT SL.quantity)                    AS quantity,
                    GROUP_CONCAT(DISTINCT SL.product_id)                  AS product_id,
                    GROUP_CONCAT(DISTINCT SL.product_list)                AS product_list,
                    GROUP_CONCAT(DISTINCT SL.amount_to_pay)               AS amount_to_pay,
                    GROUP_CONCAT(DISTINCT SL.status)                      AS status,
                    GROUP_CONCAT(DISTINCT SL.date_time)                   AS date_time,
                    GROUP_CONCAT(DISTINCT SL.gst_amount)                  AS gst_amount,
                    GROUP_CONCAT(DISTINCT SL.courier_amount)              AS courier_amount,
                    GROUP_CONCAT(DISTINCT SL.created_at)                  AS created_at,             
                    GROUP_CONCAT(DISTINCT US.emp_id)                      AS emp_id,
                    GROUP_CONCAT(DISTINCT US.branch_rceid)                AS branch_rceid,
                    GROUP_CONCAT(DISTINCT BR.branch_id)                   AS branch_id,
                    GROUP_CONCAT(DISTINCT FLD.flead_name)                 AS lead_name,
                    GROUP_CONCAT(DISTINCT FLD.mobile_number)              AS mobile_number,
                    GROUP_CONCAT(DISTINCT GD.gst_number)                  AS gst_number,
                    GROUP_CONCAT(DISTINCT GD.hsn_codes)                   AS hsn_codes,
                    GROUP_CONCAT(DISTINCT GD.gst_percentage)              AS gst_percentage,
                    GROUP_CONCAT(DISTINCT SL.reason)                      AS reason,
                    
                    -- Gramiyam values
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.order_value ELSE 0 END),2)     AS gr_total_amount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.discount ELSE 0 END),2)        AS gr_discount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Gramiyam' THEN SL.total_value ELSE 0 END),2)     AS gr_paid_amount,

                    -- Vaithiyar Poova values
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.order_value ELSE 0 END),2)   AS vp_total_amount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.discount ELSE 0 END),2)      AS vp_discount,
                    ROUND(SUM(DISTINCT CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.total_value ELSE 0 END),2)   AS vp_paid_amount,
                    'Field sale' AS purchase_type

                FROM
                    fieldshopsales        AS SL
                    LEFT JOIN users       AS US ON US.user_id = SL.created_by
                    LEFT JOIN fieldleads  AS FLD ON FLD.flead_id = SL.leads_id
                    LEFT JOIN purchased_product AS PP ON PP.order_recid = SL.order_recid
                    LEFT JOIN product     AS PR ON PR.product_recid = PP.product_recid
                    LEFT JOIN branches AS BR ON BR.branch_recid= US.branch_rceid
                    LEFT JOIN gst_data    AS GD ON GD.id = SL.gst_id
                WHERE
                    SL.product_id IS NOT NULL ",IFNULL(sCondition, ''),"
                GROUP BY SL.order_recid  
            ) AS A 
            ORDER BY 1 DESC ");

		-- SELECT @sQuery;
        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;

END//


DELIMITER ;