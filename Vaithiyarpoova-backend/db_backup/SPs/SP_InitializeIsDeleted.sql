DELIMITER //

CREATE PROCEDURE SP_InitializeIsDeleted()
BEGIN
    -- Initialize all is_deleted columns to 0 (active state)
    -- This ensures all master data and products start in active state
    -- Only admin actions in inputs page should change is_deleted to 1
    
    -- Tables with 'is_deleted' column (Master data tables)
    UPDATE brands SET is_deleted = 0 WHERE brand_id > 0 AND (is_deleted IS NULL OR is_deleted != 0);
    UPDATE categories SET is_deleted = 0 WHERE category_id > 0 AND (is_deleted IS NULL OR is_deleted != 0);
    UPDATE form_factors SET is_deleted = 0 WHERE form_factor_id > 0 AND (is_deleted IS NULL OR is_deleted != 0);
    UPDATE product_types SET is_deleted = 0 WHERE product_type_id > 0 AND (is_deleted IS NULL OR is_deleted != 0);
    UPDATE units SET is_deleted = 0 WHERE unit_id > 0 AND (is_deleted IS NULL OR is_deleted != 0);
    UPDATE usertype SET is_deleted = 0 WHERE usertype_id > 0 AND (is_deleted IS NULL OR is_deleted != 0);
    UPDATE product SET is_deleted = 0 WHERE product_recid > 0 AND (is_deleted IS NULL OR is_deleted != 0);
    
    -- Tables with 'isDeleted' column (Other tables) - Not used in inputs page
    -- UPDATE users SET isDeleted = 0 WHERE user_id > 0 AND (isDeleted IS NULL OR isDeleted != 0);
    -- UPDATE branches SET isDeleted = 0 WHERE branch_recid > 0 AND (isDeleted IS NULL OR isDeleted != 0);
    
    -- Return success message with count of updated records
    SELECT 
        'All is_deleted columns initialized to 0 successfully' as message,
        'Initial state: All items are active (is_deleted = 0)' as note,
        'Only admin actions in inputs page will change is_deleted to 1' as reminder;
    
END //

DELIMITER ; 