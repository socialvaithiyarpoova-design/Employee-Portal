    -- /* ----------------------------------------------------------------------------------------------------------------- 
    -- NAME: Hariharan S
    -- DATE: 27/07/2025
    -- DESC: It is used to get all accounts
    -- ----------------------------------------------------------------------------------------------------------------- */
    -- DELIMITER //
    -- DROP PROCEDURE IF EXISTS `SP_GetAccountsData`;

    -- CREATE PROCEDURE `SP_GetAccountsData`(
    --     IN start_date VARCHAR(100),
    --     IN end_date VARCHAR(100),
    --     IN usertype_code VARCHAR(100),
    --     IN iUser_id INT(11)
    -- )
    -- BEGIN
    
    --     IF usertype_code = "AD" OR usertype_code = "AC" THEN
        
    --         -- SALES
    --         SELECT SUM(final_amount) INTO @saleTodayAmount 
    --         FROM sales AS SL 
    --         LEFT JOIN users AS US ON US.user_id = SL.created_by  
    --         WHERE DATE(SL.date_time) = CURDATE() 
    --         AND US.isDeleted = 0 
    --         AND SL.status IN ('Approved', 'Dispatched', 'In transit');
            
    --         SELECT SUM(final_amount) INTO @saleMonthlyAmount 
    --         FROM sales AS SL 
    --         LEFT JOIN users AS US ON US.user_id = SL.created_by  
    --         WHERE MONTH(SL.date_time) = MONTH(CURDATE()) 
    --         AND YEAR(SL.date_time) = YEAR(CURDATE()) 
    --         AND US.isDeleted = 0
    --         AND SL.status IN ('Approved', 'Dispatched', 'In transit');
            
    --         SELECT SUM(final_amount) INTO @saleTotalAmount 
    --         FROM sales AS SL 
    --         LEFT JOIN users AS US ON US.user_id = SL.created_by  
    --         WHERE US.isDeleted = 0
    --         AND SL.status IN ('Approved', 'Dispatched', 'In transit');

    --         -- FIELD SHOP SALES
    --         SELECT SUM(final_amount) INTO @fsaleTodayAmount 
    --         FROM fieldshopsales AS FSL 
    --         LEFT JOIN users AS USF ON USF.user_id = FSL.created_by   
    --         WHERE DATE(FSL.date_time) = CURDATE() 
    --         AND USF.isDeleted = 0
    --         AND FSL.status IN ('Approved', 'Dispatched', 'In transit');
            
    --         SELECT SUM(final_amount) INTO @fsaleMonthlyAmount 
    --         FROM fieldshopsales AS FSL 
    --         LEFT JOIN users AS USF ON USF.user_id = FSL.created_by  
    --         WHERE MONTH(FSL.date_time) = MONTH(CURDATE()) 
    --         AND YEAR(FSL.date_time) = YEAR(CURDATE()) 
    --         AND USF.isDeleted = 0
    --         AND FSL.status IN ('Approved', 'Dispatched', 'In transit');
            
    --         SELECT SUM(final_amount) INTO @fsaleTotalAmount 
    --         FROM fieldshopsales AS FSL 
    --         LEFT JOIN users AS USF ON USF.user_id = FSL.created_by  
    --         WHERE USF.isDeleted = 0
    --         AND FSL.status IN ('Approved', 'Dispatched', 'In transit');

    --         -- CLASS REGISTER
    --         SELECT SUM(amount_to_pay) INTO @classTodayAmount 
    --         FROM class_register AS CL 
    --         LEFT JOIN users AS UST ON UST.user_id = CL.created_by 
    --         WHERE DATE(CL.created_at) = CURDATE() 
    --         AND UST.isDeleted = 0
    --         AND CL.status IN ('Approved');
            
    --         SELECT SUM(amount_to_pay) INTO @classMonthlyAmount 
    --         FROM class_register AS CL 
    --         LEFT JOIN users AS UST ON UST.user_id = CL.created_by  
    --         WHERE MONTH(CL.created_at) = MONTH(CURDATE()) 
    --         AND YEAR(CL.created_at) = YEAR(CURDATE()) 
    --         AND UST.isDeleted = 0
    --         AND CL.status IN ('Approved');
            
    --         SELECT SUM(amount_to_pay) INTO @classTotalAmount 
    --         FROM class_register AS CL 
    --         LEFT JOIN users AS UST ON UST.user_id = CL.created_by  
    --         WHERE UST.isDeleted = 0
    --         AND CL.status IN ('Approved');

    --         -- WALLET DATA (no status)
    --         SELECT SUM(amount) INTO @walletTodayAmount 
    --         FROM wallet_data AS WL 
    --         LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
    --         WHERE DATE(WL.created_at) = CURDATE() 
    --         AND USH.isDeleted = 0
    --         AND WL.status IN ('Approved');
            
    --         SELECT SUM(amount) INTO @walletMonthlyAmount 
    --         FROM wallet_data AS WL 
    --         LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
    --         WHERE MONTH(WL.created_at) = MONTH(CURDATE()) 
    --         AND YEAR(WL.created_at) = YEAR(CURDATE()) 
    --         AND USH.isDeleted = 0
    --         AND WL.status IN ('Approved');
            
    --         SELECT SUM(amount) INTO @walletTotalAmount 
    --         FROM wallet_data AS WL 
    --         LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
    --         WHERE USH.isDeleted = 0 
    --         AND WL.status IN ('Approved');

    --         -- CONSULTING APPOINTMENTS
    --         SELECT SUM(price) INTO @consultTodayAmount 
    --         FROM consulting_appointments AS CN 
    --         LEFT JOIN users AS USC ON USC.user_id = CN.created_by 
    --         WHERE DATE(CN.created_at) = CURDATE() 
    --         AND USC.isDeleted = 0
    --         AND CN.status IN ('Approved');
            
    --         SELECT SUM(price) INTO @consultMonthlyAmount 
    --         FROM consulting_appointments AS CN 
    --         LEFT JOIN users AS USC ON USC.user_id = CN.created_by  
    --         WHERE MONTH(CN.created_at) = MONTH(CURDATE()) 
    --         AND YEAR(CN.created_at) = YEAR(CURDATE()) 
    --         AND USC.isDeleted = 0
    --         AND CN.status IN ('Approved');
            
    --         SELECT SUM(price) INTO @consultTotalAmount 
    --         FROM consulting_appointments AS CN 
    --         LEFT JOIN users AS USC ON USC.user_id = CN.created_by  
    --         WHERE USC.isDeleted = 0
    --         AND CN.status IN ('Approved');

    --         -- FINAL RESULT
    --         SELECT 
    --             ROUND(IFNULL(@saleTodayAmount,0)+IFNULL(@fsaleTodayAmount,0)+IFNULL(@classTodayAmount,0)+IFNULL(@walletTodayAmount,0)+IFNULL(@consultTodayAmount,0),2) AS todays_revenue,
    --             ROUND(IFNULL(@saleMonthlyAmount,0)+IFNULL(@fsaleMonthlyAmount,0)+IFNULL(@classMonthlyAmount,0)+IFNULL(@walletMonthlyAmount,0)+IFNULL(@consultMonthlyAmount,0),2) AS monthly_revenue,
    --             ROUND(IFNULL(@saleTotalAmount,0)+IFNULL(@fsaleTotalAmount,0)+IFNULL(@classTotalAmount,0)+IFNULL(@walletTotalAmount,0)+IFNULL(@consultTotalAmount,0),2) AS total_revenue,
    --             ROUND(IFNULL(@saleTotalAmount,0)+IFNULL(@fsaleTotalAmount,0),2) AS total_sale_revenue,
    --             IFNULL(ROUND(@classTotalAmount,2),0) AS total_class_revenue,
    --             IFNULL(ROUND(@walletTotalAmount,2),0) AS total_wallet_revenue,
    --             IFNULL(ROUND(@consultTotalAmount,2),0) AS total_consult_revenue;
                
    --             ELSE
                
    --         -- SALES
    --         SELECT SUM(final_amount) INTO @saleTodayAmount 
    --         FROM sales AS SL 
    --         LEFT JOIN users AS US ON US.user_id = SL.created_by  
    --         WHERE DATE(SL.date_time) = CURDATE() 
    --         AND US.isDeleted = 0 
    --         AND SL.status IN ('Approved', 'Dispatched', 'In transit')
    --         AND SL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         SELECT SUM(final_amount) INTO @saleMonthlyAmount 
    --         FROM sales AS SL 
    --         LEFT JOIN users AS US ON US.user_id = SL.created_by  
    --         WHERE MONTH(SL.date_time) = MONTH(CURDATE()) 
    --         AND YEAR(SL.date_time) = YEAR(CURDATE()) 
    --         AND US.isDeleted = 0 
    --         AND SL.status IN ('Approved', 'Dispatched', 'In transit')
    --         AND SL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         SELECT SUM(final_amount) INTO @saleTotalAmount 
    --         FROM sales AS SL 
    --         LEFT JOIN users AS US ON US.user_id = SL.created_by  
    --         WHERE US.isDeleted = 0 
    --         AND SL.status IN ('Approved', 'Dispatched', 'In transit')
    --         AND SL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         -- FIELD SHOP SALES
    --         SELECT SUM(final_amount) INTO @fsaleTodayAmount 
    --         FROM fieldshopsales AS FSL 
    --         LEFT JOIN users AS USF ON USF.user_id = FSL.created_by  
    --         WHERE DATE(FSL.date_time) = CURDATE() 
    --         AND USF.isDeleted = 0 
    --         AND FSL.status IN ('Approved', 'Dispatched', 'In transit')
    --         AND FSL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         SELECT SUM(final_amount) INTO @fsaleMonthlyAmount 
    --         FROM fieldshopsales AS FSL 
    --         LEFT JOIN users AS USF ON USF.user_id = FSL.created_by  
    --         WHERE MONTH(FSL.date_time) = MONTH(CURDATE()) 
    --         AND YEAR(FSL.date_time) = YEAR(CURDATE()) 
    --         AND USF.isDeleted = 0 
    --         AND FSL.status IN ('Approved', 'Dispatched', 'In transit')
    --         AND FSL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         SELECT SUM(final_amount) INTO @fsaleTotalAmount 
    --         FROM fieldshopsales AS FSL 
    --         LEFT JOIN users AS USF ON USF.user_id = FSL.created_by  
    --         WHERE USF.isDeleted = 0 
    --         AND FSL.status IN ('Approved', 'Dispatched', 'In transit')
    --         AND FSL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         -- CLASS REGISTER
    --         SELECT SUM(amount_to_pay) INTO @classTodayAmount 
    --         FROM class_register AS CL 
    --         LEFT JOIN users AS UST ON UST.user_id = CL.created_by  
    --         WHERE DATE(CL.created_at) = CURDATE() 
    --         AND UST.isDeleted = 0 
    --         AND CL.status IN ('Approved')
    --         AND CL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         SELECT SUM(amount_to_pay) INTO @classMonthlyAmount 
    --         FROM class_register AS CL 
    --         LEFT JOIN users AS UST ON UST.user_id = CL.created_by  
    --         WHERE MONTH(CL.created_at) = MONTH(CURDATE()) 
    --         AND YEAR(CL.created_at) = YEAR(CURDATE()) 
    --         AND UST.isDeleted = 0 
    --         AND CL.status IN ('Approved')
    --         AND CL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         SELECT SUM(amount_to_pay) INTO @classTotalAmount 
    --         FROM class_register AS CL 
    --         LEFT JOIN users AS UST ON UST.user_id = CL.created_by  
    --         WHERE UST.isDeleted = 0 
    --         AND CL.status IN ('Approved')
    --         AND CL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         -- WALLET DATA
    --         SELECT SUM(amount) INTO @walletTodayAmount 
    --         FROM wallet_data AS WL 
    --         LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
    --         WHERE DATE(WL.created_at) = CURDATE() 
    --         AND USH.isDeleted = 0 
    --         AND WL.status IN ('Approved')
    --         AND WL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         SELECT SUM(amount) INTO @walletMonthlyAmount 
    --         FROM wallet_data AS WL 
    --         LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
    --         WHERE MONTH(WL.created_at) = MONTH(CURDATE()) 
    --         AND YEAR(WL.created_at) = YEAR(CURDATE()) 
    --         AND USH.isDeleted = 0 
    --         AND WL.status IN ('Approved')
    --         AND WL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         SELECT SUM(amount) INTO @walletTotalAmount 
    --         FROM wallet_data AS WL 
    --         LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
    --         WHERE USH.isDeleted = 0 
    --         AND WL.status IN ('Approved')
    --         AND WL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         -- CONSULTING APPOINTMENTS
    --         SELECT SUM(price) INTO @consultTodayAmount 
    --         FROM consulting_appointments AS CN 
    --         LEFT JOIN users AS USC ON USC.user_id = CN.created_by  
    --         WHERE DATE(CN.created_at) = CURDATE() 
    --         AND USC.isDeleted = 0 
    --         AND CN.status IN ('Approved')
    --         AND CN.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         SELECT SUM(price) INTO @consultMonthlyAmount 
    --         FROM consulting_appointments AS CN 
    --         LEFT JOIN users AS USC ON USC.user_id = CN.created_by  
    --         WHERE MONTH(CN.created_at) = MONTH(CURDATE()) 
    --         AND YEAR(CN.created_at) = YEAR(CURDATE()) 
    --         AND USC.isDeleted = 0 
    --         AND CN.status IN ('Approved')
    --         AND CN.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         SELECT SUM(price) INTO @consultTotalAmount 
    --         FROM consulting_appointments AS CN 
    --         LEFT JOIN users AS USC ON USC.user_id = CN.created_by  
    --         WHERE USC.isDeleted = 0 
    --         AND CN.status IN ('Approved')
    --         AND CN.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

    --         -- FINAL RESULT
    --         SELECT 
    --             ROUND(IFNULL(@saleTodayAmount, 0) + IFNULL(@fsaleTodayAmount, 0) + IFNULL(@classTodayAmount, 0) + IFNULL(@walletTodayAmount, 0) + IFNULL(@consultTodayAmount, 0), 2) AS todays_revenue,
    --             ROUND(IFNULL(@saleMonthlyAmount, 0) + IFNULL(@fsaleMonthlyAmount, 0) + IFNULL(@classMonthlyAmount, 0) + IFNULL(@walletMonthlyAmount, 0) + IFNULL(@consultMonthlyAmount, 0), 2) AS monthly_revenue,
    --             ROUND(IFNULL(@saleTotalAmount, 0) + IFNULL(@fsaleTotalAmount, 0) + IFNULL(@classTotalAmount, 0) + IFNULL(@walletTotalAmount, 0) + IFNULL(@consultTotalAmount, 0), 2) AS total_revenue,
    --             ROUND(IFNULL(@saleTotalAmount, 0) + IFNULL(@fsaleTotalAmount, 0), 2) AS total_sale_revenue,
    --             IFNULL(ROUND(@classTotalAmount, 2), 0) AS total_class_revenue,
    --             IFNULL(ROUND(@walletTotalAmount, 2), 0) AS total_wallet_revenue,
    --             IFNULL(ROUND(@consultTotalAmount, 2), 0) AS total_consult_revenue;

    --     END IF;


    -- END//
    -- DELIMITER ;
