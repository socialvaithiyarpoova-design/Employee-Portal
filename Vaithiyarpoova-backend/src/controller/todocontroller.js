
const { getPool } = require('../database/db');
const db = getPool();


exports.todolist = async (req, res) => {
    const { userId, isBtnClicked, user_typecode, disposition } = req.body;
    const sqlPg = `CALL SP_GetAllTodoList(${userId}, '${isBtnClicked}', '${user_typecode}', '${disposition}')`;
    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting todo list:', errPg);
                return res.status(500).json({ message: 'Failed to get todo list' });
            }
            res.status(200).json({
                leads: resultPg[0]
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateLeads = async (req, res) => {
    const { disposition, date , lead_id , comment, userId, user_typecode } = req.body;

    const sqlPg = `CALL SP_UpdateLeads(${userId}, '${disposition}', '${date}', ${lead_id}, '${comment}', '${user_typecode}')`;
    
    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting todo list:', errPg);
                return res.status(500).json({ message: 'Failed to get todo list' });
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

exports.getCommentsHistory = async (req, res) => {
    const { lead_recid , code} = req.body;

    const sqlPg = `CALL SP_GetCommentHistory(${lead_recid}, '${code}')`;
    
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

