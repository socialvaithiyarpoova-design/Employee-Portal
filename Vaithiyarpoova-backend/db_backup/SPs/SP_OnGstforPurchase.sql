/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 26/07/2025
 DESC: It is used to turn on gst
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_OnGstforPurchase`;

CREATE PROCEDURE `SP_OnGstforPurchase`(
    IN gst_id       VARCHAR(50),
    IN percentage   VARCHAR(50),
    IN Type         VARCHAR(20)
)
BEGIN
    SET SQL_SAFE_UPDATES = 0;

    IF Type = "OFF" THEN
        UPDATE gst_data 
        SET isActiveGST = 0 
        WHERE id IS NOT NULL;
    ELSE
        UPDATE gst_data 
        SET isActiveGST = 0 
        WHERE id IS NOT NULL;

        UPDATE gst_data 
        SET isActiveGST = 1, 
            gst_percentage = percentage
        WHERE gst_number = gst_id;
    END IF;

    SET SQL_SAFE_UPDATES = 1;
END //

DELIMITER ;
