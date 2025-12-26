-- /* -----------------------------------------------------------------------------------------------------------------
--  NAME: Ajith K
--  DATE: 25/06/2025
--  DESC: Get all lead details based on disposition_date; includes daily lead usage and remaining lead count
--  ----------------------------------------------------------------------------------------------------------------- */
-- DELIMITER //

-- DROP PROCEDURE IF EXISTS `SP_GetAllLeadPoolDetails`;

-- CREATE PROCEDURE `SP_GetAllLeadPoolDetails`(
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
--         SET sCondition = CONCAT(" AND DATE(LD.disposition_date) BETWEEN '", startDate, "' AND '", endDate, "' ");
--     ELSE
--         SET sCondition = "";  -- no date filter
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

--     -- ✅ Final Query
--     SET @sQuery = CONCAT("
--         SELECT 
--             U.user_id,
--             GROUP_CONCAT(DISTINCT B.branch_recid) AS branch_id,
--             GROUP_CONCAT(DISTINCT B.branch_name) AS branch_name,
--             U.emp_id,
--             U.name AS emp_name,

--             -- ✅ Daily lead summary from leads table
--             IFNULL(SUM(CASE WHEN DATE(LD.created_at) = CURDATE() THEN 1 ELSE 0 END), 0) AS created_leads_today,

--             -- ✅ Daily lead summary from fieldleads table
--             IFNULL(SUM(CASE WHEN DATE(LD.created_at) = CURDATE() THEN 1 ELSE 0 END), 0) AS created_fieldleads_today,

--             -- ✅ Remaining leads for today
--             IFNULL(LHT.lead_count, 0) AS remaining_leads_today,

--             -- ✅ Total assigned today
--             (IFNULL(SUM(CASE WHEN DATE(LD.created_at) = CURDATE() THEN 1 ELSE 0 END), 0) + IFNULL(LHT.lead_count, 0)) AS lead_count,

--             -- ✅ Disposition counts
--             IFNULL(SUM(CASE WHEN LD.disposition = 'Call back' THEN 1 ELSE 0 END), 0) AS callback_count,
--             IFNULL(SUM(CASE WHEN LD.disposition = 'Follow up' THEN 1 ELSE 0 END), 0) AS followup_count,
--             IFNULL(SUM(CASE WHEN LD.disposition = 'Call not response' THEN 1 ELSE 0 END), 0) AS not_response_count

--         FROM users AS U
--         LEFT JOIN branches AS B ON B.branch_incharge_recid = U.created_by
--         LEFT JOIN leads AS LD ON LD.created_by = U.user_id ", sCondition, "
--         LEFT JOIN (
--             SELECT created_by, SUM(lead_count) AS lead_count
--             FROM leads_count_history
--             WHERE DATE(created_at) = CURDATE()
--             GROUP BY created_by
--         ) AS LHT ON LHT.created_by = U.user_id

--         WHERE 1=1 
--           AND U.designation IN ('Telecalling sales', 'Telecalling class', 'Field Sales', 'Front office incharge', 'Vaithiyar') 
--           ", sFilter, "
--         GROUP BY U.user_id, U.name
--         ORDER BY U.name ASC
--     ");

--     PREPARE stmt FROM @sQuery;
--     EXECUTE stmt;
--     DEALLOCATE PREPARE stmt;
-- END //

-- DELIMITER ;


/* -----------------------------------------------------------------------------------------------------------------
 NAME: Ajith K
 DATE: 25/06/2025
 DESC: Get all lead details based on disposition_date; includes daily lead usage and remaining lead count
 ----------------------------------------------------------------------------------------------------------------- */
DDELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAllLeadPoolDetails`;

CREATE PROCEDURE `SP_GetAllLeadPoolDetails`(
    IN branch_id    INT(11),
    IN employee_id  INT(11),
    IN startDate    VARCHAR(100),
    IN endDate      VARCHAR(100)
)
BEGIN
    DECLARE sCondition TEXT DEFAULT '';
    DECLARE sConditionFL TEXT DEFAULT '';
    DECLARE sFilter TEXT DEFAULT '';

    -- ✅ Date filter for leads
    IF startDate IS NOT NULL AND endDate IS NOT NULL 
       AND startDate <> '' AND endDate <> '' THEN 
        SET sCondition = CONCAT(" AND DATE(LD.disposition_date) BETWEEN '", startDate, "' AND '", endDate, "' ");
        SET sConditionFL = CONCAT(" AND DATE(FL.disposition_date) BETWEEN '", startDate, "' AND '", endDate, "' ");
    ELSE
        SET sCondition = "";
        SET sConditionFL = "";
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

    -- ✅ Final Query
    SET @sQuery = CONCAT("
        SELECT 
            U.user_id,
            GROUP_CONCAT(DISTINCT B.branch_recid) AS branch_id,
            GROUP_CONCAT(DISTINCT B.branch_name) AS branch_name,
            U.emp_id,
            U.name AS emp_name,

            -- ✅ Daily lead summary from leads table
            IFNULL(SUM(CASE WHEN DATE(LD.created_at) = CURDATE() THEN 1 ELSE 0 END), 0) AS created_leads_today,

            -- ✅ Daily lead summary from fieldleads table
            IFNULL(SUM(CASE WHEN DATE(FL.created_at) = CURDATE() THEN 1 ELSE 0 END), 0) AS created_fieldleads_today,

            -- ✅ Remaining leads for today
            IFNULL(LHT.lead_count, 0) AS remaining_leads_today,

            -- ✅ Total assigned today
            (
                IFNULL(SUM(CASE WHEN DATE(LD.created_at) = CURDATE() THEN 1 ELSE 0 END), 0) + 
                IFNULL(SUM(CASE WHEN DATE(FL.created_at) = CURDATE() THEN 1 ELSE 0 END), 0) + 
                IFNULL(LHT.lead_count, 0)
            ) AS lead_count,

            -- ✅ Disposition counts (FIXED - now includes both leads and fieldleads)
            IFNULL(
                SUM(CASE WHEN LD.disposition = 'Call back' THEN 1 ELSE 0 END) + 
                SUM(CASE WHEN FL.disposition = 'Call back' THEN 1 ELSE 0 END)
            , 0) AS callback_count,
            
            IFNULL(
                SUM(CASE WHEN LD.disposition = 'Follow up' THEN 1 ELSE 0 END) + 
                SUM(CASE WHEN FL.disposition = 'Follow up' THEN 1 ELSE 0 END)
            , 0) AS followup_count,
            
            IFNULL(
                SUM(CASE WHEN LD.disposition = 'Call not response' THEN 1 ELSE 0 END) + 
                SUM(CASE WHEN FL.disposition = 'Call not response' THEN 1 ELSE 0 END)
            , 0) AS not_response_count

        FROM users AS U
        LEFT JOIN branches AS B ON B.branch_incharge_recid = U.created_by
        LEFT JOIN leads AS LD ON LD.created_by = U.user_id ", sCondition, "
        LEFT JOIN fieldleads AS FL ON FL.created_by = U.user_id ", sConditionFL, "
        LEFT JOIN (
            SELECT created_by, SUM(lead_count) AS lead_count
            FROM leads_count_history
            WHERE DATE(created_at) = CURDATE()
            GROUP BY created_by
        ) AS LHT ON LHT.created_by = U.user_id

        WHERE 1=1 
          AND (
            U.designation IN ('Telecalling sales', 'Telecalling class', 'Front office incharge')
            OR U.designation LIKE 'Field Sales%'
          )
          ", sFilter, "
        GROUP BY U.user_id, U.name
        ORDER BY U.name ASC
    ");

    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;