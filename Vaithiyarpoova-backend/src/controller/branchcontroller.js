const { getPool } = require('../database/db');
const db = getPool();

exports.getLocationDetails = async (req, res) => {

    const sql = `CALL SP_GetCountryDetails()`;

    try {
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error getting branch:', err);
                return res.status(500).json({ message: 'Failed to get branch list' });
            }
            res.status(200).json({ data: result[0] });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStateByCoutry = async (req, res) => {
    const { country_id } = req.body;

    const sql = `CALL SP_GetStateByCoutry('${country_id}')`;

    try {
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error getting branch:', err);
                return res.status(500).json({ message: 'Failed to get branch list' });
            }
            res.status(200).json({ data: result[0] });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCityByState = async (req, res) => {
    const { state_id } = req.body;

    const sql = `CALL SP_GetCityByState('${state_id}')`;

    try {
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error getting branch:', err);
                return res.status(500).json({ message: 'Failed to get branch list' });
            }
            res.status(200).json({ data: result[0] });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLastBranchId = async (req, res) => {
    const { state, location } = req.body;

    const sqlBranch = `CALL SP_GetLastBranchId('${state}', '${location}')`;

    try {
        db.query(sqlBranch, (err, branchResult) => {
            if (err) {
                console.error('Error getting branch:', err);
                return res.status(500).json({ message: 'Failed to get branch ID list' });
            }

            res.status(200).json({
                branchData: branchResult[0]
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBranchHeadList = async (req, res) => {
    const { type } = req.body;

    const sqlHead = `CALL SP_GetBranchHead('${type}')`;

    try {
        db.query(sqlHead, (err, headResult) => {
            if (err) {
                console.error('Error getting branch head:', err);
                return res.status(500).json({ message: 'Failed to get branch head' });
            }

            res.status(200).json({
                headData: headResult[0]
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.saveBranchDetails = async (req, res) => {
    const { address, assign_brand_gramiyam, assign_brand_vaithyar, branch_id, branch_in_charge, branch_incharge_recid, branch_name,
            branch_type,  country,  district,  email, location, opening_date, phone_number, rent, state, assign_dispatch
          } = req.body.formData;
 
    const userId = branch_incharge_recid;  
    const processedBranchInchargeRecid = branch_incharge_recid || null;
    const sql = `CALL SP_SaveBranchDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    try {
        db.query(
            sql,
            [  branch_id,  branch_name, branch_type, branch_in_charge, processedBranchInchargeRecid, email,
               phone_number, address,country, state, district, location,rent,opening_date, assign_brand_gramiyam, assign_brand_vaithyar,assign_dispatch
            ],
            (err, branchResult) => {
                if (err) {
                    console.error('Error saving branch details:', err);
                    return res.status(500).json({ message: err });
                }
                const responseData = branchResult?.[1]?.[0] ?? null;
                const  branchnewid = responseData?.id;
               if (branchnewid) {
                    const notificationSql = `CALL SP_Afterbranchead(?, ?, ?, ?)`;
                    db.query(notificationSql, [branchnewid,branch_id, userId,branch_name], (err2, result2) => {
                    if (err2) {
                        console.error('Error inserting notifications:', err2);
                    } else {
                        console.log('Notifications inserted:', result2[0][0].affected_rows);
                    }
                    });
                }
                if (global.io) {
                   global.io.to(userId.toString()).emit('Newbranchassign', {
                    message: `🏢 You have been assigned as Branch Head for "${branch_name}" /"${branch_id}"`,
                    type: 'Branch Assign Notification',
                    timestamp: new Date().toISOString()
                    });
                }
                res.status(200).json({ message: 'Branch details saved successfully',  data: responseData });
            }
        );
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.getBranchDetails = async (req, res) => {
    const { userId, user_typecode, branch_id, country, state, district } =
      req.body;
    const sqlBranch = `CALL SP_GetBranchDetails(${userId},'${user_typecode}', ${branch_id || 0},'${country || ""}','${state || ""}','${district || ""}')`;
    const sqlDispatchBr = `CALL SP_GetBranchDisDetails()`;
    try {
        db.query(sqlBranch, (err, branchResult) => {
            if (err) {
                console.error('Error getting branch:', err);
                return res.status(500).json({ message: 'Failed to get branch ID list' });
            }
            db.query(sqlDispatchBr, (err, disResult) => {
                if (err) {
                    console.error('Error getting branch:', err);
                    return res.status(500).json({ message: 'Failed to get branch ID list' });
                }
                res.status(200).json({
                    data: branchResult[0],
                    dataDispatch: disResult[0]
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// exports.updateBranchDetails = async (req, res) => {
//     try {
//         const { updates } = req.body;
//         if (!Array.isArray(updates) || updates.length === 0) {
//             return res.status(400).json({ message: 'No updates provided.' });
//         }
//         const branch_id = updates[0].branch_id;
//         const query = (sql, values) =>
//             new Promise((resolve, reject) => {
//                 db.query(sql, values, (err, result) => {
//                     if (err) {
//                         return reject(new Error(err));
//                     }
//                     resolve(result);
//                 });
//             });

//         for (const { key, newValue } of updates) {
//             const sql = `UPDATE branches SET ${key} = ? WHERE branch_recid = ?`;
//             await query(sql, [newValue, branch_id]);
//         }

//         res.status(200).json({
//         message: "Branch updated successfully",
//         data: {
//             table_name: "branches",
//             method: "UPDATE",
//             id: branch_id,
//             id_column_name: "branch_id"
//         }
//         });
//     } catch (err) {
//         console.error('Error updating employee:', err);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// };

exports.updateBranchDetails = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "No updates provided." });
    }

    const branchId = updates[0].branch_id;

    const query = (sql, values) =>
      new Promise((resolve, reject) => {
        db.query(sql, values, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

    //  1. Get OLD branch head
    const oldHeadRow = await query(
      `SELECT branch_incharge_recid FROM branches WHERE branch_recid = ?`,
      [branchId]
    );

    const oldHeadId = oldHeadRow[0]?.branch_incharge_recid;

    //  2. Perform all branch updates
    for (const { key, newValue } of updates) {
      const sql = `UPDATE branches SET ${key} = ? WHERE branch_recid = ?`;
      await query(sql, [newValue, branchId]);
    }

    // Get NEW head ID
    const newHeadId = updates.find(
      (u) => u.key === "branch_incharge_recid"
    )?.newValue;

    // If branch head changed, transfer employees (exclude heads)
    if (oldHeadId && newHeadId && oldHeadId !== newHeadId) {
      await query(
        `UPDATE users
         SET created_by = ?
         WHERE created_by = ?
           AND branch_rceid = ?
           AND user_id NOT IN (?, ?)`,
        [newHeadId, oldHeadId, branchId, oldHeadId, newHeadId]
      );
    }

    res.status(200).json({
      message: "Branch updated successfully",
      data: {
        table_name: "branches",
        method: "UPDATE",
        id: branchId,
        id_column_name: "branch_id",
      },
    });
  } catch (err) {
    console.error("Error updating branch:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.deleteSelBranchList = async (req, res) => {
    const { branch_id } = req.body;

    const sqlBranch = `CALL SP_DelSelBranchList('${branch_id}')`;

    try {
        db.query(sqlBranch, (err, branchResult) => {
            if (err) {
                console.error('Error getting branch:', err);
                return res.status(500).json({ message: 'Failed to get branch ID list' });
            }
            const responseData = branchResult?.[0]?.[0] ?? null; 
            res.status(200).json({
                message: "Branch deleted successfully",
                data: responseData,
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getsaledetailsbybranch = async (req, res) => {
    const { userId, startDate, endDate } = req.body;

    const sqlBranch = `CALL SP_GetSaleDetailsByBranch(?,?,?)`;
    const sqlEmp = `CALL SP_GetAllSalesDataByEmp(?,?,?)`;

    try {
        db.query(sqlBranch, [userId, startDate, endDate], (err, branchResult) => {
            if (err) {
                console.error('Error getting branch sale:', err);
                return res.status(500).json({ message: 'Failed to get branch sale list' });
            }

            db.query(sqlEmp, [userId, startDate, endDate], (err, empResult) => {
                if (err) {
                    console.error('Error getting branch sale:', err);
                    return res.status(500).json({ message: 'Failed to get branch sale list' });
                }

                res.status(200).json({
                    data: branchResult?.[0] || [],
                    empData: empResult?.[0] || []
                });
            })
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
