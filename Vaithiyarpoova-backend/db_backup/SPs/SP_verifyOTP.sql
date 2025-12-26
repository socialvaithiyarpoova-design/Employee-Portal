/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 29/04/2025
 DESC: It is used to verify otp
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_verifyOTP`;

CREATE PROCEDURE `SP_verifyOTP`(
   IN otpValue       VARCHAR(10)
)
BEGIN
    SET @otpCount = 0;

    SELECT COUNT(*) INTO @otpCount FROM users WHERE otp = otpValue LIMIT 1;

    IF @otpCount > 0 THEN 
        UPDATE users SET otp = null  WHERE otp = otpValue LIMIT 1;

        SELECT 200 AS status;
    ELSE
        SELECT 201 AS status;
    END IF;
   
END//

DELIMITER ;

