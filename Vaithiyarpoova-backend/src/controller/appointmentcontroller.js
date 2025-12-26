
const { getPool } = require('../database/db');
const db = getPool();


exports.getappointmentdata = async (req, res) => {
    const { user_id } = req.body;

    const sqlPg = `CALL SP_GetClassDataByApp(${user_id})`;
    const sqlConsult = `CALL SP_GetConsultDataByApp(${user_id})`;
    const cgSql = `CALL SP_GetAllcatagories()`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting appointment list:', errPg);
                return res.status(500).json({ message: 'Failed to appointment list' });
            }

            db.query(sqlConsult, (errPg, resultCn) => {
                if (errPg) {
                    console.error('Error getting appointment list:', errPg);
                    return res.status(500).json({ message: 'Failed to appointment list' });
                }

                db.query(cgSql, (errPg, resultCat) => {
                    if (errPg) {
                        console.error('Error getting appointment list:', errPg);
                        return res.status(500).json({ message: 'Failed to appointment list' });
                    }

                    res.status(200).json({
                        data: resultPg[0],
                        ConsultData: resultCn[0],
                        resultCat: resultCat[0]
                    });
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.slotBookingDetails = async (req, res) => {
    const {client_id,created_by,  user_id, user_typecode, date, time, interval, action , id } = req.body;

    if (!user_id || !user_typecode || !date || !time || !interval || !action) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `CALL SP_saveBookingDatas(?, ?, ?, ?, ?, ?, ?)`;


    try {
        db.query(sql, [user_id, user_typecode, date, time, interval, action, id], (err, result) => {
            if (err) {
                console.error("Error saving appointment:", err);
                return res.status(500).json({ message: "Failed to save appointment" });
            }


            if (action.toLowerCase() === 'reschedule') {
                const notificationSql = `CALL SP_Afterreschedule(?, ?, ?, ?)`;
                db.query(notificationSql, [created_by, client_id, date, time], (err2, result2) => {
                    if (err2) {
                        console.error('Error inserting notifications:', err2);
                    } else {
                        console.log('Notifications inserted:', result2[0][0].affected_rows);
                    }
                });

                if (global.io) {
                    global.io.to(created_by.toString()).emit('reschedule', {
                        message: `📅 Appointment got Re-scheduled for "${client_id}" - ${date} at ${time}`,
                        type: 'Reschedule from Doctor aka Vaithiyar',
                        timestamp: new Date().toISOString()
                    });
                }
            }


            res.status(200).json({ message: "Appointment saved successfully",data: result[0]});
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getReservedData = async (req, res) => {
    const { user_id} = req.body;

    if (!user_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `CALL SP_GetReservedData(${user_id})`;

    try {
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Error getting appointment:", err);
                return res.status(500).json({ message: "Failed to get appointment" });
            }

            res.status(200).json({
                message: "Appointment get successfully",
                data: result[0]
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.delBookingDetails = async (req, res) => {
    const {
        id
    } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `UPDATE appointments_list SET isDeleted = 1 WHERE appointment_id = ${id} `;

    try {
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Error deleting appointment:", err);
                return res.status(500).json({ message: "Failed to delete appointment " });
            }

            res.status(200).json({
                message: "Appointment saved successfully",
                data: result[0]
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.addComment = async (req, res) => {
  try {
    const { id, comment } = req.body;

    if (!id || !comment) {
      return res.status(400).json({
        message: "id and comment are required",
      });
    }

    const sql = `
      UPDATE consulting_appointments
      SET comments = ?, comment_submmited = 1
      WHERE id = ?
    `;

    const [result] = await db.promise().query(sql, [comment, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Lead not found or no changes made",
      });
    }

    return res.status(200).json({
      message: "Comment updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};