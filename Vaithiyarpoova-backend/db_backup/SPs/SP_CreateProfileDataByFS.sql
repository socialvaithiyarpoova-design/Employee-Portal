/* ----------------------------------------------------------------------------------------------------------------- 
   NAME: Hariharan S
   DATE: 10/07/2025
   DESC: It is used to save lead entries to the fieldleads table.
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_CreateProfileDataByFS`;

CREATE PROCEDURE SP_CreateProfileDataByFS(
    IN p_lead_id VARCHAR(100),
    IN p_lead_name VARCHAR(255),
    IN p_age INT,
    IN p_gender VARCHAR(20),
    IN p_category VARCHAR(100),
    IN p_mobile_number VARCHAR(20),
    IN p_email VARCHAR(255),
    IN p_created_by INT
)
BEGIN
    INSERT INTO fieldleads (
        flead_id,
        flead_name,
        age,
        gender,
        category,
        mobile_number,
        email,
        created_by,
        created_at
    )
    VALUES (
        p_lead_id,
        p_lead_name,
        p_age,
        p_gender,
        p_category,
        p_mobile_number,
        p_email,
        p_created_by,
        NOW()
    );

    SELECT * FROM fieldleads ORDER BY created_at DESC LIMIT 1;
END //

DELIMITER ;
