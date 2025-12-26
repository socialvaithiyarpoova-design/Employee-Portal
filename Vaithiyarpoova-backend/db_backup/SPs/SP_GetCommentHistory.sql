DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetCommentHistory`;

CREATE PROCEDURE `SP_GetCommentHistory`(
	IN p_lead_recid INT(11),
    IN p_code VARCHAR(50)
 )
BEGIN

    IF p_code = "FS" THEN 

        SELECT 
            CH.id,
            LD.flead_id,
            LD.flead_name,
            LD.mobile_number,
            CH.disposition,
            CH.date_value,
            CH.comment
        FROM
            comment_history AS CH
                LEFT JOIN
            fieldleads AS LD ON LD.flead_recid = CH.lead_id
        WHERE
            CH.lead_id = p_lead_recid
        ORDER BY 1 DESC;

    ELSE

        SELECT 
            CH.id,
            LD.lead_id,
            LD.lead_name,
            LD.mobile_number,
            CH.disposition,
            CH.date_value,
            CH.comment
        FROM
            comment_history AS CH
                LEFT JOIN
            leads AS LD ON LD.lead_recid = CH.lead_id
        WHERE
            CH.lead_id = p_lead_recid
        ORDER BY 1 DESC;

    END IF;
    
END//
DELIMITER ;