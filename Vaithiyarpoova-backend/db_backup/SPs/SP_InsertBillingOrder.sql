/* ----------------------------------------------------------------------------------------------------------------- 
   NAME: Ajith S
   DATE: 11/11/2025
   DESC: It is used to save sales orders and purchased products.
----------------------------------------------------------------------------------------------------------------- */
DELIMITER $$

DROP PROCEDURE IF EXISTS `SP_InsertBillingOrder`;


CREATE PROCEDURE SP_InsertBillingOrder(
    IN p_lead_name VARCHAR(255),
    IN p_age INT,
    IN p_gender VARCHAR(10),
    IN p_mobile BIGINT,
    IN p_email VARCHAR(255),
    IN p_order_value DECIMAL(10,2),
    IN p_discount DECIMAL(10,2),
    IN p_approved_by VARCHAR(255),
    IN p_payment_mode VARCHAR(50),
    IN p_total_value DECIMAL(10,2),
    IN p_gst_amount DECIMAL(10,2),
    IN p_amount_to_pay DECIMAL(10,2),
    IN p_transaction_id VARCHAR(255),
    IN p_catagory VARCHAR(255),
    IN p_quantity INT,
    IN p_created_by INT,
    IN p_products TEXT,
    IN p_gst_id VARCHAR(50),
    IN p_image_path VARCHAR(500)
)
BEGIN
    DECLARE next_order_num INT;
    DECLARE new_order_id VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_id, 5) AS UNSIGNED)), 0) + 1
    INTO next_order_num
    FROM billing 
    WHERE order_id LIKE 'VPOB%';

    SET new_order_id = CONCAT('VPOB', LPAD(next_order_num, 4, '0'));

    IF p_transaction_id = 'null' OR p_transaction_id = '' THEN
        SET p_transaction_id = NULL;
    END IF;

    IF p_transaction_id IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM transaction_id_list WHERE transaction_id = p_transaction_id) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Duplicate transaction ID!';
        END IF;

        INSERT INTO transaction_id_list (transaction_id)
        VALUES (p_transaction_id);
    END IF;

    -- Insert billing order
    INSERT INTO billing (
        order_id,
        lead_name,
        age,
        gender,
        mobile,
        email,
        order_value,
        discount,
        approved_by,
        payment_mode,
        total_value,
        gst_amount,
        amount_to_pay,
        transaction_id,
        catagory,
        quantity,
        created_by,
        product_list,
        gst_id,
        receipt_path
    ) VALUES (
        new_order_id,
        p_lead_name,
        p_age,
        p_gender,
        p_mobile,
        p_email,
        p_order_value,
        p_discount,
        p_approved_by,
        p_payment_mode,
        p_total_value,
        p_gst_amount,
        p_amount_to_pay,
        p_transaction_id,
        p_catagory,
        p_quantity,
        p_created_by,
        p_products,
        p_gst_id,
        p_image_path
    );

    SELECT new_order_id AS order_id;

    COMMIT;
END$$

DELIMITER ;