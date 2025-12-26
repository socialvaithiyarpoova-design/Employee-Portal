/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 09/08/2025
 DESC: It is used get the employee lead list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetLeadsCountList`;
CREATE PROCEDURE `SP_GetLeadsCountList`()
BEGIN

     SELECT 
        created_by,
        COUNT(DISTINCT CASE WHEN disposition = 'Follow up' THEN lead_recid END) AS follow_up_count,
        COUNT(DISTINCT CASE WHEN disposition = 'Call back' THEN lead_recid END) AS call_back_count,
        COUNT(DISTINCT CASE WHEN disposition <> 'Interested' THEN lead_recid END) AS not_interested_count
    FROM leads
    GROUP BY created_by;


END//

DELIMITER ;

