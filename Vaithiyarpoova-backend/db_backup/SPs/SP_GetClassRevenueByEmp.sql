/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 28/07/2025
 DESC: It is used to get class revenue
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetClassRevenueByEmp`;

CREATE PROCEDURE `SP_GetClassRevenueByEmp`(
	IN user_id INT(11)
)
BEGIN

        SET @sQuery = CONCAT("
                SELECT 
					GROUP_CONCAT(DISTINCT US.user_id) AS emp_recid,
					GROUP_CONCAT(DISTINCT US.emp_id) AS emp_id,
					GROUP_CONCAT(DISTINCT USS.user_id) AS branch_recid,
					GROUP_CONCAT(DISTINCT USS.emp_id) AS branch_id,
					ROUND(SUM(CL.price_value),2)                            AS cl_total_amount,
					ROUND(SUM(CL.discount),2)                                AS cl_discount,
					ROUND(SUM(CL.amount_to_pay),2)                          AS cl_paid_amount

				FROM
					users AS US
                    LEFT JOIN class_register        AS CL ON CL.created_by = US.user_id
					LEFT JOIN users                 AS USS ON USS.user_id = US.created_by
					LEFT JOIN (
								SELECT 
									branch_incharge_recid,
									GROUP_CONCAT(DISTINCT location) AS locations
								FROM branches
								GROUP BY branch_incharge_recid
							) AS BR ON BR.branch_incharge_recid = USS.created_by
				WHERE
					CL.created_by IN (
					SELECT DISTINCT
						user_id
					FROM
						users
					WHERE
						isDeleted = 0 AND created_by = ",user_id," AND CL.status = 'Approved'  AND designation NOT IN ('Admin')
					)
				GROUP BY CL.created_by ");


		PREPARE stmt FROM @sQuery;
		EXECUTE stmt;
		DEALLOCATE PREPARE stmt;


   
END//

DELIMITER ;

