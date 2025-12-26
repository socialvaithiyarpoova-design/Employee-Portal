/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 26/07/2025
 DESC: It is used to save premium data list
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_SavePremiumData`;

CREATE PROCEDURE `SP_SavePremiumData`(
    IN sClient_type       VARCHAR(500),
    IN sSelect_level      VARCHAR(500),
    IN premAmount        VARCHAR(500)
)
BEGIN
    DECLARE sIcon TEXT DEFAULT '';
    DECLARE prCount TEXT DEFAULT 0;

    IF sSelect_level = "Bronze" THEN
        SET sIcon = "bronze";
    ELSEIF sSelect_level = "Silver" THEN
        SET sIcon = "silver"; 
    ELSEIF sSelect_level = "Gold" THEN
        SET sIcon = "gold"; 
    ELSE
        SET sIcon = "";
    END IF;

    SELECT COUNT(premium_id) INTO prCount FROM premium_master WHERE client_type = sClient_type AND gst_level = sSelect_level;
    
    IF prCount > 0 THEN
        DELETE FROM premium_master WHERE client_type = sClient_type AND gst_level = sSelect_level;
    END IF;

    INSERT INTO premium_master (client_type, gst_level, amount, icon)
    VALUES (sClient_type, sSelect_level, premAmount, sIcon);
END //

DELIMITER ;