/* ----------------------------------------------------------------------------------------------------------------- 
NAME: Hariharan S
DATE: 27/07/2025
DESC: It is used to get all accounts
Updated: Added Billing table aggregation
----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAccountsData`;

CREATE PROCEDURE `SP_GetAccountsData`(
    IN start_date VARCHAR(100),
    IN end_date VARCHAR(100),
    IN usertype_code VARCHAR(100),
    IN iUser_id INT(11)
)
BEGIN

    IF usertype_code = "AD" OR usertype_code = "AC" THEN
    
        -- SALES
        SELECT SUM(final_amount) INTO @saleTodayAmount 
        FROM sales AS SL 
        LEFT JOIN users AS US ON US.user_id = SL.created_by  
        WHERE DATE(SL.date_time) = CURDATE() 
        AND US.isDeleted = 0 
        AND SL.status IN ('Approved', 'Dispatched', 'In transit');
        
        SELECT SUM(final_amount) INTO @saleMonthlyAmount 
        FROM sales AS SL 
        LEFT JOIN users AS US ON US.user_id = SL.created_by  
        WHERE MONTH(SL.date_time) = MONTH(CURDATE()) 
        AND YEAR(SL.date_time) = YEAR(CURDATE()) 
        AND US.isDeleted = 0
        AND SL.status IN ('Approved', 'Dispatched', 'In transit');
        
        SELECT SUM(final_amount) INTO @saleTotalAmount 
        FROM sales AS SL 
        LEFT JOIN users AS US ON US.user_id = SL.created_by  
        WHERE US.isDeleted = 0
        AND SL.status IN ('Approved', 'Dispatched', 'In transit');

        -- FIELD SHOP SALES
        SELECT SUM(final_amount) INTO @fsaleTodayAmount 
        FROM fieldshopsales AS FSL 
        LEFT JOIN users AS USF ON USF.user_id = FSL.created_by   
        WHERE DATE(FSL.date_time) = CURDATE() 
        AND USF.isDeleted = 0
        AND FSL.status IN ('Approved', 'Dispatched', 'In transit');
        
        SELECT SUM(final_amount) INTO @fsaleMonthlyAmount 
        FROM fieldshopsales AS FSL 
        LEFT JOIN users AS USF ON USF.user_id = FSL.created_by  
        WHERE MONTH(FSL.date_time) = MONTH(CURDATE()) 
        AND YEAR(FSL.date_time) = YEAR(CURDATE()) 
        AND USF.isDeleted = 0
        AND FSL.status IN ('Approved', 'Dispatched', 'In transit');
        
        SELECT SUM(final_amount) INTO @fsaleTotalAmount 
        FROM fieldshopsales AS FSL 
        LEFT JOIN users AS USF ON USF.user_id = FSL.created_by  
        WHERE USF.isDeleted = 0
        AND FSL.status IN ('Approved', 'Dispatched', 'In transit');

        -- CLASS REGISTER
        SELECT SUM(amount_to_pay) INTO @classTodayAmount 
        FROM class_register AS CL 
        LEFT JOIN users AS UST ON UST.user_id = CL.created_by 
        WHERE DATE(CL.created_at) = CURDATE() 
        AND UST.isDeleted = 0
        AND CL.status IN ('Approved');
        
        SELECT SUM(amount_to_pay) INTO @classMonthlyAmount 
        FROM class_register AS CL 
        LEFT JOIN users AS UST ON UST.user_id = CL.created_by  
        WHERE MONTH(CL.created_at) = MONTH(CURDATE()) 
        AND YEAR(CL.created_at) = YEAR(CURDATE()) 
        AND UST.isDeleted = 0
        AND CL.status IN ('Approved');
        
        SELECT SUM(amount_to_pay) INTO @classTotalAmount 
        FROM class_register AS CL 
        LEFT JOIN users AS UST ON UST.user_id = CL.created_by  
        WHERE UST.isDeleted = 0
        AND CL.status IN ('Approved');

        -- WALLET DATA
        SELECT SUM(amount) INTO @walletTodayAmount 
        FROM wallet_data AS WL 
        LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
        WHERE DATE(WL.created_at) = CURDATE() 
        AND USH.isDeleted = 0
        AND WL.status IN ('Approved');
        
        SELECT SUM(amount) INTO @walletMonthlyAmount 
        FROM wallet_data AS WL 
        LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
        WHERE MONTH(WL.created_at) = MONTH(CURDATE()) 
        AND YEAR(WL.created_at) = YEAR(CURDATE()) 
        AND USH.isDeleted = 0
        AND WL.status IN ('Approved');
        
        SELECT SUM(amount) INTO @walletTotalAmount 
        FROM wallet_data AS WL 
        LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
        WHERE USH.isDeleted = 0 
        AND WL.status IN ('Approved');

        -- CONSULTING APPOINTMENTS
        SELECT SUM(price) INTO @consultTodayAmount 
        FROM consulting_appointments AS CN 
        LEFT JOIN users AS USC ON USC.user_id = CN.created_by 
        WHERE DATE(CN.created_at) = CURDATE() 
        AND USC.isDeleted = 0
        AND CN.status IN ('Approved');
        
        SELECT SUM(price) INTO @consultMonthlyAmount 
        FROM consulting_appointments AS CN 
        LEFT JOIN users AS USC ON USC.user_id = CN.created_by  
        WHERE MONTH(CN.created_at) = MONTH(CURDATE()) 
        AND YEAR(CN.created_at) = YEAR(CURDATE()) 
        AND USC.isDeleted = 0
        AND CN.status IN ('Approved');
        
        SELECT SUM(price) INTO @consultTotalAmount 
        FROM consulting_appointments AS CN 
        LEFT JOIN users AS USC ON USC.user_id = CN.created_by  
        WHERE USC.isDeleted = 0
        AND CN.status IN ('Approved');

        -- BILLING DATA
        SELECT SUM(amount_to_pay) INTO @billingTodayAmount 
        FROM billing AS BL 
        LEFT JOIN users AS USB ON USB.user_id = BL.created_by 
        WHERE DATE(BL.created_at) = CURDATE() 
        AND USB.isDeleted = 0
        AND BL.status IN ('Approved');
        
        SELECT SUM(amount_to_pay) INTO @billingMonthlyAmount 
        FROM billing AS BL 
        LEFT JOIN users AS USB ON USB.user_id = BL.created_by  
        WHERE MONTH(BL.created_at) = MONTH(CURDATE()) 
        AND YEAR(BL.created_at) = YEAR(CURDATE()) 
        AND USB.isDeleted = 0
        AND BL.status IN ('Approved');
        
        SELECT SUM(amount_to_pay) INTO @billingTotalAmount 
        FROM billing AS BL 
        LEFT JOIN users AS USB ON USB.user_id = BL.created_by  
        WHERE USB.isDeleted = 0
        AND BL.status IN ('Approved');

        -- FINAL RESULT
        SELECT 
            ROUND(IFNULL(@saleTodayAmount,0)+IFNULL(@fsaleTodayAmount,0)+IFNULL(@classTodayAmount,0)+IFNULL(@walletTodayAmount,0)+IFNULL(@consultTodayAmount,0)+IFNULL(@billingTodayAmount,0),2) AS todays_revenue,
            ROUND(IFNULL(@saleMonthlyAmount,0)+IFNULL(@fsaleMonthlyAmount,0)+IFNULL(@classMonthlyAmount,0)+IFNULL(@walletMonthlyAmount,0)+IFNULL(@consultMonthlyAmount,0)+IFNULL(@billingMonthlyAmount,0),2) AS monthly_revenue,
            ROUND(IFNULL(@saleTotalAmount,0)+IFNULL(@fsaleTotalAmount,0)+IFNULL(@classTotalAmount,0)+IFNULL(@walletTotalAmount,0)+IFNULL(@consultTotalAmount,0)+IFNULL(@billingTotalAmount,0),2) AS total_revenue,
            ROUND(IFNULL(@saleTotalAmount,0)+IFNULL(@fsaleTotalAmount,0),2) AS total_sale_revenue,
            IFNULL(ROUND(@classTotalAmount,2),0) AS total_class_revenue,
            IFNULL(ROUND(@walletTotalAmount,2),0) AS total_wallet_revenue,
            IFNULL(ROUND(@consultTotalAmount,2),0) AS total_consult_revenue,
            IFNULL(ROUND(@billingTotalAmount,2),0) AS total_billing_revenue;
            
    ELSE
    
        -- SALES
        SELECT SUM(final_amount) INTO @saleTodayAmount 
        FROM sales AS SL 
        LEFT JOIN users AS US ON US.user_id = SL.created_by  
        WHERE DATE(SL.date_time) = CURDATE() 
        AND US.isDeleted = 0 
        AND SL.status IN ('Approved', 'Dispatched', 'In transit')
        AND SL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(final_amount) INTO @saleMonthlyAmount 
        FROM sales AS SL 
        LEFT JOIN users AS US ON US.user_id = SL.created_by  
        WHERE MONTH(SL.date_time) = MONTH(CURDATE()) 
        AND YEAR(SL.date_time) = YEAR(CURDATE()) 
        AND US.isDeleted = 0 
        AND SL.status IN ('Approved', 'Dispatched', 'In transit')
        AND SL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(final_amount) INTO @saleTotalAmount 
        FROM sales AS SL 
        LEFT JOIN users AS US ON US.user_id = SL.created_by  
        WHERE US.isDeleted = 0 
        AND SL.status IN ('Approved', 'Dispatched', 'In transit')
        AND SL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        -- FIELD SHOP SALES
        SELECT SUM(final_amount) INTO @fsaleTodayAmount 
        FROM fieldshopsales AS FSL 
        LEFT JOIN users AS USF ON USF.user_id = FSL.created_by  
        WHERE DATE(FSL.date_time) = CURDATE() 
        AND USF.isDeleted = 0 
        AND FSL.status IN ('Approved', 'Dispatched', 'In transit')
        AND FSL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(final_amount) INTO @fsaleMonthlyAmount 
        FROM fieldshopsales AS FSL 
        LEFT JOIN users AS USF ON USF.user_id = FSL.created_by  
        WHERE MONTH(FSL.date_time) = MONTH(CURDATE()) 
        AND YEAR(FSL.date_time) = YEAR(CURDATE()) 
        AND USF.isDeleted = 0 
        AND FSL.status IN ('Approved', 'Dispatched', 'In transit')
        AND FSL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(final_amount) INTO @fsaleTotalAmount 
        FROM fieldshopsales AS FSL 
        LEFT JOIN users AS USF ON USF.user_id = FSL.created_by  
        WHERE USF.isDeleted = 0 
        AND FSL.status IN ('Approved', 'Dispatched', 'In transit')
        AND FSL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        -- CLASS REGISTER
        SELECT SUM(amount_to_pay) INTO @classTodayAmount 
        FROM class_register AS CL 
        LEFT JOIN users AS UST ON UST.user_id = CL.created_by  
        WHERE DATE(CL.created_at) = CURDATE() 
        AND UST.isDeleted = 0 
        AND CL.status IN ('Approved')
        AND CL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(amount_to_pay) INTO @classMonthlyAmount 
        FROM class_register AS CL 
        LEFT JOIN users AS UST ON UST.user_id = CL.created_by  
        WHERE MONTH(CL.created_at) = MONTH(CURDATE()) 
        AND YEAR(CL.created_at) = YEAR(CURDATE()) 
        AND UST.isDeleted = 0 
        AND CL.status IN ('Approved')
        AND CL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(amount_to_pay) INTO @classTotalAmount 
        FROM class_register AS CL 
        LEFT JOIN users AS UST ON UST.user_id = CL.created_by  
        WHERE UST.isDeleted = 0 
        AND CL.status IN ('Approved')
        AND CL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        -- WALLET DATA
        SELECT SUM(amount) INTO @walletTodayAmount 
        FROM wallet_data AS WL 
        LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
        WHERE DATE(WL.created_at) = CURDATE() 
        AND USH.isDeleted = 0 
        AND WL.status IN ('Approved')
        AND WL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(amount) INTO @walletMonthlyAmount 
        FROM wallet_data AS WL 
        LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
        WHERE MONTH(WL.created_at) = MONTH(CURDATE()) 
        AND YEAR(WL.created_at) = YEAR(CURDATE()) 
        AND USH.isDeleted = 0 
        AND WL.status IN ('Approved')
        AND WL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(amount) INTO @walletTotalAmount 
        FROM wallet_data AS WL 
        LEFT JOIN users AS USH ON USH.user_id = WL.created_by  
        WHERE USH.isDeleted = 0 
        AND WL.status IN ('Approved')
        AND WL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        -- CONSULTING APPOINTMENTS
        SELECT SUM(price) INTO @consultTodayAmount 
        FROM consulting_appointments AS CN 
        LEFT JOIN users AS USC ON USC.user_id = CN.created_by  
        WHERE DATE(CN.created_at) = CURDATE() 
        AND USC.isDeleted = 0 
        AND CN.status IN ('Approved')
        AND CN.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(price) INTO @consultMonthlyAmount 
        FROM consulting_appointments AS CN 
        LEFT JOIN users AS USC ON USC.user_id = CN.created_by  
        WHERE MONTH(CN.created_at) = MONTH(CURDATE()) 
        AND YEAR(CN.created_at) = YEAR(CURDATE()) 
        AND USC.isDeleted = 0 
        AND CN.status IN ('Approved')
        AND CN.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(price) INTO @consultTotalAmount 
        FROM consulting_appointments AS CN 
        LEFT JOIN users AS USC ON USC.user_id = CN.created_by  
        WHERE USC.isDeleted = 0 
        AND CN.status IN ('Approved')
        AND CN.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        -- BILLING DATA
        SELECT SUM(amount_to_pay) INTO @billingTodayAmount 
        FROM billing AS BL 
        LEFT JOIN users AS USB ON USB.user_id = BL.created_by  
        WHERE DATE(BL.created_at) = CURDATE() 
        AND USB.isDeleted = 0 
        AND BL.status IN ('Approved')
        AND BL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(amount_to_pay) INTO @billingMonthlyAmount 
        FROM billing AS BL 
        LEFT JOIN users AS USB ON USB.user_id = BL.created_by  
        WHERE MONTH(BL.created_at) = MONTH(CURDATE()) 
        AND YEAR(BL.created_at) = YEAR(CURDATE()) 
        AND USB.isDeleted = 0 
        AND BL.status IN ('Approved')
        AND BL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        SELECT SUM(amount_to_pay) INTO @billingTotalAmount 
        FROM billing AS BL 
        LEFT JOIN users AS USB ON USB.user_id = BL.created_by  
        WHERE USB.isDeleted = 0 
        AND BL.status IN ('Approved')
        AND BL.created_by IN (SELECT user_id FROM users WHERE created_by = iUser_id);

        -- FINAL RESULT
        SELECT 
            ROUND(IFNULL(@saleTodayAmount, 0) + IFNULL(@fsaleTodayAmount, 0) + IFNULL(@classTodayAmount, 0) + IFNULL(@walletTodayAmount, 0) + IFNULL(@consultTodayAmount, 0) + IFNULL(@billingTodayAmount, 0), 2) AS todays_revenue,
            ROUND(IFNULL(@saleMonthlyAmount, 0) + IFNULL(@fsaleMonthlyAmount, 0) + IFNULL(@classMonthlyAmount, 0) + IFNULL(@walletMonthlyAmount, 0) + IFNULL(@consultMonthlyAmount, 0) + IFNULL(@billingMonthlyAmount, 0), 2) AS monthly_revenue,
            ROUND(IFNULL(@saleTotalAmount, 0) + IFNULL(@fsaleTotalAmount, 0) + IFNULL(@classTotalAmount, 0) + IFNULL(@walletTotalAmount, 0) + IFNULL(@consultTotalAmount, 0) + IFNULL(@billingTotalAmount, 0), 2) AS total_revenue,
            ROUND(IFNULL(@saleTotalAmount, 0) + IFNULL(@fsaleTotalAmount, 0), 2) AS total_sale_revenue,
            IFNULL(ROUND(@classTotalAmount, 2), 0) AS total_class_revenue,
            IFNULL(ROUND(@walletTotalAmount, 2), 0) AS total_wallet_revenue,
            IFNULL(ROUND(@consultTotalAmount, 2), 0) AS total_consult_revenue,
            IFNULL(ROUND(@billingTotalAmount, 2), 0) AS total_billing_revenue;

    END IF;

END//
DELIMITER ;