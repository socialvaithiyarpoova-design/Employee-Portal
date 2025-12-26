
-- /* ----------------------------------------------------------------------------------------------------------------- 
--  NAME: Hariharan S
--  DATE: 01/07/2025
--  DESC: It is used to get user activity details
--  ----------------------------------------------------------------------------------------------------------------- */
-- DELIMITER //

-- DROP PROCEDURE IF EXISTS `SP_GetTrackingData`;

-- CREATE PROCEDURE `SP_GetTrackingData`(
--     IN startDate    VARCHAR(50),
--     IN endDate      VARCHAR(50),
--     IN sStatus      VARCHAR(50),
--     IN type_code    VARCHAR(20),
--     IN user_id      INT(11)
-- )
-- BEGIN
--     DECLARE sCondition VARCHAR(1000) DEFAULT '';

--     IF (startDate IS NOT NULL AND startDate != '') AND (endDate IS NOT NULL AND endDate != '') THEN
--         SET sCondition = CONCAT(" AND DATE(O.date_time) BETWEEN '", startDate, "' AND '", endDate, "' ");
--     END IF;

--     IF sStatus != "" THEN 
--         SET sCondition = CONCAT(sCondition , CONCAT(" AND status = '",sStatus,"' "));
--     END IF;

--     IF type_code = "FS" THEN
--         SET @sQuery = CONCAT("
--                 SELECT 
--                     O.order_recid            AS order_recid
--                     ,O.leads_id               AS leads_id
--                     ,O.direct_pickup          AS direct_pickup
--                     ,O.additional_number      AS additional_number
--                     ,O.address                AS address
--                     ,O.district               AS district
--                     ,O.state                  AS state
--                     ,O.country                AS country
--                     ,O.courier                AS courier
--                     ,O.order_id               AS order_id
--                     ,O.order_name             AS order_name
--                     ,O.order_value            AS order_value
--                     ,O.discount               AS discount
--                     ,O.approved_by            AS approved_by
--                     ,O.payment_mode           AS payment_mode
--                     ,O.wallet                 AS wallet
--                     ,O.total_value            AS total_value
--                     ,O.quantity               AS quantity
--                     ,O.product_id             AS product_id
--                     ,O.amount_to_pay          AS amount_to_pay
--                     ,O.payment_type           AS payment_type
--                     ,O.receipt_image_url      AS receipt_image_url
--                     ,O.transaction_id         AS transaction_id
--                     ,O.stick_type             AS stick_type
--                     ,O.date_time              AS date_time
--                     ,O.status                 AS status
--                     ,O.created_by             AS created_by
--                     ,O.salescol               AS lead_id
--                     ,U.flead_id                 AS emp_id
--                     ,U.flead_name               AS lead_name
--                     ,US.emp_id                  AS emp_id
--                     ,O.product_list             AS product_list
--                     ,O.tracking_id             AS tracking_id
--                 FROM
--                     fieldshopsales AS O
--                 LEFT JOIN fieldleads AS U ON U.flead_id = O.leads_id
--                 LEFT JOIN users AS US ON US.user_id = U.created_by
--                 WHERE O.created_by = ",user_id,  IFNULL(sCondition, ''), "
--                 ORDER BY O.order_recid DESC");

--             PREPARE stmt FROM @sQuery;
--             EXECUTE stmt;
--             DEALLOCATE PREPARE stmt;
--     ELSEIF type_code = "AD" OR type_code = "BH" OR type_code = "AC" OR type_code = "DIS" THEN

--             SET @sQuery = CONCAT("
--                 SELECT 
--                     O.order_recid            AS order_recid
--                     ,O.leads_id               AS leads_id
--                     ,O.direct_pickup          AS direct_pickup
--                     ,O.additional_number      AS additional_number
--                     ,O.address                AS address
--                     ,O.district               AS district
--                     ,O.state                  AS state
--                     ,O.country                AS country
--                     ,O.courier                AS courier
--                     ,O.order_id               AS order_id
--                     ,O.order_name             AS order_name
--                     ,O.order_value            AS order_value
--                     ,O.discount               AS discount
--                     ,O.approved_by            AS approved_by
--                     ,O.payment_mode           AS payment_mode
--                     ,O.wallet                 AS wallet
--                     ,O.total_value            AS total_value
--                     ,O.quantity               AS quantity
--                     ,O.product_id             AS product_id
--                     ,O.amount_to_pay          AS amount_to_pay
--                     ,O.payment_type           AS payment_type
--                     ,O.receipt_image_url      AS receipt_image_url
--                     ,O.transaction_id         AS transaction_id
--                     ,O.stick_type             AS stick_type
--                     ,O.date_time              AS date_time
--                     ,O.status                 AS status
--                     ,O.created_by             AS created_by
--                     ,O.salescol               AS lead_id
--                     ,U.lead_id                 AS emp_id
--                     ,U.lead_name                   AS lead_name
--                     ,US.emp_id                  AS emp_id
--                     ,O.product_list             AS product_list
--                     ,O.tracking_id             AS tracking_id
--                 FROM
--                     fieldshopsales AS O
--                 LEFT JOIN leads AS U ON U.lead_id = O.leads_id
--                 LEFT JOIN users AS US ON US.user_id = U.created_by
--                 WHERE  O.created_by IS NOT NULL ",IFNULL(sCondition, ''), "
--                 ORDER BY O.order_recid DESC   
--                  UNION 
--                 SELECT 
--                      O.order_recid            AS order_recid
--                     ,O.leads_id               AS leads_id
--                     ,O.direct_pickup          AS direct_pickup
--                     ,O.additional_number      AS additional_number
--                     ,O.address                AS address
--                     ,O.district               AS district
--                     ,O.state                  AS state
--                     ,O.country                AS country
--                     ,O.courier                AS courier
--                     ,O.order_id               AS order_id
--                     ,O.order_name             AS order_name
--                     ,O.order_value            AS order_value
--                     ,O.discount               AS discount
--                     ,O.approved_by            AS approved_by
--                     ,O.payment_mode           AS payment_mode
--                     ,O.wallet                 AS wallet
--                     ,O.total_value            AS total_value
--                     ,O.quantity               AS quantity
--                     ,O.product_id             AS product_id
--                     ,O.amount_to_pay          AS amount_to_pay
--                     ,O.medication_period      AS medication_period
--                     ,O.receipt_image_url      AS receipt_image_url
--                     ,O.transaction_id         AS transaction_id
--                     ,O.stick_type             AS stick_type
--                     ,O.date_time              AS date_time
--                     ,O.status                 AS status
--                     ,O.created_by             AS created_by
--                     ,O.salescol               AS lead_id
--                     ,U.lead_id                 AS emp_id
--                     ,U.lead_name                   AS lead_name
--                     ,US.emp_id                  AS emp_id
--                     ,O.product_list             AS product_list
--                     ,O.tracking_id             AS tracking_id
--                 FROM
--                     sales AS O
--                 LEFT JOIN leads AS U ON U.lead_id = O.leads_id
--                 LEFT JOIN users AS US ON US.user_id = U.created_by
--                 WHERE O.created_by IS NOT NULL ",IFNULL(sCondition, ''), "
--                 ORDER BY O.order_recid DESC ");

--             PREPARE stmt FROM @sQuery;
--             EXECUTE stmt;
--             DEALLOCATE PREPARE stmt;

--     ELSE 
    
--         SET @sQuery = CONCAT("
--                 SELECT 
--                      O.order_recid            AS order_recid
--                     ,O.leads_id               AS leads_id
--                     ,O.direct_pickup          AS direct_pickup
--                     ,O.additional_number      AS additional_number
--                     ,O.address                AS address
--                     ,O.district               AS district
--                     ,O.state                  AS state
--                     ,O.country                AS country
--                     ,O.courier                AS courier
--                     ,O.order_id               AS order_id
--                     ,O.order_name             AS order_name
--                     ,O.order_value            AS order_value
--                     ,O.discount               AS discount
--                     ,O.approved_by            AS approved_by
--                     ,O.payment_mode           AS payment_mode
--                     ,O.wallet                 AS wallet
--                     ,O.total_value            AS total_value
--                     ,O.quantity               AS quantity
--                     ,O.product_id             AS product_id
--                     ,O.amount_to_pay          AS amount_to_pay
--                     ,O.medication_period      AS medication_period
--                     ,O.receipt_image_url      AS receipt_image_url
--                     ,O.transaction_id         AS transaction_id
--                     ,O.stick_type             AS stick_type
--                     ,O.date_time              AS date_time
--                     ,O.status                 AS status
--                     ,O.created_by             AS created_by
--                     ,O.salescol               AS lead_id
--                     ,U.lead_id                 AS emp_id
--                     ,U.lead_name                   AS lead_name
--                     ,US.emp_id                  AS emp_id
--                     ,O.product_list             AS product_list
--                     ,O.tracking_id             AS tracking_id
--                 FROM
--                     sales AS O
--                 LEFT JOIN leads AS U ON U.lead_id = O.leads_id
--                 LEFT JOIN users AS US ON US.user_id = U.created_by
--                 WHERE O.created_by = ",user_id,  IFNULL(sCondition, ''), "
--                 ORDER BY O.order_recid DESC");

--             PREPARE stmt FROM @sQuery;
--             EXECUTE stmt;
--             DEALLOCATE PREPARE stmt;
--     END IF;


-- END//

-- DELIMITER ;


/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 01/07/2025
 DESC: Get tracking data filtered by date, status, and global mobile_number (auto global when searching by number)
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetTrackingData`;
CREATE PROCEDURE `SP_GetTrackingData`(
    IN startDate      VARCHAR(50),
    IN endDate        VARCHAR(50),
    IN sStatus        VARCHAR(50),
    IN type_code      VARCHAR(20),
    IN user_id        INT(11),
    IN mobile_number  VARCHAR(20)
)
BEGIN
    DECLARE sCondition VARCHAR(1000) DEFAULT '';

    -- ✅ Handle both datetime and date
    IF (startDate IS NOT NULL AND startDate != '') AND (endDate IS NOT NULL AND endDate != '') THEN
        SET sCondition = CONCAT(
            " AND DATE(O.date_time) BETWEEN DATE('", startDate, "') AND DATE('", endDate, "') "
        );
    END IF;

    -- ✅ Filter by status
    IF sStatus IS NOT NULL AND sStatus != '' THEN 
        SET sCondition = CONCAT(sCondition, " AND O.status = '", sStatus, "' ");
    END IF;

    -- ✅ Global search (ignore created_by)
    IF mobile_number IS NOT NULL AND mobile_number != '' THEN
        SET sCondition = CONCAT(sCondition, 
            " AND (O.additional_number LIKE '%", mobile_number, "%' 
                   OR U.mobile_number LIKE '%", mobile_number, "%') ");
    END IF;

    -- ✅ Build query dynamically
    IF type_code = 'FS' THEN
        IF mobile_number IS NULL OR mobile_number = '' THEN
            SET @sQuery = CONCAT("
                SELECT O.*, U.flead_name AS lead_name, U.mobile_number, O.tracking_id
                FROM fieldshopsales AS O
                LEFT JOIN fieldleads AS U ON U.flead_id = O.leads_id
                WHERE O.created_by = ", user_id, sCondition, "
                ORDER BY O.order_recid DESC");
        ELSE
            SET @sQuery = CONCAT("
                SELECT O.*, U.flead_name AS lead_name, U.mobile_number, O.tracking_id
                FROM fieldshopsales AS O
                LEFT JOIN fieldleads AS U ON U.flead_id = O.leads_id
                WHERE 1=1 ", sCondition, "
                ORDER BY O.order_recid DESC");
        END IF;
    ELSE
        IF mobile_number IS NULL OR mobile_number = '' THEN
            SET @sQuery = CONCAT("
                SELECT O.*, U.lead_name AS lead_name, U.mobile_number, O.tracking_id
                FROM sales AS O
                LEFT JOIN leads AS U ON U.lead_id = O.leads_id
                WHERE O.created_by = ", user_id, sCondition, "
                ORDER BY O.order_recid DESC");
        ELSE
            SET @sQuery = CONCAT("
                SELECT O.*, U.lead_name AS lead_name, U.mobile_number, O.tracking_id
                FROM sales AS O
                LEFT JOIN leads AS U ON U.lead_id = O.leads_id
                WHERE 1=1 ", sCondition, "
                ORDER BY O.order_recid DESC");
        END IF;
    END IF;

    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END//

DELIMITER ;
