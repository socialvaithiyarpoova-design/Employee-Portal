DELIMITER $$
DROP PROCEDURE IF EXISTS `SP_DeleteProduct`;
CREATE PROCEDURE `SP_DeleteProduct` (
    IN p_product_recid INT
)
BEGIN
    UPDATE product
    SET is_deleted = 1
    WHERE product_recid = p_product_recid;
END $$

DELIMITER ;
-- CALL SP_DeleteProduct(1);

