/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 28/07/2025
 DESC: It is used to get class revenue
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetClassRevenueByBranch`;

CREATE PROCEDURE `SP_GetClassRevenueByBranch`(
    IN start_date VARCHAR(100),
    IN end_date VARCHAR(100),
    IN branch_id INT(11),
    IN employee_id INT(11),
    IN usertype_code VARCHAR(100),
    IN iUser_id INT(11)
)
BEGIN

    DECLARE sCondition TEXT DEFAULT '';
    DECLARE sBRCondition TEXT DEFAULT '';

    IF end_date IS NOT NULL AND start_date IS NOT NULL AND start_date <> '' AND end_date <> '' THEN 
        SET sCondition = CONCAT(" AND DATE(CL.created_at) BETWEEN '",start_date,"' AND '",end_date,"' "); 
    END IF;

    IF branch_id IS NOT NULL THEN
        SELECT branch_incharge_recid INTO @iBranch_id FROM branches WHERE branch_recid = branch_id;
        SET sBRCondition = CONCAT(" WHERE user_recid = ", @iBranch_id); 
    END IF;

    IF usertype_code = "BH" THEN 
         SET sBRCondition = CONCAT(" WHERE user_recid = ", iUser_id); 
    END IF;

    IF employee_id IS NOT NULL THEN
        SELECT user_id INTO @iUserId FROM users WHERE user_id = employee_id;
        SET sCondition = CONCAT(sCondition," AND USS.user_id = ",  @iUserId); 
    END IF;
   
    SET @sQuery = CONCAT("
                         SELECT * FROM (SELECT 
                            USS.created_by                                  AS user_recid,
                            GROUP_CONCAT(DISTINCT UST.designation)          AS user_types,
                            GROUP_CONCAT(DISTINCT UST.emp_id)		        AS branch_id,
                            GROUP_CONCAT(DISTINCT UST.name)		            AS branch_name,
                            GROUP_CONCAT(DISTINCT USS.user_id)	            AS user_i,
                            GROUP_CONCAT(DISTINCT USS.emp_id)               AS emp_id,
                            ROUND(SUM(CL.price_value),2)                    AS cl_total_amount,
                            ROUND(SUM(CL.discount),2)                       AS cl_discount,
                            ROUND(SUM(CL.amount_to_pay),2)                  AS cl_paid_amount
                            
                                
                        FROM
                            users AS USS
                            LEFT JOIN class_register    AS 	CL ON CL.created_by = USS.user_id
                            LEFT JOIN users 			AS 	UST ON UST.user_id = USS.created_by
                        WHERE
                            USS.created_by IN 
                            (
                            SELECT 
                                DISTINCT U.user_id
                            FROM
                                users AS U
                                LEFT JOIN users AS US ON US.created_by = U.user_id
                                LEFT JOIN usertype AS UT ON UT.usertype_id = US.usertype_id
                            WHERE
                                U.isDeleted = 0 AND US.isDeleted = 0 AND US.created_by IS NOT NULL
                            ) AND USS.isDeleted = 0  AND CL.status = 'Approved' ",IFNULL(sCondition, '')," 
                        GROUP BY USS.created_by ) AS A ", IFNULL(sBRCondition, ''), " ");

    -- SELECT @sQuery;
    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;


   
END//

DELIMITER ;

