const { getPool } = require('../database/db');
const db = getPool();
const { generatePresignedUrl } = require('../utilities/s3Utils');


exports.getCrteditsData = async (req, res) => {
    const { startDate, endDate , branch_id, employee_id} = req.body;

    const sqlPg = `CALL getCrteditsData('${startDate}','${endDate}', ${branch_id}, ${employee_id} )`;

    try {
        db.query(sqlPg, async (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting service:', errPg);
                return res.status(500).json({ message: 'Failed to get service' });
            }

            const final_res = resultPg[0];

            const enrichedRes = await Promise.all(
              final_res.map(async (p) => ({
                ...p,
                image_url: p.receipt_image_url
                  ? await generatePresignedUrl(p.receipt_image_url)
                  : null,
              }))
            );

            res.status(200).json({ data: enrichedRes });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.putStatusForCredits = async (req, res) => {
  const { status, order_id } = req.body;

  const sqlPg = `CALL SP_PutStatusForCredits(?, ?)`;

  try {
    db.query(sqlPg, [status, order_id], async (errPg, resultPg) => {
      if (errPg) {
        console.error("Error updating order status:", errPg);
        return res.status(500).json({ message: "Failed to update status", error: errPg });
      }
      const responseData = resultPg?.[0]?.[0] ?? null;
      res.status(200).json({
        message: "Status updated successfully",
        data: responseData
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateCreditsData = async (req, res) => {
  const { order_recid, paid_status, status } = req.body;

  const sqlPg = `CALL SP_UpdateCreditsData(${order_recid}, '${paid_status}' , '${status}')`;
console.log(sqlPg);

  try {
    db.query(sqlPg, [order_recid, paid_status , status], async (errPg, resultPg) => {
      if (errPg) {
        console.error("Error updating order status:", errPg);
        return res.status(500).json({ message: "Failed to update status", error: errPg });
      }
      const responseData = resultPg?.[0]?.[0] ?? null;
      res.status(200).json({
        message: "Status updated successfully",
        data: responseData
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};