const { getPool } = require('../database/db');
const db = getPool();


exports.getallcreatives = async (req, res) => {    
    const { filterData = {}, user_id, user_typecode } = req.body || {};
    const userId = user_id;
    const userType = user_typecode; 
    
    // Handle filterData properly
    const isObject = filterData && typeof filterData === 'object' && !Array.isArray(filterData);
    const status = isObject ? (filterData.status || null) : null;
    const startDateStr = isObject ? (filterData.startDate || null) : null;
    const endDateStr = isObject ? (filterData.endDate || null) : null;
    const branch_id = isObject ? (filterData.branch_id || null) : null;
    const employee_id = isObject ? (filterData.employee_id || null) : null;
    const type = isObject ? (filterData.type2 || null) : null;
    
    const sql = 'CALL SP_GetAllCreativesDetails(?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [
        status,
        startDateStr,  
        endDateStr,    
        (employee_id && parseInt(employee_id) > 0) ? parseInt(employee_id) : null,  
        (branch_id && parseInt(branch_id) > 0) ? parseInt(branch_id) : null, 
        type,
        userId,
        userType
    ];

    try {
        db.query(sql, params, (errPg, resultPg) => {
            if (errPg) {
                console.error('Database Error:', errPg.message);
                console.error('Error Code:', errPg.code);
                console.error('SQL:', sql);
                console.error('Params:', params);
                return res.status(500).json({ 
                    message: 'Failed to get creatives',
                    error: errPg.message 
                });
            }
           
            const rows = resultPg?.[0] || [];

            return res.status(200).json({ 
                data: rows,
                count: rows.length 
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.savecreativeservice = async (req, res) => {
    const { empID, title, type, description, dateToPost } = req.body.data;
    const sqlPg = `CALL SP_SaveCreativeServices('${empID}', '${title}', '${type}', '${description}', '${dateToPost}')`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error saving service:', errPg);
                return res.status(500).json({ message: 'Failed to save service' });
            }

            const responseData = resultPg?.[0]?.[0] ?? null;
            const creative_id = responseData?.id; 
               
            if (creative_id) {
                const sqlUser = `SELECT user_id FROM users WHERE emp_id = ?`;
                db.query(sqlUser, [empID], (errUser, users) => {
                    if (errUser) {
                        console.error('Error fetching user_id:', errUser);
                        return;
                    }
                    if (users.length > 0) {
                        const userId = users[0].user_id;                        
                        const notificationSql = `CALL SP_AftercreativeInsert(?, ?, ?)`;
                        db.query(notificationSql, [creative_id, userId,title], (err2, result2) => {
                            if (err2) {
                                console.error('Error inserting notifications:', err2);
                            } else {
                                console.log('Notifications inserted:', result2[0][0].affected_rows);
                            }
                        });

                        if (global.io) {
                            global.io.to(userId.toString()).emit('creativeadd', {
                                message: `New Work Assign "${title}"`,
                                type: 'New Work Assign',
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                });
            }

            res.status(200).json({
                message: "Creative service saved successfully",
                data: responseData
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.updateCreativeStatus = async (req, res) => {
    const { id, idKey, status } = req.body || {};

    console.log(`Received updateCreativeStatus request: id=${id}, idKey=${idKey}, status=${status}`);
    if (!id || !status) {
        return res.status(400).json({ message: 'id and status are required' });
    }

    const tryUpdate = (query, params) => new Promise((resolve) => {
        db.query(query, params, (errPg, result) => {
            if (errPg) {
                console.error('Error updating status:', errPg);
                return resolve({ ok: false, affected: 0, error: errPg });
            }
            resolve({ ok: true, affected: result.affectedRows || 0 });
        });
    });

    try {
        const getRow = () => new Promise((resolve) => {
            const where = idKey && ['cs_recid','id','creative_id','cs_id'].includes(idKey)
                ? `${idKey} = ?`
                : 'cs_recid = ? OR id = ? OR creative_id = ? OR cs_id = ?';

            const params = idKey ? [id] : [id, id, id, id];

            db.query(`SELECT status, progress_start, progress_seconds 
                      FROM creativeservice WHERE ${where} LIMIT 1`, params, 
            (errPg, rows) => {
                if (errPg) return resolve(null);
                resolve(rows?.[0] ?? null);
            });
        });

        const row = await getRow();
        if (!row) {
            return res.status(404).json({ message: "Record not found" });
        }

        const next = status;

        let timerQuery = null;
        let timerParams = [];

        const isRunning = row.progress_start !== null;

        // Start / Continue timer
        if (next === "in progress") {
            if (!isRunning) {
                timerQuery = `
                    UPDATE creativeservice
                    SET progress_start = NOW()
                    WHERE ${idKey || "creative_id"} = ?
                `;
                timerParams = [id];
            }
        }

        // STOP TIMER (Hold / Completed / Uploaded)
        if (["hold", "completed", "uploaded"].includes(next)) {
            if (isRunning) {
                timerQuery = `
                    UPDATE creativeservice
                    SET 
                        progress_seconds = progress_seconds + TIMESTAMPDIFF(SECOND, progress_start, NOW()),
                        progress_start = NULL
                    WHERE ${idKey || "creative_id"} = ?
                `;
                timerParams = [id];
            }
        }
        // Correction → CONTINUE ONLY (no start/stop)
        if (next === "correction") {
           if (!isRunning) {
                timerQuery = `
                    UPDATE creativeservice
                    SET progress_start = NOW()
                    WHERE ${idKey || "creative_id"} = ?
                `;
                timerParams = [id];
            }
        }

        if (timerQuery) {
            await tryUpdate(timerQuery, timerParams);
        }

        // ------------------------------
        //   UPDATE STATUS
        // ------------------------------
        let outcome;
        if (idKey && ['cs_recid','id','creative_id','cs_id'].includes(idKey)) {
            outcome = await tryUpdate(`UPDATE creativeservice SET status = ? WHERE ${idKey} = ?`, [status, id]);
        } else {
            // auto-detect id column
            const keys = ["cs_recid", "id", "creative_id", "cs_id"];
            for (const key of keys) {
                outcome = await tryUpdate(`UPDATE creativeservice SET status = ? WHERE ${key} = ?`, [status, id]);
                if (outcome.affected > 0) break;
            }
        }

        if (outcome.affected === 0) {
            return res.status(404).json({ message: `Record not found for ID ${id}` });
        }

        return res.status(200).json({ message: 'Status updated successfully' });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getEmployeeListForCS = async (req, res) => {

    const { user_id, user_typecode } = req.body;
    const sql = `CALL SP_GetEmployeeListForCS(? , ?)`;

    try {

        db.query(sql, [user_id, user_typecode],(errCg, result) => {
            if (errCg) {
                console.error('Error saving data:', errCg);
                return res.status(500).json({ message: 'Failed to saving data' });
            }

            res.status(200).json({
                data: result[0]
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getcreativesbyemp = async (req, res) => {    
    const {user_id } = req.body || {};

    const sql = 'CALL SP_GetCreativesDetails(?)';

    try {
        db.query(sql, [user_id], (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting service:', errPg);
                return res.status(500).json({ message: 'Failed to get service' });
            }
            const rows = resultPg?.[0] || [];
            return res.status(200).json({ data: rows });
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCreativeService = async (req, res) => {
    const data = req.body?.data || {};
    const { creative_id } = data;

    if (!creative_id) {
        return res.status(400).json({ message: "creative_id is required" });
    }

    const fields = [];
    const params = [];

    if (data.empID) {
        fields.push("emp_id = ?");
        params.push(data.empID);
    }

    if (data.title) {
        fields.push("title = ?");
        params.push(data.title);
    }

    if (data.type) {
        fields.push("type = ?");
        params.push(data.type);
    }

    if (data.description) {
        fields.push("description = ?");
        params.push(data.description);
    }

    if (data.dateToPost) {
        fields.push("date_to_post = ?");
        params.push(data.dateToPost);
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
    }

    const sql = `
        UPDATE creativeservice
        SET ${fields.join(", ")}
        WHERE creative_id = ?
    `;

    params.push(creative_id);

    try {
        db.query(sql, params, (errPg, resultPg) => {
            if (errPg) {
                console.error("Error updating creative service:", errPg);
                return res.status(500).json({ message: "Failed to update creative service" });
            }

            if (resultPg.affectedRows === 0) {
                return res.status(404).json({ message: "Creative service not found" });
            }

            return res.status(200).json({ message: "Updated successfully" });
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.deleteCreative = async (req, res) => {
    const { creativeId } = req.params;
    console.log(creativeId)

    if (!creativeId) {
        return res.status(400).json({ message: "Creative ID is required" });
    }

    const sql = `
        DELETE FROM creativeservice 
        WHERE creative_id = ?
    `;

    db.query(sql, [creativeId], (err, result) => {
        if (err) {
            console.error("Delete error:", err);
            return res.status(500).json({ message: "Failed to delete" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Creative not found" });
        }

        return res.status(200).json({ message: "Creative deleted successfully" });
    });
}

