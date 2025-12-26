DELIMITER $$

DROP PROCEDURE IF EXISTS SP_GetCreativeServicesEmployees$$

CREATE PROCEDURE SP_GetCreativeServicesEmployees(IN p_userId INT)
BEGIN
    -- Get all employees for Creative Services designation
    -- This includes both active and inactive employees
    SELECT 
        u.user_id,
        u.emp_id,
        u.name,
        u.email,
        u.mobile_number,
        u.usertype_id,
        u.designation,
        u.date_of_joining,
        u.salary,
        u.incentive_percentage,
        u.address,
        u.image_url,
        u.created_by,
        u.created_at,
        u.isDeleted
    FROM users u
    INNER JOIN usertype ut ON u.usertype_id = ut.usertype_id
    WHERE ut.user_typecode = 'CS'  -- Creative Services designation
    ORDER BY u.name ASC;
END$$

DELIMITER ;
