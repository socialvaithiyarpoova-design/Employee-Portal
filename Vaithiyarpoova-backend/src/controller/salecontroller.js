const { getPool } = require('../database/db');
const db = getPool();
const util = require("util");
const dbQuery = util.promisify(db.query).bind(db);

exports.getallsales = async (req, res) => {

    const sqlPg = `CALL SP_GetAllSaleDetails()`;
    const cgSql = `CALL SP_GetAllcatagories()`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting leads:', errPg);
                return res.status(500).json({ message: 'Failed to get leads' });
            }

            db.query(cgSql, (errCg, resultCg) => {
                if (errCg) {
                    console.error('Error getting categories:', errCg);
                    return res.status(500).json({ message: 'Failed to get categories' });
                }

                res.status(200).json({
                    leads: resultPg[0],                  
                    categories: resultCg[0]
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.insertSalesOrder = async (req, res) => {
    const data = req.body;
    const {
        leads_id, direct_pickup, additional_number,
        address, district, state, country,pincode, courier,catagory,
        order_value, discount, approved_by, 
        wallet,courier_amount,gst_amount , total_value, amount_to_pay, payment_type,
        transaction_id, date_time, catagory_id, quantity, user_id, rec_id, stick_type, products,gst_id,dispatch_id
    } = data;

    const imagePath = req.file?.key || null;

    const sql = `
        CALL SP_InsertSalesOrderForFS(
            '${leads_id}', ${direct_pickup}, '${additional_number}',
            '${address}', '${district}', '${state}','${country}','${pincode}', '${courier}','${catagory}',
            ${order_value}, ${discount || 0}, '${approved_by}',
            ${wallet || 0}, ${courier_amount}, ${gst_amount}, ${total_value}, ${amount_to_pay}, '${payment_type}',
            '${imagePath}', '${transaction_id}',  '${date_time}', ${user_id}, '${catagory_id}', ${quantity}, '${rec_id}', '${stick_type}', '${products}',${gst_id} , ${dispatch_id}
        )
    `;

    try {
        db.query(sql, (err, result) => {
           if (err.code === "ER_SIGNAL_EXCEPTION" &&err.sqlMessage.includes("Duplicate transaction ID")) {
                 return res.status(400).json({
                     message:"Duplicate Transaction ID. Please use a unique Transaction ID.",
                     });
                 }

            return res.status(200).json({ message: 'Sales order inserted successfully' });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLatestOrderId = async (req, res) => {
    const sql = "SELECT order_id FROM fieldshopsales ORDER BY order_recid DESC LIMIT 1";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching last order_id:", err);
            return res.status(500).json({ message: "Failed to get latest order ID" });
        }

        let nextOrderId = "VPSO001";
        if (result.length > 0 && result[0].order_id) {
            const lastId = parseInt(result[0].order_id.replace("VPSO", "")) || 0;
            nextOrderId = "VPSO" + String(lastId + 1).padStart(3, "0");
        }

        res.status(200).json({ nextOrderId });
    });
};

exports.getleadshistorydetails = async (req, res) => {
    const { lead_id , id} = req.body;
    
    const lead = id;

    try {        
        const [sales] = await Promise.all([
            dbQuery(`CALL SP_GetLeadHistorySalesByFS("${lead}")`)
        ]);

        const response = {
            "Purchase history": sales?.[0] || []
        };

        return res.status(200).json({
            message: "Lead history fetched successfully",
            data: response
        });
    } catch (error) {
        console.error("Error fetching lead history:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.updateDisposition = async (req, res) => {
    const { key, id , followup_date } = req.body;

    const sqlPg = `CALL SP_UpdateDispositionByFS('${key}', ${id} , '${followup_date}')`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting leads:', errPg);
                return res.status(500).json({ message: 'Failed to get leads' });
            }
            res.status(200).json({
                data: resultPg[0]
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.createShopProfileByFS = async (req, res) => {
  try {
    const {flead_name, shop_keeper,shop_type,mobile_number,alternate_number,email,gst,created_by,country,state,city,location} = req.body;

    const image_sales = req.file?.key || null;

    const [result] = await db.promise().query(
      `CALL sp_add_fieldlead(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?)`,
      [flead_name,shop_keeper,shop_type,mobile_number,alternate_number,email,gst,image_sales,created_by,country,state,city,location]
    );

    return res.status(201).json({
      success: true,
      message: 'Lead added successfully',
      data: result[0]

    });

  } catch (error) {
    console.error('Error adding lead:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error while adding lead',
      error: error.message
    });
  }
};

exports.updateCollection = async (req, res) => {
    const data = req.body;

    const {
        order_recid,
        payment_type,
        amount,
        transaction_id,
        dateTime,
        payment_mode,
        collection_date
    } = data;

    const imagePath = req.file?.key || null;  
    const sql = `CALL SP_UpdateCollection(?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        order_recid,
        payment_type,
        amount,
        transaction_id,
        dateTime,
        payment_mode,
        imagePath,
        collection_date
    ];

    try {
        db.query(sql, params, (err, result) => {
            if (err) {
                if (err.code === "ER_SIGNAL_EXCEPTION" &&err.sqlMessage.includes("Duplicate transaction ID")) {
                 return res.status(400).json({
                     message:"Duplicate Transaction ID. Please use a unique Transaction ID.",
                     });
                 }               
                console.error("Error executing SP_UpdateCollection:", err);
                return res.status(500).json({ 
                    message: "Failed to update collection",
                    error: err 
                });
            }

            return res.status(200).json({ 
                message: "Collection updated successfully" 
            });
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
