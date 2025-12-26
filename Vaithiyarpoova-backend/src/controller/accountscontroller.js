
const { getPool } = require('../database/db');
const db = getPool();
const { generatePresignedUrl } = require('../utilities/s3Utils');

exports.getgstlistdetails = async (req, res) => {

    const sqlPg = `CALL SP_GetAllGSTData()`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting gst list:', errPg);
                return res.status(500).json({ message: 'Failed to get list' });
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

exports.ongstforpurchase = async (req, res) => {
    const { percentage, gst_number, type } = req.body;

    const sqlPg = `CALL SP_OnGstforPurchase('${gst_number}','${percentage}', '${type}')`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error on gst list:', errPg);
                return res.status(500).json({ message: 'Failed to on gst list' });
            }

            const sqlAccounts = `SELECT user_id FROM users WHERE designation = 'Accounts'`;
            db.query(sqlAccounts, (errAcc, users) => {
                if (!errAcc) {
                    const emoji = type === 'ON' ? '✅' : '🚫';
                    const actionText = type === 'ON' ? 'enabled' : 'disabled';
                    users.forEach(user => {
                        global.io.to(user.user_id.toString()).emit('GSTNotification', {
                            message: `${emoji} Admin has ${actionText} GST (${percentage * 100}%) `,
                            type: 'GST Notification',
                            timestamp: new Date().toISOString()
                        });
                    });
                }
            });

            const sqlNotif = `CALL SP_GstNotificationonof(?, ?)`;
            db.query(sqlNotif, [type, percentage || 0], (errNotif) => {
                if (errNotif) console.error('Error inserting GST notifications:', errNotif);
            });

            res.status(200).json({ data: resultPg[0] });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.savepremiumdata = async (req, res) => {
    const { clientType, selectLevel, premAmount } = req.body;

    const sqlPg = `CALL SP_SavePremiumData('${clientType}','${selectLevel}', '${premAmount}')`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error on premium list:', errPg);
                return res.status(500).json({ message: 'Failed to on premium list' });
            }

            const responseData = resultPg?.[0]?.[0] ?? null;

            return res.status(200).json({
                message: "Premium data saved successfully",
                data: responseData,
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getaccountsdata = async (req, res) => {
    const { startDate, endDate, branch_id,employee_id, usertype_code, user_id } = req.body;

    const sqlPg = `CALL SP_GetAccountsData('${startDate}','${endDate}','${usertype_code}',${user_id})`;
    const sqlSale = `CALL SP_GetSaleRevenueByBranch('${startDate}','${endDate}', ${branch_id}, ${employee_id},'${usertype_code}',${user_id})`;
    const sqlClass = `CALL SP_GetClassRevenueByBranch('${startDate}','${endDate}', ${branch_id},${employee_id},'${usertype_code}',${user_id})`;
    const sqlWall = `CALL SP_GetWalletRevenueByBranch('${startDate}','${endDate}', ${branch_id},${employee_id},'${usertype_code}',${user_id})`;
    const sqlCon = `CALL SP_GetConsultRevenueByBranch('${startDate}','${endDate}', ${branch_id},${employee_id},'${usertype_code}',${user_id})`;
    const sqlBill = `CALL SP_GetBillingRevenueByBranch('${startDate}','${endDate}', ${branch_id},${employee_id},'${usertype_code}',${user_id})`;

    try {
        const runQuery = (sql) => {
            return new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) return reject(new Error(err));
                    resolve(result[0]);
                });
            });
        };

        const [pgData, saleData, classData, walletData, consultData ,BillData] = await Promise.all([
            runQuery(sqlPg),
            runQuery(sqlSale),
            runQuery(sqlClass),
            runQuery(sqlWall),
            runQuery(sqlCon),
            runQuery(sqlBill),
        ]);

        res.status(200).json({
            accountsData: pgData[0] || {},
            saleRevenue: saleData,
            classRevenue: classData,
            walletRevenue: walletData,
            consultRevenue: consultData,
            BillRevenue: BillData
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Failed to fetch accounts data' });
    }
};

