


-- /* ----------------------------------------------------------------------------------------------------------------- 
--  NAME: Ajith k
--  DATE: 12/11/2025
--  DESC: Get all products assigned to user's branch with optional category filter
--  Flow: user_id → users.branch_rceid → branches.branch_recid → branches.assign_dispatch → inventory.dispatch_id → product_id → product
--  ----------------------------------------------------------------------------------------------------------------- */
-- DELIMITER //
-- DROP PROCEDURE IF EXISTS `SP_GetAllProductSale`;

-- CREATE PROCEDURE `SP_GetAllProductSale`(
--     IN sFilterData VARCHAR(1000),
--     IN user_id INT
-- )

-- BEGIN

--     DECLARE sCondition VARCHAR(1000) DEFAULT '';
--     DECLARE sQuery TEXT;

--     -- Add category filter if provided
--     IF sFilterData IS NOT NULL AND sFilterData != '' THEN
--         SET sCondition = CONCAT(" AND p.product_category IN (", sFilterData, ") ");
--     END IF;

--     SET @sQuery = CONCAT("
--         SELECT 
--             i.inventory_recid,
--             i.dispatch_id,
--             i.product_id,
--             p.product_name,
--             p.brand,
--             p.product_category,
--             p.form_factor,
--             p.product_type,
--             p.package_quantity,
--             p.units,
--             p.selling_price,
--             p.product_img,
--             br.branch_incharge_recid
--         FROM
--             inventory i
--         INNER JOIN product p ON i.product_id = p.product_id
--         INNER JOIN branches b ON i.dispatch_id = b.assign_dispatch
--         INNER JOIN branches br ON br.branch_recid = b.assign_dispatch
--         INNER JOIN users u ON b.branch_recid = u.branch_rceid
--         WHERE 
--             u.user_id = ", user_id, "
--             ", IFNULL(sCondition, ''), "
--         ORDER BY p.product_recid DESC
--     ");

--     PREPARE stmt FROM @sQuery;
--     EXECUTE stmt;
--     DEALLOCATE PREPARE stmt;
   
-- END//
-- DELIMITER ;





/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith k
 DATE: 12/11/2025
 DESC: Get all products assigned to user's branch with optional category filter
 Flow: user_id → users.branch_rceid → branches.branch_recid → branches.assign_dispatch → inventory.dispatch_id → product_id → product
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllProductSale`;
CREATE PROCEDURE `SP_GetAllProductSale`(
    IN sFilterData VARCHAR(1000),
    IN user_id INT
)
BEGIN
    DECLARE sCondition VARCHAR(1000) DEFAULT '';
    DECLARE isAdmin INT DEFAULT 0;
    DECLARE allowVaithyar INT DEFAULT 0;
    DECLARE allowGramiyam INT DEFAULT 0;
    -- Fetch user type and brand assignment
    SELECT
        u.usertype_id,
        b.assign_brand_vaithyar,
        b.assign_brand_gramiyam
    INTO isAdmin, allowVaithyar, allowGramiyam
    FROM users u
    LEFT JOIN branches b ON b.branch_recid = u.branch_rceid
    WHERE u.user_id = user_id;
    -- Category filtering
    IF sFilterData IS NOT NULL AND sFilterData != '' THEN
        SET sCondition = CONCAT(" AND p.product_category IN (", sFilterData, ") ");
    END IF;
    -- Brand filter condition (dynamic)
    SET @brandFilter = "";
    IF isAdmin != 1 THEN
        IF allowVaithyar = 1 OR allowGramiyam = 1 THEN
            SET @brandFilter = CONCAT(
                " AND (",
                    IF(allowVaithyar = 1, " p.brand = 'Vaithiyar Poova' ", " 1=0 "),
                    " OR ",
                    IF(allowGramiyam = 1, " p.brand = 'Gramiyam' ", " 1=0 "),
                ")"
            );
        END IF;
        -- If user has no brand assignments → no brand restriction applied
    END IF;
    -- Main query
    SET @sQuery = CONCAT(
        "SELECT
            i.inventory_recid,
            i.dispatch_id,
            i.product_id,
            p.product_name,
            p.brand,
            p.product_category,
            p.form_factor,
            p.product_type,
            p.package_quantity,
            p.units,
            p.selling_price,
            p.product_img,
            b.branch_incharge_recid
        FROM inventory i
        INNER JOIN product p ON p.product_id = i.product_id
        INNER JOIN branches b ON i.dispatch_id = b.assign_dispatch
        INNER JOIN users u ON u.branch_rceid = b.branch_recid
        WHERE u.user_id = ", user_id,
        @brandFilter,
        sCondition,
        " ORDER BY p.product_recid DESC"
    );
    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END//
DELIMITER ;