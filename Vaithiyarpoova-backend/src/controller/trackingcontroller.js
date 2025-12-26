const { getPool } = require('../database/db');
const db = getPool();

exports.gettrackingdata = async (req, res) => {
    const {  startDate , endDate , status , user_typecode, user_id,mobile_number = '' } = req.body;

    const sql = `CALL SP_GetTrackingData('${startDate}', '${endDate}', '${status}', '${user_typecode}' , ${user_id} ,'${mobile_number}')`;
    
    try {
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error getting user activity:', err);
                return res.status(500).json({ message: 'Failed to get user activity list' });
            }
            res.status(200).json({ data: result[0] });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
