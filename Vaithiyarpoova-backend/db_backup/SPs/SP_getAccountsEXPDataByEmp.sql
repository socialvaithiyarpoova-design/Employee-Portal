-- DELIMITER //

-- DROP PROCEDURE IF EXISTS `SP_getAccountsEXPDataByEmp`;

-- CREATE PROCEDURE `SP_getAccountsEXPDataByEmp`(
--     IN user_id INT(11)
-- )
-- BEGIN
   
--     SET @sQuery = CONCAT("
-- 			SELECT 
            
--                   DISTINCT USS.emp_id        AS branch_id
-- 				, US.user_id                 AS user_id
--                 , GROUP_CONCAT(DISTINCT US.emp_id)                  AS emp_id
--                 , GROUP_CONCAT(DISTINCT US.designation)             AS designation
--                 , GROUP_CONCAT(DISTINCT US.salary)                  			AS salary
--                 , GROUP_CONCAT(DISTINCT US.incentive_percentage)    			AS incentive_percentage
--                 , SUM(SL.total_value)          AS total_value
--                 , ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)) ,2) AS em_total_incentive
--                 , SUM(FSL.total_value)          AS fstotal_value
--                 , ROUND(SUM(FSL.total_value * (US.incentive_percentage / 100)) ,2) AS fstotal_incentive
--             FROM
--                 users AS US
--                 LEFT JOIN sales AS SL ON SL.created_by = US.user_id
--                 LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = US.user_id
--                 LEFT JOIN users AS USS ON USS.user_id = US.created_by 
--             WHERE
--                 US.isDeleted = 0 AND US.created_by = ",user_id,"
--                     AND US.designation NOT IN ('Admin') 
--             GROUP BY US.user_id  ");

--     -- SELECT @sQuery;
--     PREPARE stmt FROM @sQuery;
--     EXECUTE stmt;
--     DEALLOCATE PREPARE stmt;

-- END//

-- DELIMITER ;


DELIMITER //

DROP PROCEDURE IF EXISTS `SP_getAccountsEXPDataByEmp`;

CREATE PROCEDURE `SP_getAccountsEXPDataByEmp`(
    IN user_id INT(11)
)
BEGIN
   
    SET @sQuery = CONCAT("
			SELECT 
                  DISTINCT USS.emp_id                  AS branch_id,
				  US.user_id                           AS user_id,
                  GROUP_CONCAT(DISTINCT US.emp_id)    AS emp_id,
                  GROUP_CONCAT(DISTINCT US.designation) AS designation,
                  GROUP_CONCAT(DISTINCT US.salary)    AS salary,
                  GROUP_CONCAT(DISTINCT US.incentive_percentage) AS incentive_percentage,
                  
                  -- SALES DATA (Monthly)
                  SUM(CASE WHEN MONTH(SL.date_time) = MONTH(CURDATE()) AND YEAR(SL.date_time) = YEAR(CURDATE()) 
                           THEN SL.total_value ELSE 0 END) AS sl_monthly_value,
                  ROUND(SUM(CASE WHEN MONTH(SL.date_time) = MONTH(CURDATE()) AND YEAR(SL.date_time) = YEAR(CURDATE()) 
                                  THEN SL.total_value * (US.incentive_percentage / 100) ELSE 0 END), 2) AS sl_monthly_incentive,
                  
                  -- SALES DATA (Total)
                  SUM(SL.total_value) AS sl_total_value,
                  ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)), 2) AS sl_total_incentive,
                  
                  -- FIELD SHOP SALES DATA (Monthly)
                  SUM(CASE WHEN MONTH(FSL.date_time) = MONTH(CURDATE()) AND YEAR(FSL.date_time) = YEAR(CURDATE()) 
                           THEN FSL.total_value ELSE 0 END) AS fsl_monthly_value,
                  ROUND(SUM(CASE WHEN MONTH(FSL.date_time) = MONTH(CURDATE()) AND YEAR(FSL.date_time) = YEAR(CURDATE()) 
                                  THEN FSL.total_value * (US.incentive_percentage / 100) ELSE 0 END), 2) AS fsl_monthly_incentive,
                  
                  -- FIELD SHOP SALES DATA (Total)
                  SUM(FSL.total_value) AS fsl_total_value,
                  ROUND(SUM(FSL.total_value * (US.incentive_percentage / 100)), 2) AS fsl_total_incentive,
                  
                  -- CONSULTING APPOINTMENTS DATA (Monthly)
                  SUM(CASE WHEN MONTH(CA.created_at) = MONTH(CURDATE()) AND YEAR(CA.created_at) = YEAR(CURDATE()) 
                           THEN CA.price ELSE 0 END) AS ca_monthly_value,
                  ROUND(SUM(CASE WHEN MONTH(CA.created_at) = MONTH(CURDATE()) AND YEAR(CA.created_at) = YEAR(CURDATE()) 
                                  THEN CA.price * (US.incentive_percentage / 100) ELSE 0 END), 2) AS ca_monthly_incentive,
                  
                  -- CONSULTING APPOINTMENTS DATA (Total)
                  SUM(CA.price) AS ca_total_value,
                  ROUND(SUM(CA.price * (US.incentive_percentage / 100)), 2) AS ca_total_incentive,
                  
                  -- WALLET DATA (Monthly)
                  SUM(CASE WHEN MONTH(WD.created_at) = MONTH(CURDATE()) AND YEAR(WD.created_at) = YEAR(CURDATE()) 
                           THEN WD.amount ELSE 0 END) AS wd_monthly_value,
                  ROUND(SUM(CASE WHEN MONTH(WD.created_at) = MONTH(CURDATE()) AND YEAR(WD.created_at) = YEAR(CURDATE()) 
                                  THEN WD.amount * (US.incentive_percentage / 100) ELSE 0 END), 2) AS wd_monthly_incentive,
                  
                  -- WALLET DATA (Total)
                  SUM(WD.amount) AS wd_total_value,
                  ROUND(SUM(WD.amount * (US.incentive_percentage / 100)), 2) AS wd_total_incentive
                  
            FROM
                users AS US
                LEFT JOIN sales AS SL ON SL.created_by = US.user_id 
                  AND SL.status IN ('Approved', 'Dispatched', 'In transit')
                LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = US.user_id 
                  AND FSL.status IN ('Approved', 'Dispatched', 'In transit')
                LEFT JOIN consulting_appointments AS CA ON CA.created_by = US.user_id 
                  AND CA.status IN ('Approved')
                LEFT JOIN wallet_data AS WD ON WD.created_by = US.user_id 
                  AND WD.status IN ('Approved')
                LEFT JOIN users AS USS ON USS.user_id = US.created_by 
            WHERE
                US.isDeleted = 0 AND US.created_by = ", user_id, "
                    AND US.designation NOT IN ('Admin') 
            GROUP BY US.user_id");

    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END//

DELIMITER ;