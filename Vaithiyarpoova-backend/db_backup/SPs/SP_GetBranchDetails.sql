/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 21/05/2025
 DESC: It is used get the branch list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetBranchDetails`;

CREATE PROCEDURE `SP_GetBranchDetails`(
    IN userId INT(11),
    IN user_code VARCHAR(20),
    IN branch_id INT(11),
    IN countryFilter VARCHAR(150),
    IN stateFilter VARCHAR(150),
    IN districtFilter VARCHAR(150)
)
BEGIN

    DECLARE sCondition VARCHAR(1000) DEFAULT '';

     IF branch_id IS NOT NULL AND branch_id != 0 THEN
        SET sCondition = CONCAT(sCondition, " AND branch_recid = ", branch_id, " ");
    END IF;

    -- Country filter
    IF countryFilter IS NOT NULL AND countryFilter != '' THEN
        SET sCondition = CONCAT(sCondition, " AND country = '", countryFilter, "' ");
    END IF;

    -- State filter
    IF stateFilter IS NOT NULL AND stateFilter != '' THEN
        SET sCondition = CONCAT(sCondition, " AND state = '", stateFilter, "' ");
    END IF;

    -- District filter
    IF districtFilter IS NOT NULL AND districtFilter != '' THEN
        SET sCondition = CONCAT(sCondition, " AND district = '", districtFilter, "' ");
    END IF;


    IF user_code = "AD" THEN
        SET @sQuery = CONCAT(" SELECT 
            branch_recid,
            branch_id,
            branch_name,
            branch_type,
            phone_number,
            branch_in_charge,
            branch_incharge_recid,
            country,
            state,
            district,
            email,
            opening_date,
            rent,
            location,
            address,
            assign_brand_vaithyar,
            assign_brand_gramiyam,
            created_at
        FROM
            branches 
        WHERE isDeleted = 0 ",sCondition,"
        ORDER BY 1 DESC ");

        -- SELECT @sQuery;
        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    ELSE
        SET @sQuery = CONCAT(" SELECT 
            branch_recid,
            branch_id,
            branch_name,
            branch_type,
            phone_number,
            branch_in_charge,
            branch_incharge_recid,
            country,
            state,
            district,
            email,
            opening_date,
            rent,
            location,
            address,
            assign_brand_vaithyar ,
            assign_brand_gramiyam,
            created_at
        FROM
            branches 
        WHERE 
            isDeleted = 0 AND branch_incharge_recid = ",userId,"  ",sCondition,"
        ORDER BY 1 DESC");

        -- SELECT @sQuery;
        PREPARE stmt FROM @sQuery;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

    END IF;

END//

DELIMITER ;

