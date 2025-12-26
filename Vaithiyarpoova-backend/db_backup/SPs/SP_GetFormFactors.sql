/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Ajithkumar
 DATE: 09/05/2025
 DESC: It is used to check mail
 ----------------------------------------------------------------------------------------------------------------- */

 DELIMITER $$

CREATE PROCEDURE SP_GetFormFactors()
BEGIN
    SELECT 
        form_factor_id ,
        form_name AS label,
        form_name AS value,
        code 
        
    FROM form_factors WHERE is_deleted = 0;
END $$

DELIMITER ;

call SP_GetFormFactors();