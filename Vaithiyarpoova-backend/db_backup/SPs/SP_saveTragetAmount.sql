	
/* ----------------------------------------------------------------------------------------------------------------- 
   NAME: Hariharan S
   DATE: 13/08/2025
   DESC: It is used to insert or update target
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_saveTragetAmount`;

CREATE PROCEDURE SP_saveTragetAmount(
    IN p_department INT(11),
    IN p_code_des VARCHAR(50),
    IN p_amount DECIMAL(10,2)
)
BEGIN

    -- Check if record exists
    IF EXISTS (SELECT 1 FROM monthly_target WHERE created_to = p_department) THEN
        -- Update existing record
        UPDATE monthly_target
        SET 
            monthly_target = p_amount,
            created_at = NOW()  -- Update timestamp
        WHERE created_to = p_department;
    ELSE
        -- Insert new record
        INSERT INTO monthly_target (created_to,code_des, monthly_target, created_at)
        VALUES (p_department,p_code_des, p_amount, NOW());
    END IF;

END //

DELIMITER ;