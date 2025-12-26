-- /* ----------------------------------------------------------------------------------------------------------------- 
--  NAME: Hariharan S
--  DATE: 15/07/2025
--  DESC: It is used to get all user designation
--  ----------------------------------------------------------------------------------------------------------------- */
-- DELIMITER //
-- DROP PROCEDURE IF EXISTS `SP_GetAllTodoList`;

-- CREATE PROCEDURE `SP_GetAllTodoList`(
--     IN userId INT(11),
--     IN sType VARCHAR(50),
--     IN user_typecode VARCHAR(50)
-- )
-- BEGIN

--     IF user_typecode = "FS" THEN 
--         IF sType = "Leads" THEN 
--             SELECT * FROM fieldleads WHERE created_by = userId  AND (disposition IS NULL OR disposition != 'Not interested')  ORDER BY created_at DESC;
--         ELSE 
--             SELECT * FROM fieldleads WHERE disposition = sType AND DATE(disposition_date) = DATE(NOW()) AND created_by = userId   ORDER BY created_at DESC;
--         END IF;
--     ELSE
--         IF sType = "Leads" THEN 
--             SELECT * FROM leads WHERE created_by = userId  AND (disposition IS NULL OR disposition != 'Not interested')  ORDER BY created_at DESC;
--         ELSE 
--             SELECT * FROM leads WHERE disposition = sType AND DATE(disposition_date) = DATE(NOW()) AND created_by = userId   ORDER BY created_at DESC;
--         END IF;
--     END IF;
   
-- END//

-- DELIMITER ;


DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllTodoList`;

CREATE PROCEDURE `SP_GetAllTodoList`(
    IN userId INT(11),
    IN sType VARCHAR(50),
    IN user_typecode VARCHAR(50),
    IN p_disposition VARCHAR(50)  // add this line
)
BEGIN

    IF user_typecode = "FS" THEN 
        IF sType = "Leads" THEN 
            SELECT * FROM fieldleads WHERE created_by = userId  AND (disposition IS NULL OR disposition != 'Not interested')
            AND (p_disposition IS NULL OR p_disposition = '' OR disposition = p_disposition)   // add this line
            ORDER BY created_at DESC;
        ELSE 
            SELECT * FROM fieldleads WHERE disposition = sType AND DATE(disposition_date) = DATE(NOW()) AND created_by = userId
            AND (p_disposition IS NULL OR p_disposition = '' OR disposition = p_disposition)  // add this line
            ORDER BY created_at DESC;
        END IF;
    ELSE
        IF sType = "Leads" THEN 
            SELECT * FROM leads WHERE created_by = userId  AND (disposition IS NULL OR disposition != 'Not interested')
            AND (p_disposition IS NULL OR p_disposition = '' OR disposition = p_disposition)  // add this line
            ORDER BY created_at DESC;
        ELSE 
            SELECT * FROM leads WHERE disposition = sType AND DATE(disposition_date) = DATE(NOW()) AND created_by = userId  
            AND (p_disposition IS NULL OR p_disposition = '' OR disposition = p_disposition)  // add this line
            ORDER BY created_at DESC;
        END IF;
    END IF;
   
END//

DELIMITER ;