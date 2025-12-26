
const { getPool } = require('../database/db');
const db = getPool();
const { generatePresignedUrl } = require('../utilities/s3Utils');

exports.getalldirectory = async (req, res) => {

    const sqlPg = `CALL SP_GetAllDirectory()`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting leads:', errPg);
                return res.status(500).json({ message: 'Failed to get leads' });
            }

            res.status(200).json({
                leads: resultPg[0]
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.savealldirectory = async (req, res) => {
    const {
        title,
        name,
        mobile,
        additional_mobile,
        email,
        address,
        country_id,
        state_id,
        city_id,
        userId
    } = req.body.payload;

    const sqlPg = `CALL SP_SaveAllDirectory(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
        title,
        name,
        mobile,
        additional_mobile || null,
        email || null,
        address,
        country_id,
        state_id,
        city_id,
        userId
    ];

    try {
        db.query(sqlPg, values, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error saving directory:', errPg);
                return res.status(500).json({ message: 'Failed to save directory' });
            }

            const responseData = resultPg?.[0]?.[0] ?? null;

            res.status(200).json({
                message: "Directory saved successfully",
                data: responseData
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};  

exports.deldirectorydata = async (req, res) => {

    const { dir_id } = req.body;
    
    const sqlPg = `CALL SP_DelDirectoryData(${dir_id})`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error while delete:', errPg);
                return res.status(500).json({ message: 'Failed to delete data' });
            }

           const responseData = resultPg?.[0]?.[0] ?? null;

            res.status(200).json({
                message: "Directory deleted successfully",
                data: responseData
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getProductsByinventoryBrand = async (req, res) => {
    const { brand, user_id, status } = req.body;
 
    try {
        let conditions = ` WHERE p.brand = ? AND p.is_deleted = 0 `;
        const params = [brand];

        if (status && status !== "") {
            conditions += ` AND i.stock_status = ? `;
            params.push(status);
        }

        if (user_id && user_id > 0) {
            conditions += ` AND i.dispatch_id = ? `;
            params.push(user_id);
        }

        const sql = `
            SELECT 
                p.*,
                i.inventory_recid,
                i.dispatch_id,
                i.product_id AS inventory_product_id,
                i.min_stock_quantity,
                i.quantity,
                i.stock_status,
                i.updated_at AS inventory_updated_at
            FROM vaithiyar_poova.inventory i
            INNER JOIN vaithiyar_poova.product p ON i.product_id = p.product_id
            ${conditions}
            ORDER BY p.product_recid DESC;
        `;

        db.query(sql, params, async (err, products) => {
            if (err) {
                console.error("DB error:", err);
                return res.status(500).json({ message: "Database error", error: err.message });
            }  
            const enrichedProducts = await Promise.all(
                products.map(async (p) => ({
                    ...p,
                    imageUrl: p.product_img
                        ? await generatePresignedUrl(p.product_img)
                        : null,
                }))
            );

            return res.status(200).json(enrichedProducts);
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.getinventorylist = async (req, res) => {
    const sqlPg = `SELECT * FROM branches WHERE branch_type = 'Dispatch' AND isDeleted = 0`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting branches:', errPg);
                return res.status(500).json({ message: 'Failed to fetch branches' });
            }
            res.status(200).json({ branches: resultPg });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.Addinventory = async (req, res) => {
  try {
    const { product_id, quantity, min_stock_quantity, userId } = req.body;
    const productCheckSql = `
      SELECT * FROM product  WHERE product_id = ? AND is_deleted = 0 `;
    db.query(productCheckSql, [product_id], (productErr, productResult) => {
      if (productErr) {
        console.error("Error checking product:", productErr);
        return res.status(500).json({ message: "Database error", error: productErr });
      }

      if (productResult.length === 0) {
        return res.status(404).json({
          message: "Product not found in product table",
        });
      }

      // 2️⃣ Check if product already exists in inventory for this dispatch_id
      const inventoryCheckSql = `SELECT * FROM inventory  WHERE product_id = ? AND dispatch_id = ? `;

      db.query(inventoryCheckSql, [product_id, userId], (invErr, invResult) => {
        if (invErr) {
          console.error("Error checking inventory:", invErr);
          return res.status(500).json({ message: "Database error", error: invErr });
        }

        if (invResult.length > 0) {
          return res.status(409).json({
            message: "This product already exists in inventory for this dispatch branch",
          });
        }

                // Stock Status Logic
            let stock_status = "Not Available";

            if (quantity > 0 && quantity <= min_stock_quantity) {
            stock_status = "Low Stock";
            } else if (quantity > min_stock_quantity) {
            stock_status = "Available";
            }

        const insertSql = `
          INSERT INTO inventory 
          (product_id, quantity, min_stock_quantity, stock_status, dispatch_id)
          VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
          product_id,
          quantity,
          min_stock_quantity,
          stock_status,
          userId,
        ];

        db.query(insertSql, values, (err, result) => {
          if (err) {
            console.error("Error adding stock:", err);
            return res.status(500).json({ message: "Error adding product", error: err });
          }

          return res.status(200).json({
            message: "Stock added successfully",
            insertId: result.insertId,
          });
        });
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.EditeProductinventry = (req, res) => {
  const { inventory_recid } = req.params;
  const { quantity, min_stock_quantity = 0 } = req.body;

  if (quantity === undefined || quantity === null ||
      min_stock_quantity === undefined || min_stock_quantity === null) {
    return res.status(400).json({ message: "Quantity and min_stock_quantity are required" });
  }

  const sql = 'CALL SP_EditProductinventry(?, ?, ?)';
  const values = [inventory_recid, quantity, min_stock_quantity];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Edit failed:', err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
    const responseData = result?.[0]?.[0] ?? null;
    res.status(200).json({ success: true, message: 'Product updated successfully', data: responseData });
  });
};

