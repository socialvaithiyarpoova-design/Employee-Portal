/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 09/07/2025
 DESC: It is used save the services
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_SaveCreativeServices`;

CREATE PROCEDURE `SP_SaveCreativeServices`(
    IN sEmpID       VARCHAR(1000)
   ,IN sTitle       VARCHAR(1000)
   ,IN sType        VARCHAR(1000)
   ,IN sDescribtion VARCHAR(1000)
   ,IN dateToPost   VARCHAR(100)
)
BEGIN
    
    INSERT INTO creativeservice ( emp_id, title, type, description, date_to_post ) 
    VALUES (sEmpID, sTitle, sType, sDescribtion, dateToPost);

    SELECT * FROM creativeservice ORDER BY 1 DESC;
   
END//

DELIMITER ;

