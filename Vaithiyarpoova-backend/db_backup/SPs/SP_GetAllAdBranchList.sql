/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 14/07/2025
 DESC: It is used to get all head
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllAdBranchList`;

CREATE PROCEDURE `SP_GetAllAdBranchList`(
    IN iUserId INT(11)
)
BEGIN
    DECLARE iHeadId INT(11) DEFAULT NULL;
    
    SELECT created_by INTO iHeadId FROM users WHERE user_id = iUserId;

    SELECT user_id , emp_id , designation AS label, designation AS value FROM  users WHERE user_id = iHeadId OR designation IN ("Admin");

END//
DELIMITER ;
