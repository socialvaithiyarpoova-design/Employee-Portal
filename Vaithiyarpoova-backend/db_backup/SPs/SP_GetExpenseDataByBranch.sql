

DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetExpenseDataByBranch`;

CREATE PROCEDURE `SP_GetExpenseDataByBranch`(
    IN start_date VARCHAR(100),
    IN end_date VARCHAR(100),
    IN branch_id INT(11),
    IN employee_id INT(11),
    IN iUserId INT(11),
    IN sCode VARCHAR(100)
)
BEGIN

    DECLARE sCondition TEXT DEFAULT '';
    DECLARE sBRCondition TEXT DEFAULT '';

    IF end_date IS NOT NULL AND start_date IS NOT NULL AND start_date <> '' AND end_date <> '' THEN 
        SET sCondition = CONCAT(" AND DATE(SL.created_at) BETWEEN '",start_date,"' AND '",end_date,"' ");
    END IF;

    IF branch_id IS NOT NULL THEN
        SELECT branch_incharge_recid INTO @iBranch_id FROM branches WHERE branch_recid = branch_id;
        SET sBRCondition = CONCAT(" WHERE branch_incharge_id = ", @iBranch_id); 
    END IF;

    IF sCode = "BH" THEN 
         SET sBRCondition = CONCAT(" WHERE A.br_userid = ", iUserId); 
    END IF;

    SET @sQuery = CONCAT("
            SELECT * FROM
			(SELECT 
				A.branch_incharge_id        AS  branch_incharge_id,
				A.br_userid                 AS  br_userid,
                A.branch_id                 AS  branch_id,
				USS.emp_id                  AS  emp_id,
				A.rent                      AS  monthly_rent,
				A.total_salary              AS  total_salary,
				A.total_sales               AS  sl_monthly_sales,
				A.fs_total_sales            AS  fs_monthly_sales,
				A.total_incentive           AS  sl_monthly_incentive,
				A.fs_total_incentive        AS  fs_monthly_incentive,
                A.location                  AS  location,
				other_expenses              AS  monthly_other_expenses
			FROM
				(
                SELECT 
                    BR.branch_incharge_recid AS branch_incharge_id,
                    BR.location AS location,
                    BR.branch_id AS branch_id,
                    BR.rent AS rent,
                    IFNULL(US.created_by, BR.branch_incharge_recid) AS br_userid,
                    SUM(US.salary) AS total_salary,
                    SUM(SL.total_value) AS total_sales,
                    ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)), 2) AS total_incentive,
                    SUM(FSL.total_value) AS fs_total_sales,
                    ROUND(SUM(FSL.total_value * (US.incentive_percentage / 100)), 2) AS fs_total_incentive
                FROM branches AS BR
                LEFT JOIN users AS US ON US.created_by = BR.branch_incharge_recid
                LEFT JOIN sales AS SL ON SL.created_by = US.user_id AND SL.status IN ('Approved', 'Dispatched', 'In transit') ", sCondition ,"
                LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = US.user_id AND FSL.status IN ('Approved', 'Dispatched', 'In transit') ", sCondition ,"
                WHERE BR.isDeleted = 0 AND (US.isDeleted = 0 OR US.user_id IS NULL)
                GROUP BY BR.branch_recid, BR.branch_incharge_recid, BR.location, BR.branch_id, BR.rent, US.created_by

                UNION

                SELECT 
                    NULL AS branch_incharge_id,
                    NULL AS location,
                    NULL AS branch_id,
                    NULL AS rent,
                    US.created_by AS br_userid,
                    SUM(US.salary) AS total_salary,
                    SUM(SL.total_value) AS total_sales,
                    ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)), 2) AS total_incentive,
                    SUM(FSL.total_value) AS fs_total_sales,
                    ROUND(SUM(FSL.total_value * (US.incentive_percentage / 100)), 2) AS fs_total_incentive
                FROM users AS US
                LEFT JOIN sales AS SL ON SL.created_by = US.user_id AND SL.status IN ('Approved', 'Dispatched', 'In transit') ", sCondition ,"
                LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = US.user_id AND FSL.status IN ('Approved', 'Dispatched', 'In transit') ", sCondition ,"
                WHERE US.isDeleted = 0
                AND US.created_by NOT IN (SELECT DISTINCT branch_incharge_recid FROM branches WHERE isDeleted = 0)
                GROUP BY US.created_by 
                ) AS A 
			LEFT JOIN users AS USS ON USS.user_id = A.br_userid
            LEFT JOIN (
						SELECT 
						created_by,
						SUM(amount) AS other_expenses
					FROM
						expenses
					WHERE status = 'approved'
					", sCondition ,"
						GROUP BY created_by
						) 		AS EX 	ON EX.created_by = USS.user_id
              ) AS A ", sBRCondition ,"");

    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END//

DELIMITER ;