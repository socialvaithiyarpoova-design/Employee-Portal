DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetOtherExpAllData`;

CREATE PROCEDURE `SP_GetOtherExpAllData`(
    IN user_id INT(11)
)
BEGIN
SELECT 
        id,
        bill_type,
        amount,
        transaction_id,
        date_time,
        receipt_image,
        status,
        created_by
    FROM
        expenses 
    WHERE created_by = user_id 
    AND status = 'approved'
    ORDER BY id DESC;

END//

DELIMITER ;
