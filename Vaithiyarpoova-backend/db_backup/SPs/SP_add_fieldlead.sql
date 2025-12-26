/* ----------------------------------------------------------------------------------------------------------------- 
   NAME: aAjith
   DATE: 10/07/2025
   DESC: It is used to save lead entries to the fieldleads table with auto-generated flead_id (e.g., VPCF001)
         and updates leads_count_history table.
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_add_fieldlead`;

CREATE PROCEDURE `SP_add_fieldlead`(
    IN p_flead_name VARCHAR(100),
    IN p_shop_keeper VARCHAR(100),
    IN p_shop_type VARCHAR(100),
    IN p_mobile_number VARCHAR(15),
    IN p_alternate_number VARCHAR(15),
    IN p_email VARCHAR(100),
    IN p_gst VARCHAR(50),
    IN p_image_sales VARCHAR(350),
    IN p_created_by INT,
    IN p_country VARCHAR(255),
    IN p_state VARCHAR(255),
    IN p_city VARCHAR(255),
    IN p_location VARCHAR(255)
)
BEGIN
    DECLARE v_new_flead_id VARCHAR(20);
    DECLARE v_last_id_num INT DEFAULT 0;

    -- Get last numeric part of flead_id (e.g., 1 from VPCF001)
    SELECT 
        IFNULL(MAX(CAST(SUBSTRING(flead_id, 5) AS UNSIGNED)), 0)
    INTO v_last_id_num
    FROM fieldleads
    WHERE flead_id LIKE 'VPSC%';

    -- Generate new flead_id (e.g., VPCF001, VPCF002, etc.)
    SET v_new_flead_id = CONCAT('VPSC', LPAD(v_last_id_num + 1, 3, '0'));

    -- Insert the new record
    INSERT INTO fieldleads (
        flead_id, flead_name, shop_keeper, shop_type,
        mobile_number, alternate_number, email,
        gst, image_sales, created_by, created_at ,disposition_date,country,state,city,location
    )
    VALUES (
        v_new_flead_id, p_flead_name, p_shop_keeper, p_shop_type,
        p_mobile_number, p_alternate_number, p_email,
        p_gst, p_image_sales, p_created_by,
        CURRENT_TIMESTAMP , CURRENT_TIMESTAMP,p_country,p_state,p_city,p_location
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
    FROM fieldleads 
    WHERE flead_id = v_new_flead_id;
END //

DELIMITER ;
