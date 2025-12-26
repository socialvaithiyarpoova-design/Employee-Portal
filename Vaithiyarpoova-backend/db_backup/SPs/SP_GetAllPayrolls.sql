
/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 01/07/2025
 DESC: It is used get the payroll
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAllPayrolls`;

CREATE PROCEDURE `SP_GetAllPayrolls`(
    IN startDate    VARCHAR(100),
    IN endDate      VARCHAR(100),
    IN branch_id    INT(11),
    IN employee_id  INT(11)
)
BEGIN
        DECLARE sCondition TEXT DEFAULT '';

        IF startDate <> '' AND endDate <> ''
            AND startDate <> '' AND endDate <> '' THEN 
                SET sCondition = CONCAT(sCondition , " AND US.created_at BETWEEN '",startDate,"' AND '",endDate,"' ");
        END IF;
            
        IF branch_id IS NOT NULL THEN
            SET sCondition = CONCAT(sCondition, " AND US.user_id IN (
                        SELECT user_id FROM users AS USI LEFT JOIN branches AS BRI ON BRI.branch_incharge_recid = USI.created_by WHERE branch_recid = ",branch_id,"
                        ) ");
        END IF;
            
        IF employee_id IS NOT NULL THEN
            SET sCondition = CONCAT(sCondition, " AND US.user_id = ",employee_id," ");
        END IF;

        SET @sQuery = CONCAT("SELECT 
            user_id,
            emp_id,
            name,
            designation,
            salary,
            branch_id,
            branch_name,
            branch_inid,
            GROUP_CONCAT(DISTINCT leaves) AS leaves,
            GROUP_CONCAT(DISTINCT permission) AS permission,
            GROUP_CONCAT(amount) AS sale_amount,
            GROUP_CONCAT(amount) * incentive_percentage / 100 AS incentive_earned,
            IFNULL(salary+(GROUP_CONCAT(amount) * (incentive_percentage / 100)), salary) AS total_amount
        FROM
            (SELECT 
                US.user_id AS user_id,
                    US.emp_id AS emp_id,
                    US.name AS name,
                    US.designation AS designation,
                    US.incentive_percentage AS incentive_percentage,
                    US.salary AS salary,
                    GROUP_CONCAT(DISTINCT BR.branch_id) AS branch_id,
                    GROUP_CONCAT(DISTINCT BR.branch_name) AS branch_name,
                    GROUP_CONCAT(DISTINCT BR.branch_incharge_recid) AS branch_inid,
                    MAX(CASE
                        WHEN UA.action = 'Leave' THEN leave_days
                        ELSE 0
                    END) AS leaves,
                    MAX(CASE
                        WHEN UA.action = 'Permission' THEN total_permission_time
                        ELSE '-'
                    END) AS permission,
                    SUM(CASE
                        WHEN SL.order_recid IS NOT NULL THEN SL.total_value
                        ELSE 0
                    END) AS amount
            FROM
                users AS US
            LEFT JOIN branches AS BR ON BR.branch_recid = US.branch_rceid
            LEFT JOIN sales AS SL ON SL.created_by = US.user_id
            LEFT JOIN (
                SELECT 
                    user_id,
                        CASE
                            WHEN action = 'Leave' THEN SUM(DATEDIFF(to_date, from_date) + 1)
                            ELSE 0
                        END AS leave_days,
                        CONCAT(FLOOR(SUM(TIME_TO_SEC(TIMEDIFF(to_time, from_time))) / 3600), ' hrs ', FLOOR(MOD(SUM(TIME_TO_SEC(TIMEDIFF(to_time, from_time))), 3600) / 60), ' mins') AS total_permission_time,
                        GROUP_CONCAT(DISTINCT action) AS action
                FROM
                    user_activity
                WHERE
                    user_status = 'Approved'
                GROUP BY user_id , action)          AS UA ON UA.user_id = US.user_id
            WHERE US.user_id IS NOT NULL ",sCondition," 
            GROUP BY US.user_id , US.emp_id , US.name , US.designation , US.salary , US.incentive_percentage UNION ALL SELECT 
                US.user_id AS user_id,
                    US.emp_id AS emp_id,
                    US.name AS name,
                    US.designation AS designation,
                    US.incentive_percentage AS incentive_percentage,
                    US.salary AS salary,
                    GROUP_CONCAT(DISTINCT BR.branch_id) AS branch_id,
                    GROUP_CONCAT(DISTINCT BR.branch_name) AS branch_name,
                    GROUP_CONCAT(DISTINCT BR.branch_incharge_recid) AS branch_inid,
                    MAX(CASE
                        WHEN UA.action = 'Leave' THEN leave_days
                        ELSE 0
                    END) AS leaves,
                    MAX(CASE
                        WHEN UA.action = 'Permission' THEN total_permission_time
                        ELSE '-'
                    END) AS permission,
                    SUM(CASE
                        WHEN FSL.order_recid IS NOT NULL THEN FSL.total_value
                        ELSE 0
                    END) AS amount
            FROM
                users AS US
            LEFT JOIN branches AS BR ON BR.branch_recid = US.branch_rceid
            LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = US.user_id
            LEFT JOIN (SELECT 
                user_id,
                    CASE
                        WHEN action = 'Leave' THEN SUM(DATEDIFF(to_date, from_date) + 1)
                        ELSE 0
                    END AS leave_days,
                    CONCAT(FLOOR(SUM(TIME_TO_SEC(TIMEDIFF(to_time, from_time))) / 3600), ' hrs ', FLOOR(MOD(SUM(TIME_TO_SEC(TIMEDIFF(to_time, from_time))), 3600) / 60), ' mins') AS total_permission_time,
                    GROUP_CONCAT(DISTINCT action) AS action
            FROM
                user_activity
            WHERE
                user_status = 'Approved'
            GROUP BY user_id , action) AS UA ON UA.user_id = US.user_id
            WHERE US.user_id IS NOT NULL  ",sCondition," 
            GROUP BY US.user_id , US.emp_id , US.name , US.designation , US.salary , US.incentive_percentage) AS A
        GROUP BY user_id , emp_id , name , designation , salary , branch_id , branch_name , branch_inid , incentive_percentage ");

    -- SELECT @sQuery;
    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    
END//
DELIMITER ;