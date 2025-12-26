const { getPool } = require('../database/db');
const db = getPool();


exports.insertLeave = async (req, res) => {
  try {
    const { from_date, to_date, leave_type, duration, reason, user_status = 'Pending', created_by, user_id , action } = req.body;
    if (!from_date || !to_date || !leave_type || !duration || !reason || !created_by) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const values = [from_date, to_date, leave_type, duration, reason, user_status, created_by, user_id , action];
    const sql = 'CALL SP_InsertLeaveRequest(?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error insertin’ leave:', err);
        return res.status(500).json({ message: 'Database error while insertin’ leave.' });
      }
     const responseData = result?.[0]?.[0] ?? null;
     const leavepermission = responseData?.id; 
     if (leavepermission) {
        const notificationSql = `CALL SP_AfterLeavensert(?, ?)`;
        db.query(notificationSql, [leavepermission, created_by], (err2, result2) => {
          if (err2) {
            console.error('Error inserting notifications:', err2);
          } else {
            console.log('Notifications inserted:', result2[0][0].affected_rows);
          }
        });
      }

      if (global.io) {
       global.io.to(created_by.toString()).emit('LeaveAdded', {
        message: `New leave request arrived`,
        type: 'Leave Request',
        timestamp: new Date().toISOString()
      });
      }


    return res.status(200).json({ message: 'Leave inserted successfully.', data: responseData});
    });

  } catch (err) {
    console.error('Error insertin’ leave:', err);
    res.status(500).json({ message: 'Server error while insertin’ leave.' });
  }
};


exports.insertPermission = async (req, res) => {
  try {
    const { from_time, to_time, reason, user_status = 'Pending', created_by,user_id , action} = req.body;

    if (!from_time || !to_time || !reason || !created_by) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const sql = 'CALL SP_InsertPermissionRequest(?, ?, ?, ?, ?, ?, ?)';
    const values = [from_time, to_time, reason, user_status, created_by,user_id, action];

    db.query(sql, values, (err, results) => {
      if (err) {
        console.error('Error inserting permission:', err);
        return res.status(500).json({ message: 'Server error while submitting permission.' });
      }

      const responseData = results?.[0]?.[0] ?? null;
      const permissionId = responseData?.id; 
     if (permissionId ) {
        const notificationSql = `CALL SP_AfterPermissionInsert(?, ?)`;
        db.query(notificationSql, [permissionId , created_by], (err2, result2) => {
          if (err2) {
            console.error('Error inserting notifications:', err2);
          } else {
            console.log('Notifications inserted:', result2[0][0].affected_rows);
          }
        });
      }

      if (global.io) {
        global.io.to(created_by.toString()).emit('PermissionAdded', {
        message: `New permission request arrived`,
        type: 'Permission Request',
        timestamp: new Date().toISOString()
      });
    }

      return res.status(200).json({
        message: 'Permission request submitted successfully.',
        data: responseData
      });
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Unexpected server error.' });
  }
};


exports.getstatus = async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      return res.status(400).json({ message: 'user_id is required.' });
    }
    const sql = 'CALL SP_GetUserPermissionStatus(?)';
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user status:', err);
        return res.status(500).json({ message: 'Server error while fetching status.' });
      }
      return res.status(200).json({
        message: 'User permission status fetched successfully.',
        data: results?.[0]
      });
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Unexpected server error.' });
  }
};

exports.getCollectionData = async (req, res) => {
  const { userId , isBtnClicked, startDate, endDate } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ message: 'user_id is required.' });
    }

    const sql = 'CALL SP_GetAllCollection(? , ?, ?, ?)';
    db.query(sql, [userId, isBtnClicked, startDate, endDate], (err, results) => {
      if (err) {
        console.error('Error fetching user status:', err);
        return res.status(500).json({ message: 'Server error while fetching status.' });
      }
      return res.status(200).json({
        message: 'User permission status fetched successfully.',
        data: results?.[0]
      });
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Unexpected server error.' });
  }
};
