

SET SQL_SAFE_UPDATES = 0;

UPDATE vaithiyar_poova.users
SET branch_rceid = 124
WHERE user_id = 177;

SET SQL_SAFE_UPDATES = 1;



DROP TRIGGER IF EXISTS trg_branch_incharge_insert;

DELIMITER $$

CREATE TRIGGER trg_branch_incharge_insert
AFTER INSERT ON branches
FOR EACH ROW
BEGIN
    IF NEW.branch_incharge_recid IS NOT NULL THEN
        
        UPDATE users
        SET 
            created_by = NEW.branch_incharge_recid,
            branch_rceid = NEW.branch_recid
        WHERE user_id = NEW.branch_incharge_recid;

    END IF;
END$$

DELIMITER ;


DELIMITER //
DROP TRIGGER IF EXISTS trg_branch_incharge_update;
CREATE TRIGGER trg_branch_incharge_update
AFTER UPDATE ON branches
FOR EACH ROW
BEGIN
    IF OLD.branch_incharge_recid <> NEW.branch_incharge_recid THEN

        UPDATE users
        SET 
            created_by = NEW.branch_incharge_recid,
            branch_rceid = NEW.branch_recid
        WHERE user_id = NEW.branch_incharge_recid;

        IF NEW.branch_type = 'Dispatch' THEN

            UPDATE sales
            SET dispatch_id = NEW.branch_incharge_recid
            WHERE dispatch_id = OLD.branch_incharge_recid;

            UPDATE fieldshopsales
            SET dispatch_id = NEW.branch_incharge_recid
            WHERE dispatch_id = OLD.branch_incharge_recid;

        END IF;

    END IF;
END //
DELIMITER ;


