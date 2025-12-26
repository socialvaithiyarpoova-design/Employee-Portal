
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 24/07/2025
 DESC: It is used get the class data list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetLeadHistoryClass`;

CREATE PROCEDURE `SP_GetLeadHistoryClass`(
    IN lead_id INT(11)
)
BEGIN
    
    SELECT 
          CR.class_register_id              AS id
        , CR.reg_no                         AS reg_no
        , CR.reg_date                       AS reg_date
        , CR.reg_time                       AS reg_time
        , CR.marital_status                 AS marital_status
        , CR.married_date                   AS married_date
        , CR.male_name                      AS male_name
        , CR.male_dob                       AS male_dob
        , CR.male_mobile                    AS male_mobile
        , CR.male_email                     AS male_email
        , CR.male_tests_taken               AS male_tests_taken
        , CR.male_tests_details             AS male_tests_details
        , CR.male_infertility_reason        AS male_infertility_reason
        , CR.male_infertility_causes        AS male_infertility_causes
        , CR.male_remark                    AS male_remark
        , CR.female_name                    AS female_name
        , CR.female_dob                     AS female_dob
        , CR.female_mobile                  AS female_mobile
        , CR.female_email                   AS female_email
        , CR.female_tests_taken             AS female_tests_taken
        , CR.female_tests_details           AS female_tests_details
        , CR.female_infertility_reason      AS female_infertility_reason
        , CR.female_infertility_causes      AS female_infertility_causes
        , CR.female_remark                  AS female_remark
        , CR.created_by                     AS created_by
        , CR.created_at                     AS created_at
        , CR.country                        AS country
        , CR.state                          AS state
        , CR.city                           AS city
        , CR.pincode                        AS pincode
        , CR.preferred_date                 AS preferred_date
        , CR.preferred_time                 AS preferred_time
        , CR.class_type                     AS class_type
        , CR.remark                         AS remark
        , CR.price_value                    AS price_value
        , CR.amount_to_pay                  AS amount_to_pay
        , CR.discount                       AS discount
        , CR.approved_by                    AS approved_by
        , CR.transaction_id                 AS transaction_id
        , CR.payment_date                   AS payment_date
        , CR.receipt_path                     AS image_path
        , CR.owned_by                       AS owned_by
        , US.emp_id                         AS emp_id
        , US.name                           AS handler_name
        , LD.lead_id                        AS lead_id
        , LD.lead_name                      AS lead_name
    FROM
        class_register                      AS CR
        LEFT JOIN users                     AS US        ON US.user_id =  CR.created_by
        LEFT JOIN leads                     AS LD        ON LD.lead_recid =  CR.owned_by
    WHERE
        owned_by = lead_id ORDER BY CR.created_at DESC;
    
END//
DELIMITER ;

