/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 10/07/2025
 DESC: It is used to get all directies
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllDirectory`;

CREATE PROCEDURE `SP_GetAllDirectory`()
BEGIN
    
    SELECT 
        id                   AS    id
    , title                AS    title
    , D.name               AS    name
    , mobile_no            AS    mobile_no
    , additional_no        AS    additional_no
    , email                AS    email
    , address              AS    address
    , DT.city_id           AS    city_id
    , S.state_id           AS    state_id
    , C.country_id         AS    country_id
    , C.name               AS    country
    , S.name               AS    state
    , DT.name              AS    district
    , D.created_by         AS    created_by
    , D.created_at         AS    created_at
    FROM
        directory AS D
        LEFT JOIN countries AS C 	ON C.country_id = D.country
        LEFT JOIN states 	AS S 	ON S.state_id = D.state
        LEFT JOIN cities 	AS DT 	ON DT.city_id = D.district
    WHERE isDeleted = 0;
    
END//
DELIMITER ;
