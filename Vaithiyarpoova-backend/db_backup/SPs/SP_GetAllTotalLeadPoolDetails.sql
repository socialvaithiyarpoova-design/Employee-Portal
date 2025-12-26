

-- DROP PROCEDURE IF EXISTS `SP_GetAllTotalLeadPoolDetails`;

-- CREATE PROCEDURE `SP_GetAllTotalLeadPoolDetails`(
--     IN branch_id    INT(11),
--     IN employee_id  INT(11),
--     IN startDate    VARCHAR(100),
--     IN endDate      VARCHAR(100)
-- )
-- BEGIN
--     DECLARE sCondition TEXT DEFAULT '';
--     DECLARE sFilter TEXT DEFAULT '';

--     -- ✅ Date filter
--     IF startDate IS NOT NULL AND endDate IS NOT NULL 
--        AND startDate <> '' AND endDate <> '' THEN 
--         SET sCondition = CONCAT(" AND DATE(LD.created_at) BETWEEN '", startDate, "' AND '", endDate, "' ");
--     ELSE
--         SET sCondition = ""; -- show all if no dates
--     END IF;

--     -- ✅ Branch filter
--     IF branch_id IS NOT NULL AND branch_id <> 0 THEN
--         SET sFilter = CONCAT(sFilter, " AND U.created_by IN (
--             SELECT branch_incharge_recid FROM branches WHERE branch_recid = ", branch_id, "
--         ) ");
--     END IF;

--     -- ✅ Employee filter
--     IF employee_id IS NOT NULL AND employee_id <> 0 THEN
--         SET sFilter = CONCAT(sFilter, " AND U.user_id = ", employee_id, " ");
--     END IF;

--     -- ✅ Main query
--     SET @sQuery = CONCAT("
--         SELECT 
--             U.user_id AS id,
--             U.name AS emp_name,
--             U.emp_id AS emp_id,
--             IFNULL(COUNT(DISTINCT LD.lead_id), 0) AS lead_count,
--             GROUP_CONCAT(DISTINCT IFNULL(BR.branch_recid, '0')) AS branch_id,
--             GROUP_CONCAT(DISTINCT IFNULL(BR.branch_name, 'Admin')) AS branch_name,
--             IFNULL(SUM(CASE WHEN PM.gst_level = 'Gold' THEN 1 ELSE 0 END), 0) AS gold_count,
--             IFNULL(SUM(CASE WHEN PM.gst_level = 'Silver' THEN 1 ELSE 0 END), 0) AS silver_count,
--             IFNULL(SUM(CASE WHEN PM.gst_level = 'Bronze' THEN 1 ELSE 0 END), 0) AS bronze_count
--         FROM users AS U
--         LEFT JOIN branches AS BR ON BR.branch_incharge_recid = U.created_by
--         LEFT JOIN leads AS LD ON LD.created_by = U.user_id ", sCondition, "
--         LEFT JOIN (
--             SELECT 
--                 S.leads_id, 
--                 SUM(S.total_value) AS amount
--             FROM sales AS S
--             GROUP BY S.leads_id
--         ) AS LS ON LS.leads_id = LD.lead_id
--         LEFT JOIN (
--             SELECT 
--                 p1.gst_level, 
--                 p1.amount, 
--                 p1.icon  
--             FROM premium_master p1
--             WHERE client_type = 'People'
--         ) PM ON LS.amount >= PM.amount
--            AND PM.amount = (
--                SELECT MAX(p2.amount)
--                FROM premium_master p2
--                WHERE p2.client_type = 'People'
--                AND LS.amount >= p2.amount
--            )
--         WHERE 1=1 ", sFilter, "
--         GROUP BY U.user_id, U.name, U.emp_id
--         ORDER BY U.name ASC;
--     ");

--     -- Debug (optional)
--     -- SELECT @sQuery;

--     PREPARE stmt FROM @sQuery;
--     EXECUTE stmt;
--     DEALLOCATE PREPARE stmt;
-- END//

-- DELIMITER ;


DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAllTotalLeadPoolDetails`;

CREATE PROCEDURE `SP_GetAllTotalLeadPoolDetails`(
    IN branch_id    INT(11),
    IN employee_id  INT(11),
    IN startDate    VARCHAR(100),
    IN endDate      VARCHAR(100)
)
BEGIN
    DECLARE sCondition TEXT DEFAULT '';
    DECLARE sFilter TEXT DEFAULT '';

    -- ✅ Date filter
    IF startDate IS NOT NULL AND endDate IS NOT NULL 
       AND startDate <> '' AND endDate <> '' THEN 
        SET sCondition = CONCAT(" AND DATE(LD.created_at) BETWEEN '", startDate, "' AND '", endDate, "' ");
    ELSE
        SET sCondition = ""; -- show all if no dates
    END IF;

    -- ✅ Branch filter
    IF branch_id IS NOT NULL AND branch_id <> 0 THEN
        SET sFilter = CONCAT(sFilter, " AND U.created_by IN (
            SELECT branch_incharge_recid FROM branches WHERE branch_recid = ", branch_id, "
        ) ");
    END IF;

    -- ✅ Employee filter
    IF employee_id IS NOT NULL AND employee_id <> 0 THEN
        SET sFilter = CONCAT(sFilter, " AND U.user_id = ", employee_id, " ");
    END IF;

    -- ✅ Main query
    SET @sQuery = CONCAT("
        SELECT 
            U.user_id AS id,
            U.name AS emp_name,
            U.emp_id AS emp_id,
            IFNULL(COUNT(DISTINCT LD.lead_id), 0) AS lead_count,
            GROUP_CONCAT(DISTINCT IFNULL(BR.branch_recid, '0')) AS branch_id,
            GROUP_CONCAT(DISTINCT IFNULL(BR.branch_name, 'Admin')) AS branch_name,
            IFNULL(SUM(CASE WHEN PM.gst_level = 'Gold' THEN 1 ELSE 0 END), 0) AS gold_count,
            IFNULL(SUM(CASE WHEN PM.gst_level = 'Silver' THEN 1 ELSE 0 END), 0) AS silver_count,
            IFNULL(SUM(CASE WHEN PM.gst_level = 'Bronze' THEN 1 ELSE 0 END), 0) AS bronze_count
        FROM users AS U
        LEFT JOIN branches AS BR ON BR.branch_incharge_recid = U.created_by
        LEFT JOIN leads AS LD ON LD.created_by = U.user_id ", sCondition, "
        LEFT JOIN (
            SELECT 
                S.leads_id, 
                SUM(S.total_value) AS amount
            FROM sales AS S
            GROUP BY S.leads_id
        ) AS LS ON LS.leads_id = LD.lead_id
        LEFT JOIN (
            SELECT 
                p1.gst_level, 
                p1.amount, 
                p1.icon  
            FROM premium_master p1
            WHERE client_type = 'People'
        ) PM ON LS.amount >= PM.amount
           AND PM.amount = (
               SELECT MAX(p2.amount)
               FROM premium_master p2
               WHERE p2.client_type = 'People'
               AND LS.amount >= p2.amount
           )
        WHERE 1=1 
          AND (
            U.designation IN ('Telecalling sales', 'Telecalling class', 'Front office incharge' ,'Vaithiyar')
            OR U.designation LIKE 'Field Sales%'
          )
          ", sFilter, "
        GROUP BY U.user_id, U.name, U.emp_id
        ORDER BY U.name ASC
    ");

    -- Debug (optional)
    -- SELECT @sQuery;

    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;