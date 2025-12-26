DELIMITER $$
DROP PROCEDURE IF EXISTS `SP_GetProductBrandCounts`;
CREATE PROCEDURE SP_GetProductBrandCounts()
BEGIN
    SELECT
      COUNT(*) AS total_count,
      COUNT(CASE WHEN brand = 'Vaithiyar Poova' THEN 1 END) AS vaithyar_poova_count,
      COUNT(CASE WHEN brand = 'Gramiyam' THEN 1 END) AS gramiyam_count
    FROM product WHERE is_deleted = 0;
END $$

DELIMITER ;
