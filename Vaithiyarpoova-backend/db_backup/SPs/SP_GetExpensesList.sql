/* ----------------------------------------------------------------------------------------------------------------- 
NAME: Assistant
DATE: Current Date
DESC: It is used to get expenses list with branch names
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetExpensesList`;

CREATE PROCEDURE `SP_GetExpensesList`(
    IN start_date VARCHAR(100),
    IN end_date VARCHAR(100),
    IN status VARCHAR(100),
    IN branch INT
)
BEGIN
    DECLARE sCondition TEXT DEFAULT '';

    IF end_date IS NOT NULL AND start_date IS NOT NULL AND start_date <> '' AND end_date <> '' THEN 
        SET sCondition = CONCAT(" AND DATE(E.date_time) BETWEEN '", start_date, "' AND '", end_date, "' ");
    END IF;

    IF status  <> ''  THEN 
        SET sCondition = CONCAT(" AND E.status = '",status,"' ");
    END IF;

    IF branch IS NOT NULL AND branch > 0 THEN 
        SET sCondition = CONCAT(sCondition, " AND B.branch_recid = ", branch, " ");
    END IF;

    SET @sQuery = CONCAT("
        SELECT DISTINCT
            E.id,
            E.bill_type,
            E.amount,
            E.transaction_id,
            E.date_time,
            E.created_at,
            E.receipt_image,
            E.status,
            E.decline_reason,
            E.created_by,
            U.emp_id,
            U.name,
            B.branch_id,
            B.branch_name
        FROM expenses E
        LEFT JOIN users U ON E.created_by = U.user_id
        LEFT JOIN branches AS B ON B.branch_recid = U.branch_rceid
        WHERE 1=1
     ", sCondition, "
        ORDER BY E.id DESC
    ");

    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END//

DELIMITER ;
