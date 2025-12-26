/* ----------------------------------------------------------------------------------------------------------------- 
   NAME: Ajithkumar S
   DATE: 10/07/2025
   DESC: Saves lead entries to the leads table with auto-generated lead_id (VPC001, VPC002...).
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_CreateProfileData`;

CREATE PROCEDURE `SP_CreateProfileData`(
    IN p_lead_name      VARCHAR(255),
    IN p_age            INT,
    IN p_gender         VARCHAR(20),
    IN p_mobile_number  VARCHAR(20),
    IN p_email          VARCHAR(255),
    IN p_created_by     INT,
    IN p_country        VARCHAR(255),
    IN p_state          VARCHAR(255),
    IN p_city           VARCHAR(255),
    IN p_location       VARCHAR(255)
)
BEGIN
    DECLARE v_new_lead_id VARCHAR(20);
    DECLARE v_last_id_num INT DEFAULT 0;

    -- Get last numeric part of lead_id (e.g., 1 from VPC001)
    SELECT 
        IFNULL(MAX(CAST(SUBSTRING(lead_id, 4) AS UNSIGNED)), 0)
    INTO v_last_id_num
    FROM leads
    WHERE lead_id LIKE 'VPC%';

    -- Generate new lead_id
    SET v_new_lead_id = CONCAT('VPC', LPAD(v_last_id_num + 1, 3, '0'));

    -- Insert new lead
    INSERT INTO leads (
        lead_id,
        lead_name,
        age,
        gender,
        mobile_number,
        email,
        created_by,
        created_at,
        country,
        state,
        city,
        location,
        disposition_date
    )
    VALUES (
        v_new_lead_id,
        p_lead_name,
        p_age,
        p_gender,
        p_mobile_number,
        p_email,
        p_created_by,
        NOW(),
        p_country,
        p_state,
        p_city,
        p_location,
        NOW()
    );

    -- Update leads_count_history
    UPDATE leads_count_history
    SET lead_count = CASE
                        WHEN lead_count > 0 THEN lead_count - 1
                        ELSE 0
                     END
    WHERE created_by = p_created_by
      AND DATE(created_at) = CURDATE();  

    -- Return the newly inserted record
    SELECT * 
    FROM leads 
    WHERE lead_id = v_new_lead_id;
END //

DELIMITER ;