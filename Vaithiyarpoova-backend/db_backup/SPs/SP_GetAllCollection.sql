/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 10/07/2025
 DESC: It is used to get all collection
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllCollection`;

CREATE PROCEDURE `SP_GetAllCollection`(
    IN user_id INT(11),
    IN btn_clicked VARCHAR(20),
    IN startDate VARCHAR(100),
    IN endDate VARCHAR(100)
)
BEGIN

    DECLARE sCondition TEXT DEFAULT ''; 

    IF btn_clicked = "Today" THEN
        SET sCondition = " AND DATE(FSS.date_time) = DATE(NOW()) ";
    ELSEIF btn_clicked = "Upcoming" THEN
         SET sCondition = " AND DATE(FSS.date_time) > DATE(NOW()) ";
    ELSE 
        SET sCondition = "";
    END IF;

    IF endDate IS NOT NULL AND startDate IS NOT NULL AND startDate <> '' AND endDate <> '' THEN 
        SET sCondition = CONCAT(" AND DATE(FSS.date_time) BETWEEN '",startDate,"' AND '",endDate,"' "); 
    END IF;


    SET @sQuery = CONCAT(" 
        SELECT 
            FSS.*,
            FL.flead_name,
            FL.shop_keeper,
            FL.shop_type,
            FL.mobile_number,
            US.emp_id,
            US.name ,
            B.branch_id,
            B.branch_name
        FROM fieldshopsales AS FSS   
        LEFT JOIN fieldleads AS FL ON FL.flead_id = FSS.leads_id
        LEFT JOIN users AS US ON US.user_id = FSS.created_by
        LEFT JOIN branches AS B ON B.branch_recid = US.branch_rceid
        WHERE payment_type = 'Credit' AND  AND paid_status IN ('Pending', 'Part') AND status = 'Approved' AND FSS.created_by = ",user_id,"
        ",sCondition,"
     ");

    -- SELECT @sQuery;
    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END//
DELIMITER ;
