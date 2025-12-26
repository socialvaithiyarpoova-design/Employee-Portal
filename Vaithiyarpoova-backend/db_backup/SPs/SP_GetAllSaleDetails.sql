/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 25/06/2025
 DESC: It is used to get all lead details
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //
DROP PROCEDURE IF EXISTS `SP_GetAllSaleDetails`;

CREATE PROCEDURE `SP_GetAllSaleDetails`()
BEGIN

    SELECT 
        FS.flead_recid          AS lead_recid
        ,FS.flead_id            AS lead_id
        ,FS.flead_name          AS lead_name
        ,FS.shop_keeper         AS shop_keeper
        ,FS.shop_type           AS shop_type
        ,FS.mobile_number       AS mobile_number
        ,FS.alternate_number    AS alternate_number
        ,FS.email               AS email
        ,FS.city                AS city
        ,FS.state               AS state
        ,FS.country             AS country
        ,FS.location            AS address
        ,FS.category            AS category
        ,FS.gst                 AS gst
        ,FS.image_sales         AS image_sales
        ,FS.created_by          AS created_by
        ,FS.disposition         AS disposition
        ,FS.disposition_date    AS disposition_date
        ,FS.comments            AS comments
        ,FS.interested_type     AS interested_type
        ,FS.created_at          AS created_at
        ,US.emp_id              AS created_by
        ,US.name                AS created_by_name
    FROM
            fieldleads AS FS 
        LEFT JOIN users AS US ON US.user_id = FS.created_by 
        ORDER BY 1 DESC;
    
END//
DELIMITER ;
