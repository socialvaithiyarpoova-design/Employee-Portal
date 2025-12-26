
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 24/07/2025
 DESC: It is used get the consulting data list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetLeadHistoryConsult`;

CREATE PROCEDURE `SP_GetLeadHistoryConsult`(
    IN lead_id INT(11)
)
BEGIN
    
    SELECT 
          CA.id                     AS id
        , CA.vaithyar_name          AS vaithyar_name
        , CA.vaithyar_id            AS vaithyar_id
        , CA.slot_date              AS slot_date
        , CA.slot_time              AS slot_time
        , CA.price                  AS amount_to_pay
        , CA.receipt_path         AS receipt_image
        , CA.transaction_id         AS transaction_id
        , CA.date_time            AS paid_date
        , CA.created_by             AS created_by
        , CA.owned_by               AS owned_by
        , CA.created_at             AS created_at
        , US.emp_id                 AS emp_id
        , US.name                   AS handler_name
        , U.emp_id                  AS vaithiyar_id
        , U.name                    AS vaithyar_name
        , LD.lead_id                AS lead_id
        , LD.lead_name              AS lead_name
    FROM
        consulting_appointments     AS CA
        LEFT JOIN users             AS US        ON US.user_id =  CA.created_by
        LEFT JOIN users             AS U         ON U.user_id =  CA.vaithyar_id
        LEFT JOIN leads             AS LD        ON LD.lead_recid =  CA.owned_by
    WHERE
        owned_by = lead_id ORDER BY CA.created_at DESC;
    
END//
DELIMITER ;

