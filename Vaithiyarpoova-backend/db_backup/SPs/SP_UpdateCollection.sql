
-- /* ----------------------------------------------------------------------------------------------------------------- 
--  NAME: Hariharan S
--  DATE: 11/08/2025
--  DESC: It is used update the logout time
--  ----------------------------------------------------------------------------------------------------------------- */


DELIMITER //

DROP PROCEDURE IF EXISTS `SP_UpdateCollection`//
CREATE PROCEDURE `SP_UpdateCollection`(
       IN p_order_recid INT,
       IN p_payment_type VARCHAR(100),
       IN p_amount DECIMAL(10,2),
       IN p_transaction_id VARCHAR(100),
       IN p_dateTime VARCHAR(100),
       IN p_payment_mode VARCHAR(100),
       IN p_image VARCHAR(1000),
       IN p_collection_date VARCHAR(100)
)
BEGIN

    DECLARE v_current_paid DECIMAL(10,2) DEFAULT 0;
    DECLARE v_new_total_paid DECIMAL(10,2) DEFAULT 0;

    IF p_transaction_id IS NOT NULL AND p_transaction_id <> '' THEN
        IF EXISTS (SELECT 1 FROM transaction_id_list WHERE transaction_id = p_transaction_id) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Duplicate transaction ID!';
        END IF;
        INSERT INTO transaction_id_list (transaction_id)
        VALUES (p_transaction_id);
    END IF;

    SELECT IFNULL(last_paid_total,0)
    INTO v_current_paid
    FROM fieldshopsales
    WHERE order_recid = p_order_recid;

    IF p_payment_type = 'Part' THEN
        SET v_new_total_paid = v_current_paid + p_amount;
    END IF;

    IF p_payment_type = 'Part' THEN

        UPDATE fieldshopsales 
        SET 
            paid_status       = p_payment_type,
            payment_mode       = p_payment_mode,
            transaction_id     = p_transaction_id,
            date_time          = p_collection_date,
            total_value        = p_amount,
            receipt_image_url  = p_image,
            last_paid_value    = p_amount,
            last_paid_total    = v_new_total_paid,
            updated_at         = NOW()
        WHERE order_recid = p_order_recid;

    ELSE

        UPDATE fieldshopsales 
        SET 
            paid_status       = p_payment_type,
            payment_mode       = p_payment_mode,
            transaction_id     = p_transaction_id,
            date_time          = p_collection_date,
            transaction_date   = p_dateTime,
            total_value        = p_amount,
            receipt_image_url  = p_image,
            last_paid_value    = p_amount,
            last_paid_total    = 0,
            updated_at         = NOW()
        WHERE order_recid = p_order_recid;

    END IF;

END//

DELIMITER ;
