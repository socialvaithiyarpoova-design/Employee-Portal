
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_EditProductinventry`;
CREATE PROCEDURE SP_EditProductinventry(
    IN p_inventory_recid INT,
    IN p_added_quantity INT,
    IN p_min_stock_quantity INT
)
BEGIN
    DECLARE current_quantity INT;

    -- Get existing quantity
    SELECT quantity INTO current_quantity
    FROM inventory
    WHERE inventory_recid = p_inventory_recid;

    -- Update product
    UPDATE inventory
    SET 
        quantity = current_quantity + p_added_quantity,
        updated_quantity = p_added_quantity,
        min_stock_quantity = p_min_stock_quantity,
        updated_at = NOW()
    WHERE inventory_recid = p_inventory_recid;
END //

DELIMITER ;
