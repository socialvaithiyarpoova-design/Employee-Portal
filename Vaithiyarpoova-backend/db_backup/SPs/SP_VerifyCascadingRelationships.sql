DELIMITER //

CREATE PROCEDURE SP_VerifyCascadingRelationships()
BEGIN
    -- Verify the cascading relationships work correctly
    -- This shows which products would be affected when master items are soft deleted
    
    -- Brands and their affected products
    SELECT 
        'Brands' as master_table,
        b.brand_name as master_value,
        COUNT(p.product_id) as affected_products
    FROM brands b
    LEFT JOIN product p ON b.brand_name = p.brand AND p.is_deleted = 0
    WHERE b.is_deleted = 0
    GROUP BY b.brand_id, b.brand_name
    HAVING COUNT(p.product_id) > 0;
    
    -- Categories and their affected products
    SELECT 
        'Categories' as master_table,
        c.category_name as master_value,
        COUNT(p.product_id) as affected_products
    FROM categories c
    LEFT JOIN product p ON c.category_name = p.product_category AND p.is_deleted = 0
    WHERE c.is_deleted = 0
    GROUP BY c.category_id, c.category_name
    HAVING COUNT(p.product_id) > 0;
    
    -- Form Factors and their affected products
    SELECT 
        'Form Factors' as master_table,
        f.form_name as master_value,
        COUNT(p.product_id) as affected_products
    FROM form_factors f
    LEFT JOIN product p ON f.form_name = p.form_factor AND p.is_deleted = 0
    WHERE f.is_deleted = 0
    GROUP BY f.form_factor_id, f.form_name
    HAVING COUNT(p.product_id) > 0;
    
    -- Product Types and their affected products
    SELECT 
        'Product Types' as master_table,
        pt.type_name as master_value,
        COUNT(p.product_id) as affected_products
    FROM product_types pt
    LEFT JOIN product p ON pt.type_name = p.product_type AND p.is_deleted = 0
    WHERE pt.is_deleted = 0
    GROUP BY pt.product_type_id, pt.type_name
    HAVING COUNT(p.product_id) > 0;
    
    -- Units and their affected products
    SELECT 
        'Units' as master_table,
        u.unit_name as master_value,
        COUNT(p.product_id) as affected_products
    FROM units u
    LEFT JOIN product p ON u.unit_name = p.units AND p.is_deleted = 0
    WHERE u.is_deleted = 0
    GROUP BY u.unit_id, u.unit_name
    HAVING COUNT(p.product_id) > 0;
    
END //

DELIMITER ; 