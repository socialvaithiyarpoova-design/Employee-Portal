
const { getPool } = require('../database/db');
const db = getPool();

exports.getclientdata = async (req, res) => {
    const { user_typecode, startDate, endDate, branch_id, emp_id, premium_id, user_id , category, country, state, district } = req.body;
    const city = district;
    const sqlPg = `CALL SP_GetAllClientData('${user_typecode}', '${startDate}','${endDate}', ${branch_id}, ${emp_id}, '${premium_id}', ${user_id}, '${category}', '${ country || ''}', '${state || ''}', '${city || ''}')`;
    const sqlShopPg = `CALL SP_GetAllClientShopData('${user_typecode}', '${startDate}','${endDate}', ${branch_id}, ${emp_id}, '${premium_id}', ${user_id}, '${category}', '${ country || ''}', '${state || ''}', '${city || ''}')`;
    
    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error on client list:', errPg);
                return res.status(500).json({ message: 'Failed to on client list' });
            }

            db.query(sqlShopPg, (errPg, resultShop) => {
                if (errPg) {
                    console.error('Error on client list:', errPg);
                    return res.status(500).json({ message: 'Failed to on client list' });
                }

                res.status(200).json({
                    data: resultPg[0],
                    shopData: resultShop[0]
                });

            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getViewWalletHis = async (req, res) => {
    const { lead_recid , type } = req.body;

    const sqlPg = `CALL SP_GetWalletSaleHistory('${lead_recid}', '${type}')`;
    
    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting data list:', errPg);
                return res.status(500).json({ message: 'Failed to get data list' });
            }

            res.status(200).json({
                data: resultPg[0]
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
