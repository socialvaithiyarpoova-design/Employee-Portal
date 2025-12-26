const { getPool } = require('../database/db');
const db = getPool();
const { generatePresignedUrl } = require('../utilities/s3Utils');
const ExcelJS = require('exceljs');


exports.GetAllProductTypes = async (req, res) => {
  try {
    const sql = 'CALL SP_GetAllProductTypes()';
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error fetching product types:', err);
        return res.status(500).json({ message: 'Failed to fetch product types' });
      }
      const rows = result[0];
      res.status(200).json({ data: rows });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to fetch product types' });
  }
}

exports.GetFormfactors = async (req, res) => {
  try {
    const sql = 'CALL SP_GetFormFactors()';
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error fetching product types:', err);
        return res.status(500).json({ message: 'Failed to fetch product types' });
      }
      const rows = result[0];
      res.status(200).json({ data: rows });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to fetch product types' });
  }
}

exports.ProductUints = async (req, res) => {
  try {
    const sql = 'CALL SP_ProductUints()';
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error fetching product types:', err);
        return res.status(500).json({ message: 'Failed to fetch product types' });
      }
      const rows = result[0];
      res.status(200).json({ data: rows });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to fetch product types' });
  }
}

exports.ProductCategory = async (req, res) => {
  try {
    const sql = 'CALL SP_ProductCategory()';
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error fetching product Category:', err);
        return res.status(500).json({ message: 'Failed to fetch product Category' });
      }
      const rows = result[0];
      res.status(200).json({ data: rows });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to fetch product Category' });
  }
}
exports.ProductBrand = async (req, res) => {
  try {
    const sql = 'CALL SP_ProductBrand()';
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error fetching product Brand:', err);
        return res.status(500).json({ message: 'Failed to fetch product Brand' });
      }
      const rows = result[0];
      res.status(200).json({ data: rows });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to fetch product Brand' });
  }
}

exports.getLastProductID = async (req, res) => {
  const { value } = req.body;

  try {
    const sql = `CALL SP_GetLastProductID(?)`;
    db.query(sql, [value], (err, result) => {
      if (err) {
        console.error('Error executing stored procedure:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      const rows = result[0];
      res.status(200).json({ data: rows });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.AddProduct = async (req, res) => {
  try {
    const { productId, productName, productBrand, productCategory, formFactor, ptype,
      package_quantity, units, price, product_dsc, quantity, min_stock, userId } = req.body;

    const stock_status = 'Available';
    const imagePath = req.file?.key || null;

    const values = [productId, productName, productBrand, productCategory, formFactor, ptype, package_quantity,
      units, price, product_dsc, quantity, min_stock, imagePath, stock_status, userId
    ];

    const sql = `CALL SP_AddProduct(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ? , ?)`;
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error in adding product: ', err);
        return res.status(500).json({ message: 'Error adding product', error: err });
      }
      const responseData = result?.[0]?.[0] ?? null;
      const productRecid = responseData?.id; 

      if (productRecid) {
        const notificationSql = `CALL SP_AfterProductInsert(?, ?, ?, ?)`;
        db.query(notificationSql, [productRecid,productId, productName, userId], (err2, result2) => {
          if (err2) {
            console.error('Error inserting notifications:', err2);
          } else {
            console.log('Notifications inserted:', result2[0][0].affected_rows);
          }
        });
      }

       if (global.io) {
        global.io.emit('productAdded', {
          message: `New Product Added "${productName}" - ${productId}`,
          type: 'Product Add/Edit/Del',
          timestamp: new Date().toISOString()
        });
      }
      return res.status(200).json({ message: 'Product added successfully', data: responseData });
    });

  } catch (error) {
    console.error('Error parsing formDataToSend:', error);
    return res.status(400).json({ message: 'Invalid form data', error: error.message });
  }
};

exports.GetProduct = async (req, res) => {
  const { brand, form_factor, category, status, user_id } = req.body;

  if (!brand) {
    return res.status(400).json({ message: 'Brand is required' });
  }

  const sql = 'CALL SP_GetProductsByBrand(?, ?, ?, ?, ?)';

  db.query(sql, [brand, form_factor, category, status, user_id], async (err, result) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ message: 'Internal server error', error: err });
    }

    const products = result[0];
    try {
      // Build full image URLs
      const enrichedProducts = await Promise.all(
        products.map(async (p) => ({
          ...p,
          imageUrl: p.product_img
            ? await generatePresignedUrl(p.product_img)
            : null,
        }))
      );

      return res.status(200).json(enrichedProducts);
    } catch (e) {
      console.warn('⚠️ Failed to enrich product images:', e.message);
      return res.status(200).json(products);
    }
  });
};



exports.GetProductCount = (req, res) => {
  const sql = 'CALL SP_GetProductBrandCounts()';
  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error executing stored procedure:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }
    const counts = results[0][0];
    return res.json({
      totalCount: counts.total_count,
      vaithyarPoovaCount: counts.vaithyar_poova_count,
      gramiyamCount: counts.gramiyam_count,
    });
  });
};

