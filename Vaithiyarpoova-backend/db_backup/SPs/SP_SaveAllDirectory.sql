/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 10/07/2025
 DESC: It is used to save all directies
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_SaveAllDirectory`;

CREATE PROCEDURE SP_SaveAllDirectory(
    IN p_title VARCHAR(255),
    IN p_name VARCHAR(255),
    IN p_mobile VARCHAR(20),
    IN p_additional_mobile VARCHAR(20),
    IN p_email VARCHAR(255),
    IN p_address TEXT,
    IN p_country INT(11),
    IN p_state INT(11),
    IN p_city INT(11),
    IN p_userId INT(11)
)
BEGIN
    INSERT INTO directory (
        title, name, mobile_no, additional_no,
        email, address, country, state, district, created_at , created_by
    )
    VALUES (
        p_title, p_name, p_mobile, p_additional_mobile,
        p_email, p_address, p_country, p_state, p_city, NOW() , p_userId
    );
END//
DELIMITER ;
