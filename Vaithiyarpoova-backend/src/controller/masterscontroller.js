const { getPool } = require('../database/db');
const db = getPool();

const TABLES = {
  // Master data tables with 'is_deleted' column
  brands: { id: 'brand_id', name: 'brand_name', code: 'code', productCol: 'brand', deleteCol: 'is_deleted' },
  categories: { id: 'category_id', name: 'category_name', code: 'code', productCol: 'product_category', deleteCol: 'is_deleted' },
  form_factors: { id: 'form_factor_id', name: 'form_name', code: 'code', productCol: 'form_factor', deleteCol: 'is_deleted' },
  product_types: { id: 'product_type_id', name: 'type_name', code: 'code', productCol: 'product_type', deleteCol: 'is_deleted' },
  units: { id: 'unit_id', name: 'unit_name', code: 'code', productCol: 'units', deleteCol: 'is_deleted' },
  usertype: { id: 'usertype_id', name: 'user_type', code: 'user_typecode', deleteCol: 'is_deleted' }
};

const queryAsync = (sql, params) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, result) => {
    if (err) return reject(err);
    resolve(result);
  });
});

exports.listMaster = async (req, res) => {
  try {
    const { table } = req.params;
    const meta = TABLES[table];
    if (!meta) return res.status(400).json({ message: 'Invalid table' });

    const rows = await queryAsync(`SELECT ${meta.id}, ${meta.name}, ${meta.code}, ${meta.deleteCol} FROM ${table} ORDER BY ${meta.name} ASC`);
    return res.status(200).json({ data: rows });
  } catch (e) {
    console.error('listMaster error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.upsertMaster = async (req, res) => {
  try {
    const { table } = req.params;
    const { name, code } = req.body;
    const meta = TABLES[table];
    if (!meta) return res.status(400).json({ message: 'Invalid table' });
    if (!name || !code) return res.status(400).json({ message: 'Missing name/code' });

    const existing = await queryAsync(`SELECT ${meta.id} AS id, ${meta.deleteCol}, ${meta.name} AS db_name, ${meta.code} AS db_code FROM ${table} WHERE ${meta.name} = ? OR ${meta.code} = ? LIMIT 1`, [name, code]);

    if (existing.length > 0) {
      const row = existing[0];
      if (row[meta.deleteCol] === 0 || row[meta.deleteCol] === '0') {
        const tableName = table === 'usertype' ? 'designation' : table.slice(0,-1);
        return res.status(409).json({ message: `${tableName} already exists` });
      }
      // Restore master
      await queryAsync(`UPDATE ${table} SET ${meta.deleteCol} = 0 WHERE ${meta.id} = ?`, [row.id]);
      // Optionally align name/code to the provided payload if they differ
      if ((row.db_name && row.db_name !== name) || (row.db_code && row.db_code !== code)) {
        await queryAsync(`UPDATE ${table} SET ${meta.name} = ?, ${meta.code} = ? WHERE ${meta.id} = ?`, [name, code, row.id]);
      }
      // Restore products by the original DB name to avoid mismatch when the incoming name differs
      if (meta.productCol) {
        const matchName = row.db_name || name;
        await queryAsync(`UPDATE product SET is_deleted = 0 WHERE ${meta.productCol} = ?`, [matchName]);
      }
      return res.status(200).json({ message: 'Restored successfully' });
    }

    const insertRes = await queryAsync(`INSERT INTO ${table} (${meta.name}, ${meta.code}, ${meta.deleteCol}) VALUES (?, ?, 0)`, [name, code]);
    return res.status(200).json({ message: 'Added successfully', id: insertRes.insertId });
  } catch (e) {
    console.error('upsertMaster error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.checkImpact = async (req, res) => {
  try {
    const { table, name } = req.body;
    const meta = TABLES[table];
    if (!meta) return res.status(400).json({ message: 'Invalid table' });
    if (!name) return res.status(400).json({ message: 'Missing name' });

    let affectedProducts = [];
    
    if (meta.productCol) {
      // Get all products that will be affected by this deletion
      const products = await queryAsync(
        `SELECT product_recid, product_name, brand, product_category, form_factor, product_type, units 
         FROM product 
         WHERE ${meta.productCol} = ? AND is_deleted = 0 
         ORDER BY product_name ASC 
         LIMIT 50`, 
        [name]
      );
      
      affectedProducts = products.map(p => ({
        product_id: p.product_recid,
        product_name: p.product_name,
        brand: p.brand,
        product_category: p.product_category,
        form_factor: p.form_factor,
        product_type: p.product_type,
        units: p.units
      }));
    }

    return res.status(200).json({ 
      affectedProducts,
      totalAffected: affectedProducts.length,
      table: table,
      masterItem: name
    });
  } catch (e) {
    console.error('checkImpact error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.softDeleteMaster = async (req, res) => {
  try {
    const { table } = req.params;
    const { id } = req.body;
    const meta = TABLES[table];
    if (!meta) return res.status(400).json({ message: 'Invalid table' });
    if (!id) return res.status(400).json({ message: 'Missing id' });

    // find name for cascading
    const rows = await queryAsync(`SELECT ${meta.name} AS name FROM ${table} WHERE ${meta.id} = ? LIMIT 1`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    const masterName = rows[0].name;

    await queryAsync(`UPDATE ${table} SET ${meta.deleteCol} = 1 WHERE ${meta.id} = ?`, [id]);

    if (meta.productCol) {
      await queryAsync(`UPDATE product SET is_deleted = 1 WHERE ${meta.productCol} = ?`, [masterName]);
    }

    return res.status(200).json({ message: 'Deleted successfully' });
  } catch (e) {
    console.error('softDeleteMaster error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

