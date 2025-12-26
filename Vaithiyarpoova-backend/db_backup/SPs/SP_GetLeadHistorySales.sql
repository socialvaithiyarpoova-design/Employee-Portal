
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 24/07/2025
 DESC: It is used get the sales data list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetLeadHistorySales`;

CREATE PROCEDURE `SP_GetLeadHistorySales`(
    IN lead_id VARCHAR(50)
)
BEGIN
    
   SELECT 
          SL.order_recid         AS id
        , SL.leads_id            AS leads_id
        , SL.direct_pickup       AS direct_pickup
        , SL.additional_number   AS additional_number
        , SL.address             AS address
        , SL.district            AS district
        , SL.state               AS state
        , SL.country             AS country
        , SL.courier             AS courier
        , SL.order_id            AS order_id
        , SL.order_name          AS order_name
        , SL.order_value         AS order_value
        , SL.discount            AS discount
        , SL.approved_by         AS approved_by
        , SL.payment_mode        AS payment_mode
        , SL.wallet              AS wallet
        , SL.total_value         AS total_value
        , SL.quantity            AS quantity
        , SL.product_id          AS product_id
        , SL.amount_to_pay       AS amount_to_pay
        , SL.medication_period   AS medication_period
        , SL.receipt_image_url   AS receipt_image_url
        , SL.transaction_id      AS transaction_id
        , SL.stick_type          AS stick_type
        , SL.date_time           AS date_time
        , SL.status              AS status
        , SL.created_by          AS created_by
        , SL.salescol            AS salescol
        , SL.tracking_id         AS tracking_id
        , SL.net_weight          AS net_weight
        , SL.product_list        AS product_list
        , CT.category_name       AS category_name
        , US.emp_id              AS emp_id
        , US.name                AS handler_name
    FROM
        sales   AS SL
    LEFT JOIN categories AS CT   ON CT.category_id = SL.order_name
    LEFT JOIN users AS US        ON US.user_id =  SL.created_by
    WHERE
        leads_id = lead_id ORDER BY SL.date_time  DESC;
    
END//
DELIMITER ;

