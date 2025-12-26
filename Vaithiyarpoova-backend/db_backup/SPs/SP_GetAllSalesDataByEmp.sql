/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 28/07/2025
 DESC: It is used to get sales data list by emp
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAllSalesDataByEmp`;

CREATE PROCEDURE `SP_GetAllSalesDataByEmp`(
	IN user_id INT(11),
    IN startDate VARCHAR(100),
    IN endDate VARCHAR(100)
)
BEGIN
        DECLARE sCondition TEXT DEFAULT '';

        IF endDate IS NOT NULL AND startDate IS NOT NULL AND startDate <> '' AND endDate <> '' THEN 
            SET sCondition = CONCAT(" AND DATE(SL.date_time) BETWEEN '",startDate,"' AND '",endDate,"' "); 
        END IF;

	    SET @sQuery = CONCAT("SELECT 
			GROUP_CONCAT(DISTINCT UR.emp_id) AS branch_id,
			GROUP_CONCAT(DISTINCT US.user_id) AS emp_recid,
			GROUP_CONCAT(DISTINCT US.emp_id) AS emp_id,

			-- Gramiyam values
			ROUND((SUM(CASE WHEN PR.brand = 'Gramiyam' THEN SL.order_value ELSE 0 END)),2)     AS gr_total_amount,
			ROUND((SUM(CASE WHEN PR.brand = 'Gramiyam' THEN SL.discount ELSE 0 END)),2)        AS gr_discount,
			ROUND((SUM(CASE WHEN PR.brand = 'Gramiyam' THEN SL.total_value ELSE 0 END)),2)     AS gr_paid_amount,

			-- Vaithiyar Poova values
			ROUND((SUM(CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.order_value ELSE 0 END)),2)   AS vp_total_amount,
			ROUND((SUM(CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.discount ELSE 0 END)),2)      AS vp_discount,
			ROUND((SUM(CASE WHEN PR.brand = 'Vaithiyar Poova' THEN SL.total_value ELSE 0 END)),2)   AS vp_paid_amount,

			GROUP_CONCAT(DISTINCT UT.usertype_id)                                       AS user_recid,
			GROUP_CONCAT(DISTINCT UT.user_type)                                         AS user_types,
			GROUP_CONCAT(DISTINCT CAST(SL.product_id AS UNSIGNED))                      AS product_ids,
			GROUP_CONCAT(DISTINCT PR.brand)                                             AS brands,
			GROUP_CONCAT(DISTINCT BR.location)                                          AS location,
            GROUP_CONCAT(DISTINCT US.incentive_percentage)								AS incentive_percentage

		FROM
			users AS US
			LEFT JOIN usertype              AS UT ON UT.usertype_id = US.created_by
			LEFT JOIN users              	AS UR ON UR.user_id = UT.usertype_id
			LEFT JOIN sales                 AS SL ON SL.created_by = US.user_id
			LEFT JOIN product               AS PR ON PR.product_recid = SL.product_id
			LEFT JOIN branches              AS BR ON BR.branch_incharge_recid = UT.usertype_id

		WHERE
			US.designation IN ('Telecalling sales', 'Telecalling class', 'Field Sales', 'Vaithiyar') AND
			SL.product_id IS NOT NULL AND BR.branch_recid = ",user_id," ",IFNULL(sCondition, ''),"

		GROUP BY UT.usertype_id , US.user_id");

    -- SELECT @sQuery;
    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

   
END//

DELIMITER ;

