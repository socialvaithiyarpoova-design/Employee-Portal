/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 11/08/2025
 DESC: It is used get the client list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetClientsCountList`;
CREATE PROCEDURE `SP_GetClientsCountList`(
    IN iUserId INT(11)
)
BEGIN

     SELECT 
        COUNT(lead_recid) AS total_count,
        SUM(CASE WHEN premium_status = 'Gold' THEN 1 ELSE 0 END)  AS gold_count,
        SUM(CASE WHEN premium_status = 'Silver' THEN 1 ELSE 0 END)  AS silver_count,
        SUM(CASE WHEN premium_status = 'Bronze' THEN 1 ELSE 0 END)  AS bronze_count
    FROM (
        SELECT 
            A.*,
            COALESCE(PM.gst_level, NULL) AS premium_status,
            COALESCE(PM.icon, NULL) AS icon
        FROM (
            SELECT 
                LD.lead_recid,
                LD.lead_id,
                LD.lead_name,
                LD.age,
                LD.gender,
                LD.mobile_number,
                LD.email,
                LD.disposition,
                LD.disposition_date,
                LD.comments,
                LD.interested_type,
                LD.created_at,
                LS.amount,
                US.user_id,
                US.name AS created_by_name
            FROM leads AS LD 
            LEFT JOIN (
                SELECT leads_id, SUM(total_value) AS amount
                FROM sales
                GROUP BY leads_id
            ) AS LS ON LS.leads_id = LD.lead_id
            LEFT JOIN users AS US ON US.user_id = LD.created_by
        ) A
        LEFT JOIN (
            SELECT p1.gst_level, p1.amount, p1.icon  
            FROM premium_master p1
            WHERE client_type = 'People'
        ) PM 
            ON A.amount >= PM.amount
        AND PM.amount = (
                SELECT MAX(p2.amount)
                FROM premium_master p2
                WHERE p2.client_type = 'People'
                AND A.amount >= p2.amount
        )
        WHERE user_id = iUserId
    ) AS A;



END//

DELIMITER ;

