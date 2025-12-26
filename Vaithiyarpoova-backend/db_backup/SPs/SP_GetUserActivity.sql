/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith S
 DATE: 22/11/2025
 DESC: It is used to get user activity details
 MODIFIED: Added branch_id filter logic
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetUserActivity`;

CREATE PROCEDURE `SP_GetUserActivity`(
    IN usertype_code VARCHAR(10),
    IN startDate VARCHAR(50),
    IN endDate VARCHAR(50),
    IN sStatus VARCHAR(50),
    IN p_id INT(11),
    IN type VARCHAR(50),
    IN branch_id INT(11)
)
BEGIN
    DECLARE sCondition VARCHAR(1000) DEFAULT '';

    -- Check if both dates are provided
    IF (startDate IS NOT NULL AND startDate != '') AND (endDate IS NOT NULL AND endDate != '') THEN
        SET sCondition = CONCAT("AND DATE(UA.created_at) BETWEEN DATE('", startDate, "') AND DATE('", endDate, "') ");
    END IF;

    IF sStatus IS NOT NULL AND sStatus != "" THEN 
        SET sCondition = CONCAT(sCondition, " AND UA.user_status = '", sStatus, "' ");
    END IF;

    IF type IS NOT NULL AND type != "" THEN
       SET sCondition = CONCAT(sCondition, " AND UA.leave_type = '", type, "' ");
    END IF;

    -- Add branch filter if branch_id is provided
    IF branch_id IS NOT NULL AND branch_id != 0 THEN
        SET sCondition = CONCAT(sCondition, " AND US.branch_rceid = ", branch_id, " ");
    END IF;

    -- Query for Admin user
    IF usertype_code = "AD" THEN
        SET @sQuery = CONCAT("
            SELECT 
                 UA.lp_recid            AS lp_recid
                ,UA.from_date           AS from_date
                ,UA.to_date             AS to_date
                ,UA.leave_type          AS leave_type
                ,UA.action              AS action
                ,UA.duration            AS duration
                ,UA.from_time           AS from_time
                ,UA.to_time             AS to_time
                ,UA.Reason              AS Reason
                ,UA.user_status         AS user_status
                ,UA.user_id             AS user_id
                ,UA.created_by          AS created_by
                ,UA.created_at          AS created_at
                ,UA.updated_at          AS updated_at
                ,US.emp_id              AS emp_id
                ,US.name                AS emp_name
                ,US.branch_rceid        AS branch_id
                ,CB.emp_id              AS created_by_emp_id
                ,CB.name                AS created_by_name
            FROM
                user_activity AS UA
            LEFT JOIN users AS US ON US.user_id = UA.user_id
            LEFT JOIN users AS CB ON CB.user_id = UA.created_by
            WHERE UA.lp_recid IS NOT NULL
            ", IFNULL(sCondition, ''), "
            ORDER BY UA.lp_recid DESC");

        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    ELSE 
        SET @sQuery = CONCAT("
            SELECT 
                 UA.lp_recid            AS lp_recid
                ,UA.from_date           AS from_date
                ,UA.to_date             AS to_date
                ,UA.leave_type          AS leave_type
                ,UA.action              AS action
                ,UA.duration            AS duration
                ,UA.from_time           AS from_time
                ,UA.to_time             AS to_time
                ,UA.Reason              AS Reason
                ,UA.user_status         AS user_status
                ,UA.user_id             AS user_id
                ,UA.created_by          AS created_by
                ,UA.created_at          AS created_at
                ,UA.updated_at          AS updated_at
                ,US.emp_id              AS emp_id
                ,US.name                AS emp_name
                ,US.branch_rceid        AS branch_id
                ,CB.emp_id              AS created_by_emp_id
                ,CB.name                AS created_by_name
            FROM
                user_activity AS UA
            LEFT JOIN users AS US ON US.user_id = UA.user_id
            LEFT JOIN users AS CB ON CB.user_id = UA.created_by
            WHERE UA.created_by = ", p_id, "
            ", IFNULL(sCondition, ''), "
            ORDER BY UA.lp_recid DESC");

        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;

END//

DELIMITER ;