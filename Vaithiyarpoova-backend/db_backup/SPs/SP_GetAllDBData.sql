    /* ----------------------------------------------------------------------------------------------------------------- 
    NAME: Hariharan S
    DATE: 18/07/2025
    DESC: It is used to get all db data
    ----------------------------------------------------------------------------------------------------------------- */
    DELIMITER //
    DROP PROCEDURE IF EXISTS `SP_GetAllDBData`;

    CREATE PROCEDURE `SP_GetAllDBData`(
        IN usertype VARCHAR(20),
        IN p_user_id INT(11)
    )
    BEGIN

        DECLARE iTotalOrders INT DEFAULT 0;
        DECLARE iPendingOrder INT DEFAULT 0;
        DECLARE iReadyToDispatch INT DEFAULT 0;
        DECLARE iTotalTransit INT DEFAULT 0;
        DECLARE iTodaysOrders INT DEFAULT 0;
        DECLARE iStockAlert INT DEFAULT 0;
        DECLARE ivatot_upcome INT DEFAULT 0;

        DECLARE iTodayLeads INT DEFAULT 0;
        DECLARE iToday INT DEFAULT 0;
        DECLARE iTotalExpenses INT DEFAULT 0;
        DECLARE iADPendingOrder INT DEFAULT 0;
        DECLARE iPendingLeave INT DEFAULT 0;
        DECLARE iPendingPermission INT DEFAULT 0;
        DECLARE iTodayLeadsOnMd INT DEFAULT 0;

        DECLARE ibhTodayLeads INT DEFAULT 0;
        DECLARE ibhTotalRev INT DEFAULT 0;
        DECLARE ibhTotalExpenses INT DEFAULT 0;
        DECLARE ibhADPendingOrder INT DEFAULT 0;
        DECLARE ibhPendingLeave INT DEFAULT 0;
        DECLARE ibhPendingPermission INT DEFAULT 0;
        DECLARE ibhTodayLeadsOnMd INT DEFAULT 0;

        DECLARE iacPendingOrder INT DEFAULT 0;
        DECLARE iacTodayOrder INT DEFAULT 0;
        DECLARE iacTotalRev INT DEFAULT 0;
        DECLARE iacTotalExpenses INT DEFAULT 0;
        DECLARE iacTotalOrder INT DEFAULT 0;

        DECLARE ifsTodayleeds INT DEFAULT 0;
        DECLARE ifsTotalCollection INT DEFAULT 0;
        DECLARE ifsTodayFollowup INT DEFAULT 0;
        DECLARE ifsTodayCallback INT DEFAULT 0;
        DECLARE ifsSalesofmonth INT DEFAULT 0;
        DECLARE ifsIncentive INT DEFAULT 0;
        DECLARE ifsTodaySale INT DEFAULT 0;
        DECLARE ifsStarPerformer VARCHAR(1000) DEFAULT '';

        DECLARE itslTodLeadCount INT DEFAULT 0;
        DECLARE itslTodayFollowup INT DEFAULT 0;
        DECLARE itslTodayCallback INT DEFAULT 0;
        DECLARE itslTodaySalesCount INT DEFAULT 0;
        DECLARE itslTodaySalesAmount INT DEFAULT 0;
        DECLARE itslMonthSalesCount INT DEFAULT 0;
        DECLARE itslMonthSalesAmount INT DEFAULT 0;
        DECLARE itslIncentiveAmount INT DEFAULT 0;
        DECLARE itslStar VARCHAR(100) DEFAULT '';
        DECLARE itclTodayReg INT DEFAULT 0;
        DECLARE ifoiBillOfMonth INT DEFAULT 0;
        DECLARE ifoiTotalSaleMonth INT DEFAULT 0;

        DECLARE ivatot_appc INT DEFAULT 0;
        DECLARE ivatodayClass INT DEFAULT 0;
        DECLARE ivaUpcomingClass INT DEFAULT 0;
        DECLARE ivaTotalClassc  INT DEFAULT 0;
        DECLARE ivaTodayClassReg  INT DEFAULT 0;

        DECLARE icsTodayDelivery INT DEFAULT 0;
        DECLARE icsTodayEvents  INT DEFAULT 0;
        DECLARE icsCarryForward  INT DEFAULT 0;

        IF usertype = "DIS" THEN

                SELECT COUNT(order_recid) INTO iTotalOrders
                    FROM (
                        SELECT order_recid FROM sales WHERE status IN ('Approved', 'Dispatched', 'In transit') AND dispatch_id = p_user_id
                        UNION ALL
                        SELECT order_recid FROM fieldshopsales WHERE status IN ('Approved', 'Dispatched', 'In transit') AND dispatch_id = p_user_id
                    ) AS total_orders;

                    -- Pending Orders (Approved)
                    SELECT COUNT(order_recid) INTO iPendingOrder
                    FROM (
                        SELECT order_recid FROM sales WHERE status = 'Approved' AND dispatch_id = p_user_id
                        UNION ALL
                        SELECT order_recid FROM fieldshopsales WHERE status = 'Approved' AND dispatch_id = p_user_id
                    ) AS pending_orders;

                    -- Ready to Dispatch
                    SELECT COUNT(order_recid) INTO iReadyToDispatch
                    FROM (
                        SELECT order_recid FROM sales WHERE status = 'Dispatched' AND dispatch_id = p_user_id
                        UNION ALL
                        SELECT order_recid FROM fieldshopsales WHERE status = 'Dispatched' AND dispatch_id = p_user_id
                    ) AS ready_orders;

                    -- In Transit
                    SELECT COUNT(order_recid) INTO iTotalTransit
                    FROM (
                        SELECT order_recid FROM sales WHERE status = 'In transit' AND dispatch_id = p_user_id
                        UNION ALL
                        SELECT order_recid FROM fieldshopsales WHERE status = 'In transit' AND dispatch_id = p_user_id
                    ) AS transit_orders;

                    -- Today's Orders (Approved, Dispatched, In transit)
                    SELECT COUNT(order_recid) INTO iTodaysOrders
                    FROM (
                        SELECT order_recid FROM sales 
                        WHERE status IN ('Approved') AND DATE(date_time) = CURDATE() AND dispatch_id = p_user_id
                        UNION ALL
                        SELECT order_recid FROM fieldshopsales 
                        WHERE status IN ('Approved') AND DATE(date_time) = CURDATE() AND dispatch_id = p_user_id
                    ) AS today_orders;
            SELECT COUNT(inventory_recid) INTO iStockAlert 
            FROM inventory 
            WHERE min_stock_quantity > quantity 
            AND dispatch_id = (SELECT branch_recid FROM branches WHERE branch_incharge_recid = p_user_id);

            SELECT 
                iTotalOrders        AS total_order,
                iPendingOrder       AS Pending_order,
                iTodaysOrders       AS today_order,
                iReadyToDispatch    AS ready_to_dispatch,
                iTotalTransit       AS total_in_transit,
                iStockAlert         AS stock_alert;

        
        ELSEIF usertype = "AD" THEN

            SELECT COUNT(lead_recid) INTO iTodayLeads FROM (
            SELECT lead_recid FROM leads WHERE DATE(created_at) = DATE(NOW())
            UNION ALL
            SELECT flead_recid FROM fieldleads WHERE DATE(created_at) = DATE(NOW())
            ) AS L;
            SELECT SUM(lead_count)       INTO iTodayLeadsOnMd FROM leads_count_history WHERE DATE(created_at) = DATE(NOW());
            SELECT SUM(revenue)          INTO iToday 
            FROM (
            SELECT SUM(final_amount) AS revenue 
            FROM sales 
            WHERE DATE(date_time) = DATE(NOW()) 
            AND status IN ('Approved', 'Dispatched', 'In transit')

            UNION ALL

            SELECT SUM(final_amount) AS revenue 
            FROM fieldshopsales 
            WHERE DATE(date_time) = DATE(NOW()) 
            AND status IN ('Approved', 'Dispatched', 'In transit')

            UNION ALL

            SELECT SUM(amount) AS revenue 
            FROM wallet_data 
            WHERE DATE(date_time) = DATE(NOW()) 
            AND status = 'Approved'

            UNION ALL

            SELECT SUM(amount_to_pay) AS revenue 
            FROM class_register 
            WHERE DATE(date_time) = DATE(NOW()) 
            AND status = 'Approved'

            UNION ALL

            SELECT SUM(amount_to_pay) AS revenue 
            FROM billing 
            WHERE DATE(date_time) = DATE(NOW()) 
            UNION ALL

            SELECT SUM(price) AS revenue 
            FROM consulting_appointments 
            WHERE DATE(date_time) = DATE(NOW()) 
            AND status = 'Approved'
        ) AS R;

            SELECT SUM(amount)  INTO iTotalExpenses FROM expenses WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) AND status = 'approved';
            SELECT COUNT(order_recid)    INTO iADPendingOrder FROM (SELECT order_recid FROM sales WHERE status IN ("Pending") UNION SELECT order_recid FROM fieldshopsales WHERE status IN ("Pending")) AS O;
            SELECT COUNT(lp_recid)       INTO iPendingLeave  FROM user_activity WHERE action = "Leave" AND user_status = "Pending";
            SELECT COUNT(lp_recid)       INTO iPendingPermission  FROM user_activity WHERE action = "Permission" AND user_status = "Pending";

            SELECT
                ROUND((IFNULL(iTodayLeads, 0) + IFNULL(iTodayLeadsOnMd,0)), 2)         AS ad_today_lead,
                iToday              AS ad_total_revenue,
                iTotalExpenses      AS ad_total_expense,
                iADPendingOrder     AS ad_pending_order,
                iPendingLeave       AS ad_pending_leaves,
                iPendingPermission  AS ad_pending_permission;

        ELSEIF usertype = "BH" THEN

            SELECT COUNT(recid)  INTO ibhTodayLeads FROM
            (SELECT LD.lead_recid AS recid FROM users AS US LEFT JOIN leads AS LD ON LD.created_by = US.user_id WHERE US.created_by = p_user_id AND LD.lead_recid IS NOT NULL AND DATE(LD.created_at) = DATE(NOW())
            UNION
            SELECT FLD.flead_recid AS recid FROM users AS FUS LEFT JOIN fieldleads AS FLD ON FLD.created_by = FUS.user_id WHERE FUS.created_by = p_user_id AND FLD.flead_recid IS NOT NULL AND DATE(FLD.created_at) = DATE(NOW())) AS BL;
            SELECT IFNULL(SUM(LCH.lead_count), 0) INTO ibhTodayLeadsOnMd FROM users AS USL LEFT JOIN leads_count_history AS LCH ON LCH.created_by = USL.user_id where USL.created_by = p_user_id AND DATE(LCH.created_at) = DATE(NOW());

            SELECT SUM(revenue)  INTO ibhTotalRev  FROM 
            (SELECT SUM(RSL.total_value) AS revenue  FROM users AS USR LEFT JOIN sales AS RSL ON RSL.created_by = USR.user_id WHERE USR.created_by = p_user_id AND DATE(date_time) = DATE(NOW())
            UNION
            SELECT SUM(RFS.total_value) AS revenue  FROM users AS USFR LEFT JOIN fieldshopsales AS RFS ON RFS.created_by = USFR.user_id WHERE USFR.created_by = p_user_id  AND DATE(date_time) = DATE(NOW())) AS  BR;

            SELECT SUM(amount)  INTO ibhTotalExpenses FROM expenses WHERE created_by = p_user_id  AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) AND status = 'approved' ;

            SELECT COUNT(order_recid) INTO ibhADPendingOrder FROM 
            (SELECT SLO.order_recid AS order_recid  FROM users AS USO LEFT JOIN sales AS SLO ON SLO.created_by = USO.user_id WHERE USO.created_by = p_user_id AND SLO.status IN ("Pending")
            UNION
            SELECT SPO.order_recid AS order_recid  FROM users AS UPO LEFT JOIN fieldshopsales AS SPO ON SPO.created_by = UPO.user_id WHERE UPO.created_by = p_user_id AND SPO.status IN ("Pending") ) AS  BPO;

            SELECT COUNT(lp_recid)       INTO ibhPendingLeave  FROM user_activity WHERE action = "Leave" AND user_status = "Pending" AND user_id = p_user_id;
            SELECT COUNT(lp_recid)       INTO ibhPendingPermission  FROM user_activity WHERE action = "Permission" AND user_status = "Pending"  AND user_id = p_user_id;

            SELECT
                ROUND((IFNULL(ibhTodayLeads, 0) + IFNULL(ibhTodayLeadsOnMd,0)), 2)  AS bh_today_lead,
                ibhTotalRev             AS bh_total_revenue,
                ibhTotalExpenses        AS bh_total_expense,
                ibhADPendingOrder       AS bh_pending_order,
                ibhPendingLeave         AS bh_pending_leaves,
                ibhPendingPermission    AS bh_pending_permission;

    ELSEIF usertype = "AC" THEN

        -- Pending Orders
        SELECT SUM(order_recid) INTO iacPendingOrder FROM
        (SELECT COUNT(order_recid) AS order_recid FROM sales WHERE status = "Pending" 
        UNION
        SELECT COUNT(order_recid) AS order_recid FROM fieldshopsales WHERE status = "Pending") AS ACS;

        -- Today Orders
        SELECT SUM(order_recid) INTO iacTodayOrder FROM
        (SELECT COUNT(order_recid) AS order_recid FROM sales WHERE DATE(date_time) = DATE(NOW())
        UNION
        SELECT COUNT(order_recid) AS order_recid FROM fieldshopsales WHERE DATE(date_time) = DATE(NOW())) AS ACO;

        -- ✅ Total Revenue (Enhanced)
        SELECT 
            SUM(revenue) INTO iacTotalRev  
        FROM (
            SELECT SUM(final_amount) AS revenue 
            FROM sales  
            WHERE YEAR(date_time) = YEAR(CURDATE()) 
            AND MONTH(date_time) = MONTH(CURDATE())
            AND status IN ('Approved', 'Dispatched', 'In transit')
            
            UNION ALL
            
            SELECT SUM(final_amount) AS revenue 
            FROM fieldshopsales 
            WHERE YEAR(date_time) = YEAR(CURDATE()) 
            AND MONTH(date_time) = MONTH(CURDATE())
            AND status IN ('Approved', 'Dispatched', 'In transit')

            UNION ALL

            SELECT SUM(amount) AS revenue 
            FROM wallet_data 
            WHERE YEAR(created_at) = YEAR(CURDATE()) 
            AND MONTH(created_at) = MONTH(CURDATE())
            AND status IN ('Approved')

            UNION ALL

            SELECT SUM(price) AS revenue 
            FROM consulting_appointments 
            WHERE YEAR(slot_date) = YEAR(CURDATE()) 
            AND MONTH(slot_date) = MONTH(CURDATE())
            AND status IN ('Approved')

            UNION ALL

            SELECT SUM(amount_to_pay) AS revenue 
            FROM class_register 
            WHERE YEAR(created_at) = YEAR(CURDATE()) 
            AND MONTH(created_at) = MONTH(CURDATE())
            AND status IN ('Approved')

            UNION ALL

            SELECT SUM(amount_to_pay) AS revenue 
            FROM billing 
            WHERE YEAR(created_at) = YEAR(CURDATE()) 
            AND MONTH(created_at) = MONTH(CURDATE())         
        ) AS ACR;

        -- Expenses
        SELECT SUM(amount)  INTO iacTotalExpenses FROM expenses WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) AND status = 'approved';
        SELECT SUM(order_recid) INTO iacTotalOrder FROM(SELECT COUNT(order_recid) AS order_recid FROM sales  UNION SELECT COUNT(order_recid) AS order_recid FROM fieldshopsales ) AS ATO;

        -- Output
        SELECT
            iacPendingOrder         AS ac_pending_order,
            iacTodayOrder           AS ac_today_order,
            iacTotalRev             AS ac_total_revenue,
            iacTotalExpenses        AS ac_total_expense,
            iacTotalOrder           AS ac_total_order;

                
        ELSEIF usertype = "FS" THEN
            SELECT COUNT(flead_recid) INTO itslTodLeadCount FROM fieldleads WHERE DATE(created_at) = DATE(NOW()) AND created_by = p_user_id;
            SELECT SUM(lead_count)       INTO iTodayLeadsOnMd FROM leads_count_history WHERE DATE(created_at) = DATE(NOW()) AND created_by = p_user_id;
            SELECT COUNT(order_recid) INTO ifsTotalCollection  FROM fieldshopsales WHERE DATE(date_time) = DATE(NOW()) AND payment_type = "Credit" AND paid_status = "Pending";
            SELECT COUNT(flead_recid) INTO ifsTodayFollowup  FROM fieldleads WHERE disposition IN ("Follow up") AND DATE(created_at) = DATE(NOW());
            SELECT COUNT(flead_recid) INTO ifsTodayCallback  FROM fieldleads WHERE disposition IN ("Call back") AND DATE(created_at) = DATE(NOW());
            SELECT SUM(total_value), ROUND(SUM(total_value)*MAX(US.incentive_percentage)/100, 2)  INTO ifsSalesofmonth, ifsIncentive FROM fieldshopsales AS FSL 
            LEFT JOIN users AS US ON US.user_id = FSL.created_by WHERE YEAR(FSL.date_time) = YEAR(CURDATE()) AND MONTH(FSL.date_time) = MONTH(CURDATE());
            SELECT SUM(total_value) INTO ifsTodaySale FROM fieldshopsales WHERE DATE(date_time) = DATE(NOW());
            SELECT CONCAT(emp_id," / ", name) INTO ifsStarPerformer FROM (SELECT GROUP_CONCAT(DISTINCT emp_id) AS emp_id, GROUP_CONCAT(DISTINCT name) AS name , SUM(total_value) AS value FROM fieldshopsales AS FL LEFT JOIN users AS UFS ON UFS.user_id = FL.created_by GROUP BY FL.created_by) AS A ORDER BY value DESC LIMIT 1;

            SELECT
                ROUND(IFNULL(itslTodLeadCount, 0) + IFNULL(iTodayLeadsOnMd, 0), 2)     AS fs_fieldlead,
                ifsTotalCollection     AS fs_today_collection,
                ifsTodayFollowup       AS fs_today_followup,
                ifsTodayCallback       AS fs_today_calback,
                ifsSalesofmonth        AS fs_sale_month,
                ifsIncentive           AS fs_incentives,
                ifsTodaySale           AS fs_total_sale,
                ifsStarPerformer       AS fs_star_performar;
        
        ELSEIF usertype = "TSL" THEN

            SELECT COUNT(lead_recid) INTO itslTodLeadCount FROM leads WHERE DATE(created_at) = DATE(NOW()) AND created_by = p_user_id;
            SELECT SUM(lead_count)       INTO iTodayLeadsOnMd FROM leads_count_history WHERE DATE(created_at) = DATE(NOW()) AND created_by = p_user_id;
            SELECT COUNT(lead_recid) INTO itslTodayFollowup FROM leads WHERE DATE(disposition_date) = DATE(NOW()) AND disposition = "Follow up" AND created_by = p_user_id;
            SELECT COUNT(lead_recid) INTO itslTodayCallback FROM leads WHERE DATE(disposition_date) = DATE(NOW()) AND disposition = "Call back" AND created_by = p_user_id;

            SELECT COUNT(order_recid) INTO itslTodaySalesCount
            FROM sales
            WHERE DATE(date_time) = DATE(NOW())
            AND created_by = p_user_id
            AND status IN ('Approved', 'Dispatched', 'In transit');

            SELECT IFNULL(SUM(final_amount), 0) INTO itslTodaySalesAmount
            FROM sales
            WHERE DATE(date_time) = DATE(NOW())
            AND created_by = p_user_id
            AND status IN ('Approved', 'Dispatched', 'In transit');

            -- Month sales & incentive (only approved/in-progress statuses)
            SELECT IFNULL(SUM(SL.final_amount), 0), IFNULL(ROUND(SUM(SL.final_amount) * MAX(US.incentive_percentage) / 100, 2), 0)
            INTO itslMonthSalesAmount, itslIncentiveAmount
            FROM sales AS SL
            LEFT JOIN users AS US ON US.user_id = SL.created_by
            WHERE YEAR(SL.date_time) = YEAR(CURDATE())
            AND MONTH(SL.date_time) = MONTH(CURDATE())
            AND SL.created_by = p_user_id
            AND SL.status IN ('Approved', 'Dispatched', 'In transit');

            SELECT COUNT(order_recid) INTO itslMonthSalesCount
            FROM sales
            WHERE YEAR(date_time) = YEAR(CURDATE())
            AND MONTH(date_time) = MONTH(CURDATE())
            AND created_by = p_user_id
            AND status IN ('Approved', 'Dispatched', 'In transit');

            SELECT CONCAT(emp_id," / ",name) INTO itslStar FROM (SELECT GROUP_CONCAT(DISTINCT user_id) AS id , GROUP_CONCAT(DISTINCT emp_id) AS emp_id,  GROUP_CONCAT(DISTINCT name) AS name, SUM(final_amount) AS amount  FROM users AS UST
            LEFT JOIN sales AS SLT ON SLT.created_by = UST.user_id
            WHERE designation IN ('Telecalling sales') GROUP BY UST.user_id) AS TSL ORDER BY amount DESC LIMIT 1;


            SELECT
                ROUND(IFNULL(itslTodLeadCount, 0) + IFNULL(iTodayLeadsOnMd, 0), 2)     AS tsl_today_leads,
                itslTodayFollowup      AS tsl_today_followup,
                itslTodayCallback      AS tsl_today_calback,
                CONCAT(itslTodaySalesCount," / ₹ ", itslTodaySalesAmount)       AS tsl_today_sale,
                CONCAT(itslMonthSalesCount," / ₹ ", itslMonthSalesAmount)       AS tsl_month_sale,
                itslIncentiveAmount      AS tsl_incentive,
                itslStar                AS tsl_star_performar;
        
          ELSEIF usertype = "TCL" THEN

            SELECT COUNT(lead_recid) INTO itslTodLeadCount FROM leads WHERE DATE(created_at) = DATE(NOW()) AND created_by = p_user_id;
            SELECT SUM(lead_count)   INTO iTodayLeadsOnMd FROM leads_count_history WHERE DATE(created_at) = DATE(NOW()) AND created_by = p_user_id;
            SELECT COUNT(lead_recid) INTO itslTodayFollowup FROM leads WHERE DATE(disposition_date) = DATE(NOW()) AND disposition = "Follow up" AND created_by = p_user_id;
            SELECT COUNT(lead_recid) INTO itslTodayCallback FROM leads WHERE DATE(disposition_date) = DATE(NOW()) AND disposition = "Call back" AND created_by = p_user_id;

            SELECT COUNT(order_recid) INTO itslTodaySalesCount
            FROM sales
            WHERE DATE(date_time) = DATE(NOW())
            AND created_by = p_user_id
            AND status IN ('Approved', 'Dispatched', 'In transit');

            SELECT IFNULL(SUM(final_amount), 0) INTO itslTodaySalesAmount
            FROM sales
            WHERE DATE(date_time) = DATE(NOW())
            AND created_by = p_user_id
            AND status IN ('Approved', 'Dispatched', 'In transit');

            -- Month sales (only approved/in-progress statuses)
            SELECT IFNULL(SUM(final_amount), 0) INTO itslMonthSalesAmount
            FROM sales
            WHERE YEAR(date_time) = YEAR(CURDATE())
            AND MONTH(date_time) = MONTH(CURDATE())
            AND created_by = p_user_id
            AND status IN ('Approved', 'Dispatched', 'In transit');

            SELECT COUNT(order_recid) INTO itslMonthSalesCount
            FROM sales
            WHERE YEAR(date_time) = YEAR(CURDATE())
            AND MONTH(date_time) = MONTH(CURDATE())
            AND created_by = p_user_id
            AND status IN ('Approved', 'Dispatched', 'In transit');

            SELECT CONCAT(emp_id," / ",name) INTO itslStar FROM (SELECT GROUP_CONCAT(DISTINCT user_id) AS id , GROUP_CONCAT(DISTINCT emp_id) AS emp_id,  GROUP_CONCAT(DISTINCT name) AS name, SUM(total_value) AS amount  FROM users AS UST
            LEFT JOIN sales AS SLT ON SLT.created_by = UST.user_id
            WHERE designation IN ('Telecalling class') GROUP BY UST.user_id) AS TCL ORDER BY amount DESC LIMIT 1;
            
            SELECT COUNT(class_register_id) INTO itclTodayReg FROM class_register WHERE DATE(created_at) = DATE(NOW()) AND created_by = p_user_id;

            SELECT
            
                ROUND(IFNULL(itslTodLeadCount, 0) + IFNULL(iTodayLeadsOnMd, 0), 2)  AS tcl_today_leads,
                itslTodayFollowup      AS tcl_today_followup,
                itslTodayCallback      AS tcl_today_calback,
                CONCAT(itslTodaySalesCount," / ₹ ", itslTodaySalesAmount)       AS tcl_today_sale,
                CONCAT(itslMonthSalesCount," / ₹ ", itslMonthSalesAmount)       AS tcl_month_sale,
                itclTodayReg           AS tcl_Today_registers,
                itslStar               AS tcl_star_performar;

        ELSEIF usertype = "FOI" THEN

            SELECT COUNT(lead_recid) INTO itslTodLeadCount FROM leads WHERE DATE(created_at) = DATE(NOW()) AND created_by = p_user_id;
            SELECT SUM(lead_count)       INTO iTodayLeadsOnMd FROM leads_count_history WHERE DATE(created_at) = DATE(NOW()) AND created_by = p_user_id;
            SELECT COUNT(lead_recid) INTO itslTodayFollowup FROM leads WHERE DATE(disposition_date) = DATE(NOW()) AND disposition = "Follow up" AND created_by = p_user_id;
            SELECT COUNT(lead_recid) INTO itslTodayCallback FROM leads WHERE DATE(disposition_date) = DATE(NOW()) AND disposition = "Call back" AND created_by = p_user_id;
            SELECT SUM(amount_to_pay) INTO ifoiBillOfMonth FROM billing WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())  AND created_by = p_user_id;
            SELECT SUM(final_amount) INTO ifoiTotalSaleMonth FROM sales  WHERE YEAR(date_time) = YEAR(CURDATE()) AND MONTH(date_time) = MONTH(CURDATE())  AND status IN ('Approved', 'Dispatched', 'In transit') AND created_by = p_user_id;
            SELECT COUNT(stock_recid) INTO iStockAlert   FROM stock WHERE stock_status = "Low stock";
        
            SELECT CONCAT(emp_id, " / ", name)
                INTO itslStar
                FROM (
                    SELECT
                        GROUP_CONCAT(DISTINCT user_id) AS id,
                        GROUP_CONCAT(DISTINCT emp_id) AS emp_id,
                        GROUP_CONCAT(DISTINCT name) AS name,
                        IFNULL(SUM(final_amount), 0) AS amount
                    FROM users AS UST
                    LEFT JOIN sales AS SLT ON SLT.created_by = UST.user_id
                    WHERE designation IN ('Front office incharge')
                    AND SLT.status IN ('Approved', 'Dispatched', 'In transit')
                    GROUP BY UST.user_id
                ) AS FOI
                ORDER BY amount DESC
                LIMIT 1;
            

            SELECT
                ROUND(IFNULL(itslTodLeadCount, 0) + IFNULL(iTodayLeadsOnMd, 0), 2) AS foi_today_leads,
                itslTodayFollowup      AS foi_today_followup,
                itslTodayCallback      AS foi_today_calback,
                ifoiBillOfMonth        AS foi_bill_month,
                ifoiTotalSaleMonth     AS foi_sale_month,
                iStockAlert            AS foi_stock_alert,
                itslStar               AS foi_star_performar;

            ELSEIF usertype = "VA" THEN
            
                SELECT COUNT(id) INTO ivatot_appc FROM consulting_appointments
                WHERE DATE(slot_date) = DATE(NOW()) AND vaithyar_id = p_user_id;
                        
                SELECT  COUNT(id) INTO ivatot_upcome FROM consulting_appointments
                WHERE DATE(slot_date) > DATE(NOW()) AND vaithyar_id = p_user_id;

                SELECT  COUNT(class_register_id) INTO ivatodayClass FROM class_register
                WHERE DATE(preferred_date) = DATE(NOW()) AND assigned_to = p_user_id;

                SELECT  COUNT(class_register_id) INTO ivaUpcomingClass FROM class_register
                WHERE preferred_date > NOW() AND assigned_to = p_user_id;

                SELECT  COUNT(id) INTO ivaTotalClassc FROM consulting_appointments
                WHERE vaithyar_id = p_user_id;

                SELECT COUNT(class_register_id) INTO ivaTodayClassReg FROM class_register
                WHERE DATE(created_at) AND assigned_to = p_user_id;

                SELECT
                    ivatot_appc             AS va_today_appointment,
                    ivatot_upcome           AS va_upcome_appointment,
                    ivatodayClass           AS va_today_class,
                    ivaUpcomingClass        AS va_upcoming_class,
                    ivaTotalClassc          AS va_total_appointment,
                    ivaTodayClassReg        AS va_total_register;

        ELSEIF usertype = "CS" THEN
        
            SELECT COUNT(creative_id) INTO icsTodayDelivery FROM creativeservice WHERE status IN ("Completed","Uploaded") AND DATE(created_at) = DATE(NOW());
            SELECT COUNT(event_id) INTO icsTodayEvents FROM events WHERE DATE(event_date) = DATE(NOW());
            SELECT COUNT(creative_id) INTO icsCarryForward FROM creativeservice WHERE date_to_post > DATE(NOW()) AND status IN ("In progress") ;

            SELECT
                icsTodayDelivery            AS cs_today_delivary,
                icsTodayEvents              AS cs_today_events,
                icsCarryForward             AS cs_carry_forward;
                
        END IF;


        
    END//
    DELIMITER ;
