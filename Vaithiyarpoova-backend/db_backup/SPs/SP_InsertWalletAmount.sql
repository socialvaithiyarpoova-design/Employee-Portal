DELIMITER //

DROP PROCEDURE IF EXISTS SP_InsertWalletAmount //
CREATE PROCEDURE SP_InsertWalletAmount (
    IN p_amount DECIMAL(10,2),
    IN p_callback_date DATETIME,
    IN p_comments TEXT,
    IN p_receipt_image_url TEXT,
    IN p_transaction_id VARCHAR(100),
    IN p_date_time DATETIME,
    IN p_owned_by INT,
    IN p_created_by INT
)
BEGIN

    IF p_transaction_id = "null" THEN
        SET p_transaction_id = null;
    END IF;

    IF p_transaction_id IS NOT NULL AND p_transaction_id <> '' THEN
        IF EXISTS (SELECT 1 FROM transaction_id_list WHERE transaction_id = p_transaction_id) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Duplicate transaction ID!';
        END IF;
        -- STEP 2: Insert into transaction_id_list
        INSERT INTO transaction_id_list (transaction_id)
        VALUES (p_transaction_id);
    END IF;

    -- Insert transaction log into wallet_data
    INSERT INTO wallet_data (
        amount, callback_date, comments, receipt_path,
        transaction_id, transaction_datetime, owned_by, created_by, created_at
    )
    VALUES (
        p_amount, p_callback_date, p_comments, p_receipt_image_url,
        p_transaction_id, p_date_time, p_owned_by, p_created_by, NOW()
    );
END //

DELIMITER ;
