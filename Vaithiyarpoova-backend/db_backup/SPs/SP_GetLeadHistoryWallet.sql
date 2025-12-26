
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 24/07/2025
 DESC: It is used get the wallet data list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetLeadHistoryWallet`;

CREATE PROCEDURE `SP_GetLeadHistoryWallet`(
    IN lead_id INT(11)
)
BEGIN
    
  SELECT 
        WD.wallet_id              AS id
      , WD.amount                 AS amount_to_pay
      , WD.callback_date          AS callback_date
      , WD.comments               AS comments
      , WD.receipt_path           AS receipt_path
      , WD.transaction_id         AS transaction_id
      , WD.transaction_datetime   AS transaction_datetime
      , WD.owned_by               AS owned_by
      , WD.created_by             AS created_by
      , WD.created_at             AS created_at
      , US.emp_id                 AS emp_id
      , US.name                   AS handler_name
      , WA.amount                 AS wall_balance
  FROM
      wallet_data                 AS WD
      LEFT JOIN users             AS US        ON US.user_id =  WD.created_by
      LEFT JOIN wallet_amount     AS WA        ON WA.owned_by =  WD.owned_by
 WHERE
      WD.owned_by = lead_id AND WD.status IN ('Approved', 'Decline')
      WD.amount IS NOT NULL AND WD.amount <> '0.00' ORDER BY WD.created_at  DESC;
    
END//
DELIMITER ;

