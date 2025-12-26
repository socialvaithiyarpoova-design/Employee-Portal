/* -----------------------------------------------------------------------------------------------------------------
 NAME: Hariharan S
 DATE: 31/10/2025
 DESC: It is used to get total sales revenue by employee including Approved, Dispatched, and In transit statuses
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetSaleRevenueByEmp`;
CREATE PROCEDURE `SP_GetSaleRevenueByEmp`(
    IN user_id INT(11)
)
BEGIN
   SET @sQuery = CONCAT("
    SELECT 
        GROUP_CONCAT(DISTINCT US.user_id) AS emp_recid,
        GROUP_CONCAT(DISTINCT US.emp_id) AS emp_id,
        GROUP_CONCAT(DISTINCT USS.user_id) AS branch_recid,
        GROUP_CONCAT(DISTINCT USS.emp_id) AS branch_id,
        ROUND(SUM(SL.final_amount), 2) AS total_sale_amount
    FROM users AS US
    LEFT JOIN sales AS SL ON SL.created_by = US.user_id
    LEFT JOIN users AS USS ON USS.user_id = US.created_by
    WHERE
        SL.status IN ('Approved', 'Dispatched', 'In transit')
        AND SL.created_by IN (
            SELECT DISTINCT user_id
            FROM users
            WHERE isDeleted = 0 
              AND created_by = ", user_id, " 
              AND designation NOT IN ('Admin')
        )
    GROUP BY SL.created_by

    UNION ALL

    SELECT 
        GROUP_CONCAT(DISTINCT US.user_id) AS emp_recid,
        GROUP_CONCAT(DISTINCT US.emp_id) AS emp_id,
        GROUP_CONCAT(DISTINCT USS.user_id) AS branch_recid,
        GROUP_CONCAT(DISTINCT USS.emp_id) AS branch_id,
        ROUND(SUM(FSL.final_amount), 2) AS total_sale_amount
    FROM users AS US
    LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = US.user_id
    LEFT JOIN users AS USS ON USS.user_id = US.created_by
    WHERE
        FSL.status IN ('Approved', 'Dispatched', 'In transit')
        AND FSL.created_by IN (
            SELECT DISTINCT user_id
            FROM users
            WHERE isDeleted = 0 
              AND created_by = ", user_id, " 
              AND designation NOT IN ('Admin')
        )
    GROUP BY FSL.created_by
");


    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;


