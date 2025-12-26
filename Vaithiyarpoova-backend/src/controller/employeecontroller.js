const { getPool } = require('../database/db');
const db = getPool();
const { getAwsSecrets } = require("../utilities/vaultClient");
const { generatePresignedUrl } = require('../utilities/s3Utils');
exports.getDesignationList = async (req, res) => {

    try {
        const sql = `CALL SP_GetDesignationList()`;

        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error executing stored procedure:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            
            const rows = result[0];
            res.status(200).json({ data: rows });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLastEmpID = async (req, res) => {
    const { value } = req.body;
    try {
        const sql = `CALL SP_GetLastEmpID( '${value}')`;

        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error executing stored procedure:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const rows = result[0];
            res.status(200).json({ data: rows });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const sanitizeValue = (value) => {
  if (value === 'null' || value === '' || value === undefined || value === null) {
    return null;
  }
  return value;
};

exports.saveEmpDetails = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Missing body in request" });
    }

    const {
      emp_id, name, email, mobile_number, address,
      salary, incentive_percentage, date_of_joining,date_of_birth,wed_date, designation,
      designation_id, userId, work_start, work_end,branch_rceid
    } = req.body;

    const imagePath = req.file?.key || null;

    const sql = `CALL SP_SaveEmpDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      emp_id,
      name,
      designation,
      mobile_number,
      email,
      sanitizeValue(date_of_joining),
      sanitizeValue(date_of_birth),
      sanitizeValue(wed_date),
      salary,
      incentive_percentage,
      address,
      userId,
      imagePath,
      designation_id,
      work_start,
      work_end,
      branch_rceid
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting employee:", err);
        return res.status(500).json({ message: "Failed to save employee", error: err });
      }

      const responseData = result?.[0]?.[0] ?? null;
      const newUserId = responseData?.id; 
      const newUsertypeId = designation_id;

      if (newUserId && newUsertypeId) {
        const seedSql = "CALL SP_SeedAccessUserMenuForUser(?, ?)";
        db.query(seedSql, [newUserId, newUsertypeId], (seedErr) => {
          if (seedErr) {
            console.error("Error seeding access_user_menu:", seedErr);
            // do not fail request
          }

          return res.status(200).json({
            message: "Employee saved successfully",
            data: responseData
          });
        });
      } else {
        return res.status(200).json({
          message: "Employee saved successfully",
          data: responseData
        });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getEmployeeList = async (req, res) => {
    const { userId, user_typecode, viewAllForCS , branch_id = null, emp_id = null } = req.body;

    const sqlEmp = `CALL SP_GetEmployeeList(?, ?, ?, ?)`;
    const sqlLeads = `CALL SP_GetLeadsCountList()`;

    // If CS requests view-all explicitly, treat as admin scope server-side
    const effectiveTypecode = (user_typecode === 'CS' && viewAllForCS) ? 'AD' : user_typecode;
    const values = [userId, effectiveTypecode, branch_id, emp_id];
    
    try {
        db.query(sqlEmp, values, async (err, empResult) => {
            if (err) {
                console.error('Error getting employee:', err);
                return res.status(500).json({ message: 'Failed to get employee list' });
            }

            const employees = empResult[0];

            db.query(sqlLeads, async (err2, leadsResult) => {
                if (err2) {
                    console.error('Error getting leads count:', err2);
                    return res.status(500).json({ message: 'Failed to get leads count' });
                }

                const leadsCountData = leadsResult[0];

                try {
                      const getEmpData = await Promise.all(
                        employees.map(async (item) => {
                        const leadInfo = leadsCountData.find(
                            (lead) => lead.created_by === item.user_id
                        );

                        return {
                            ...item,
                            image_url: item.image_url
                            ? await generatePresignedUrl(item.image_url)
                            : null,
                            follow_up_count: leadInfo ? leadInfo.follow_up_count : 0,
                            call_back_count: leadInfo ? leadInfo.call_back_count : 0,
                            not_interested_count: leadInfo ? leadInfo.not_interested_count : 0,
                        };
                        })
                    );
                    return res.status(200).json(getEmpData);
                } catch (e) {
                    console.warn('⚠️ Failed to enrich product images:', e.message);
                    return res.status(200).json(employees);
                }
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { updates } = req.body;

        if (!updates) {
            return res.status(400).json({ message: 'No updates provided.' });
        }

        const parsedUpdates = JSON.parse(updates);

        if (!Array.isArray(parsedUpdates) || parsedUpdates.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty updates array.' });
        }

        const emp_recid = parsedUpdates[0].emp_recid;

        const query = (sql, values) =>
            new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) return reject(new Error(err));
                    resolve(result);
                });
            });
            
        if (req.file?.key) {
            parsedUpdates.push({ key: 'image_url', newValue: req.file.key });
        }

        for (const { key, newValue } of parsedUpdates) {
            const sql = `UPDATE users SET ${key} = ? WHERE user_id = ?`;
            await query(sql, [newValue, emp_recid]);
        }

          res.status(200).json({
          message: "Employee updated successfully.",
        data: {
            table_name: "users",
            method: "UPDATE",
            id: emp_recid,
            id_column_name: "user_id"
        }
        });
    } catch (err) {
        console.error('Error updating employee:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.deleteSelEmployee = async (req, res) => {
    const { emp_recid } = req.body;

    const sql = `CALL SP_DeleteSelEmployee(${emp_recid})`;
    try {
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error getting employee:', err);
                return res.status(500).json({ message: 'Failed to get employee list' });
            }
            const responseData = result?.[0]?.[0] ?? null;
            res.status(200).json({
                message: "Employee deleted successfully",
                data: responseData
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.assignTaskToOther = async (req, res) => {
    const { user_id, assign_id } = req.body;

    const sql = `CALL SP_AssignTaskToOther(${user_id}, ${assign_id})`;
    console.log(sql);

    try {
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error getting employee:', err);
                return res.status(500).json({ message: 'Failed to get employee list' });
            }
            res.status(200).json({ data: result[0] });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.GetClientsCountList = async (req, res) => {
    const { user_id } = req.body;

    try {
        const sql = `CALL SP_GetClientsCountList(${user_id})`;

        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error executing stored procedure:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const rows = result[0][0];
            res.status(200).json({ data: rows });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCreativeServicesEmployees = async (req, res) => {
    try {
        const { userId, user_typecode } = req.body;
        
        // For Creative Services designation, show all employees
        const sql = 'CALL SP_GetCreativeServicesEmployees(?)';
        
        db.query(sql, [userId], (err, result) => {
            if (err) {
                console.error('Error executing stored procedure:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Failed to fetch Creative Services employees' 
                });
            }
            
            const rows = result[0] || [];
            res.status(200).json({ 
                success: true,
                data: rows 
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

exports.getAllPayrolls = async (req, res) => {
    try {
        const { startDate, endDate , branch_id, employee_id } = req.body;
        
        const sql = `CALL SP_GetAllPayrolls('${startDate}', '${endDate}', ${branch_id}, ${employee_id})`;
        
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error executing stored procedure:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Failed to fetch payrolls' 
                });
            }
            
            const rows = result[0] || [];
            res.status(200).json({ 
                data: rows
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

exports.getbranchs = async (req, res) => {
    const { user_id, user_type } = req.body;  // 👈 Make sure frontend sends user_type (e.g., 'AD')

    try {
        const dbConn = db.promise();

        let query = `
            SELECT 
                branch_id AS code,
                branch_recid AS id,
                branch_name AS label,
                branch_name AS value
            FROM branches
        `;
        let params = [];

        // ✅ If NOT Admin → filter by incharge
        if (user_type !== 'AD') {
            query += ` WHERE branch_incharge_recid = ?`;
            params.push(user_id);
        }

        const [rows] = await dbConn.query(query, params);

        res.status(200).json({
            branch: rows || [],
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Failed to fetch branch data' });
    }
};
