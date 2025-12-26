/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Reports Data Union
 DATE: Current
 DESC: It is used to get combined sales data from sales and fieldshopsales tables
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetReportsData`;

CREATE PROCEDURE `SP_GetReportsData`(
    IN startDate VARCHAR(100),
    IN endDate VARCHAR(100),
    IN reportType VARCHAR(50),
    IN p_user_id INT(11)
)
BEGIN
    DECLARE sCondition VARCHAR(1000) DEFAULT '';
    
    -- Build date condition if dates are provided
    IF endDate IS NOT NULL AND startDate IS NOT NULL AND startDate <> '' AND endDate <> '' THEN 
        SET sCondition = CONCAT(" AND DATE(SL.date_time) BETWEEN '", startDate, "' AND '", endDate, "' "); 
    END IF;

	SET @sResQuery = CONCAT("SELECT COUNT(user_id) INTO @sEmp_id FROM users WHERE created_by = ",p_user_id);

	PREPARE stmt FROM @sResQuery;
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
    
    -- For Sales Report: Union sales and fieldshopsales tables
    IF @sEmp_id > 0 THEN
        IF reportType = 'sales' THEN
            SET @sQuery = CONCAT("
                            SELECT 
                                SL.order_recid      AS order_recid,
                                SL.order_id         AS order_id,
                                SL.leads_id         AS leads_id,
                                SL.order_value      AS order_value,
                                SL.discount         AS discount,
                                SL.total_value      AS total_value,
                                SL.date_time        AS date_time,
                                PP.product_recid    AS product_recid,
                                PP.product_id       AS product_id,
                                PP.product_name     AS product_name,
                                PP.qty              AS qty,
                                PP.price            AS price,
                                PR.brand            AS brand,
                                SL.created_by       AS created_by,
                                US.emp_id           AS emp_id,
                                ROUND(SL.total_value * US.incentive_percentage / 100,2) AS incentive_earned,
                                ROUND(CASE
                                            WHEN PR.brand = 'Gramiyam' THEN SL.total_value
                                            ELSE 0
                                        END,
                                        2) AS gr_paid_amount,
                                ROUND(CASE
                                            WHEN PR.brand = 'Vaithiyar Poova' THEN SL.total_value
                                            ELSE 0
                                        END,
                                        2) AS vp_paid_amount 
                            FROM
                                sales AS SL
                                    LEFT JOIN
                                users AS US ON US.user_id = SL.created_by
                                    LEFT JOIN
                                purchased_product AS PP ON PP.order_recid = SL.order_recid
                                    LEFT JOIN
                                product AS PR ON PR.product_recid = PP.product_recid WHERE SL.created_by IN (SELECT user_id FROM users WHERE created_by = ",p_user_id,") ",sCondition,"
            ");
            
		PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        
        -- For Employee Report: Show employee performance data
        ELSEIF reportType = 'employee' THEN
            SET @sQuery = CONCAT("
                            SELECT 
                                GROUP_CONCAT(DISTINCT SL.order_recid)      AS order_recid,
                                GROUP_CONCAT(DISTINCT SL.order_id)         AS order_id,
                                GROUP_CONCAT(DISTINCT SL.leads_id)         AS leads_id,
                                SUM(SL.order_value)      AS order_value,
                                SUM(SL.discount)         AS discount,
                                SUM(SL.total_value)      AS total_value,
                                GROUP_CONCAT(DISTINCT SL.date_time)        AS date_time,
                                GROUP_CONCAT(DISTINCT PP.product_recid)    AS product_recid,
                                GROUP_CONCAT(DISTINCT PP.product_id)       AS product_id,
                                GROUP_CONCAT(DISTINCT PP.product_name)     AS product_name,
                                SUM(PP.qty)              AS qty,
                                SUM(PP.price)            AS price,
                                GROUP_CONCAT(DISTINCT PR.brand)            AS brand,
                                GROUP_CONCAT(DISTINCT SL.created_by)       AS created_by,
                                GROUP_CONCAT(DISTINCT US.emp_id)           AS emp_id,
                                ROUND(SUM(SL.total_value * US.incentive_percentage / 100), 2) AS incentive_earned,
                                ROUND(SUM(CASE
                                            WHEN PR.brand = 'Gramiyam' THEN SL.total_value
                                            ELSE 0
                                        END),
                                        2) AS gr_paid_amount,
                                ROUND(SUM(CASE
                                            WHEN PR.brand = 'Vaithiyar Poova' THEN SL.total_value
                                            ELSE 0
                                        END),
                                        2) AS vp_paid_amount
                            FROM
                                sales AS SL
                                    LEFT JOIN
                                users AS US ON US.user_id = SL.created_by
                                    LEFT JOIN
                                purchased_product AS PP ON PP.order_recid = SL.order_recid
                                    LEFT JOIN
                                product AS PR ON PR.product_recid = PP.product_recid WHERE SL.created_by IN (SELECT user_id FROM users WHERE created_by = ",p_user_id,") ",sCondition,"
                                GROUP BY SL.created_by
            ");
            
            
		PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        
        END IF;
    
     
    END IF;
    
END//

DELIMITER ;
