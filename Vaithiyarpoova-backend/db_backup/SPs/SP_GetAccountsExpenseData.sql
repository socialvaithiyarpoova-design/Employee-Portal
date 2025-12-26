-- DELIMITER //
-- DROP PROCEDURE IF EXISTS `SP_GetAccountsExpenseData`;

-- CREATE PROCEDURE `SP_GetAccountsExpenseData`(
--     IN iUserId INT(11),
--     IN sCode VARCHAR(100)
-- )
-- BEGIN

--     IF sCode IN ("AD", "AC") THEN
--         -- ADMIN CODE
        
--         SELECT SUM(salary) INTO @saleryMonthAmount FROM users WHERE isDeleted = 0;
--         SELECT SUM(salary) INTO @saleryTotalAmount FROM users WHERE isDeleted = 0;

--         SELECT 
--             ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)), 2)  INTO @saleryMonthIncentive
--         FROM users AS US
--         LEFT JOIN sales AS SL ON SL.created_by = US.user_id
--         WHERE SL.total_value IS NOT NULL AND US.isDeleted = 0 AND SL.status IN ('Approved', 'Dispatched', 'In transit') 
--         AND MONTH(SL.date_time) = MONTH(CURDATE()) AND YEAR(SL.date_time) = YEAR(CURDATE());

--         SELECT 
--             ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)), 2) INTO @saleryTotalIncentive
--         FROM users AS US
--         LEFT JOIN sales AS SL ON SL.created_by = US.user_id
--         WHERE SL.total_value IS NOT NULL AND US.isDeleted = 0 AND SL.status IN ('Approved', 'Dispatched', 'In transit');

--         SELECT 
--             ROUND(SUM(FSL.total_value * (FUS.incentive_percentage / 100)), 2) INTO @fsaleryMonthIncentive
--         FROM users AS FUS
--         LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = FUS.user_id
--         WHERE FSL.total_value IS NOT NULL AND FUS.isDeleted = 0 AND FSL.status IN ('Approved', 'Dispatched', 'In transit') 
--         AND MONTH(FSL.date_time) = MONTH(CURDATE()) AND YEAR(FSL.date_time) = YEAR(CURDATE());

--         SELECT 
--             ROUND(SUM(FSL.total_value * (FUS.incentive_percentage / 100)), 2) INTO @fsaleryTotalIncentive
--         FROM users AS FUS
--         LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = FUS.user_id
--         WHERE FSL.total_value IS NOT NULL AND FUS.isDeleted = 0 AND FSL.status IN ('Approved', 'Dispatched', 'In transit');

--         SELECT SUM(amount) INTO @saleryMonthOtherExp FROM expenses 
--         WHERE MONTH(created_at) = MONTH(CURDATE()) AND status = 'approved' AND YEAR(created_at) = YEAR(CURDATE());
        
--         SELECT SUM(amount) INTO @saleryTotalOtherExp FROM expenses WHERE status = 'approved';

--         SELECT SUM(rent) INTO @salerymonthRent FROM branches WHERE isDeleted = 0;
        
--         SELECT ROUND(SUM(
--           rent * (
--             (YEAR(CURDATE()) - YEAR(created_at)) * 12 + 
--             (MONTH(CURDATE()) - MONTH(created_at)) + 1
--           )
--         ), 2) INTO @saleryTotalRent
--         FROM branches WHERE isDeleted = 0;

--         SELECT 
--         IFNULL(ROUND(@saleryMonthAmount, 2), 0) AS monthly_salary,
--         ROUND(IFNULL(@saleryMonthIncentive, 0) + IFNULL(@fsaleryMonthIncentive, 0), 2) AS monthly_incentive,
--         IFNULL(ROUND(@saleryMonthOtherExp, 2), 0) AS monthly_other_exp,
--         IFNULL(ROUND(@salerymonthRent, 2), 0) AS monthly_rent,
--         ROUND(IFNULL(@saleryMonthAmount, 0) + IFNULL(@saleryMonthIncentive, 0) + IFNULL(@fsaleryMonthIncentive, 0) + IFNULL(@saleryMonthOtherExp, 0) + IFNULL(@salerymonthRent, 0), 2) AS monthly_total_expenses,
        
