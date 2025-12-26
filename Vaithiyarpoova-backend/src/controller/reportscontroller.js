const { getPool } = require('../database/db');
const db = getPool();

// Get reports data by combining sales and fieldshopsales tables
exports.getReportsData = async (req, res) => {
    const { startDate, endDate, status , user_id} = req.body;
    
    try {
        const sqlQuery = `CALL SP_GetReportsData(?, ?, ?, ?)`;
        
        db.query(sqlQuery, [startDate || '', endDate || '', status || 'sales', user_id], (err, result) => {
            if (err) {
                console.error('Error executing stored procedure:', err);
                return res.status(500).json({ 
                    message: 'Error fetching reports data',
                    error: err.message 
                });
            }
            
            // The result from stored procedure comes in result[0]
            const reportsData = result[0] || [];
            
            res.status(200).json({
                success: true,
                data: reportsData,
                message: 'Reports data fetched successfully'
            });
        });
        
    } catch (error) {
        console.error('Error in getReportsData:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};
