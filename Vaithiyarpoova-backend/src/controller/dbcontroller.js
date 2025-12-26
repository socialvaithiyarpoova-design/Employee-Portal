
const { getPool } = require('../database/db');
const db = getPool();


exports.getdbdataut = async (req, res) => {
    const { user_typecode , user_id } = req.body;

    const sqlPg = `CALL SP_GetAllDBData('${user_typecode}', ${user_id})`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting db list:', errPg);
                return res.status(500).json({ message: 'Failed to get db list' });
            }

            res.status(200).json({
                data: resultPg?.[0]?.[0] ?? []
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};