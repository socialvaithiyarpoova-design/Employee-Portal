/* -----------------------------------------------------------------------------------------------------------------
 NAME: Hariharan S
 DATE: 04/08/2025
 DESC: It is used to get shop data (filtered for Interested disposition only)
 STRUCTURE: Same as SP_GetAllClientData but queries fieldleads table instead of leads
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAllClientShopData`;

CREATE PROCEDURE `SP_GetAllClientShopData`(
    IN type_code    VARCHAR(10),
    IN startDate    VARCHAR(50),
    IN endDate      VARCHAR(50),
    IN branch_id    INT(11),
    IN emp_id       INT(11),
    IN premium_id   VARCHAR(100),
    IN p_userId     INT(11),
    IN p_category   VARCHAR(1000),
    IN p_country    VARCHAR(150),
    IN p_state      VARCHAR(150),
    IN p_city       VARCHAR(150)
)
BEGIN

    DECLARE sCondition TEXT DEFAULT ''; 

    -- Date Range Filter
    IF endDate IS NOT NULL AND startDate IS NOT NULL AND startDate <> '' AND endDate <> '' THEN 
        SET sCondition = CONCAT(" AND DATE(A.created_at) BETWEEN '", startDate, "' AND '", endDate, "' "); 
    END IF;

    -- Branch Filter
    IF branch_id IS NOT NULL THEN
        SET sCondition = CONCAT(sCondition,
            " AND A.user_id IN (
                SELECT US.user_id 
                FROM branches AS BR 
                LEFT JOIN users AS US ON US.created_by = BR.branch_incharge_recid 
                WHERE BR.branch_recid = ", branch_id, "
            )"
        ); 
    END IF;

    -- Employee Filter
    IF emp_id IS NOT NULL THEN
        SET sCondition = CONCAT(sCondition, " AND A.user_id = ", emp_id);
    END IF;

    -- Premium Filter
    IF premium_id <> '' THEN
        SET sCondition = CONCAT(sCondition, " AND PM.gst_level = '", premium_id, "' ");
    END IF;

    -- Category Filter
    IF p_category <> '' THEN
        SET sCondition = CONCAT(sCondition, " AND (A.category LIKE '%", p_category, "%' OR FIND_IN_SET('", p_category, "', REPLACE(A.category, ',', ','))) ");
    END IF;


    -- Country Filter
	IF p_country IS NOT NULL AND p_country <> '' THEN
		SET sCondition = CONCAT(sCondition, " AND A.country = '", p_country, "' ");
	END IF;
	-- State Filter
	IF p_state IS NOT NULL AND p_state <> '' THEN
		SET sCondition = CONCAT(sCondition, " AND A.state = '", p_state, "' ");
	END IF;
	-- City Filter
	IF p_city IS NOT NULL AND p_city <> '' THEN
		SET sCondition = CONCAT(sCondition, " AND A.city = '", p_city, "' ");
	END IF;

    -- -----------------------------------------------
    -- TYPE CODE: AD  (Admin / All Data)
    -- -----------------------------------------------
    IF type_code = "AD" THEN
        
        SET @sQuery = CONCAT("
            SELECT 
                A.*,
                COALESCE(PM.gst_level, NULL) AS premium_status,
                COALESCE(PM.icon, NULL) AS icon
            FROM (
                SELECT 
                    LD.flead_recid,
                    LD.flead_id,
                    LD.flead_name,
                    LD.shop_keeper,
                    LD.shop_type,
                    LD.mobile_number,
                    LD.email,
                    LD.disposition,
                    LD.disposition_date,
                    LD.comments,
                    LD.interested_type,
                    LD.category,
                    LD.created_at,
                    LD.country,
                    LD.state,
                    LD.city,
                    LS.amount,
                    US.user_id AS user_id,
                    US.name AS created_by_name
                FROM fieldleads AS LD 
                LEFT JOIN (
                    SELECT leads_id, SUM(total_value) AS amount
                    FROM fieldshopsales
                    GROUP BY leads_id
                ) AS LS ON LS.leads_id = LD.flead_id
                LEFT JOIN users AS US ON US.user_id = LD.created_by
            ) A
            LEFT JOIN (
                SELECT p1.gst_level, p1.amount, p1.icon   
                FROM premium_master p1
                WHERE client_type = 'Shop'
            ) PM ON A.amount >= PM.amount
            AND PM.amount = (
                SELECT MAX(p2.amount)
                FROM premium_master p2
                WHERE p2.client_type = 'Shop'
                  AND A.amount >= p2.amount
            )
            WHERE flead_recid IS NOT NULL ", IFNULL(sCondition, ''), "
            AND A.disposition = 'Interested'
            ORDER BY A.flead_recid
        ");

        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    
    -- -----------------------------------------------
    -- TYPE CODE: BH  (Branch Head)
    -- -----------------------------------------------
    ELSEIF type_code = "BH" THEN
        
        SET @sQuery = CONCAT("
            SELECT 
                A.*,
                COALESCE(PM.gst_level, NULL) AS premium_status,
                COALESCE(PM.icon, NULL) AS icon
            FROM (
                SELECT 
                    LD.flead_recid,
                    LD.flead_id,
                    LD.flead_name,
                    LD.shop_keeper,
                    LD.shop_type,
                    LD.mobile_number,
                    LD.email,
                    LD.disposition,
                    LD.disposition_date,
                    LD.comments,
                    LD.interested_type,
                    LD.category,
                    LD.created_at,
                    LD.country,
                    LD.state,
                    LD.city,
                    LS.amount,
                    US.user_id AS user_id,
                    US.name AS created_by_name
                FROM fieldleads AS LD 
                LEFT JOIN (
                    SELECT leads_id, SUM(total_value) AS amount
                    FROM fieldshopsales
                    GROUP BY leads_id
                ) AS LS ON LS.leads_id = LD.flead_id
                LEFT JOIN users AS US ON US.user_id = LD.created_by
            ) A
            LEFT JOIN (
                SELECT p1.gst_level, p1.amount, p1.icon   
                FROM premium_master p1
                WHERE client_type = 'Shop'
            ) PM ON A.amount >= PM.amount
            AND PM.amount = (
                SELECT MAX(p2.amount)
                FROM premium_master p2
                WHERE p2.client_type = 'Shop'
                  AND A.amount >= p2.amount
            )
            WHERE user_id IN (SELECT user_id FROM users WHERE created_by = ", p_userId, ") ", IFNULL(sCondition, ''), "
            AND A.disposition = 'Interested'
            ORDER BY A.flead_recid
        ");

        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

    -- -----------------------------------------------
    -- TYPE CODE: Default (Normal User - FS, TSL, etc)
    -- -----------------------------------------------
    ELSE 

        SET @sQuery = CONCAT("
            SELECT 
                A.*,
                COALESCE(PM.gst_level, NULL) AS premium_status,
                COALESCE(PM.icon, NULL) AS icon
            FROM (
                SELECT 
                    LD.flead_recid,
                    LD.flead_id,
                    LD.flead_name,
                    LD.shop_keeper,
                    LD.shop_type,
                    LD.mobile_number,
                    LD.email,
                    LD.disposition,
                    LD.disposition_date,
                    LD.comments,
                    LD.interested_type,
                    LD.category,
                    LD.created_at,
                    LD.country,
                    LD.state,
                    LD.city,
                    LS.amount,
                    US.user_id AS user_id,
                    US.name AS created_by_name
                FROM fieldleads AS LD 
                LEFT JOIN (
                    SELECT leads_id, SUM(total_value) AS amount
                    FROM fieldshopsales
                    GROUP BY leads_id
                ) AS LS ON LS.leads_id = LD.flead_id
                LEFT JOIN users AS US ON US.user_id = LD.created_by
            ) A
            LEFT JOIN (
                SELECT p1.gst_level, p1.amount, p1.icon  
                FROM premium_master p1
                WHERE client_type = 'Shop'
            ) PM ON A.amount >= PM.amount
            AND PM.amount = (
                SELECT MAX(p2.amount)
                FROM premium_master p2
                WHERE p2.client_type = 'Shop'
                  AND A.amount >= p2.amount
            )
            WHERE user_id = ", p_userId, " ", IFNULL(sCondition, ''), "
            AND A.disposition = 'Interested'
            ORDER BY A.flead_recid
        ");

        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

    END IF;

END //

DELIMITER ;