/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 15/07/2025
 DESC: It is used to get all user designation
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_UpdateLeads`;

CREATE PROCEDURE `SP_UpdateLeads`(
    IN userId       INT(11),
    IN sDisposition VARCHAR(50),
    IN sDateValue   VARCHAR(50),
    IN lead_id      INT(11),
    IN comment      VARCHAR(10000),
    IN usertype_code VARCHAR(20)
)
BEGIN
  
    IF usertype_code = "FS" THEN 
        SET SQL_SAFE_UPDATES = 0;
            UPDATE fieldleads 
            SET disposition = sDisposition, disposition_date = sDateValue, comments = comment
            WHERE flead_recid = lead_id AND created_by = userId;
        SET SQL_SAFE_UPDATES = 1;

        IF sDisposition != "Interested" THEN

            INSERT INTO comment_history (
                user_id,
                disposition,
                date_value,
                lead_id,
                comment,
                usertype_code,
                type
            ) VALUES (
                userId, sDisposition, sDateValue, lead_id, comment, usertype_code, "FS"
            );
        END IF;

    ELSE
        SET SQL_SAFE_UPDATES = 0;
            UPDATE leads 
            SET disposition = sDisposition, disposition_date = sDateValue, comments = comment
            WHERE lead_recid = lead_id AND created_by = userId;
        SET SQL_SAFE_UPDATES = 1;

        IF sDisposition != "Interested" THEN
        
            INSERT INTO comment_history (
                user_id,
                disposition,
                date_value,
                lead_id,
                comment,
                usertype_code,
                type
            ) VALUES (
                userId, sDisposition, sDateValue, lead_id, comment, usertype_code, "SL"
            );
        END IF;

    END IF;

   
END//

DELIMITER ;