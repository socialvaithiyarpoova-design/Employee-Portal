-- DELIMITER $$
-- DROP PROCEDURE IF EXISTS `SP_GetProductsByBrand`;

-- CREATE PROCEDURE `SP_GetProductsByBrand`(
--     IN brand_name   VARCHAR(100),
--     IN form_factor  VARCHAR(100),
--     IN category     VARCHAR(100),
--     IN p_status       VARCHAR(20),
--     IN p_user_id    INT(11)
-- )
-- BEGIN
--     DECLARE sCondition VARCHAR(1000) DEFAULT '';

--     IF form_factor <> "" THEN 
--         SET sCondition = CONCAT(" AND form_factor = '",form_factor,"' ");
--     END IF;

--     IF category <> "" THEN 
--         SET sCondition = CONCAT(sCondition, " AND product_category = '",category,"' ");
--     END IF;

--     IF p_status <> "" THEN 
--         SET sCondition = CONCAT(sCondition, " AND stock_status = '",p_status,"' ");
--     END IF;

--     SET @sQuery = CONCAT(" 
--     SELECT * FROM product WHERE brand = '",brand_name,"' AND is_deleted = 0 ",sCondition," ORDER BY product_recid DESC ");

--     -- SELECT @sQuery;
--     PREPARE stmt FROM @sQuery;
--     EXECUTE stmt;
--     DEALLOCATE PREPARE stmt;
-- END $$

-- DELIMITER ;



-- DELIMITER $$
-- DROP PROCEDURE IF EXISTS `SP_GetProductsByinventoryBrand`;
-- CREATE PROCEDURE `SP_GetProductsByinventoryBrand`(
--     IN brand_name   VARCHAR(100),
--     IN p_status     VARCHAR(20),
--     IN p_user_id   INT(11)
-- )
-- BEGIN
--     DECLARE sCondition VARCHAR(1000) DEFAULT '';
    
--     -- Add stock status condition if provided
--     IF p_status <> '' AND p_status IS NOT NULL THEN 
--         SET sCondition = CONCAT(sCondition, " AND i.stock_status = '", p_status, "' ");
--     END IF;
    
--     -- Add user_id condition if provided
--     IF p_user_id IS NOT NULL AND p_user_id > 0 THEN
--         SET sCondition = CONCAT(sCondition, " AND i.dispatch_id = ", p_user_id, " ");
--     END IF;
    
--     SET @sQuery = CONCAT("
--         SELECT 
--             p.*,
--             i.inventory_recid,
--             i.dispatch_id,
--             i.product_id,
--             i.min_stock_quantity,
--             i.quantity,
--             i.stock_status,
--             i.updated_at
--         FROM 
--             vaithiyar_poova.inventory i
--         INNER JOIN 
--             product p ON i.product_id = p.product_recid
--         WHERE 
--             p.brand = '", brand_name, "' 
--             AND p.is_deleted = 0 ",
--             sCondition,
--         " ORDER BY p.product_recid DESC
--     ");
    
--     -- For debugging (uncomment if needed)
--     -- SELECT @sQuery;
    
--     PREPARE stmt FROM @sQuery;
--     EXECUTE stmt;
--     DEALLOCATE PREPARE stmt;
-- END $$
-- DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS SP_GetProductsByBrand;
CREATE PROCEDURE SP_GetProductsByBrand (
    IN brand_name   VARCHAR(100),
    IN form_factor  VARCHAR(100),
    IN category     VARCHAR(100),
    IN p_status     VARCHAR(20),
    IN p_user_id    INT(11)
)
BEGIN
    DECLARE sCondition VARCHAR(1000) DEFAULT '';
    DECLARE isAdmin INT DEFAULT 0;
    DECLARE branchId INT DEFAULT 0;
    DECLARE allowVaithyar INT DEFAULT 0;
    DECLARE allowGramiyam INT DEFAULT 0;
    -- fetch user role and branch details
    SELECT
        u.usertype_id,
        u.branch_rceid,
        b.assign_brand_vaithyar,
        b.assign_brand_gramiyam
    INTO isAdmin, branchId, allowVaithyar, allowGramiyam
    FROM users u
    LEFT JOIN branches b ON b.branch_recid = u.branch_rceid
    WHERE u.user_id = p_user_id;
    -- Build optional filters
    IF form_factor <> '' THEN
        SET sCondition = CONCAT(sCondition, " AND form_factor = '", form_factor, "' ");
    END IF;
    IF category <> '' THEN
        SET sCondition = CONCAT(sCondition, " AND product_category = '", category, "' ");
    END IF;
    IF p_status <> '' THEN
        SET sCondition = CONCAT(sCondition, " AND stock_status = '", p_status, "' ");
    END IF;
    -- NOW DECIDE WHICH QUERY TO BUILD (NO LEAVE STATEMENT REQUIRED)
    -- Case 1: ADMIN → no restrictions
    IF isAdmin = 1 THEN
        SET @sQuery = CONCAT("
            SELECT p.*
            FROM product p
            WHERE p.is_deleted = 0
              AND p.brand = '", brand_name, "'
            ", sCondition, "
            ORDER BY p.product_recid DESC
        ");
    -- Case 2: USER WITHOUT BRANCH → allow all products
    ELSEIF branchId IS NULL OR branchId = 0 THEN
        SET @sQuery = CONCAT("
            SELECT p.*
            FROM product p
            WHERE p.is_deleted = 0
              AND p.brand = '", brand_name, "'
            ", sCondition, "
            ORDER BY p.product_recid DESC
        ");
    -- Case 3: NORMAL USER WITH BRANCH RESTRICTIONS
    ELSE
        SET @sQuery = CONCAT("
            SELECT p.*
            FROM product p
            WHERE p.is_deleted = 0
              AND p.brand = '", brand_name, "'
              AND (
                    (p.brand = 'Vaithiyar Poova' AND ", allowVaithyar, " = 1)
                 OR (p.brand = 'Gramiyam'       AND ", allowGramiyam, " = 1)
              )
            ", sCondition, "
            ORDER BY p.product_recid DESC
        ");
    END IF;
    -- SINGLE EXECUTE (NO MULTIPLE RESULT SETS)
    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END $$
DELIMITER ;