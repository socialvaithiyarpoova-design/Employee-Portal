/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 08/05/2025
 DESC: It is used get the wallet sale list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetWalletSaleHistory`;

CREATE PROCEDURE `SP_GetWalletSaleHistory`(
    IN p_lead_id VARCHAR(100),
    IN p_sType VARCHAR(20)
)
BEGIN

   

        IF p_sType != 'FS' THEN
            SET @sQuery = CONCAT(" 
                SELECT 
                    order_id, wallet, total_value, date_time,final_amount
                FROM
                    sales
                WHERE
                    leads_id = '",p_lead_id,"' ");

                -- SELECT @sQuery;
                PREPARE stmt FROM @sQuery;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
        ELSE

            SET @sQuery = CONCAT(" 
                        SELECT 
                            order_id, wallet, total_value, date_time,final_amount
                        FROM
                            fieldshopsales
                        WHERE
                            leads_id = '",p_lead_id,"' ");

                -- SELECT @sQuery;
                PREPARE stmt FROM @sQuery;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
        END IF;

END//

DELIMITER ;

