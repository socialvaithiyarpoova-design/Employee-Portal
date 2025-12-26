const { getPool } = require('../database/db');
const db = getPool();
const { generatePresignedUrl } = require('../utilities/s3Utils');
const util = require("util");
const dbQuery = util.promisify(db.query).bind(db);

exports.getallleads = async (req, res) => {
    const {
        branch_id,
        disposition,
        employee_id,
        startDate,
        endDate,
        id,
        country,
        state,
        district
    } = req.body;
    const city = district;
    const sqlPg = `CALL SP_GetAllLeadDetails(
        ${branch_id ?? null},
        '${disposition}',
        ${employee_id ?? null},
        '${startDate}',
        '${endDate}',
        ${id ?? null}
        ,'${country || ''}',
        '${state || ''}',
        '${city || ''}'
    )`;
    const cgSql = `CALL SP_GetAllcatagories()`;
    const usSql = `CALL SP_GetAllTelliUsers()`;
    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting leads:', errPg);
                return res.status(500).json({ message: 'Failed to get leads' });
            }
            db.query(cgSql, (errCg, resultCg) => {
                if (errCg) {
                    console.error('Error getting categories:', errCg);
                    return res.status(500).json({ message: 'Failed to get categories' });
                }
                db.query(usSql, (errUser, resultUsers) => {
                    if (errUser) {
                        console.error('Error getting users:', errUser);
                        return res.status(500).json({ message: 'Failed to get users' });
                    }
                    res.status(200).json({
                        leads: resultPg[0],
                        categories: resultCg[0],
                        users: resultUsers[0]
                    });
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLeadPool = async (req, res) => {
    const { branch_id = null, employee_id = null, startDate = '', endDate = '' } = req.body.filteredData || {};

    const sql = `CALL SP_GetAllLeadPoolDetails(${branch_id}, ${employee_id}, '${startDate}', '${endDate}')`;
    const clSql = `CALL SP_GetAllTotalLeadPoolDetails(${branch_id}, ${employee_id}, '${startDate}', '${endDate}')`;

    try {
        db.query(sql, (err, rows) => {
            if (err) {
                console.error('Error fetching lead pool:', err);
                return res.status(500).json({ message: 'Failed to fetch lead pool' });
            }

            db.query(clSql, (err, rowsCl) => {
                if (err) {
                    console.error('Error fetching lead pool:', err);
                    return res.status(500).json({ message: 'Failed to fetch lead pool' });
                }

                return res.status(200).json(
                    { data: rows[0], total_data: rowsCl[0] }
                );
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLeadPoolSummary = async (req, res) => {
    try {
        const {
            viewMode = 'today',
            startDate = null,
            endDate = null,
            branch_id = null,
            emp_id = null
        } = req.body || {};

        const sql = 'CALL SP_GetLeadPoolSummary(?, ?, ?, ?, ?)';
        db.query(sql, [viewMode, startDate, endDate, branch_id, emp_id], (err, rows) => {
            if (err) {
                console.error('Error fetching lead pool summary:', err);
                return res.status(500).json({ message: 'Failed to fetch lead pool summary' });
            }
            return res.status(200).json({ data: rows?.[0] || [] });
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getallleadsforcl = async (req, res) => {
    const { userId } = req.body;

    const sqlPg = `CALL SP_GetAllLeadDetailsbyid('${userId}')`;
    const cgSql = `CALL SP_GetAllcatagories()`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting leads:', errPg);
                return res.status(500).json({ message: 'Failed to get leads' });
            }

            db.query(cgSql, (errCg, resultCg) => {
                if (errCg) {
                    console.error('Error getting categories:', errCg);
                    return res.status(500).json({ message: 'Failed to get categories' });
                }

                res.status(200).json({
                    leads: resultPg[0],
                    categories: resultCg[0]
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.uploadBulkLeads = async (req, res) => {
    try {
        const leads = req.body.leads;

        if (!Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({ message: 'No leads provided.' });
        }

        const values = leads.map((lead) => ([
            lead.lead_id,
            lead.lead_name,
            lead.age,
            lead.gender,
            lead.category,
            lead.mobile_number,
            lead.email,
            lead.created_by,
            lead.disposition,
            lead.disposition_date,
            lead.created_at
        ]));

        const sql = `
        INSERT INTO leads (
          lead_id,
          lead_name,
          age,
          gender,
          category,
          mobile_number,
          email,
          created_by,
          disposition,
          disposition_date,
          created_at
        ) VALUES ?
      `;

        db.query(sql, [values], (err, result) => {
            if (err) {
                console.error("DB Error:", err);
                return res.status(500).json({ message: "Database insert failed", error: err });
            }

            return res.status(200).json({
                message: "Bulk leads inserted successfully",
                inserted_count: result.affectedRows
            });
        });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.updateDisposition = async (req, res) => {
    const { key, id, followup_date } = req.body;

    const sqlPg = `CALL SP_UpdateDisposition('${key}', ${id} , '${followup_date}')`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting leads:', errPg);
                return res.status(500).json({ message: 'Failed to get leads' });
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

exports.getallproducts = async (req, res) => {
    const { type ,user_id } = req.body;

    const sqlPg = `CALL SP_GetAllProductSale("${type}",${user_id})`;
    try {
    db.query(sqlPg, async (errPg, resultPg) => {
      if (errPg) {
        console.error('Error getting leads:', errPg);
        return res.status(500).json({ message: 'Failed to get leads' });
      }
      const products = resultPg[0];

      try {
        const enrichedProducts = await Promise.all(
          products.map(async (p) => ({
            ...p,
            imageUrl: p.product_img
              ? await generatePresignedUrl(p.product_img)
              : null,
          }))
        );

        res.status(200).json({ data: enrichedProducts });
      } catch (e) {
        console.warn('⚠️ Failed to generate presigned URLs for some products:', e.message);
        res.status(200).json({ data: products }); 
      }
    });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createprofileData = async (req, res) => {
    const { name, age, genderName, mobile, email, userId, countryName, stateName, cityName, locationProfile } = req.body.profileData;
    const sqlPg = `CALL SP_CreateProfileData('${name}','${age}','${genderName}','${mobile}','${email}', ${userId},
    '${countryName}','${stateName}','${cityName}','${locationProfile}')`;

    try {
        db.query(sqlPg, async (errPg, resultPg) => {
             if (errPg) {
                console.error('Database Error:', errPg);

                if (errPg.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        message: 'This mobile number already exists. Please use a different one.'
                    });
                }

                return res.status(500).json({
                    message: 'Database error occurred.',
                    error: errPg.sqlMessage
                });
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

exports.insertSalesOrder = async (req, res) => {
    const data = req.body;
    const {
        leads_id, direct_pickup, additional_number,
        address, district, state, country,pincode, courier,catagory,
        order_value, discount, approved_by, payment_mode,courier_amount,
        wallet, total_value,gst_amount, amount_to_pay, medication_period,
        transaction_id, date_time, catagory_id, quantity, user_id, rec_id, stick_type, products,gst_id,dispatch_id
    } = data;

    const imagePath = req.file?.key || null;

    const sql = `
        CALL SP_InsertSalesOrder(
            '${leads_id}', ${direct_pickup}, '${additional_number}',
            '${address}', '${district}', '${state}', '${country}','${pincode}', '${courier}','${catagory}',
            ${order_value}, ${discount || 0}, '${approved_by}', '${payment_mode}',${courier_amount || 0}, 
            ${wallet || 0},${gst_amount}, ${total_value}, ${amount_to_pay}, '${medication_period}',
            '${imagePath}', '${transaction_id}',  '${date_time}', ${dispatch_id}, ${user_id}, '${catagory_id}', ${quantity}, '${rec_id}', '${stick_type}', '${products}',${gst_id}
        )
    `;

    try {
       db.query(sql, (err, result) => {
            if (err) {
                console.error('Error inserting sales order:', err);
                return res.status(500).json({ 
                    message: err.sqlMessage || 'Failed to insert sales order' 
                });
            }

            return res.status(200).json({ message: 'Sales order inserted successfully' });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLatestOrderId = async (req, res) => {
    const sql = "SELECT order_id FROM sales ORDER BY order_recid DESC LIMIT 1";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching last order_id:", err);
            return res.status(500).json({ message: "Failed to get latest order ID" });
        }

        let nextOrderId = "VPO001";
        if (result.length > 0 && result[0].order_id) {
            const lastId = parseInt(result[0].order_id.replace("VPO", "")) || 0;
            nextOrderId = "VPO" + String(lastId + 1).padStart(3, "0");
        }

        res.status(200).json({ nextOrderId });
    });
};

exports.getadminbranchlist = async (req, res) => {
    const { userId } = req.body;

    const sqlPg = `CALL SP_GetAllAdBranchList(${userId})`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting leads:', errPg);
                return res.status(500).json({ message: 'Failed to get leads' });
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

exports.getLatestClassId = async (req, res) => {
    const sql = "SELECT reg_no FROM class_register ORDER BY class_register_id DESC LIMIT 1";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching last class id:", err);
            return res.status(500).json({ message: "Failed to get latest class id" });
        }

        let nextOrderId = "VPR001";
        if (result.length > 0 && result[0].reg_no) {
            const lastId = parseInt(result[0].reg_no.replace("VPR", "")) || 0;
            nextOrderId = "VPR" + String(lastId + 1).padStart(3, "0");
        }

        res.status(200).json({ nextOrderId });
    });
};

exports.insertclassOrder = async (req, res) => {
    const data = req.body;
    const receipt_path = req.file?.key || null;

    const {
        registerId, currentDate, currentTime, martialStatus, marriedDate,
        maleName, maleDob, maleMobile, maleEmail,
        isMaleTest, maleTestRemark, maleReason,
        maleCause, maleRemark,
        femaleName, femaleDob, femaleMobile, femaleEmail,
        isFemaleTest, femaleTestRemark, femaleReason,
        femaleCause, femaleRemark,
        userId,
        country, state, city, pincode,
        preferredDate, preferredTime,
        classType, remark,
        price, amount_to_pay, discount, assigned_to,
        approvedBy, transactionId, paymentDate, lead_recid,gst_id,gst_amount
    } = data;

    const sql = `
            CALL SP_InsertClassRegister(
                '${registerId}', '${currentDate}', '${currentTime}', '${martialStatus}', '${marriedDate}',

                '${maleName}', '${maleDob}', '${maleMobile}', '${maleEmail}',
                '${isMaleTest}', '${maleTestRemark}', '${maleReason}',
                '${maleCause}', '${maleRemark}',

                '${femaleName}', '${femaleDob}', '${femaleMobile}', '${femaleEmail}',
                '${isFemaleTest}', '${femaleTestRemark}', '${femaleReason}',
                '${femaleCause}', '${femaleRemark}',

                '${userId}', NOW(),

                '${country}', '${state}', '${city}', '${pincode}',
                '${preferredDate}', '${preferredTime}',
                '${classType}', '${remark}',

                ${price || 0}, ${amount_to_pay || 0}, ${discount || 0},
                '${approvedBy}', '${transactionId}', '${paymentDate}', '${receipt_path}', ${lead_recid}, '${assigned_to}', ${gst_id}, ${gst_amount || 0}
            )
        `;

    try {
        db.query(sql, (err, result) => {
            if (err) {
              if (err.code === "ER_SIGNAL_EXCEPTION" &&err.sqlMessage.includes("Duplicate transaction ID")) {
                 return res.status(400).json({
                     message:"Duplicate Transaction ID. Please use a unique Transaction ID.",
                     });
                 }

            console.error('Error inserting class order:', err);
            return res.status(500).json({ message: 'Failed to insert class order' });
        }

            const notificationSql = `CALL SP_Afterclassinsert(?, ?, ?, ?)`;
            db.query(notificationSql, [userId, preferredDate, preferredTime, assigned_to], (err2, result2) => {
                if (err2) {
                    console.error('Error inserting notifications:', err2);
                } else {
                    console.log('Notifications inserted:', result2[0][0].affected_rows);
                }
            });


            if (global.io) {
                global.io.to(assigned_to.toString()).emit('classadded', {
                    message: `New class has arrived date  ${preferredDate} at ${preferredTime}`,
                    type: 'New Appointment & Class',
                    timestamp: new Date().toISOString()
                });
            }

            return res.status(200).json({ message: 'Class order inserted successfully' });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.insertWalletData = async (req, res) => {
    try {
        const {
            amount,
            callbackDate,
            comments,
            transactionId,
            dateTime,
            ownedBy,
            createdBy
        } = req.body;

        const receiptPath = req.file?.key || null;

        const insertValues = [
            amount,
            callbackDate,
            comments,
            receiptPath,
            transactionId,
            dateTime,
            ownedBy,
            createdBy
        ];

        const insertQuery = `CALL SP_InsertWalletAmount(?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(insertQuery, insertValues, (insertErr) => {
            if (insertErr) {
               if (
                  insertErr.code === "ER_SIGNAL_EXCEPTION" &&
                  insertErr.sqlMessage.includes("Duplicate transaction ID")
                ) {
                  return res.status(400).json({
                    message:
                      "Duplicate Transaction ID. Please use a correct Transaction ID.",
                  });
                }
                console.error('Error inserting/updating wallet data:', insertErr);
                return res.status(500).json({ message: 'Failed to insert/update wallet data' });
            }

            const updateLeadsQuery = `
                UPDATE leads 
                SET 
                    disposition = 'Interested',
                    interested_type = 'Wallet',
                    disposition_date = NOW()
                WHERE lead_recid = ? LIMIT 1
            `;

            db.query(updateLeadsQuery, [ownedBy], (updateErr) => {
                if (updateErr) {
                    console.error('Error updating leads:', updateErr);
                    return res.status(500).json({ message: 'Wallet updated, but failed to update lead status' });
                }

                return res.status(200).json({ message: 'Wallet data inserted/updated and lead updated successfully' });
            });
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


exports.getInFertilityDatas = async (req, res) => {
    const sqlMale = "SELECT infertility_id AS id, name, code, created_at FROM male_infertility_categories";
    const sqlFemale = "SELECT infertility_id AS id, name, code, created_at FROM female_infertility_categories";

    try {
        db.query(sqlMale, (errMale, maleResults) => {
            if (errMale) {
                console.error("Error fetching male infertility categories:", errMale);
                return res.status(500).json({ message: "Failed to get male infertility categories" });
            }

            db.query(sqlFemale, (errFemale, femaleResults) => {
                if (errFemale) {
                    console.error("Error fetching female infertility categories:", errFemale);
                    return res.status(500).json({ message: "Failed to get female infertility categories" });
                }

                return res.status(200).json({
                    maleCategories: maleResults,
                    femaleCategories: femaleResults
                });
            });
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ message: "Unexpected server error" });
    }
};

exports.getmalecause = async (req, res) => {
    const { id } = req.body;

    const sqlPg = `CALL SP_GetSpecMaleCause(${id})`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting causes:', errPg);
                return res.status(500).json({ message: 'Failed to get causes' });
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

exports.getfemalecause = async (req, res) => {
    const { id } = req.body;

    const sqlPg = `CALL SP_GetSpecFemaleCause(${id})`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting causes:', errPg);
                return res.status(500).json({ message: 'Failed to get causes' });
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

exports.getallvaithiyarlist = async (req, res) => {

    const sqlPg = `CALL SP_GetVaithiyarList()`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting causes:', errPg);
                return res.status(500).json({ message: 'Failed to get causes' });
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

exports.saveconsultingappointment = async (req, res) => {
  const data = req.body;
  const receipt_path = req.file?.key || null;

  const {
    vaithyar_name,
    vaithyar_id,
    slot_date,
    slot_time,
    price,
    transaction_id,
    paid_date,
    created_by,
    owned_by,
    lead_id,
  } = data;

  const checkTxnSql = `
        SELECT 1 FROM transaction_id_list WHERE transaction_id = ?
    `;

  const insertTxnSql = `
        INSERT INTO transaction_id_list (transaction_id) VALUES (?)
    `;

  const insertSql = ` 
        INSERT INTO consulting_appointments (
            vaithyar_name, vaithyar_id, slot_date, slot_time,
            price, receipt_path, transaction_id, date_time,
            created_by, owned_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

  const insertValues = [
    vaithyar_name,
    vaithyar_id,
    slot_date,
    slot_time,
    price,
    receipt_path,
    transaction_id,
    paid_date,
    created_by,
    owned_by,
  ];

  const updateSql = `
        UPDATE leads 
        SET 
            disposition = "Interested",
            interested_type = "Consulting",
            disposition_date = NOW()
        WHERE 
            created_by = ? AND lead_id = ?
    `;

  const updateValues = [created_by, lead_id];

  try {
    // CHECK IF TRANSACTION ID EXISTS
    db.query(checkTxnSql, [transaction_id], (err, exists) => {
      if (err) {
        console.error("Error checking transaction ID:", err);
        return res.json({
          status: "error",
          message: "Failed to book appointment.",
        });
      }

      if (exists.length > 0) {
        return res.json({
          status: "duplicate",
          message: "Transaction ID already exists. Please use a unique one.",
        });
      }

      // INSERT INTO transaction_id_list
      db.query(insertTxnSql, [transaction_id], (err2) => {
        if (err2) {
          console.error("Error inserting transaction ID:", err2);
          return res.json({
            status: "error",
            message: "Failed to book appointment.",
          });
        }

        // NOW CONTINUE WITH YOUR ORIGINAL LOGIC
        db.query(insertSql, insertValues, (err3, result) => {
            const lockSlotSql = `
            UPDATE appointments_list
            SET status = 'reserved'
            WHERE user_id = ?
                AND appointment_date = ?
                AND appointment_time = ?
                AND isDeleted = 0
            `;

            db.query(
              lockSlotSql,
              [vaithyar_id, slot_date, slot_time],
              (errLock) => {
                if (errLock) {
                  console.error("Failed to lock slot:", errLock);
                }
              }
            );

          if (err3) {
            console.error("Error inserting consulting appointment:", err3);

            if (err3.code === "ER_DUP_ENTRY") {
              return res.json({
                status: "duplicate",
                message:
                  "Transaction ID already exists. Please use a unique one.",
              });
            }

            return res.json({
              status: "error",
              message: "Failed to book appointment.",
            });
          }

          const appointment_ids = result.insertId;

          db.query(updateSql, updateValues, (err4) => {
            if (err4) {
              console.error("Error updating lead disposition:", err4);
              return res
                .status(500)
                .json({
                  message: "Appointment booked, but failed to update lead",
                });
            }

            if (appointment_ids) {
              const notificationSql = `CALL SP_Afterappoinmentconsulting(?, ?, ?, ?)`;
              db.query(
                notificationSql,
                [appointment_ids, vaithyar_id, slot_date, slot_time],
                (err5) => {
                  if (err5)
                    console.error("Error inserting notifications:", err5);
                }
              );
            }

            if (global.io) {
              global.io
                .to(vaithyar_id.toString())
                .emit("saveconsultingappointment", {
                  message: `New Consulting Appointment arrived ${slot_date} at ${slot_time}`,
                  type: "New Appointment & Class",
                  timestamp: new Date().toISOString(),
                });
            }

            return res
              .status(200)
              .json({
                message: "Appointment booked and lead updated successfully",
              });
          });
        });
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getleadshistorydetails = async (req, res) => {
    const { lead_id, id } = req.body;

    try {
        // Run all 4 queries at once in parallel
        const [sales, consulting, classData, wallet] = await Promise.all([
            dbQuery(`CALL SP_GetLeadHistorySales("${id}")`),
            dbQuery(`CALL SP_GetLeadHistoryConsult(${lead_id})`),
            dbQuery(`CALL SP_GetLeadHistoryClass(${lead_id})`),
            dbQuery(`CALL SP_GetLeadHistoryWallet(${lead_id})`),
        ]);

        console.log(lead_id);


        const response = {
            "Purchase history": sales?.[0] || [],
            "Consulting history": consulting?.[0] || [],
            "Class": classData?.[0] || [],
            "Wallet": wallet?.[0] || []
        };

        return res.status(200).json({
            message: "Lead history fetched successfully",
            data: response
        });
    } catch (error) {
        console.error("Error fetching lead history:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


exports.shuffleLeads = (req, res) => {
    const { employeeID, leadCount,  userId } = req.body;

    if (
        !employeeID || !Array.isArray(employeeID) || employeeID.length === 0 ||
        !leadCount || isNaN(parseInt(leadCount, 10))
      
    ) {
        return res.status(400).json({ message: "Invalid input data" });
    }

    const totalLeads = parseInt(leadCount, 10);
    const numEmployees = employeeID.length;

    db.getConnection((connErr, connection) => {
        if (connErr) {
            console.error("Connection error:", connErr);
            return res.status(500).json({ message: "Database connection error" });
        }

        connection.beginTransaction(tranErr => {
            if (tranErr) {
                connection.release();
                console.error("Transaction error:", tranErr);
                return res.status(500).json({ message: "Failed to start transaction" });
            }

            // Step 1: Select lead IDs to update based on filters and leadCount
            connection.query(
                `SELECT lead_recid FROM leads WHERE disposition = 'Not interested'  ORDER BY lead_recid ASC LIMIT ?`,
                [ totalLeads],
                (selectErr, leads) => {
                    if (selectErr) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error("Select leads error:", selectErr);
                            res.status(500).json({ message: "Failed to select leads" });
                        });
                    }

                    if (leads.length === 0) {
                        connection.release();
                        return res.status(202).json({ message: "No leads found to update" });
                    }

                    // Step 2: Distribute leads equally among employeeIDs
                    const leadIds = leads.map(l => l.lead_recid);

                    const chunkSize = Math.floor(leadIds.length / numEmployees);
                    const remainder = leadIds.length % numEmployees;

                    let start = 0;
                    let updatedCount = 0;
                    let i = 0;

                    const updateNextEmployee = () => {
                        if (i >= numEmployees) {
                            // Commit transaction
                            return connection.commit(commitErr => {
                                connection.release();
                                if (commitErr) {
                                    console.error("Commit error:", commitErr);
                                    return res.status(500).json({ message: "Transaction commit failed" });
                                }
                                // Fetch designation first
                                db.query('SELECT designation FROM users WHERE user_id = ?', [userId], (err, rows) => {
                                    if (err) {
                                        console.error("Error fetching designation:", err);
                                        return res.status(500).json({ message: "Failed to fetch designation" });
                                    }

                                    const designation = rows[0]?.designation || 'admin';

                                    // Pass employee list as string and designation to SP
                                    const employeeString = employeeID.join(',');
                                    const notificationSql = `CALL SP_Afterassign(?, ?, ?)`;

                                    db.query(notificationSql, [employeeString, userId, designation], (err2, result2) => {
                                        if (err2) {
                                            console.error('Error inserting notifications:', err2);
                                        } else {
                                            console.log('Notifications inserted:', result2[0][0].affected_rows);
                                        }
                                    });

                                    // Emit to all employees
                                    employeeID.forEach(emp => {
                                        global.io.to(emp.toString()).emit('leadAssigned', {
                                            message: `📢 New leads assigned by ${designation}`,
                                            type: 'New Lead Assign',
                                            timestamp: new Date().toISOString()
                                        });
                                    });
                                });

                                res.status(200).json({ message: `Successfully updated ${updatedCount} leads` });
                            });
                        }

                        let countForThisEmployee = chunkSize;
                        if (i === numEmployees - 1) countForThisEmployee += remainder;

                        if (countForThisEmployee === 0) {
                            i++;
                            return updateNextEmployee();
                        }

                        const leadsToUpdate = leadIds.slice(start, start + countForThisEmployee);
                        start += countForThisEmployee;

                        connection.query(
                            `UPDATE leads SET created_by = ? , disposition_date = CURRENT_TIMESTAMP, interested_type = NULL, disposition = NULL  WHERE lead_recid IN (?)`,
                            [employeeID[i], leadsToUpdate],
                            (updateErr, updateRes) => {
                                if (updateErr) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        console.error("Update leads error:", updateErr);
                                        res.status(500).json({ message: "Failed to update leads" });
                                    });
                                }

                                updatedCount += updateRes.affectedRows;
                                i++;
                                updateNextEmployee();
                            }
                        );
                    };

                    updateNextEmployee();
                }
            );
        });
    });
};

exports.gettimes = async (req, res) => {
    const { id, date } = req.body;

    const sqlPg = `CALL SP_GetTimeSlot(${id},'${date}')`;
console.log(sqlPg);

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting causes:', errPg);
                return res.status(500).json({ message: 'Failed to get causes' });
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



exports.getGstPercentage = async (req, res) => {
  try {
    const sql = `
      SELECT id AS gst_id, gst_percentage
      FROM gst_data
      WHERE isActiveGST = 1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching GST data:", err);
        return res.status(500).json({ message: "Failed to fetch GST percentage" });
      }

      if (!result.length) {
        return res.status(404).json({ message: "No active GST percentage found" });
      }

      return res.status(200).json({
        gst_id: result[0].gst_id,
        gst_percentage: result[0].gst_percentage
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.getWalletByLead = async (req, res) => {
  try {
    const { lead_recid } = req.params;

    if (!lead_recid) {
      return res.status(400).json({ message: "lead_recid is required" });
    }

    const query = `
      SELECT wallet_recid, amount,updated_at
      FROM wallet_amount
      WHERE owned_by = ?
      ORDER BY updated_at DESC
    `;

    db.query(query, [lead_recid], (err, result) => {
      if (err) {
        console.error("Error fetching wallet data:", err);
        return res.status(500).json({ message: "Failed to fetch wallet data" });
      }

      return res.status(200).json({
        success: true,
        data: result[0] || null, 
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.walletbalance = async (req, res) => {
  const { wallet_recid, amount } = req.body;

  if (!wallet_recid) {
    return res.status(400).json({ message: "wallet_recid is required" });
  }

  try {
    // ✅ Use promise wrapper
    const [result] = await db.promise().query(
      `UPDATE wallet_amount SET amount = ? WHERE wallet_recid = ?`,
      [amount, wallet_recid]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "Wallet balance updated successfully",
        wallet_recid,
        amount
      });
    } else {
      return res.status(404).json({ message: "Wallet not found" });
    }
  } catch (err) {
    console.error("Wallet update failed:", err);
    return res.status(500).json({ message: "Failed to update wallet balance" });
  }
};
