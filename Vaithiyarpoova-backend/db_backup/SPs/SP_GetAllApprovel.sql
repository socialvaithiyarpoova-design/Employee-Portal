DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllApprovel`;
//
CREATE PROCEDURE `SP_GetAllApprovel`(
    IN btn_data    VARCHAR(20), 
    IN branch_id   INT, 
    IN employee_id INT, 
    IN startDate   VARCHAR(50), 
    IN endDate     VARCHAR(50), 
    IN status      VARCHAR(20),
    IN type        VARCHAR(20)
)
BEGIN
    DECLARE sCondition VARCHAR(1000) DEFAULT ''; 

    -- Base condition
    IF btn_data = 'Reset' THEN  
        SET sCondition = " WHERE T.status = 'Pending' "; 
    ELSE 
        SET sCondition = " WHERE T.status IN ('Approved', 'Decline') "; 
    END IF;

    -- Date filter
    IF startDate <> '' AND endDate <> '' THEN  
        SET sCondition = CONCAT(sCondition," AND DATE(T.date_time) BETWEEN '",startDate,"' AND '",endDate,"' ");  
    END IF; 

    -- Status filter
    IF status <> '' THEN  
        SET sCondition = CONCAT(sCondition," AND T.status = '",status,"' ");  
    END IF; 

    -- Branch filter
    IF branch_id IS NOT NULL AND employee_id IS NULL THEN 
        SELECT GROUP_CONCAT(user_id) INTO @sEmployeeIds 
        FROM users 
        WHERE created_by IN (
            SELECT branch_incharge_recid 
            FROM branches 
            WHERE branch_recid = branch_id
        ); 
        SET sCondition = CONCAT(sCondition," AND T.created_by IN (",@sEmployeeIds,") ");  
    END IF; 

    -- Employee filter
    IF employee_id IS NOT NULL THEN 
        SET sCondition = CONCAT(sCondition," AND T.created_by = ",employee_id," ");  
    END IF; 

    -- =============================
    --   BUILD MAIN QUERY
    -- =============================

    IF type = '' OR type = 'all' THEN
        SET @sQuery = CONCAT("
            SELECT 'wallet' AS source_type, T.wallet_id AS id, T.date_time, T.status, T.type,
                   L.lead_id, U.emp_id, B.branch_name,
                   T.created_at
            FROM wallet_data AS T
            LEFT JOIN leads AS L ON L.lead_recid = T.owned_by
            LEFT JOIN users AS U ON U.user_id = T.created_by
            LEFT JOIN branches AS B ON B.branch_recid = U.branch_rceid
            ", sCondition, "

            UNION ALL

            SELECT 'class' AS source_type, T.class_register_id AS id, T.date_time, T.status,T.type,
                   L.lead_id, U.emp_id, B.branch_name,
                   T.created_at
            FROM class_register AS T
            LEFT JOIN leads AS L ON L.lead_recid = T.owned_by
            LEFT JOIN users AS U ON U.user_id = T.created_by
            LEFT JOIN branches AS B ON B.branch_recid = U.branch_rceid
            ", sCondition, "

            UNION ALL

            SELECT 'consulting' AS source_type, T.id, T.date_time, T.status,T.type,
                   L.lead_id, U.emp_id, B.branch_name,
                   T.created_at
            FROM consulting_appointments AS T
            LEFT JOIN leads AS L ON L.lead_recid = T.owned_by
            LEFT JOIN users AS U ON U.user_id = T.created_by
            LEFT JOIN branches AS B ON B.branch_recid = U.branch_rceid
            ", sCondition, "

            UNION ALL

            SELECT 'billing' AS source_type, T.billing_recid AS id,  NULL AS date_time, T.status, T.type,
                 NULL AS lead_id,U.emp_id, B.branch_name,
                   T.created_at
            FROM billing AS T
            LEFT JOIN users AS U ON U.user_id = T.created_by
            LEFT JOIN branches AS B ON B.branch_recid = U.branch_rceid
            ", sCondition, "

            ORDER BY created_at DESC
        ");
    ELSEIF type = 'wallet' THEN
        SET @sQuery = CONCAT("
            SELECT 'wallet' AS source_type, T.wallet_id, T.date_time, T.status, T.type, 
                   L.lead_id, U.emp_id, B.branch_name,
                   T.created_at
            FROM wallet_data AS T
            LEFT JOIN leads AS L ON L.lead_recid = T.owned_by
            LEFT JOIN users AS U ON U.user_id = T.created_by
            LEFT JOIN branches AS B ON B.branch_recid = U.branch_rceid
            ", sCondition, "
            ORDER BY T.created_at DESC
        ");
    ELSEIF type = 'class' THEN
        SET @sQuery = CONCAT("
            SELECT 'class' AS source_type, T.class_register_id AS id, T.date_time, T.status,  T.type,
                   L.lead_id, U.emp_id, B.branch_name,
                   T.created_at
            FROM class_register AS T
            LEFT JOIN leads AS L ON L.lead_recid = T.owned_by
            LEFT JOIN users AS U ON U.user_id = T.created_by
            LEFT JOIN branches AS B ON B.branch_recid = U.branch_rceid
            ", sCondition, "
            ORDER BY T.created_at DESC
        ");
    ELSEIF type = 'consulting' THEN
        SET @sQuery = CONCAT("
            SELECT 'consulting' AS source_type, T.id, T.date_time, T.status,  T.type,
                   L.lead_id, U.emp_id, B.branch_name,
                   T.created_at
            FROM consulting_appointments AS T
            LEFT JOIN leads AS L ON L.lead_recid = T.owned_by
            LEFT JOIN users AS U ON U.user_id = T.created_by
            LEFT JOIN branches AS B ON B.branch_recid = U.branch_rceid
            ", sCondition, "
            ORDER BY T.created_at DESC
        ");
    ELSEIF type = 'billing' THEN
        SET @sQuery = CONCAT("
            SELECT 'billing' AS source_type, T.billing_recid AS id, NULL AS date_time, T.status, T.type,
                   NULL AS lead_id, U.emp_id, B.branch_name,
                   T.created_at
            FROM billing AS T
            LEFT JOIN users AS U ON U.user_id = T.created_by
            LEFT JOIN branches AS B ON B.branch_recid = U.branch_rceid
            ", sCondition, "
            ORDER BY T.created_at DESC
        ");
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid type parameter. Must be: wallet, class, consulting, billing, or all';
    END IF;

    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END//
DELIMITER ;
