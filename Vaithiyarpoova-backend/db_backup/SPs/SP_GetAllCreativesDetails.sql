/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajith
 DATE: 08/07/2025
 DESC: Get all creative services with role-based access 
       - Admin sees ALL creativeservices (optionally filtered by branch)
       - Branch Head sees only their branch creativeservices + their own uploads
 FIXED: Uses LEFT JOINs + COALESCE for proper branch matching
 ----------------------------------------------------------------------------------------------------------------- */

DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetAllCreativesDetails` //

CREATE PROCEDURE `SP_GetAllCreativesDetails`(
    IN p_status       VARCHAR(100),
    IN p_fromDate     DATETIME,
    IN p_toDate       DATETIME,
    IN p_employee_id  INT,
    IN p_branch_id    INT,
    IN p_type         VARCHAR(100),
    IN p_user_id      INT,
    IN p_user_type    VARCHAR(50)
)
BEGIN
    DECLARE sCondition VARCHAR(2000) DEFAULT '';
    DECLARE user_branch_id INT DEFAULT NULL;

    /* ===== Get branch id for Branch Head ===== */
    IF p_user_type = 'BH' THEN
        SELECT branch_rceid INTO user_branch_id
        FROM users
        WHERE user_id = p_user_id
        LIMIT 1;
    END IF;


    /* ===== Status Filter ===== */
    IF p_status IS NOT NULL AND p_status <> '' THEN
        SET sCondition = CONCAT(
            sCondition,
            ' WHERE UPPER(cs.status) = UPPER("', REPLACE(p_status, '"', '""'), '") '
        );
    END IF;


    /* ===== Type Filter ===== */
    IF p_type IS NOT NULL AND p_type <> '' THEN
        SET sCondition = CONCAT(
            sCondition,
            CASE WHEN sCondition = '' THEN ' WHERE ' ELSE ' AND ' END,
            ' UPPER(cs.type) = UPPER("', REPLACE(p_type, '"', '""'), '") '
        );
    END IF;


    /* ===== Date Filters ===== */
    IF p_fromDate IS NOT NULL AND p_toDate IS NOT NULL THEN
        SET sCondition = CONCAT(
            sCondition,
            CASE WHEN sCondition = '' THEN ' WHERE ' ELSE ' AND ' END,
            " DATE(cs.created_at) BETWEEN DATE('", DATE_FORMAT(p_fromDate, '%Y-%m-%d'), "') ",
            " AND DATE('", DATE_FORMAT(p_toDate, '%Y-%m-%d'), "') "
        );
    ELSEIF p_fromDate IS NOT NULL THEN
        SET sCondition = CONCAT(
            sCondition,
            CASE WHEN sCondition = '' THEN ' WHERE ' ELSE ' AND ' END,
            " DATE(cs.created_at) >= DATE('", DATE_FORMAT(p_fromDate, '%Y-%m-%d'), "') "
        );
    ELSEIF p_toDate IS NOT NULL THEN
        SET sCondition = CONCAT(
            sCondition,
            CASE WHEN sCondition = '' THEN ' WHERE ' ELSE ' AND ' END,
            " DATE(cs.created_at) <= DATE('", DATE_FORMAT(p_toDate, '%Y-%m-%d'), "') "
        );
    END IF;


    /* ===== Employee Filter ===== */
    IF p_employee_id IS NOT NULL AND p_employee_id > 0 THEN
        SET sCondition = CONCAT(
            sCondition,
            CASE WHEN sCondition = '' THEN ' WHERE ' ELSE ' AND ' END,
            ' cs.emp_id = ', p_employee_id, ' '
        );
    END IF;


    /* ===== Branch Restriction by Role ===== */

    /* BRANCH HEAD: show creativeservices from their branch + their own uploads */
    IF p_user_type = 'BH' THEN
        IF user_branch_id IS NOT NULL THEN
            SET sCondition = CONCAT(
                sCondition,
                CASE WHEN sCondition = '' THEN ' WHERE (' ELSE ' AND (' END,
                ' COALESCE(b.branch_recid, u.branch_rceid) = ', user_branch_id,
                ' OR cs.emp_id = ', p_user_id,
                ') '
            );
        END IF;
    
    /* ADMIN: Optional branch filter - shows ALL creativeservices if no branch filter */
    ELSEIF p_user_type = 'AD' THEN
        IF p_branch_id IS NOT NULL AND p_branch_id > 0 THEN
            SET sCondition = CONCAT(
                sCondition,
                CASE WHEN sCondition = '' THEN ' WHERE ' ELSE ' AND ' END,
                ' COALESCE(b.branch_recid, u.branch_rceid) = ', p_branch_id, ' '
            );
        END IF;
    END IF;


    /* ===== Final dynamic query with LEFT JOINs ===== */
    SET @sQuery = CONCAT(
        'SELECT ',
        '   cs.creative_id, ',
        '   cs.emp_id, ',
        '   COALESCE(u.name, "Unknown") AS emp_name, ',
        '   cs.title, ',
        '   cs.type, ',
        '   cs.description, ',
        '   cs.date_to_post, ',
        '   cs.created_at, ',
        '   cs.status, ',
        '   cs.total_working_time, ',
        '   COALESCE(b.branch_recid, u.branch_rceid) AS branch_recid ',
        'FROM creativeservice cs ',
        'LEFT JOIN users u ON cs.emp_id = u.user_id ',
        'LEFT JOIN branches b ON u.branch_rceid = b.branch_recid ',
        sCondition,
        ' ORDER BY cs.created_at DESC'
    );

    PREPARE stmt FROM @sQuery;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

END //

DELIMITER ;