exports.getinventoryBrand = async (req, res) => {
    const { brand, user_id, status } = req.body;

    try {
        let branch_rceid = null;

        // Step 1: Get user's branch ID
        if (user_id && user_id > 0) {
            const userResult = await new Promise((resolve, reject) => {
                db.query(
                    "SELECT branch_rceid FROM users WHERE user_id = ? LIMIT 1",
                    [user_id],
                    (err, rows) => (err ? reject(err) : resolve(rows))
                );
            });

            if (userResult.length > 0) {
                branch_rceid = userResult[0].branch_rceid;
            }
        }

        // Build main conditions
        let conditions = ` WHERE p.brand = ? AND p.is_deleted = 0 `;
        const params = [brand];

        if (status && status !== "") {
            conditions += ` AND i.stock_status = ? `;
            params.push(status);
        }

        if (branch_rceid) {
            conditions += ` AND i.dispatch_id = ? `;
            params.push(branch_rceid);
        }

        // Main SQL Query
        const sql = `
            SELECT 
                p.*,
                i.inventory_recid,
                i.dispatch_id,
                i.product_id AS inventory_product_id,
                i.min_stock_quantity,
                i.quantity,
                i.stock_status,
                i.updated_at AS inventory_updated_at
            FROM vaithiyar_poova.inventory i
            INNER JOIN vaithiyar_poova.product p ON i.product_id = p.product_id
            ${conditions}
            ORDER BY p.product_recid DESC;
        `;

        db.query(sql, params, async (err, products) => {
            if (err) {
                console.error("DB error:", err);
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            // Attach image URLs
            const enrichedProducts = await Promise.all(
                products.map(async (p) => ({
                    ...p,
                    imageUrl: p.product_img
                        ? await generatePresignedUrl(p.product_img)
                        : null,
                }))
            );

            return res.status(200).json(enrichedProducts);
        });

    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


exports.getUserBranch = async (req, res) => {
    const { user_id } = req.body; 
    const sql = "SELECT branch_rceid FROM users WHERE user_id = ? LIMIT 1";

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ data: result[0] });
    });
};