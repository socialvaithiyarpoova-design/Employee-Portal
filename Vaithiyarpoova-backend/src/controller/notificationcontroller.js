const { getPool } = require('../database/db');
const db = getPool();

exports.markNotificationAsRead = (req, res) => {
  const { userId} = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'Notification ID is required' });
  }

  const user_id = userId;
    const sql = `
    UPDATE notifications
    SET readms = 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
    `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error('Error marking notification as read:', err);
      return res.status(500).json({ message: 'Failed to mark notification as read', error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json({
      message: 'Notification marked as read successfully',
      data: { affected_rows: result.affectedRows }
    });
  });
};


exports.getnotification = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
const user_id = userId;
  const sql = `
    SELECT 
      notification_id,
      user_id,
      notification_type_id,
      content AS message,
      source_id,
      source_type,
      readms AS \`read\`,
      created_at,
      updated_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).json({ message: 'Failed to fetch notifications', error: err });
    }

    return res.status(200).json({
      message: 'Notifications fetched successfully',
      data: result
    });
  });
};
