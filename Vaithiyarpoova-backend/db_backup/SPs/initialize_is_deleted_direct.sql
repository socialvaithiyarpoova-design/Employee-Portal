-- Direct SQL to initialize all soft delete columns to 0
-- Run this in MySQL Workbench to set initial state

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

-- Verify the changes
SELECT 'Initialization Complete' as status;

-- Check tables with 'is_deleted' column
SELECT 
    'brands' as table_name, 
    COUNT(*) as total_records, 
    SUM(is_deleted) as deleted_count,
    'is_deleted' as column_type
FROM brands
UNION ALL
SELECT 'categories', COUNT(*), SUM(is_deleted), 'is_deleted' FROM categories
UNION ALL
SELECT 'form_factors', COUNT(*), SUM(is_deleted), 'is_deleted' FROM form_factors
UNION ALL
SELECT 'product_types', COUNT(*), SUM(is_deleted), 'is_deleted' FROM product_types
UNION ALL
SELECT 'units', COUNT(*), SUM(is_deleted), 'is_deleted' FROM units
UNION ALL
SELECT 'usertype', COUNT(*), SUM(is_deleted), 'is_deleted' FROM usertype
UNION ALL
SELECT 'product', COUNT(*), SUM(is_deleted), 'is_deleted' FROM product
UNION ALL
-- Check tables with 'isDeleted' column (Not used in inputs page)
-- SELECT 'users', COUNT(*), SUM(isDeleted), 'isDeleted' FROM users
-- UNION ALL
-- SELECT 'branches', COUNT(*), SUM(isDeleted), 'isDeleted' FROM branches; 