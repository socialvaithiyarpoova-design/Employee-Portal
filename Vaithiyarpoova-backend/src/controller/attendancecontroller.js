const { getPool } = require('../database/db');
const db = getPool();

exports.getUAttendanceData = async (req, res) => {
    const { user_typecode, startDate , endDate , status , branch_id , id} = req.body;

    const sql = `CALL SP_GetAttendanceData('${user_typecode}', '${startDate}', '${endDate}', '${status}', ${branch_id}, ${id})`;

    try {
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error getting attendance:', err);
                return res.status(500).json({ message: 'Failed to get attendance list' });
            }
            res.status(200).json({ data: result[0] });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserActivity = async (req, res) => {
    const { user_typecode, startDate, endDate, status, id, type, branch_id } = req.body;

    // Validate required parameters
    if (!user_typecode || !id) {
        return res.status(400).json({ message: 'user_typecode and id are required' });
    }

    // Use parameterized query to prevent SQL injection
    const sql = `CALL SP_GetUserActivity(?, ?, ?, ?, ?, ?, ?)`;
    
    try {
        db.query(
            sql,
            [
                user_typecode,
                startDate || null,      // Convert empty string to null
                endDate || null,        // Convert empty string to null
                status || null,
                id,
                type || null,
                branch_id || null       // Handle undefined/empty branch_id
            ],
            (err, result) => {
                if (err) {
                    console.error('Error getting user activity:', err);
                    return res.status(500).json({ message: 'Failed to get user activity list' });
                }
                res.status(200).json({ data: result[0] });
            }
        );
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.sendApprovalStatus = async (req, res) => {
  const { status, id } = req.body;
  if (!status || !id) {
    return res.status(400).json({ message: 'Status and ID are required' });
  }
  const updateSql = `UPDATE user_activity SET user_status = ? WHERE lp_recid = ?`;
  try {
    db.query(updateSql, [status, id], (err, result) => {
   
      const spSql = `CALL SP_Afterapporove(?, ?)`;
      db.query(spSql, [status, id], (spErr, spResult) => {
        if (spErr) {
          console.error('SP_Afterapporove error:', spErr);
        } else {
          console.log('SP_Afterapporove done:', spResult?.[0]?.[0]);
        }
      });

      // Fetch user_id to emit socket
      const userSql = `SELECT user_id, action FROM user_activity WHERE lp_recid = ?`;
      db.query(userSql, [id], (err, userResult) => {
        if (err) {
            console.error('Failed to get user_id:', err);
        } else if (userResult?.length) {
            const user_id = userResult[0].user_id;
            const action = userResult[0].action;

            global.io.to(user_id.toString()).emit('Approved', {
            message: `Your ${action} request has been ${status.toLowerCase()}`,
            type: 'Leave and Permission Application',
            timestamp: new Date().toISOString()
            });
        }
        });


      return res.status(200).json({
        message: 'User status updated',
        data: {
          table_name: 'user_activity',
          method: 'UPDATE',
          id,
          id_column_name: 'lp_recid'
        }
      });
    });
  } catch (error) {
    console.error('Unhandled error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
