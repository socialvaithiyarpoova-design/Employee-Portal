/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Lead Pool Summary
 DESC: Per-employee, per-branch lead summary with counts
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetLeadPoolSummary`;//

CREATE PROCEDURE `SP_GetLeadPoolSummary`(
    IN p_viewMode   VARCHAR(16),
    IN p_fromDate   DATETIME,
    IN p_toDate     DATETIME,
    IN p_branch_id  INT,
    IN p_emp_id     INT
)
BEGIN
    DECLARE v_from DATETIME;
    DECLARE v_to   DATETIME;

    IF p_viewMode = 'today' THEN
        SET v_from = CONCAT(CURDATE(), ' 00:00:00');
        SET v_to   = CONCAT(CURDATE(), ' 23:59:59');
    ELSE
        SET v_from = p_fromDate;
        SET v_to   = p_toDate;
    END IF;

    SET @where := ' WHERE 1=1 ';
    IF v_from IS NOT NULL AND v_to IS NOT NULL THEN
        SET @where := CONCAT(@where, ' AND l.created_at BETWEEN ''', DATE_FORMAT(v_from, '%Y-%m-%d %H:%i:%s'), ''' AND ''', DATE_FORMAT(v_to, '%Y-%m-%d %H:%i:%s'), ''' ');
    END IF;
    IF p_emp_id IS NOT NULL THEN
        SET @where := CONCAT(@where, ' AND u.user_id = ', p_emp_id, ' ');
    END IF;
    IF p_branch_id IS NOT NULL THEN
        SET @where := CONCAT(@where,
            ' AND u.user_id IN ( SELECT US.user_id FROM branches BR ' ,
            ' LEFT JOIN users US ON US.created_by = BR.branch_incharge_recid WHERE BR.branch_recid = ', p_branch_id, ' ) ');
    END IF;

    SET @sql := CONCAT(
        'SELECT ',
            'COALESCE(b.branch_name, ''-'') AS branch_name, ',
            'u.emp_id, ',
            'u.name AS employee_name, ',
            'COUNT(DISTINCT l.lead_id) AS leads, ',
            'SUM(l.disposition = ''Follow up'') AS follow_up, ',
            'SUM(l.disposition = ''Call back'') AS callback, ',
            '(SUM(l.disposition = ''Follow up'') + SUM(l.disposition = ''Call back'')) AS total ',
        'FROM leads l ',
        'LEFT JOIN users u ON u.user_id = l.created_by ',
        'LEFT JOIN branches b ON b.branch_incharge_recid = u.created_by ',
        @where,
        ' GROUP BY b.branch_name, u.emp_id, u.name ',
        ' ORDER BY b.branch_name, u.emp_id' 
    );

    PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
END//

DELIMITER ;