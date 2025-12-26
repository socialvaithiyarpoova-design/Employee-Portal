DELIMITER //

DROP PROCEDURE IF EXISTS `SP_AssignTaskToOther` //
CREATE PROCEDURE `SP_AssignTaskToOther`(
     IN iEmp_recid INT(11),
     IN iAssign_id INT(11)
)
BEGIN
    
    SET SQL_SAFE_UPDATES = 0;

    INSERT INTO assigned_task (emp_recid, assign_id) 
    VALUES (iEmp_recid, iAssign_id);

    UPDATE leads
    SET created_by = iEmp_recid
    WHERE created_by = iAssign_id;

    UPDATE fieldleads
    SET created_by = iEmp_recid
    WHERE created_by = iAssign_id;

    UPDATE users
    SET isAssigned = 1
    WHERE user_id = iAssign_id;

    SET SQL_SAFE_UPDATES = 1;
END //

DELIMITER ;
