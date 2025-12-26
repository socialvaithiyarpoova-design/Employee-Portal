/* -----------------------------------------------------------------------------------------------------------------
   NAME: ajith
   DATE: 01/09/2025
   DESC: Returns profile header info plus type-specific KPIs based on user_typecode.
         - Always returns Resultset 1: Basic profile header (from `users`)
         - Returns Resultset 2: KPIs tailored per role (safe defaults where data model differs)
         - Returns Resultset 3: Echo of inputs and detected role for debugging/traceability

   INPUTS:
     p_user_id        INT
     p_user_typecode  VARCHAR(10)    -- AD, TSL, TCL, BH, AC, DIS, FS, FOI, VA, CS

----------------------------------------------------------------------------------------------------------------- */

DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetProfileData`;//

CREATE PROCEDURE `SP_GetProfileData`(
    IN p_user_id INT,
    IN p_user_typecode VARCHAR(10)
)
BEGIN

    DECLARE v_monthly_incentive DECIMAL(18,2) DEFAULT 0;
    DECLARE v_total_incentive DECIMAL(18,2) DEFAULT 0;
    DECLARE v_current_milestone DECIMAL(18,2) DEFAULT 0;
    DECLARE v_monthly_target DECIMAL(18,2) DEFAULT 0;
    DECLARE v_incentive_pct DECIMAL(5,2) DEFAULT 0;
    DECLARE v_start_date DATE; /* first sale date per user/type */
    DECLARE v_team_sales_total DECIMAL(18,2) DEFAULT 0;
    DECLARE v_team_target_total DECIMAL(18,2) DEFAULT 0;

    /* ---------------------------------------------------------------
       Resultset 1: Profile header (basic information)
       --------------------------------------------------------------- */
    SELECT 
        u.user_id,
        u.emp_id,
        u.name,
        u.designation,
        u.mobile_number,
        u.email,
        u.date_of_joining,
        u.image_url
    FROM users u
    WHERE u.user_id = p_user_id
    LIMIT 1;

    /* ---------------------------------------------------------------
       Resultset 2: Incentive Summary based on sales data
       Logic: 
          - For TSL, TCL, VA, FOI: use `sales` table
          - For FS: use `fieldshopsales` table
            - incentive = SUM(total_value * (incentive_percentage/100))
          - monthly_incentive = current month sales incentive
          - total_incentive = all-time sales incentive
       --------------------------------------------------------------- */

    /* Get user's incentive percentage */
    SELECT COALESCE(u.incentive_percentage, 0)
    INTO v_incentive_pct
    FROM users u WHERE u.user_id = p_user_id LIMIT 1;

    IF p_user_typecode IN ('TSL', 'TCL', 'VA', 'FOI') THEN
        /* Calculate from sales table (from first sale date onwards) */
        /* Determine first sale date */
        SELECT COALESCE(MIN(DATE(s.date_time)), CURDATE())
        INTO v_start_date
        FROM sales s
        WHERE s.created_by = p_user_id;
        
        /* Monthly incentive (current month) */
        SELECT COALESCE(SUM(ROUND(s.total_value * (v_incentive_pct / 100), 2)), 0)
        INTO v_monthly_incentive
        FROM sales s
        WHERE s.created_by = p_user_id
          AND DATE(s.date_time) >= v_start_date
          AND DATE_FORMAT(s.date_time, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m');

        /* Total incentive (from date of joining) */
        SELECT COALESCE(SUM(ROUND(s.total_value * (v_incentive_pct / 100), 2)), 0)
        INTO v_total_incentive
        FROM sales s
        WHERE s.created_by = p_user_id
          AND DATE(s.date_time) >= v_start_date;

        /* Current milestone = current month sales amount (not incentive) */
        SELECT COALESCE(SUM(s.total_value), 0)
        INTO v_current_milestone
        FROM sales s
        WHERE s.created_by = p_user_id
          AND DATE_FORMAT(s.date_time, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m');

    ELSEIF p_user_typecode = 'FS' THEN
        /* Calculate from fieldshopsales table (from first sale date onwards) */
        /* Determine first field shop sale date */
        SELECT COALESCE(MIN(DATE(fs.created_at)), CURDATE())
        INTO v_start_date
        FROM fieldshopsales fs
        WHERE fs.created_by = p_user_id;
        
        /* Monthly incentive (current month) */
        SELECT COALESCE(SUM(ROUND(fs.total_value * (v_incentive_pct / 100), 2)), 0)
        INTO v_monthly_incentive
        FROM fieldshopsales fs
        WHERE fs.created_by = p_user_id
          AND DATE(fs.created_at) >= v_start_date
          AND DATE_FORMAT(fs.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m');

        /* Total incentive (from date of joining) */
        SELECT COALESCE(SUM(ROUND(fs.total_value * (v_incentive_pct / 100), 2)), 0)
        INTO v_total_incentive
        FROM fieldshopsales fs
        WHERE fs.created_by = p_user_id
          AND DATE(fs.created_at) >= v_start_date;

        /* Current milestone = current month field sales amount (not incentive) */
        SELECT COALESCE(SUM(fs.total_value), 0)
        INTO v_current_milestone
        FROM fieldshopsales fs
        WHERE fs.created_by = p_user_id
          AND DATE_FORMAT(fs.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m');

    ELSEIF p_user_typecode = 'BH' THEN
        /* Branch Head: sum of sales from 5 user types in their branch */
        SET v_team_sales_total = 0;
        SET v_team_target_total = 0;
        SET v_start_date = CURDATE(); /* BH doesn't have individual sales, use current date */

        /* Get current month team sales (TSL, TCL, VA, FOI from sales table + FS from fieldshopsales) */
        SELECT COALESCE(SUM(s.total_value), 0)
        INTO v_team_sales_total
        FROM sales s
        JOIN users u ON s.created_by = u.user_id
        JOIN usertype ut ON u.usertype_id = ut.usertype_id
        WHERE u.created_by = p_user_id
          AND ut.user_typecode IN ('TSL', 'TCL', 'VA', 'FOI')
          AND DATE_FORMAT(s.date_time, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m');

        /* Add current month FS sales from fieldshopsales */
        SELECT COALESCE(v_team_sales_total + SUM(fs.total_value), v_team_sales_total)
        INTO v_team_sales_total
        FROM fieldshopsales fs
        JOIN users u ON fs.created_by = u.user_id
        JOIN usertype ut ON u.usertype_id = ut.usertype_id
        WHERE u.created_by = p_user_id
          AND ut.user_typecode = 'FS'
          AND DATE_FORMAT(fs.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m');

        /* Get team monthly targets */
        SELECT COALESCE(SUM(mt.monthly_target), 0)
        INTO v_team_target_total
        FROM monthly_target mt
        JOIN users u ON mt.created_to = u.user_id
        JOIN usertype ut ON u.usertype_id = ut.usertype_id
        WHERE u.created_by = p_user_id
          AND ut.user_typecode IN ('TSL', 'TCL', 'VA', 'FOI', 'FS')
          AND mt.id = (
            SELECT MAX(mt2.id) FROM monthly_target mt2 
            WHERE mt2.created_to = mt.created_to
          );

        SET v_monthly_incentive = 0; /* BH doesn't get sales incentive */
        SET v_total_incentive = 0;
        SET v_current_milestone = v_team_sales_total;
        SET v_monthly_target = v_team_target_total;

    ELSE
        /* Other user types get 0 incentives and targets */
        SET v_monthly_incentive = 0;
        SET v_total_incentive = 0;
        SET v_current_milestone = 0;
        SET v_monthly_target = 0;
        SET v_start_date = CURDATE(); /* Default start date for non-sales users */
    END IF;

    /* For individual sales users (TSL, TCL, VA, FOI, FS): get monthly target from table */
    IF p_user_typecode IN ('TSL', 'TCL', 'VA', 'FOI', 'FS') THEN
        SELECT COALESCE(mt.monthly_target, 0)
        INTO v_monthly_target
        FROM monthly_target mt
        WHERE mt.code_des = p_user_typecode
        ORDER BY mt.created_at DESC
        LIMIT 1;
    END IF;

    SELECT v_monthly_incentive AS monthly_incentive,
           v_total_incentive AS total_incentive,
           v_current_milestone AS current_milestone,
           v_monthly_target AS monthly_target;

        /* ---------------------------------------------------------------
       Resultset 3: Achievements (last 4 months - current, last, 2 ago, 3 ago)
       Columns: amount (total sales), month
       --------------------------------------------------------------- */
    
    /* For ALL user types: get top performers across all users for last 4 months */
    SELECT
        COALESCE(top_performer.month_total, 0) AS amount,
        DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL months.n MONTH), '%M %Y') AS month,
        top_performer.top_performer_name,
        top_performer.top_performer_emp_id
    FROM (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) months
    LEFT JOIN (
        -- Get top performer for each month (highest sales between sales and fieldshopsales)
        SELECT 
            month_year,
            top_performer_name,
            top_performer_emp_id,
            month_total
        FROM (
            SELECT 
                month_year,
                top_performer_name,
                top_performer_emp_id,
                month_total,
                ROW_NUMBER() OVER (PARTITION BY month_year ORDER BY month_total DESC) as rn
            FROM (
                -- Sales table top performers
                SELECT 
                    DATE_FORMAT(s.date_time, '%Y-%m') AS month_year,
                    u.name AS top_performer_name,
                    u.emp_id AS top_performer_emp_id,
                    SUM(s.total_value) AS month_total
                FROM sales s
                JOIN users u ON s.created_by = u.user_id
                WHERE DATE_FORMAT(s.date_time, '%Y-%m') IN (
                    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 0 MONTH), '%Y-%m'),
                    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'),
                    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m'),
                    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m')
                )
                GROUP BY DATE_FORMAT(s.date_time, '%Y-%m'), u.name, u.emp_id
                
                UNION ALL
                
                -- Fieldshopsales table top performers
                SELECT 
                    DATE_FORMAT(fs.created_at, '%Y-%m') AS month_year,
                    u.name AS top_performer_name,
                    u.emp_id AS top_performer_emp_id,
                    SUM(fs.total_value) AS month_total
                FROM fieldshopsales fs
                JOIN users u ON fs.created_by = u.user_id
                WHERE DATE_FORMAT(fs.created_at, '%Y-%m') IN (
                    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 0 MONTH), '%Y-%m'),
                    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'),
                    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m'),
                    DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m')
                )
                GROUP BY DATE_FORMAT(fs.created_at, '%Y-%m'), u.name, u.emp_id
            ) combined_sales
        ) ranked_sales
        WHERE rn = 1
    ) top_performer ON DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL months.n MONTH), '%Y-%m') = top_performer.month_year
    ORDER BY months.n ASC;

    /* ---------------------------------------------------------------
       Resultset 4: Echo inputs & role (for quick diagnostics)
       --------------------------------------------------------------- */
    SELECT p_user_id AS user_id, p_user_typecode AS user_typecode;

END //

DELIMITER ;


