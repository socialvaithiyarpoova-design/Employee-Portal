-- /* ----------------------------------------------------------------------------------------------------------------- 
--  NAME: Hariharan S
--  DATE: 25/06/2025
--  DESC: It is used to get all lead details
--  ----------------------------------------------------------------------------------------------------------------- */



DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllLeadDetails`;

CREATE  PROCEDURE `SP_GetAllLeadDetails`(
    IN branch_id    INT(11),
    IN disposition  VARCHAR(100),
    IN employee_id  INT(11),
    IN startDate    VARCHAR(100),
    IN endDate      VARCHAR(100),
    IN p_id         INT(11),
    IN countryFilter VARCHAR(150),
    IN stateFilter   VARCHAR(150),
    IN cityFilter    VARCHAR(150)
)
BEGIN

    DECLARE sBRCondition VARCHAR(1000) DEFAULT '';
    DECLARE sCondition TEXT DEFAULT '';

    
    -- BRANCH FILTER
    
    IF branch_id IS NOT NULL THEN
        SET sBRCondition = CONCAT(" AND user_id IN (
                    SELECT user_id FROM users AS USI 
                    LEFT JOIN branches AS BRI 
                    ON BRI.branch_incharge_recid = USI.created_by 
                    WHERE branch_recid = ",branch_id,"
                ) ");
    END IF;

    
    -- DISPOSITION FILTER
    
    IF disposition IS NOT NULL AND disposition <> '' THEN
        SET sCondition = CONCAT(
            IF(sCondition <> '',
               CONCAT(sCondition, " AND LD.disposition = '", disposition, "' "),
               CONCAT(" AND LD.disposition = '", disposition, "' ")
            )
        );
    END IF;

    
    -- EMPLOYEE FILTER
    
    IF employee_id IS NOT NULL THEN
        SET sCondition = CONCAT(
            IF(sCondition <> '',
               CONCAT(sCondition," AND LD.created_by = ",employee_id," "),
               CONCAT(" AND LD.created_by = ",employee_id," ")
            )
        );
    END IF;

    
    -- PARENT USER FILTER
    
    IF p_id IS NOT NULL THEN
        SET sBRCondition = CONCAT(" AND user_id IN (
                    SELECT user_id FROM users WHERE created_by = ",p_id,"
                ) ");
    END IF;

    
    -- DATE RANGE FILTER
    
    IF startDate IS NOT NULL AND endDate IS NOT NULL 
       AND startDate <> '' AND endDate <> '' THEN 
        SET sCondition = CONCAT(
            IF(sCondition <> '',
               CONCAT(sCondition," AND LD.created_at BETWEEN '",startDate,"' AND '",endDate,"' "),
               CONCAT(" AND LD.created_at BETWEEN '",startDate,"' AND '",endDate,"' ")
            )
        );
    END IF;

    
    -- COUNTRY FILTER (NEW)
    
    IF countryFilter IS NOT NULL AND countryFilter <> '' THEN
        SET sCondition = CONCAT(
            sCondition,
            " AND LD.country = '", countryFilter, "' "
        );
    END IF;

    
    -- STATE FILTER (NEW)
    
    IF stateFilter IS NOT NULL AND stateFilter <> '' THEN
        SET sCondition = CONCAT(
            sCondition,
            " AND LD.state = '", stateFilter, "' "
        );
    END IF;

    
    -- CITY FILTER (NEW)
    
    IF cityFilter IS NOT NULL AND cityFilter <> '' THEN
        SET sCondition = CONCAT(
            sCondition,
            " AND LD.city = '", cityFilter, "' "
        );
    END IF;

    
    -- FINAL QUERY (UNCHANGED)
    
    SET @sQuery = CONCAT("
        SELECT  
            LD.lead_recid           AS lead_recid,
            LD.lead_id              AS lead_id,
            LD.lead_name            AS lead_name,
            LD.age                  AS age,
            LD.gender               AS gender,
            LD.mobile_number        AS mobile_number,
            LD.email                AS email,
            A.emp_id                AS created_by,
            A.name                  AS name,
            LD.disposition          AS disposition,
            LD.disposition_date     AS disposition_date,
            LD.created_at           AS created_at 
        FROM 
            (
                SELECT user_id, emp_id, name, mobile_number, designation, created_by, branch_recid, branch_id
                FROM users AS US 
                LEFT JOIN branches AS BR ON BR.branch_incharge_recid = US.user_id 
                WHERE US.isDeleted = 0 ",IFNULL(sBRCondition, ''),"
            ) AS A 
        LEFT JOIN leads AS LD ON LD.created_by = A.user_id 
        WHERE lead_recid IS NOT NULL ",IFNULL(sCondition, ''),"
        
        UNION 
        
        SELECT  
            LD.flead_recid           AS lead_recid,
            LD.flead_id              AS lead_id,
            LD.flead_name            AS lead_name,
            NULL                     AS age,
            NULL                     AS gender,
            LD.mobile_number         AS mobile_number,
            LD.email                 AS email,
            A.emp_id                 AS created_by,
            A.name                   AS name,
            LD.disposition           AS disposition,
            LD.disposition_date      AS disposition_date,
            LD.created_at            AS created_at 
        FROM 
            (
                SELECT user_id, emp_id, name, mobile_number, designation, created_by, branch_recid, branch_id
                FROM users AS FUS 
                LEFT JOIN branches AS FBR ON FBR.branch_incharge_recid = FUS.user_id 
                WHERE FUS.isDeleted = 0 ",IFNULL(sBRCondition, ''),"
            ) AS A 
        LEFT JOIN fieldleads AS LD ON LD.created_by = A.user_id 
        WHERE LD.flead_recid IS NOT NULL ",IFNULL(sCondition, ''),"
    ");

    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END//
DELIMITER ;

-- CREATE PROCEDURE `SP_GetAllLeadDetails`(
--     IN branch_id    INT(11),
--     IN disposition  VARCHAR(100),
--     IN employee_id  INT(11),
--     IN startDate    VARCHAR(100),
--     IN endDate      VARCHAR(100),
--     IN p_id         INT(11),
--     IN countryFilter VARCHAR(150),
--     IN stateFilter   VARCHAR(150),
--     IN cityFilter    VARCHAR(150)
-- )
-- BEGIN

--     DECLARE sBRCondition VARCHAR(1000) DEFAULT '';
--     DECLARE sCondition TEXT DEFAULT '';
    
--     IF branch_id IS NOT NULL THEN
-- 		SET sBRCondition = CONCAT(" AND user_id IN (
--                     SELECT user_id FROM users AS USI LEFT JOIN branches AS BRI ON BRI.branch_incharge_recid = USI.created_by WHERE branch_recid = ",branch_id,"
--                     ) ");
--     END IF;
    
-- 	IF disposition IS NOT NULL AND disposition <> '' THEN
-- 		SET sCondition = CONCAT(
-- 			IF(sCondition <> '', 
-- 			   CONCAT(sCondition, " AND LD.disposition = '", disposition, "' "), 
-- 			   CONCAT(" AND LD.disposition = '", disposition, "' ")
-- 			)
-- 		);
-- 	END IF;
    
--     IF employee_id IS NOT NULL THEN
-- 		SET sCondition = CONCAT(
-- 			IF(sCondition <> '', 
-- 			   CONCAT(sCondition," AND LD.created_by = ",employee_id," "), 
-- 			   CONCAT(" AND LD.created_by = ",employee_id," ")
-- 			)
-- 		);
-- 	END IF;

--     IF p_id IS NOT NULL THEN
--             SET sBRCondition = CONCAT(" AND user_id IN (
--                                 SELECT user_id FROM users WHERE created_by = ",p_id,"
--                                 ) ");
--     END IF;

-- 	IF startDate IS NOT NULL AND endDate IS NOT NULL 
-- 	   AND startDate <> '' AND endDate <> '' THEN 
-- 		SET sCondition = CONCAT(
-- 			IF(sCondition <> '', 
-- 			   CONCAT(sCondition," AND LD.created_at BETWEEN '",startDate,"' AND '",endDate,"' "), 
-- 			   CONCAT(" AND LD.created_at BETWEEN '",startDate,"' AND '",endDate,"' ")
-- 			)
-- 		);
-- 	END IF;
--        -- COUNTRY FILTER (NEW)
    
--     IF countryFilter IS NOT NULL AND countryFilter <> '' THEN
--         SET sCondition = CONCAT(
--             sCondition,
--             " AND LD.country = '", countryFilter, "' "
--         );
--     END IF;

    
--     -- STATE FILTER (NEW)
    
--     IF stateFilter IS NOT NULL AND stateFilter <> '' THEN
--         SET sCondition = CONCAT(
--             sCondition,
--             " AND LD.state = '", stateFilter, "' "
--         );
--     END IF;

    
--     -- CITY FILTER (NEW)
    
--     IF cityFilter IS NOT NULL AND cityFilter <> '' THEN
--         SET sCondition = CONCAT(
--             sCondition,
--             " AND LD.city = '", cityFilter, "' "
--         );
--     END IF;


--      SET @sQuery = CONCAT("
--                     SELECT  
--                         LD.lead_recid           AS lead_recid,
--                         LD.lead_id              AS lead_id,
--                         LD.lead_name            AS lead_name,
--                         LD.age                  AS age,
--                         LD.gender               AS gender,
--                         LD.mobile_number        AS mobile_number,
--                         LD.email                AS email,
--                         A.emp_id                AS created_by,
--                         A.name                  AS name,
--                         LD.disposition          AS disposition,
--                         LD.disposition_date     AS disposition_date,
--                         LD.created_at           AS created_at 
--                     FROM 
--                         (
--                             SELECT 
--                                 user_id, emp_id , name, mobile_number, designation, created_by, branch_recid, branch_id
--                             FROM
--                                 users AS US 
-- 								LEFT JOIN branches 			AS BR ON BR.branch_incharge_recid = US.user_id 
--                             WHERE 
-- 								US.isDeleted = 0 ",IFNULL(sBRCondition, ''),"
--                         ) 
--                         AS A 
                    
--                     LEFT JOIN leads             AS LD ON LD.created_by = A.user_id WHERE lead_recid IS NOT NULL
--                     ",IFNULL(sCondition, ''),"
--                     UNION 

--                     SELECT  
--                         LD.flead_recid           AS lead_recid,
--                         LD.flead_id              AS lead_id,
--                         LD.flead_name            AS lead_name,
--                         null                    AS age,
--                         null                    AS gender,
--                         LD.mobile_number        AS mobile_number,
--                         LD.email                AS email,
--                         A.emp_id                AS created_by,
--                         LD.disposition          AS disposition,
--                         LD.disposition_date     AS disposition_date,
--                         LD.created_at           AS created_at FROM 
--                         (
--                             SELECT 
--                                 user_id, emp_id , name, mobile_number, designation, created_by, branch_recid, branch_id
--                             FROM
--                                 users AS FUS 
-- 								LEFT JOIN branches 			AS FBR ON FBR.branch_incharge_recid = FUS.user_id 
--                             WHERE 
-- 								FUS.isDeleted = 0 ",IFNULL(sBRCondition, ''),"
--                         ) AS A 
                    
--                     LEFT JOIN fieldleads             AS LD ON LD.created_by = A.user_id WHERE LD.flead_recid IS NOT NULL 
--                      ",IFNULL(sCondition, '')," ");


--         -- SELECT @sQuery;
--         PREPARE stmt FROM @sQuery;
--         EXECUTE stmt;
--         DEALLOCATE PREPARE stmt;

    
-- END//
-- DELIMITER ;
-- -- 