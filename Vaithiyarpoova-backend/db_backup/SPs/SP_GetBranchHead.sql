/* ----------------------------------------------------------------------------------------------------------------- 
 NAME: Hariharan S
 DATE: 19/05/2025
 DESC: It is used get the branch last id
 ----------------------------------------------------------------------------------------------------------------- */
DELIMITER //

DROP PROCEDURE IF EXISTS `SP_GetBranchHead`;

CREATE PROCEDURE `SP_GetBranchHead`(
    IN p_type VARCHAR(100)
)
BEGIN

	IF p_type = "Dispatch" THEN
		SELECT 
			 U.name             AS label
			,U.name             AS value
			,U.user_id          AS id
			,U.usertype_id      AS code
			,U.email            AS email
			,U.mobile_number    AS mobile_number
		FROM
			users AS U
			LEFT JOIN usertype AS UT ON UT.usertype_id = U.usertype_id
		WHERE
			UT.user_typecode = 'DIS'
			AND U.isDeleted = 0;
	ELSE 
		SELECT 
			 U.name             AS label
			,U.name             AS value
			,U.user_id          AS id
			,U.usertype_id      AS code
			,U.email            AS email
			,U.mobile_number    AS mobile_number
		FROM
			users AS U
			LEFT JOIN usertype AS UT ON UT.usertype_id = U.usertype_id
		WHERE
			UT.user_typecode = 'BH'
			 AND U.isDeleted = 0;
	END IF;

END//

DELIMITER ;