--         IFNULL(ROUND(@saleryTotalAmount, 2), 0) AS total_salery_expenses,
--         ROUND(IFNULL(@saleryTotalIncentive, 0) + IFNULL(@fsaleryTotalIncentive, 0), 2) AS total_incentive_expenses,
--         IFNULL(ROUND(@saleryTotalOtherExp, 2), 0) AS total_other_expenses,
--         IFNULL(ROUND(@saleryTotalRent, 2), 0) AS total_rent_expenses,
--         ROUND(IFNULL(@saleryTotalAmount, 0) + IFNULL(@saleryTotalIncentive, 0) + IFNULL(@fsaleryTotalIncentive, 0) + IFNULL(@saleryTotalOtherExp, 0) + IFNULL(@saleryTotalRent, 0), 2) AS total_expenses;

--     ELSE 
--         -- BRANCH HEAD (BH) OR MANAGER CODE
--         -- Get all users created_by = iUserId (the branch manager/head)
--         -- Then get sales/fieldshopsales for those users
        
--         SELECT SUM(salary) INTO @saleryMonthAmount FROM users 
--         WHERE isDeleted = 0 AND created_by = iUserId;
        
--         SELECT SUM(salary) INTO @saleryTotalAmount FROM users 
--         WHERE isDeleted = 0 AND created_by = iUserId;

--         -- MONTHLY SALES INCENTIVE (Only Approved, Dispatched, In transit)
--         SELECT 
--             ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)), 2) INTO @saleryMonthIncentive
--         FROM users AS US
--         LEFT JOIN sales AS SL ON SL.created_by = US.user_id
--         WHERE SL.total_value IS NOT NULL AND US.isDeleted = 0 
--         AND SL.status IN ('Approved', 'Dispatched', 'In transit') 
--         AND MONTH(SL.date_time) = MONTH(CURDATE()) AND YEAR(SL.date_time) = YEAR(CURDATE())
--         AND US.created_by = iUserId;

--         -- TOTAL SALES INCENTIVE (Only Approved, Dispatched, In transit)
--         SELECT 
--             ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)), 2) INTO @saleryTotalIncentive
--         FROM users AS US
--         LEFT JOIN sales AS SL ON SL.created_by = US.user_id
--         WHERE SL.total_value IS NOT NULL AND US.isDeleted = 0 
--         AND SL.status IN ('Approved', 'Dispatched', 'In transit')
--         AND US.created_by = iUserId;

--         -- MONTHLY FIELD SHOP SALES INCENTIVE (Only Approved, Dispatched, In transit)
--         SELECT 
--             ROUND(SUM(FSL.total_value * (FUS.incentive_percentage / 100)), 2) INTO @fsaleryMonthIncentive
--         FROM users AS FUS
--         LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = FUS.user_id
--         WHERE FSL.total_value IS NOT NULL AND FUS.isDeleted = 0 
--         AND FSL.status IN ('Approved', 'Dispatched', 'In transit') 
--         AND MONTH(FSL.date_time) = MONTH(CURDATE()) AND YEAR(FSL.date_time) = YEAR(CURDATE())
--         AND FUS.created_by = iUserId;

--         -- TOTAL FIELD SHOP SALES INCENTIVE (Only Approved, Dispatched, In transit)
--         SELECT 
--             ROUND(SUM(FSL.total_value * (FUS.incentive_percentage / 100)), 2) INTO @fsaleryTotalIncentive
--         FROM users AS FUS
--         LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = FUS.user_id
--         WHERE FSL.total_value IS NOT NULL AND FUS.isDeleted = 0 
--         AND FSL.status IN ('Approved', 'Dispatched', 'In transit')
--         AND FUS.created_by = iUserId;

--         -- MONTHLY OTHER EXPENSES FOR USER
--         SELECT SUM(amount) INTO @saleryMonthOtherExp FROM expenses 
--         WHERE MONTH(created_at) = MONTH(CURDATE()) AND status = 'approved' AND created_by = iUserId AND YEAR(created_at) = YEAR(CURDATE());
        
--         -- TOTAL OTHER EXPENSES FOR USER
--         SELECT SUM(amount) INTO @saleryTotalOtherExp FROM expenses WHERE status = 'approved' AND created_by = iUserId;

--         -- MONTHLY RENT FOR USER'S BRANCHES (ALL ACTIVE BRANCHES UNDER THIS USER)
--         SELECT SUM(rent) INTO @salerymonthRent FROM branches 
--         WHERE isDeleted = 0 AND branch_incharge_recid = iUserId;
        
