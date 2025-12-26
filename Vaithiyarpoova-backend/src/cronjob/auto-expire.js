const { getPool } = require('../database/db');

// Function that performs the expiry check
const expireUserActivityJob = async () => {
    const db = getPool();
    
    const sql = `
        UPDATE user_activity 
        SET user_status = 'Expired', updated_at = NOW()
        WHERE user_status IN ('Pending')
        AND (
            (action = 'Leave' AND DATE(to_date) < CURDATE())
            OR
            (action = 'Leave' AND DATE(to_date) = CURDATE() AND TIME(to_time) < CURTIME())
            OR
            (action = 'Permission' AND DATE(to_date) < CURDATE())
            OR
            (action = 'Permission' AND DATE(to_date) = CURDATE() AND TIME(to_time) < CURTIME())
        )
    `;

    try {
        db.query(sql, (err, result) => {
            if (err) {
                console.error('❌ Error updating expired activities:', err.message);
                return;
            }
            
            if (result.affectedRows > 0) {
                console.log(`✅ Updated ${result.affectedRows} activities to Expired status`);
            } else {
                console.log('✅ No expired activities to update');
            }
        });
    } catch (error) {
        console.error('❌ Cron job error:', error.message);
    }
};

// Export the function (not the cron schedule)
module.exports = expireUserActivityJob;