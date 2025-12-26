
-- /* ----------------------------------------------------------------------------------------------------------------- 
--  NAME: Hariharan S
--  DATE: 30/05/2025
--  DESC: It is used to get attendance details
--  ----------------------------------------------------------------------------------------------------------------- */
-- DELIMITER //

-- DROP PROCEDURE IF EXISTS `SP_GetAttendanceData`;

-- CREATE PROCEDURE `SP_GetAttendanceData`(
--     IN usertype_code VARCHAR(10),
--     IN startDate VARCHAR(50),
--     IN endDate VARCHAR(50),
--     IN sStatus VARCHAR(50),
--     IN p_id INT(11)
-- )
-- BEGIN
--     DECLARE sCondition VARCHAR(1000) DEFAULT '';

--     -- Check if both dates are provided
--     IF (startDate IS NOT NULL AND startDate != '') AND (endDate IS NOT NULL AND endDate != '') THEN
--         SET sCondition = CONCAT(" AND DATE(AT.date) BETWEEN DATE('", startDate, "') AND DATE('", endDate, "') ");
--     ELSE
--         SET sCondition = " AND DATE(date) = DATE(NOW()) ";
--     END IF;

--     IF sStatus != null OR sStatus != "" THEN 
--         SET sCondition = CONCAT(sCondition, CONCAT(" AND AT.status = '",sStatus,"' "));
--     END IF;

--     -- Query for Admin user
--     IF usertype_code = "AD" THEN
--         SET @sQuery = CONCAT("SELECT 
--             attendance_id    AS attendance_id,
--             emp_id           AS emp_id,
--             emp_name         AS emp_name,
--             designation      AS designation,
--             work_type        AS work_type,
--             duration         AS duration,
--             date             AS date,
--             login_time       AS login_time,
--             logoff_time      AS logoff_time,
--             status           AS status
--         FROM
--             attendance AS AT WHERE attendance_id IS NOT NULL
--         ", IFNULL(sCondition, ''), "
--         ORDER BY attendance_id DESC");

--         -- SELACT @sQuery;
--         PREPARE stmt FROM @sQuery;
--         EXECUTE stmt;
--         DEALLOCATE PREPARE stmt;

--     ELSE

--         SET @sQuery = CONCAT("
--                                 SELECT 
--                                     AT.attendance_id    AS attendance_id,
--                                     AT.emp_id           AS emp_id,
--                                     AT.emp_name         AS emp_name,
--                                     AT.designation      AS designation,
--                                     AT.work_type        AS work_type,
--                                     AT.duration         AS duration,
--                                     AT.date             AS date,
--                                     AT.login_time       AS login_time,
--                                     AT.logoff_time      AS logoff_time,
--                                     AT.status           AS status
--                                 FROM
--                                     attendance AS AT 
--                                 LEFT JOIN users AS US ON US.emp_id =AT.emp_id WHERE US.created_by = ",p_id,"
--                                  ", IFNULL(sCondition, ''), "
--                                 ORDER BY attendance_id DESC
--         ");

--                 -- SELACT @sQuery;
--                 PREPARE stmt FROM @sQuery;
--                 EXECUTE stmt;
--                 DEALLOCATE PREPARE stmt;

--     END IF;

-- END//

-- DELIMITER ;




/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 30/05/2025
 DESC: It is used to get attendance details
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAttendanceData`;

CREATE PROCEDURE `SP_GetAttendanceData`(
    IN usertype_code VARCHAR(10),
    IN startDate VARCHAR(50),
    IN endDate VARCHAR(50),
    IN sStatus VARCHAR(50),
    IN branch_id INT(11),
    IN p_id INT(11)
)
BEGIN
    DECLARE sCondition VARCHAR(1000) DEFAULT '';

    -- Check if both dates are provided
    IF (startDate IS NOT NULL AND startDate != '') AND (endDate IS NOT NULL AND endDate != '') THEN
        SET sCondition = CONCAT(" AND DATE(AT.date) BETWEEN DATE('", startDate, "') AND DATE('", endDate, "') ");
    ELSE
        SET sCondition = " AND DATE(date) = DATE(NOW()) ";
    END IF;

      -- Status filter
    IF sStatus IS NOT NULL AND sStatus != "" THEN 
        SET sCondition = CONCAT(sCondition, " AND AT.status = '", sStatus, "' ");
    END IF;

    -- Branch filter
    IF branch_id IS NOT NULL AND branch_id != 0 THEN
        SET sCondition = CONCAT(sCondition, " AND US.branch_rceid = ", branch_id, " ");
    END IF;

    -- Query for Admin user
IF usertype_code = "AD" THEN
        SET @sQuery = CONCAT("
            SELECT 
                AT.attendance_id AS attendance_id,
                AT.emp_id        AS emp_id,
                AT.emp_name      AS emp_name,
                AT.designation   AS designation,
                AT.work_type     AS work_type,
                AT.duration      AS duration,
                AT.date          AS date,
                AT.login_time    AS login_time,
                AT.logoff_time   AS logoff_time,
                AT.status        AS status,
                US.branch_rceid  AS branch_id
            FROM attendance AS AT
            LEFT JOIN users AS US ON US.emp_id = AT.emp_id
            WHERE AT.attendance_id IS NOT NULL
            ", IFNULL(sCondition, ''), "
            ORDER BY AT.attendance_id DESC
        ");

        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

    ELSE
        -- Query for non-admin user
        SET @sQuery = CONCAT("
            SELECT 
                AT.attendance_id AS attendance_id,
                AT.emp_id        AS emp_id,
                AT.emp_name      AS emp_name,
                AT.designation   AS designation,
                AT.work_type     AS work_type,
                AT.duration      AS duration,
                AT.date          AS date,
                AT.login_time    AS login_time,
                AT.logoff_time   AS logoff_time,
                AT.status        AS status,
                US.branch_rceid  AS branch_id
            FROM attendance AS AT
            LEFT JOIN users AS US ON US.emp_id = AT.emp_id
            WHERE US.created_by = ", p_id, "
            ", IFNULL(sCondition, ''), "
            ORDER BY AT.attendance_id DESC
        ");

        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

    END IF;

END//

DELIMITER ;