
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 13/08/2025
 DESC: It is used save the expenses 
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_SaveExpenseAmountMonth` //

CREATE PROCEDURE `SP_SaveExpenseAmountMonth`(
    IN p_bill_type DECIMAL(10,2),
    IN p_amount DECIMAL(10,2),
    IN p_transaction_id VARCHAR(100),
    IN p_date_time DATETIME,
    IN p_receipt_image VARCHAR(255),
    IN p_user_id INT(11)
)
BEGIN

    IF p_transaction_id = 'null' OR p_transaction_id = '' THEN
        SET p_transaction_id = NULL;
    END IF;

    IF p_transaction_id IS NOT NULL AND p_transaction_id <> '' THEN
        IF EXISTS (SELECT 1 FROM transaction_id_list WHERE transaction_id = p_transaction_id) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Duplicate transaction ID!';
        END IF;
        INSERT INTO transaction_id_list (transaction_id)
        VALUES (p_transaction_id);
    END IF;

    INSERT INTO expenses (
        bill_type,
        amount,
        transaction_id,
        date_time,
        receipt_image,
        created_by 
    )
    VALUES (
        p_bill_type,
        p_amount,
        p_transaction_id,
        p_date_time,
        p_receipt_image,
        p_user_id
    );
END //

DELIMITER ;