exports.getaccountsdatabyemp = async (req, res) => {
    const { user_id } = req.body;

    const sqlSale = `CALL SP_GetSaleRevenueByEmp(${user_id})`;
    const sqlClass = `CALL SP_GetClassRevenueByEmp(${user_id})`;
    const sqlWall = `CALL SP_GetConsultRevenueByEmp(${user_id})`;
    const sqlCon = `CALL SP_GetWalletRevenueByEmp(${user_id})`;
    const sqlBill = `CALL SP_GetBillRevenueByEmp(${user_id})`;

    try {
        const runQuery = (sql) => {
            return new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) return reject(new Error(err));
                    resolve(result[0]);
                });
            });
        };

        const [saleData, classData, walletData, consultData ,BillData] = await Promise.all([
            runQuery(sqlSale),
            runQuery(sqlClass),
            runQuery(sqlWall),
            runQuery(sqlCon),
            runQuery(sqlBill),
        ]);

        res.status(200).json({
            saleData: saleData,
            classData: classData,
            walletData: walletData,
            consultData: consultData,
            BillData: BillData,
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Failed to fetch accounts data' });
    }
};

exports.saveExpenseAmountMonth = async (req, res) => {
    const { billType, amount,  transaction_id, date_time, user_id } = req.body;
    try {
        if (!req.body && !req.file) {
            return res.status(400).json({ message: "Missing request data" });
        }

        const userId = user_id;
        const receiptImagePath = req.file?.key || null;


        // 1️⃣ Get designation for current user
        const branchSql = `SELECT designation FROM users WHERE user_id = ? LIMIT 1`;
        db.query(branchSql, [userId], (branchErr, branchResult) => {
            if (branchErr) {
                console.error("Error fetching designation:", branchErr);
                return res.status(500).json({ message: "Failed to fetch designation" });
            }

            const designation = branchResult?.[0]?.designation || "Unknown";
            const sql = `CALL SP_SaveExpenseAmountMonth(?, ?, ?, ?, ?, ?)`;
            const values = [
                billType,
                amount,
                transaction_id,
                date_time,
                receiptImagePath,
                userId
            ];

            db.query(sql, values, (err, result) => {
                if (err) {
                    if (err.code === "ER_SIGNAL_EXCEPTION" &&err.sqlMessage.includes("Duplicate transaction ID")) {
                        return res.status(400).json({
                            message:"Duplicate Transaction ID. Please use a unique Transaction ID.",
                            });
                    }             
                    console.error("Error saving expense:", err);
                    return res.status(500).json({ message: "Failed to save expense" });
                }

                const responseData = result?.[0]?.[0] ?? null;
                const expense_id = responseData?.id;

                // 3️⃣ Notify DB (for persistence)
                if (expense_id) {
                    const notificationSql = `CALL SP_Afterexpense(?, ?, ?)`;
                    db.query(notificationSql, [expense_id, userId, designation], (err2, result2) => {
                        if (err2) {
                            console.error("Error inserting notifications:", err2);
                        } else {
                            console.log("Notifications inserted:", result2[0][0].affected_rows);
                        }
                    });
                }

                // 4️⃣ Get all Accounts users to broadcast socket message
                const accountsSql = `SELECT user_id FROM users WHERE designation = 'Accounts'`;
                db.query(accountsSql, (accErr, accountsResult) => {
                    if (accErr) {
                        console.error("Error fetching Accounts users:", accErr);
                    } else if (global.io) {
                        accountsResult.forEach(acc => {
                            global.io.to(acc.user_id.toString()).emit("NewExpense", {
                                message: `💰 New expense recorded from ${designation}`,
                                type: "Branch Expense Notification",
                                timestamp: new Date().toISOString()
                            });
                        });
                    }
                });

                return res.status(200).json({
                    message: "Expense saved successfully",
                    data: responseData
                });
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


exports.getExpensesList = async (req, res) => {
    const { startDate, endDate, status ,branch } = req.body;

    try {
        const sql = 'CALL SP_GetExpensesList(?, ?, ?, ?)';

        db.query(sql, [startDate || '', endDate || '', status || '' ,  (branch && branch !== '' && branch !== '0') ? parseInt(branch) : null], async (err, result) => {
            if (err) {
                console.error('Error executing stored procedure:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            try {
                const expensesData = result[0];
                const expenses = await Promise.all(
                    expensesData.map(async (item) => ({
                        ...item,
                        imageUrl: item.receipt_image
                            ? await generatePresignedUrl(item.receipt_image)
                            : null,
                    }))
                );

                res.status(200).json({
                    message: 'Expenses retrieved successfully',
                    data: expenses
                });
            } catch (processingError) {
                console.error('Error processing expenses:', processingError);
                res.status(500).json({ message: 'Server error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateExpenseStatus = async (req, res) => {
    const { expense_id, status, reason } = req.body;

    if (!expense_id || !status || !['pending', 'approved', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid expense ID or status' });
    }

    try {
        let sql, params;

        if (status === 'declined' && reason) {
            // Update status and decline reason
            sql = 'UPDATE expenses SET status = ?, decline_reason = ? WHERE id = ?';
            params = [status, reason, expense_id];
        } else {
            // Update only status
            sql = 'UPDATE expenses SET status = ? WHERE id = ?';
            params = [status, expense_id];
        }

        db.query(sql, params, (err, result) => {
            if (err) {
                console.error('Error updating expense status:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Expense not found' });
            }

            res.status(200).json({
                message: 'Expense status updated successfully'
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLeadDesignationData = async (req, res) => {

    const sqlPg = `CALL SP_getLeadDesignationData()`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting usertype list:', errPg);
                return res.status(500).json({ message: 'Failed to usertype list' });
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

exports.saveTragetAmount = async (req, res) => {

    const {department,code_des, targetAmount} = req.body;
    if (!department || !targetAmount) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sqlPg = `CALL SP_saveTragetAmount(?, ?, ?)`;

    try {
        db.query(sqlPg, [department,code_des, targetAmount], (errPg, resultPg) => {
            if (errPg) {
                console.error('Error saving target list:', errPg);
                return res.status(500).json({ message: 'Failed to saving target list' });
            }

            res.status(200).json({
                message: 'Target saved successfully',
                data: resultPg[0]
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAccountsExpenseData = async (req, res) => {
    const { startDate, endDate, branch_id,employee_id, user_id, usertype_code } = req.body;

    const sqlPg = `CALL SP_GetAccountsExpenseData(${user_id}, '${usertype_code}')`;
    const sqlBrExp = `CALL SP_GetExpenseDataByBranch('${startDate}','${endDate}', ${branch_id},  ${employee_id}, ${user_id}, '${usertype_code}')`;

    try {
        const runQuery = (sql) => {
            return new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) return reject(new Error(err));
                    resolve(result[0]);
                });
            });
        };

        const [pgData, brExpData] = await Promise.all([
            runQuery(sqlPg),
            runQuery(sqlBrExp)
        ]);

        res.status(200).json({
            data: pgData[0] || {},
            brExpData: brExpData
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Failed to fetch accounts data' });
    }
};

exports.getAccountsEXPDataByEmp = async (req, res) => {
    const { user_id } = req.body;

    const sqlPg = `CALL SP_getAccountsEXPDataByEmp(${user_id})`;

    try {
        const runQuery = (sql) => {
            return new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) return reject(new Error(err));
                    resolve(result[0]);
                });
            });
        };

        const [pgData] = await Promise.all([
            runQuery(sqlPg)
        ]);

        res.status(200).json({
            data: pgData
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Failed to fetch accounts data' });
    }
};

exports.getOtherExpAllData = async (req, res) => {
    const { user_id } = req.body;

    const sqlPg = `CALL SP_GetOtherExpAllData(${user_id})`;

    try {
        const runQuery = (sql) => {
            return new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) return reject(new Error(err));
                    resolve(result[0]);
                });
            });
        };

        const [pgData] = await Promise.all([
            runQuery(sqlPg)
        ]);

        res.status(200).json({
            data: pgData
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Failed to fetch others data' });
    }
};

exports.updateGSTData = async (req, res) => {
    const updates = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ message: "No updates provided" });
    }

    try {
        const runQuery = (sql, values) => {
            return new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        };

        // Build a promise array for all updates
        const promises = updates.map((item) => {
            const sql = `UPDATE gst_data SET gst_number = ? , hsn_codes = ? WHERE id = ?`;
            return runQuery(sql, [item.new_value_gst, item.new_value_hsn, item.id]);
        });

        await Promise.all(promises);

        res.status(200).json({
            message: "GST data updated successfully",
            updated: updates.length,
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Failed to update GST data" });
    }
};

exports.softDeleteGstHsn = async (req, res) => {
    const { id } = req.body; 

    const sql = `UPDATE gst_data SET isDeleted = 1 WHERE id = ?`;

    try {
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error("Delete error:", err);
                return res.status(500).json({ message: "Failed to delete" });
            }
            res.status(200).json({ success: true, message: "Deleted successfully" });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Failed to delete" });
    }
};

exports.addGSTHSNValues = async (req, res) => {
    const { gst, hsn } = req.body; 

    const sql = `INSERT INTO gst_data (gst_number, hsn_codes) VALUES (?, ?)`;

    try {
        db.query(sql, [gst, hsn], (err, result) => {
            if (err) {
                console.error("Delete error:", err);
                return res.status(500).json({ message: "Failed to delete" });
            }
            res.status(200).json({ success: true, message: "Deleted successfully" });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Failed to delete" });
    }
};