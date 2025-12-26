const { getPool } = require('../database/db');
const db = getPool();
const { generatePresignedUrl } = require('../utilities/s3Utils');

exports.getallcat = async (req, res) => {
    const cgSql = `CALL SP_GetAllcatagories()`;

    try {

        db.query(cgSql, (errCg, resultCg) => {
            if (errCg) {
                console.error('Error getting categories:', errCg);
                return res.status(500).json({ message: 'Failed to get categories' });
            }

            res.status(200).json({
                categories: resultCg[0]
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.getallproductsbilling = async (req, res) => {
    const { type,user_id } = req.body;

    const sqlPg = `CALL SP_GetAllProductBilling("${type}", ${user_id})`;
    try {
    db.query(sqlPg, async (errPg, resultPg) => {
      if (errPg) {
        console.error('Error getting leads:', errPg);
        return res.status(500).json({ message: 'Failed to get leads' });
      }
      const products = resultPg[0];

      try {
         const enrichedProducts = await Promise.all(
        products.map(async (p) => ({
          ...p,
          imageUrl: p.product_img
            ? await generatePresignedUrl(p.product_img)
            : null,
        }))
      );

        res.status(200).json({ data: enrichedProducts });
      } catch (e) {
        console.warn('⚠️ Failed to generate presigned URLs for some products:', e.message);
        res.status(200).json({ data: products }); 
      }
    });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.insertBillingOrder = async (req, res) => {
    const data = req.body;
    const {
        lead_name, age, gender, mobile, email, order_value, discount, approved_by, payment_mode,total_value,gst_amount, amount_to_pay,
        transaction_id, catagory, quantity, created_by,  products,gst_id
    } = data;
    const imagePath = req.file?.key || null;

    const sql = `CALL SP_InsertBillingOrder(
            '${lead_name}', ${age}, '${gender}',
            ${mobile}, '${email}',${order_value}, ${discount || 0}, '${approved_by}', '${payment_mode}', 
             ${total_value},${gst_amount}, ${amount_to_pay}, 
            '${transaction_id}', '${catagory}', ${quantity}, ${created_by}, '${products}',${gst_id}, '${imagePath}'
        )
    `;

    try {
       db.query(sql, (err, result) => {
            if (err) {
                if (
                err.code === "ER_SIGNAL_EXCEPTION" &&
                  err.sqlMessage.includes("Duplicate transaction ID")
                ) {
                  return res.status(400).json({
                    message:
                      "Duplicate Transaction ID. Please use a unique Transaction ID.",
                  });
                }
                console.error('Error inserting billing order:', err);
                return res.status(500).json({ 
                    message: err.sqlMessage || 'Failed to insert billing order' 
                });
            }

            return res.status(200).json({ message: 'Billing order inserted successfully' });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getBilling = async (req, res) => {
    const {user_id } = req.body;
    const cgSql = `SELECT 
                    billing_recid,
                    order_id,
                    lead_name,
                    mobile,
                    amount_to_pay,
                    created_at,
                    created_by
                FROM billing 
                WHERE created_by = ? 
                ORDER BY created_at DESC`;
    try {
        db.query(cgSql,[user_id], (errCg, resultCg) => {
            if (errCg) {
                console.error('Error getting billing:', errCg);
                return res.status(500).json({ message: 'Failed to get billing' });
            }
             res.status(200).json({ billing: resultCg });
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getBillingDetails = async (req, res) => {
    const { billing_recid } = req.body;
    
    const sql = `SELECT * FROM billing WHERE billing_recid = ?`;
    
    db.query(sql, [billing_recid], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                message: 'Failed to get billing details'
            });
        }
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Billing record not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: result[0]
        });
    });
};