exports.EditeProduct = (req, res) => {
  const { product_recid } = req.params;
  const { productId, productName, productBrand, productCategory, formFactor, ptype, package_quantity, units,
    price, product_dsc, quantity, min_stock,userId
  } = req.body;


  let product_img = null;
  if (req.file) {
    product_img = req.file.key;
  } else if (req.body.image && !req.body.image.startsWith("http")) {
    product_img = req.body.image;
  }
  const sql = 'CALL SP_EditProduct(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  const values = [product_recid, productId, productName, productBrand, productCategory, formFactor, ptype,
    package_quantity, units, price, product_dsc, quantity, min_stock, product_img
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Edit failed:', err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
    const responseData = result?.[0]?.[0] ?? null;
    const productRecid = responseData?.id; 
      if (productRecid) {
        const notificationSql = `CALL SP_AfterProductEdit(?, ?, ?)`; 
        db.query(notificationSql, [productRecid, productName, userId], (err2, result2) => {
          if (err2) {
            console.error('Error inserting notifications:', err2);
          } else {
            console.log('Notifications inserted:', result2[0][0].affected_rows);
          }
        });
      }

      if (global.io) {
        global.io.emit('productEdited', {
          message: `Product Edited "${productName}"`,
          type: 'Product Add/Edit/Del',
          timestamp: new Date().toISOString()
        });
      }
    res.status(200).json({ message: 'Product updated successfully', data: responseData });
  });
};


exports.DeleteProduct = (req, res) => {
  const { product_recid } = req.params;
    const { productName, userId } = req.body;

  if (!product_recid) {
    return res.status(400).json({ message: 'Product ID (recid) is required in params' });
  }

  const sql = 'CALL SP_DeleteProduct(?)';

  db.query(sql, [product_recid], (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    const responseData = result?.[0]?.[0] ?? null;
    const productRecid = responseData?.id; 
      if (productRecid) {
        const notificationSql = `CALL SP_AfterProductDelete(?, ?, ?)`; 
        db.query(notificationSql, [productRecid, productName, userId], (err2, result2) => {
          if (err2) {
            console.error('Error inserting notifications:', err2);
          } else {
            console.log('Notifications inserted:', result2[0][0].affected_rows);
          }
        });
      }

      if (global.io) {
        global.io.emit('productDeleted', {
          message: `Product  deleted "${productName}"`,
          type: 'Product Add/Edit/Del',
          timestamp: new Date().toISOString()
        });
      }
    return res.status(200).json({ message: 'Product deleted successfully', data: responseData });
  });
};


exports.Exportinventory = (req, res) => {
  const { startDate, endDate } = req.body;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'startDate and endDate are required' });
  }
  const input = JSON.stringify({ startDate, endDate });
  const sql = 'CALL SP_Exportinventory(?)';
  db.query(sql, [input], async (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    const inventory = results[0];
    // Create Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory');

    worksheet.columns = [
      { header: 'Product ID', key: 'product_id', width: 15 },
      { header: 'Product Name', key: 'product_name', width: 30 },
      { header: 'Brand', key: 'brand', width: 20 },
      { header: 'Category', key: 'product_category', width: 20 },
      { header: 'Selling Price', key: 'selling_price', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Status', key: 'stock_status', width: 15 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ];

    worksheet.addRows(inventory);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory_export.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  });
};


exports.ExportinventoryJson = (req, res) => {
  const { startDate, endDate } = req.body;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'startDate and endDate are required' });
  }
  const input = JSON.stringify({ startDate, endDate });
  const sql = 'CALL SP_Exportinventory(?)';
  db.query(sql, [input], async (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    const inventory = results[0] || [];
    if (!inventory.length) {
      return res.status(404).json({ message: 'No data found' });
    }
    return res.status(200).json({ data: inventory });
  });
};

exports.Addstocks = async (req, res) => {
  try {
    const { stock_product_id, stock_quantity, min_stock_qty ,userId } = req.body;
    const stock_status = 'Available';
    const values = [stock_product_id, stock_quantity, min_stock_qty, stock_status,userId];
    const sql = `CALL SP_Addstocks(?, ?, ?, ?, ?)`;

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error in adding Stock: ', err);
        return res.status(500).json({ message: 'Error adding product', error: err });
      }
      const responseData = result?.[0]?.[0] ?? null;
      return res.status(200).json({ message: 'Stock added successfully', data: responseData });
    });
  } catch (error) {
    console.error('Error parsing formDataToSend:', error);
    return res.status(400).json({ message: 'Invalid form data', error: error.message });
  }
};

exports.Getstocks = (req, res) => {
  const { brand , status} = req.body;

  const sql = 'CALL SP_Getstocks(?, ?)';

  db.query(sql, [brand, status], (err, results) => {
    if (err) {
      console.error('Error fetching stock:', err);
      return res.status(500).json({ message: 'Error fetching stock data', error: err });
    }
    const stockData = results[0];
    return res.status(200).json(stockData);
  });
};

exports.Editstockqty = (req, res) => {
  const { stock_recid } = req.params;
  const { stock_quantity } = req.body;

  if (!stock_quantity) {
    return res.status(400).json({ message: "stock_quantity  are required" });
  }

  const sql = 'CALL SP_Editstockqty(?, ?)';
  const values = [stock_recid, stock_quantity];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Edit failed:', err);
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
    const responseData = result?.[0]?.[0] ?? null;
    res.status(200).json({ success: true, message: 'Product updated successfully', data: responseData });
  });
};
