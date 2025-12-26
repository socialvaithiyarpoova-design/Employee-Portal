/* ----------------------------------------------------------------------------------------------------------------- 
   NAME: Hariharan S
   VARCHAR(100): 22/07/2025
   DESC: It is used to save class entries to the leads table.
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_InsertClassRegister`;

CREATE PROCEDURE SP_InsertClassRegister(
    IN reg_no VARCHAR(50), IN reg_date VARCHAR(50), IN reg_time VARCHAR(20), IN marital_status VARCHAR(20), IN married_date VARCHAR(100),

    IN male_name VARCHAR(100), IN male_dob VARCHAR(100), IN male_mobile VARCHAR(20), IN male_email VARCHAR(100),
    IN male_tests_taken VARCHAR(10), IN male_tests_details TEXT, IN male_infertility_reason VARCHAR(100),
    IN male_infertility_causes VARCHAR(100), IN male_remark TEXT,

    IN female_name VARCHAR(100), IN female_dob VARCHAR(100), IN female_mobile VARCHAR(20), IN female_email VARCHAR(100),
    IN female_tests_taken VARCHAR(10), IN female_tests_details TEXT, IN female_infertility_reason VARCHAR(100),
    IN female_infertility_causes VARCHAR(100), IN female_remark TEXT,

    IN created_by VARCHAR(100), IN created_at DATETIME,

    IN country VARCHAR(100), IN state VARCHAR(100), IN city VARCHAR(100), IN pincode VARCHAR(10),
    IN preferred_date VARCHAR(100), IN preferred_time VARCHAR(20),
    IN class_type VARCHAR(50), IN remark TEXT,

    IN price_value DECIMAL(10,2), IN amount_to_pay DECIMAL(10,2), IN discount DECIMAL(10,2),
    IN approved_by VARCHAR(100), IN transaction_id VARCHAR(100), IN payment_date VARCHAR(50), IN receipt_path TEXT, IN p_lead_recid INT(11), IN assigned_to INT(11),
    IN gst_id INT(11) ,IN gst_amount DECIMAL(10,2)
)
BEGIN
     IF transaction_id = "null" THEN
        SET transaction_id = null;
    END IF;

    IF transaction_id IS NOT NULL AND transaction_id <> '' THEN
        IF EXISTS (SELECT 1 FROM transaction_id_list t WHERE t.transaction_id = transaction_id) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Duplicate transaction ID!';
        END IF;

        INSERT INTO transaction_id_list(transaction_id)
        VALUES (transaction_id);
    END IF;

    INSERT INTO class_register (
        reg_no, reg_date, reg_time, marital_status, married_date,
        male_name, male_dob, male_mobile, male_email, male_tests_taken, male_tests_details,
        male_infertility_reason, male_infertility_causes, male_remark,
        female_name, female_dob, female_mobile, female_email, female_tests_taken, female_tests_details,
        female_infertility_reason, female_infertility_causes, female_remark,
        created_by, created_at, country, state, city, pincode,
        preferred_date, preferred_time, class_type, remark,
        price_value, amount_to_pay, discount, approved_by, transaction_id, payment_date, receipt_path, owned_by , assigned_to,gst_id,gst_amount
    ) VALUES (
        reg_no, reg_date, reg_time, marital_status, married_date,
        male_name, male_dob, male_mobile, male_email, male_tests_taken, male_tests_details,
        male_infertility_reason, male_infertility_causes, male_remark,
        female_name, female_dob, female_mobile, female_email, female_tests_taken, female_tests_details,
        female_infertility_reason, female_infertility_causes, female_remark,
        created_by, created_at, country, state, city, pincode,
        preferred_date, preferred_time, class_type, remark,
        price_value, amount_to_pay, discount, approved_by, transaction_id, payment_date, receipt_path , p_lead_recid , assigned_to,gst_id,gst_amount
    );

    SET SQL_SAFE_UPDATES = 0;
        UPDATE leads 
        SET disposition = "Interested",
        interested_type = "Class",
        disposition_date = NOW()
        WHERE lead_recid = p_lead_recid ;
	SET SQL_SAFE_UPDATES = 1;
END //

DELIMITER ;