--         -- TOTAL RENT FOR USER'S BRANCHES (CUMULATIVE)
--         SELECT ROUND(SUM(
--           rent * (
--             (YEAR(CURDATE()) - YEAR(created_at)) * 12 + 
--             (MONTH(CURDATE()) - MONTH(created_at)) + 1
--           )
--         ), 2) INTO @saleryTotalRent
--         FROM branches WHERE isDeleted = 0 AND branch_incharge_recid = iUserId;

--         -- RETURN MONTHLY BREAKDOWN + TOTAL BREAKDOWN
--         SELECT 
--         IFNULL(ROUND(@saleryMonthAmount, 2), 0) AS monthly_salary,
--         ROUND(IFNULL(@saleryMonthIncentive, 0) + IFNULL(@fsaleryMonthIncentive, 0), 2) AS monthly_incentive,
--         IFNULL(ROUND(@saleryMonthOtherExp, 2), 0) AS monthly_other_exp,
--         IFNULL(ROUND(@salerymonthRent, 2), 0) AS monthly_rent,
--         ROUND(IFNULL(@saleryMonthAmount, 0) + IFNULL(@saleryMonthIncentive, 0) + IFNULL(@fsaleryMonthIncentive, 0) + IFNULL(@saleryMonthOtherExp, 0) + IFNULL(@salerymonthRent, 0), 2) AS monthly_total_expenses,
        
--         IFNULL(ROUND(@saleryTotalAmount, 2), 0) AS total_salery_expenses,
--         ROUND(IFNULL(@saleryTotalIncentive, 0) + IFNULL(@fsaleryTotalIncentive, 0), 2) AS total_incentive_expenses,
--         IFNULL(ROUND(@saleryTotalOtherExp, 2), 0) AS total_other_expenses,
--         IFNULL(ROUND(@saleryTotalRent, 2), 0) AS total_rent_expenses,
--         ROUND(IFNULL(@saleryTotalAmount, 0) + IFNULL(@saleryTotalIncentive, 0) + IFNULL(@fsaleryTotalIncentive, 0) + IFNULL(@saleryTotalOtherExp, 0) + IFNULL(@saleryTotalRent, 0), 2) AS total_expenses;

--     END IF;

-- END//
-- DELIMITER ;

DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAccountsExpenseData`;

CREATE PROCEDURE `SP_GetAccountsExpenseData`(
    IN iUserId INT(11),
    IN sCode VARCHAR(100)
)
BEGIN

    IF sCode IN ("AD", "AC") THEN
        -- ADMIN CODE
        
        SELECT SUM(salary) INTO @saleryMonthAmount FROM users WHERE isDeleted = 0;
        SELECT SUM(salary) INTO @saleryTotalAmount FROM users WHERE isDeleted = 0;

        -- MONTHLY SALES INCENTIVE
        SELECT 
            ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)), 2)  INTO @saleryMonthIncentive
        FROM users AS US
        LEFT JOIN sales AS SL ON SL.created_by = US.user_id
        WHERE SL.total_value IS NOT NULL AND US.isDeleted = 0 AND SL.status IN ('Approved', 'Dispatched', 'In transit') 
        AND MONTH(SL.date_time) = MONTH(CURDATE()) AND YEAR(SL.date_time) = YEAR(CURDATE());

        -- TOTAL SALES INCENTIVE
        SELECT 
            ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)), 2) INTO @saleryTotalIncentive
        FROM users AS US
        LEFT JOIN sales AS SL ON SL.created_by = US.user_id
        WHERE SL.total_value IS NOT NULL AND US.isDeleted = 0 AND SL.status IN ('Approved', 'Dispatched', 'In transit');

        -- MONTHLY FIELD SHOP INCENTIVE
        SELECT 
            ROUND(SUM(FSL.total_value * (FUS.incentive_percentage / 100)), 2) INTO @fsaleryMonthIncentive
        FROM users AS FUS
        LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = FUS.user_id
        WHERE FSL.total_value IS NOT NULL AND FUS.isDeleted = 0 AND FSL.status IN ('Approved', 'Dispatched', 'In transit') 
        AND MONTH(FSL.date_time) = MONTH(CURDATE()) AND YEAR(FSL.date_time) = YEAR(CURDATE());

        -- TOTAL FIELD SHOP INCENTIVE
        SELECT 
            ROUND(SUM(FSL.total_value * (FUS.incentive_percentage / 100)), 2) INTO @fsaleryTotalIncentive
        FROM users AS FUS
        LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = FUS.user_id
        WHERE FSL.total_value IS NOT NULL AND FUS.isDeleted = 0 AND FSL.status IN ('Approved', 'Dispatched', 'In transit');

        -- MONTHLY CONSULTING APPOINTMENTS INCENTIVE
        SELECT 
            ROUND(SUM(CA.price * (US.incentive_percentage / 100)), 2) INTO @caMonthIncentive
        FROM users AS US
        LEFT JOIN consulting_appointments AS CA ON CA.created_by = US.user_id
        WHERE CA.price IS NOT NULL AND US.isDeleted = 0 AND CA.status IN ('Approved')
        AND MONTH(CA.created_at) = MONTH(CURDATE()) AND YEAR(CA.created_at) = YEAR(CURDATE());

        -- TOTAL CONSULTING APPOINTMENTS INCENTIVE
        SELECT 
            ROUND(SUM(CA.price * (US.incentive_percentage / 100)), 2) INTO @caTotalIncentive
        FROM users AS US
        LEFT JOIN consulting_appointments AS CA ON CA.created_by = US.user_id
        WHERE CA.price IS NOT NULL AND US.isDeleted = 0 AND CA.status IN ('Approved');

        -- MONTHLY WALLET DATA INCENTIVE
        SELECT 
            ROUND(SUM(WD.amount * (US.incentive_percentage / 100)), 2) INTO @wdMonthIncentive
        FROM users AS US
        LEFT JOIN wallet_data AS WD ON WD.created_by = US.user_id
        WHERE WD.amount IS NOT NULL AND US.isDeleted = 0 AND WD.status IN ('Approved')
        AND MONTH(WD.created_at) = MONTH(CURDATE()) AND YEAR(WD.created_at) = YEAR(CURDATE());

        -- TOTAL WALLET DATA INCENTIVE
        SELECT 
            ROUND(SUM(WD.amount * (US.incentive_percentage / 100)), 2) INTO @wdTotalIncentive
        FROM users AS US
        LEFT JOIN wallet_data AS WD ON WD.created_by = US.user_id
        WHERE WD.amount IS NOT NULL AND US.isDeleted = 0 AND WD.status IN ('Approved');

        SELECT SUM(amount) INTO @saleryMonthOtherExp FROM expenses 
        WHERE MONTH(created_at) = MONTH(CURDATE()) AND status = 'approved' AND YEAR(created_at) = YEAR(CURDATE());
        
        SELECT SUM(amount) INTO @saleryTotalOtherExp FROM expenses WHERE status = 'approved';

        SELECT SUM(rent) INTO @salerymonthRent FROM branches WHERE isDeleted = 0;
        
        SELECT ROUND(SUM(
          rent * (
            (YEAR(CURDATE()) - YEAR(created_at)) * 12 + 
            (MONTH(CURDATE()) - MONTH(created_at)) + 1
          )
        ), 2) INTO @saleryTotalRent
        FROM branches WHERE isDeleted = 0;

        SELECT 
        IFNULL(ROUND(@saleryMonthAmount, 2), 0) AS monthly_salary,
        ROUND(IFNULL(@saleryMonthIncentive, 0) + IFNULL(@fsaleryMonthIncentive, 0) + IFNULL(@caMonthIncentive, 0) + IFNULL(@wdMonthIncentive, 0), 2) AS monthly_incentive,
        IFNULL(ROUND(@saleryMonthOtherExp, 2), 0) AS monthly_other_exp,
        IFNULL(ROUND(@salerymonthRent, 2), 0) AS monthly_rent,
        ROUND(IFNULL(@saleryMonthAmount, 0) + IFNULL(@saleryMonthIncentive, 0) + IFNULL(@fsaleryMonthIncentive, 0) + IFNULL(@caMonthIncentive, 0) + IFNULL(@wdMonthIncentive, 0) + IFNULL(@saleryMonthOtherExp, 0) + IFNULL(@salerymonthRent, 0), 2) AS monthly_total_expenses,
        
        IFNULL(ROUND(@saleryTotalAmount, 2), 0) AS total_salery_expenses,
        ROUND(IFNULL(@saleryTotalIncentive, 0) + IFNULL(@fsaleryTotalIncentive, 0) + IFNULL(@caTotalIncentive, 0) + IFNULL(@wdTotalIncentive, 0), 2) AS total_incentive_expenses,
        IFNULL(ROUND(@saleryTotalOtherExp, 2), 0) AS total_other_expenses,
        IFNULL(ROUND(@saleryTotalRent, 2), 0) AS total_rent_expenses,
        ROUND(IFNULL(@saleryTotalAmount, 0) + IFNULL(@saleryTotalIncentive, 0) + IFNULL(@fsaleryTotalIncentive, 0) + IFNULL(@caTotalIncentive, 0) + IFNULL(@wdTotalIncentive, 0) + IFNULL(@saleryTotalOtherExp, 0) + IFNULL(@saleryTotalRent, 0), 2) AS total_expenses,
        

    ELSE 
        -- BRANCH HEAD (BH) OR MANAGER CODE
        
        SELECT SUM(salary) INTO @saleryMonthAmount FROM users 
        WHERE isDeleted = 0 AND created_by = iUserId;
        
        SELECT SUM(salary) INTO @saleryTotalAmount FROM users 
        WHERE isDeleted = 0 AND created_by = iUserId;

        -- MONTHLY SALES INCENTIVE
        SELECT 
            ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)), 2) INTO @saleryMonthIncentive
        FROM users AS US
        LEFT JOIN sales AS SL ON SL.created_by = US.user_id
        WHERE SL.total_value IS NOT NULL AND US.isDeleted = 0 
        AND SL.status IN ('Approved', 'Dispatched', 'In transit') 
        AND MONTH(SL.date_time) = MONTH(CURDATE()) AND YEAR(SL.date_time) = YEAR(CURDATE())
        AND US.created_by = iUserId;

        -- TOTAL SALES INCENTIVE
        SELECT 
            ROUND(SUM(SL.total_value * (US.incentive_percentage / 100)), 2) INTO @saleryTotalIncentive
        FROM users AS US
        LEFT JOIN sales AS SL ON SL.created_by = US.user_id
        WHERE SL.total_value IS NOT NULL AND US.isDeleted = 0 
        AND SL.status IN ('Approved', 'Dispatched', 'In transit')
        AND US.created_by = iUserId;

        -- MONTHLY FIELD SHOP INCENTIVE
        SELECT 
            ROUND(SUM(FSL.total_value * (FUS.incentive_percentage / 100)), 2) INTO @fsaleryMonthIncentive
        FROM users AS FUS
        LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = FUS.user_id
        WHERE FSL.total_value IS NOT NULL AND FUS.isDeleted = 0 
        AND FSL.status IN ('Approved', 'Dispatched', 'In transit') 
        AND MONTH(FSL.date_time) = MONTH(CURDATE()) AND YEAR(FSL.date_time) = YEAR(CURDATE())
        AND FUS.created_by = iUserId;

        -- TOTAL FIELD SHOP INCENTIVE
        SELECT 
            ROUND(SUM(FSL.total_value * (FUS.incentive_percentage / 100)), 2) INTO @fsaleryTotalIncentive
        FROM users AS FUS
        LEFT JOIN fieldshopsales AS FSL ON FSL.created_by = FUS.user_id
        WHERE FSL.total_value IS NOT NULL AND FUS.isDeleted = 0 
        AND FSL.status IN ('Approved', 'Dispatched', 'In transit')
        AND FUS.created_by = iUserId;

        -- MONTHLY CONSULTING APPOINTMENTS INCENTIVE
        SELECT 
            ROUND(SUM(CA.price * (US.incentive_percentage / 100)), 2) INTO @caMonthIncentive
        FROM users AS US
        LEFT JOIN consulting_appointments AS CA ON CA.created_by = US.user_id
        WHERE CA.price IS NOT NULL AND US.isDeleted = 0 AND CA.status IN ('Approved')
        AND MONTH(CA.created_at) = MONTH(CURDATE()) AND YEAR(CA.created_at) = YEAR(CURDATE())
        AND US.created_by = iUserId;

        -- TOTAL CONSULTING APPOINTMENTS INCENTIVE
        SELECT 
            ROUND(SUM(CA.price * (US.incentive_percentage / 100)), 2) INTO @caTotalIncentive
        FROM users AS US
        LEFT JOIN consulting_appointments AS CA ON CA.created_by = US.user_id
        WHERE CA.price IS NOT NULL AND US.isDeleted = 0 AND CA.status IN ('Approved')
        AND US.created_by = iUserId;

        -- MONTHLY WALLET DATA INCENTIVE
        SELECT 
            ROUND(SUM(WD.amount * (US.incentive_percentage / 100)), 2) INTO @wdMonthIncentive
        FROM users AS US
        LEFT JOIN wallet_data AS WD ON WD.created_by = US.user_id
        WHERE WD.amount IS NOT NULL AND US.isDeleted = 0 AND WD.status IN ('Approved')
        AND MONTH(WD.created_at) = MONTH(CURDATE()) AND YEAR(WD.created_at) = YEAR(CURDATE())
        AND US.created_by = iUserId;

        -- TOTAL WALLET DATA INCENTIVE
        SELECT 
            ROUND(SUM(WD.amount * (US.incentive_percentage / 100)), 2) INTO @wdTotalIncentive
        FROM users AS US
        LEFT JOIN wallet_data AS WD ON WD.created_by = US.user_id
        WHERE WD.amount IS NOT NULL AND US.isDeleted = 0 AND WD.status IN ('Approved')
        AND US.created_by = iUserId;

        -- MONTHLY OTHER EXPENSES
        SELECT SUM(amount) INTO @saleryMonthOtherExp FROM expenses 
        WHERE MONTH(created_at) = MONTH(CURDATE()) AND status = 'approved' AND created_by = iUserId AND YEAR(created_at) = YEAR(CURDATE());
        
        -- TOTAL OTHER EXPENSES
        SELECT SUM(amount) INTO @saleryTotalOtherExp FROM expenses WHERE status = 'approved' AND created_by = iUserId;

        -- MONTHLY RENT
        SELECT SUM(rent) INTO @salerymonthRent FROM branches 
        WHERE isDeleted = 0 AND branch_incharge_recid = iUserId;
        
        -- TOTAL RENT
        SELECT ROUND(SUM(
          rent * (
            (YEAR(CURDATE()) - YEAR(created_at)) * 12 + 
            (MONTH(CURDATE()) - MONTH(created_at)) + 1
          )
        ), 2) INTO @saleryTotalRent
        FROM branches WHERE isDeleted = 0 AND branch_incharge_recid = iUserId;

        -- RETURN MONTHLY BREAKDOWN + TOTAL BREAKDOWN
        SELECT 
        IFNULL(ROUND(@saleryMonthAmount, 2), 0) AS monthly_salary,
        ROUND(IFNULL(@saleryMonthIncentive, 0) + IFNULL(@fsaleryMonthIncentive, 0) + IFNULL(@caMonthIncentive, 0) + IFNULL(@wdMonthIncentive, 0), 2) AS monthly_incentive,
        IFNULL(ROUND(@saleryMonthOtherExp, 2), 0) AS monthly_other_exp,
        IFNULL(ROUND(@salerymonthRent, 2), 0) AS monthly_rent,
        ROUND(IFNULL(@saleryMonthAmount, 0) + IFNULL(@saleryMonthIncentive, 0) + IFNULL(@fsaleryMonthIncentive, 0) + IFNULL(@caMonthIncentive, 0) + IFNULL(@wdMonthIncentive, 0) + IFNULL(@saleryMonthOtherExp, 0) + IFNULL(@salerymonthRent, 0), 2) AS monthly_total_expenses,
        
        IFNULL(ROUND(@saleryTotalAmount, 2), 0) AS total_salery_expenses,
        ROUND(IFNULL(@saleryTotalIncentive, 0) + IFNULL(@fsaleryTotalIncentive, 0) + IFNULL(@caTotalIncentive, 0) + IFNULL(@wdTotalIncentive, 0), 2) AS total_incentive_expenses,
        IFNULL(ROUND(@saleryTotalOtherExp, 2), 0) AS total_other_expenses,
        IFNULL(ROUND(@saleryTotalRent, 2), 0) AS total_rent_expenses,
        ROUND(IFNULL(@saleryTotalAmount, 0) + IFNULL(@saleryTotalIncentive, 0) + IFNULL(@fsaleryTotalIncentive, 0) + IFNULL(@caTotalIncentive, 0) + IFNULL(@wdTotalIncentive, 0) + IFNULL(@saleryTotalOtherExp, 0) + IFNULL(@saleryTotalRent, 0), 2) AS total_expenses,

    END IF;

END//
DELIMITER ;