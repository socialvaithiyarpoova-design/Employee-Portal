/* ----------------------------------------------------------------------------------------------------------------- 
   NAME: Hariharan S
   DATE: 10/07/2025
   DESC: It is used to save lead entries to the fieldleads table.
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_InsertSalesOrderForFS`;

CREATE PROCEDURE SP_InsertSalesOrderForFS(
    IN p_leads_id VARCHAR(50),
    IN p_direct_pickup INT,
    IN p_additional_number VARCHAR(20),
    IN p_address TEXT,
    IN p_district VARCHAR(50),
    IN p_state VARCHAR(50),
    IN p_country VARCHAR(50),
    IN p_pincode VARCHAR(50),
    IN p_courier VARCHAR(50),
    IN p_catagory VARCHAR(400),
    IN p_order_value DECIMAL(10,2),
    IN p_discount DECIMAL(10,2),
    IN p_approved_by VARCHAR(100),
    IN p_wallet DECIMAL(10,2),
    IN p_courier_amount VARCHAR(50),
    IN p_gst_amount DECIMAL(10,2),
    IN p_total_value DECIMAL(10,2),
    IN p_amount_to_pay DECIMAL(10,2),
    IN p_medication_period VARCHAR(50),
    IN p_receipt_image_url TEXT,
    IN p_transaction_id VARCHAR(100),
    IN p_date_time VARCHAR(100),
    IN p_user_id INT(11),
    IN p_cat_id VARCHAR(400),
    IN p_qty INT(11),
    IN rec_id VARCHAR(1000),
    IN stick_type VARCHAR(50),
    IN p_products_data VARCHAR(1000),
    IN p_gst_id INT(11),
    IN p_dispatch_id INT(11)
)
BEGIN

    DECLARE last_order_id INT;
    DECLARE next_order_num INT DEFAULT 0;
    DECLARE new_order_id VARCHAR(50);
    DECLARE p_order_id VARCHAR(50);
 
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_id, 4) AS UNSIGNED)), 0) + 1
    INTO next_order_num
    FROM fieldshopsales
    WHERE order_id LIKE 'VPCS%';

    SET new_order_id = CONCAT('VPCS', LPAD(next_order_num, 4, '0'));
    SET p_order_id = new_order_id;

    IF p_transaction_id = "null" THEN
        SET p_transaction_id = null;
    END IF;

    IF p_transaction_id IS NOT NULL AND p_transaction_id <> '' THEN
        IF EXISTS (SELECT 1 FROM transaction_id_list WHERE transaction_id = p_transaction_id) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Duplicate transaction ID!';
        END IF;
        INSERT INTO transaction_id_list (transaction_id)
        VALUES (p_transaction_id);
    END IF;

     INSERT INTO fieldshopsales (
        order_id, leads_id, direct_pickup, additional_number, address,
        district, state, country, courier,catagory, order_value, discount,
        approved_by, wallet,courier_amount,gst_amount, final_amount, total_value, amount_to_pay,
        payment_type, receipt_image_url, transaction_id, date_time,dispatch_id, created_by, order_name, quantity, Product_id, stick_type, product_list,gst_id
    ) VALUES (
        p_order_id, p_leads_id, p_direct_pickup, p_additional_number, p_address,
        p_district, p_state, p_country, p_courier,p_catagory, p_order_value, p_discount,
        p_approved_by, p_wallet,p_courier_amount,p_gst_amount, p_total_value, p_amount_to_pay,p_amount_to_pay,
        p_medication_period, p_receipt_image_url, p_transaction_id, p_date_time,p_dispatch_id, p_user_id , p_cat_id, p_qty, rec_id, stick_type, p_products_data,p_gst_id
    );

    SET last_order_id = LAST_INSERT_ID();

    INSERT INTO purchased_product (order_recid, product_recid, product_id, product_name, qty, price, type)
    SELECT
        last_order_id,
        jt.rec_id,
        jt.id,
        jt.name,
        jt.qty,
        jt.price,
        "FSL"
    FROM JSON_TABLE(
        p_products_data,
        '$[*]' COLUMNS (
            rec_id INT PATH '$.rec_id',
            id VARCHAR(50) PATH '$.id',
            name VARCHAR(250) PATH '$.name',
            qty INT PATH '$.qty',
            price DECIMAL(10,2) PATH '$.price'
        )
    ) AS jt;

     SET SQL_SAFE_UPDATES = 0;
        UPDATE fieldleads 
        SET disposition = "Interested",
        interested_type = "Sale"
        WHERE created_by = p_user_id AND flead_id = p_leads_id;
	SET SQL_SAFE_UPDATES = 1;
    

END //

DELIMITER ;
