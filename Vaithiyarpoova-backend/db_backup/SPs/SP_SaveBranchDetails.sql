-- /* ----------------------------------------------------------------------------------------------------------------- 
--  NAME: Hariharan S
--  DATE: 19/05/2025
--  DESC: It is used save the branch list
--  ----------------------------------------------------------------------------------------------------------------- */
-- DELIMITER //

-- DROP PROCEDURE IF EXISTS `SP_SaveBranchDetails`;

-- CREATE PROCEDURE `SP_SaveBranchDetails`(
--     IN p_branch_id VARCHAR(50),
--     IN p_branch_name VARCHAR(100),
--     IN p_branch_type VARCHAR(50),
--     IN p_branch_in_charge VARCHAR(100),
--     IN p_branch_incharge_recid INT(11),
--     IN p_email VARCHAR(100),
--     IN p_phone_number VARCHAR(20),
--     IN p_address TEXT,
--     IN p_country VARCHAR(100),
--     IN p_state VARCHAR(100),
--     IN p_district VARCHAR(100),
--     IN p_location VARCHAR(100),
--     IN p_rent DECIMAL(10,2),
--     IN p_opening_date DATETIME,
--     IN p_assign_brand_gramiyam BOOLEAN,
--     IN p_assign_brand_vaithyar BOOLEAN,
--     IN p_dispatch VARCHAR(100)
-- )
-- BEGIN
--     INSERT INTO branches (
--         branch_id,
--         branch_name,
--         branch_type,
--         branch_in_charge,
--         branch_incharge_recid,
--         email,
--         phone_number,
--         address,
--         country,
--         state,
--         district,
--         location,
--         rent,
--         opening_date,
--         assign_brand_gramiyam,
--         assign_brand_vaithyar,
--         created_at,
--         assign_dispatch
--     ) VALUES (
--         p_branch_id,
--         p_branch_name,
--         p_branch_type,
--         p_branch_in_charge,
--         p_branch_incharge_recid,
--         p_email,
--         p_phone_number,
--         p_address,
--         p_country,
--         p_state,
--         p_district,
--         p_location,
--         p_rent,
--         p_opening_date,
--         p_assign_brand_gramiyam,
--         p_assign_brand_vaithyar,
--         NOW(),
--         p_dispatch
--     );

--     SELECT * FROM branches ORDER BY 1 DESC;
-- END//

-- DELIMITER ;


/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith
 DATE: 19/05/2025
 DESC: It is used save the branch list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_SaveBranchDetails`;

CREATE PROCEDURE `SP_SaveBranchDetails`(
    IN p_branch_id VARCHAR(50),
    IN p_branch_name VARCHAR(100),
    IN p_branch_type VARCHAR(50),
    IN p_branch_in_charge VARCHAR(100),
    IN p_branch_incharge_recid INT(11),
    IN p_email VARCHAR(100),
    IN p_phone_number VARCHAR(20),
    IN p_address TEXT,
    IN p_country VARCHAR(100),
    IN p_state VARCHAR(100),
    IN p_district VARCHAR(100),
    IN p_location VARCHAR(100),
    IN p_rent DECIMAL(10,2),
    IN p_opening_date DATETIME,
    IN p_assign_brand_gramiyam BOOLEAN,
    IN p_assign_brand_vaithyar BOOLEAN,
    IN p_dispatch VARCHAR(100)
)
BEGIN

    DECLARE v_branch_incharge_recid INT(11) DEFAULT NULL;
    DECLARE v_branch_in_charge VARCHAR(100) DEFAULT NULL;
    DECLARE v_email VARCHAR(100) DEFAULT NULL;
    DECLARE v_phone_number VARCHAR(20) DEFAULT NULL;

    IF p_branch_incharge_recid IS NOT NULL AND p_branch_incharge_recid != 0 THEN
        SET v_branch_incharge_recid = p_branch_incharge_recid;
    END IF;

    IF p_branch_in_charge IS NOT NULL AND p_branch_in_charge != '' THEN
        SET v_branch_in_charge = p_branch_in_charge;
    END IF;

    IF p_email IS NOT NULL AND p_email != '' THEN
        SET v_email = p_email;
    END IF;

    IF p_phone_number IS NOT NULL AND p_phone_number != '' THEN
        SET v_phone_number = p_phone_number;
    END IF;

    INSERT INTO branches (
        branch_id,
        branch_name,
        branch_type,
        branch_in_charge,
        branch_incharge_recid,
        email,
        phone_number,
        address,
        country,
        state,
        district,
        location,
        rent,
        opening_date,
        assign_brand_gramiyam,
        assign_brand_vaithyar,
        created_at,
        assign_dispatch
    )
    VALUES (
        p_branch_id,
        p_branch_name,
        p_branch_type,
        v_branch_in_charge,
        v_branch_incharge_recid,
        v_email,
        v_phone_number,
        p_address,
        p_country,
        p_state,
        p_district,
        p_location,
        p_rent,
        p_opening_date,
        p_assign_brand_gramiyam,
        p_assign_brand_vaithyar,
        NOW(),
        p_dispatch
    );

    SET @new_branch_recid = LAST_INSERT_ID();

    IF p_branch_type = 'Dispatch' THEN
        INSERT INTO inventory (product_id, dispatch_id,stock_status)
        SELECT product_id, @new_branch_recid ,'Not Available'
        FROM product 
        WHERE is_deleted = 0;
    END IF;

    SELECT @new_branch_recid AS branch_recid;

END//

DELIMITER ;
