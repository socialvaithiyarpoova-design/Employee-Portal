DELIMITER //

DROP PROCEDURE IF EXISTS SP_Editstockqty;

CREATE PROCEDURE SP_Editstockqty(
    IN p_stock_recid INT,
    IN p_added_quantity INT
)
BEGIN
    DECLARE current_quantity INT;

    -- Get existing stock quantity
    SELECT stock_quantity INTO current_quantity
    FROM stock
    WHERE stock_recid = p_stock_recid;

    -- Update stock table
    UPDATE stock
    SET 
        stock_quantity = current_quantity + p_added_quantity,
        updated_qty = p_added_quantity,
        updated_at = NOW()
    WHERE stock_recid = p_stock_recid;
END //

DELIMITER ;
