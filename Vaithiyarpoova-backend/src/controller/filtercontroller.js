const { getPool } = require('../database/db');
const db = getPool();

exports.getAllFilterOption = async (req, res) => {
    const {
        user_id, code
    } = req.body;

    const br_sql = `CALL SP_GetAllBranchData(${user_id}, '${code}')`;
    const cat_sql = `CALL SP_GetAllCategoryData()`;
    const form_sql = `CALL SP_GetAllFormfactData()`;

    try {
        db.query(br_sql, (err, br_result) => {
            if (err) {
                console.error('Error getting data:', err);
                return res.status(500).json({ message: 'Failed to get data list' });
            }

            db.query(cat_sql, (err, cat_result) => {
                if (err) {
                    console.error('Error getting data:', err);
                    return res.status(500).json({ message: 'Failed to get data list' });
                }

                db.query(form_sql, (err, ff_result) => {
                    if (err) {
                        console.error('Error getting data:', err);
                        return res.status(500).json({ message: 'Failed to get data list' });
                    }

                    res.status(200).json({
                        branch: br_result[0],
                        category: cat_result[0],
                        formfactor: ff_result[0]
                    });
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getEmployeeOption = async (req, res) => {
    const { rec_id } = req.body;

    const sql = `CALL SP_GetEmployeeData(${rec_id})`;

    try {
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error getting data:', err);
                return res.status(500).json({ message: 'Failed to get data list' });
            }

            res.status(200).json({
                data: result[0],
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
