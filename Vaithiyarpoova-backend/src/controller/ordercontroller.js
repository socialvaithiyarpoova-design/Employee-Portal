const { getPool } = require('../database/db');
const db = getPool();
const { generatePresignedUrl } = require('../utilities/s3Utils');

exports.getallorder = async (req, res) => {
    const { btnData, branch_id, employee_id, startDate, endDate, status } = req.body;

    const sqlPg = `CALL SP_GetAllSalesByCl('${btnData}', ${branch_id}, ${employee_id}, '${startDate}', '${endDate}', '${status}')`;
    const sqlShop = `CALL SP_GetAllShopSalesByCl('${btnData}', ${branch_id}, ${employee_id}, '${startDate}', '${endDate}', '${status}')`;

    try {
        db.query(sqlPg, async (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting sales:', errPg);
                return res.status(500).json({ message: 'Failed to get sales' });
            }
            const orderdata = resultPg[0];
           const getOrderData = await Promise.all(
                orderdata.map(async (item) => ({
                ...item,
                receipt_image_url: item.receipt_image_url
                    ? await generatePresignedUrl(item.receipt_image_url)
                    : null,
                }))
            );
            db.query(sqlShop, async (errPg, resultShop) => {
                if (errPg) {
                    console.error('Error getting sales:', errPg);
                    return res.status(500).json({ message: 'Failed to get sales' });
                }

                const orderShopdata = resultShop[0];

               const getOrderShopData = await Promise.all(
                orderShopdata.map(async (item) => ({
                    ...item,
                    receipt_image_url: item.receipt_image_url
                    ? await generatePresignedUrl(item.receipt_image_url)
                    : null,
                }))
                );

                res.status(200).json({
                    data: getOrderData,
                    shopes: getOrderShopData
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getallorderdis = async (req, res) => {
    const { startDate , endDate , status, branch_id, employee_id , user_id } = req.body;

    const sqlPg = `CALL SP_GetAllSalesByDis('${startDate}','${endDate}','${status}',${branch_id}, ${employee_id},${user_id})`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting orders:', errPg);
                return res.status(500).json({ message: 'Failed to get orders' });
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

exports.getproductdata = async (req, res) => {
    const { product_id } = req.body;

    const sqlPg = `CALL SP_GetProductData('${product_id}')`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting products:', errPg);
                return res.status(500).json({ message: 'Failed to get products' });
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

exports.putstatus = async (req, res) => {
    const { status, order_id, created_by, orderid , option ,reason} = req.body;
    const order_recid = order_id || 0;
    const sqlPg = `CALL SP_PutStatusForApprovals('${status}', ${order_id}, '${option}','${reason}')`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error updating status:', errPg);
                return res.status(500).json({ message: 'Failed to update status' });
            }

            // Insert notification for creator (who submitted approval)
            const notificationSql = `CALL SP_Afterpustatus(?, ?, ?, ?, ?)`;
            db.query(notificationSql, [order_recid, status, orderid, created_by,reason], (err2, result2) => {
                if (err2) {
                    console.error('Error inserting notifications:', err2);
                } else {
                    console.log('Notifications inserted:', result2[0][0].affected_rows);
                }
            });

            // Notify creator only
            if (global.io) {
                global.io.to(created_by.toString()).emit('orders', {
                    message: `Order has been ${status} - ${orderid} - ${reason}`,
                    type: 'Order Approval/Decline',
                    timestamp: new Date().toISOString()
                });
            }

            // ✅ Notify only Dispatch users if status is Approved
            if (status === 'Approved') {
                const sqlDispatch = `SELECT user_id FROM users WHERE designation = 'Dispatch'`;
                db.query(sqlDispatch, (err, dispatchUsers) => {
                    if (!err && dispatchUsers.length > 0) {
                        dispatchUsers.forEach(user => {
                            // Emit real-time event to each dispatch user
                            global.io.to(user.user_id.toString()).emit('dispatch', {
                                message: `✅ New Order arrived ${orderid} `,
                                type: 'Dispatch Notification',
                                timestamp: new Date().toISOString()
                            });
                        });

                        // Store notification in DB for all dispatch users
                        const notifSql = `CALL SP_DispatchNotification(?, ?)`;
                        db.query(notifSql, [orderid, status], errNotif => {
                            if (errNotif) console.error('Error inserting dispatch notifications:', errNotif);
                        });
                    }
                });
            }

            res.status(200).json({ data: resultPg[0] });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatedisorders = async (req, res) => {
    const { created_by, order_recid, order_id, type, courier, tracking_id, net_weight,type_mode } = req.body;
    const userId = created_by || 0;

    const sqlPg = `CALL SP_UpdateDisOrders('${type}','${order_recid}', '${order_id}', '${courier}', '${tracking_id}', '${net_weight}','${type_mode}')`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error updating order:', errPg);
                return res.status(500).json({ message: 'Failed to update order' });
            }

            const responseData = resultPg?.[0]?.[0] ?? null;
            const order_recid = responseData?.id;
            if (order_recid) {
                const notificationSql = `CALL SP_Afterupdatesatus(?, ?, ?, ?)`;
                db.query(notificationSql, [order_recid, type, userId, order_id], (err2, result2) => {
                    if (err2) {
                        console.error('Error inserting notifications:', err2);
                    } else {
                        console.log('Notifications inserted:', result2[0][0].affected_rows);
                    }
                });
            }
            if (global.io) {
                global.io.to(userId.toString()).emit('orderupdate', {
                    message: `📦 Order "${order_id}"status updated to "(${type})"`,
                    type: 'Tracking Status',
                    timestamp: new Date().toISOString()
                });
            }
            res.status(200).json({ message: 'Order updated successfully', data: responseData });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getpurchasedatas = async (req, res) => {
    const { startDate, endDate, branch_id, emp_id, status, usertype_code, user_id } = req.body;

    const sqlPg = `CALL SP_GetPurchaseDatas('${startDate}', '${endDate}', ${branch_id}, ${emp_id}, '${status}', '${usertype_code}', ${user_id})`;

    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error updating order:', errPg);
                return res.status(500).json({ message: 'Failed to update order' });
            }

            res.status(200).json({
                message: 'Order updated successfully',
                data: resultPg[0]
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.reduceProductStock = async (req, res) => {
  const products = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "No products provided" });
  }
  const updatePromises = products.map(({ product_id, qty }) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE product
        SET quantity = quantity - ?
        WHERE product_id = ? AND quantity >= ?;
      `;
      db.query(query, [qty, product_id, qty], (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) {
          return reject(new Error(`Insufficient stock for product ID ${product_id}`));
        }
        resolve();
      });
    });
  });

  try {
    await Promise.all(updatePromises);
    return res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("❌ Stock update error:", error);
    return res.status(500).json({ message: error.message || "Stock update failed" });
  }
};


exports.getapprovel = async (req, res) => {
    const { btnData, branch_id, employee_id, startDate, endDate,status, type } = req.body;

    const sqlPg = `CALL SP_GetAllApprovel('${btnData}', ${branch_id}, ${employee_id}, '${startDate}', '${endDate}', '${status}', '${type}')`;
   
    try {
        db.query(sqlPg, async (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting sales:', errPg);
                return res.status(500).json({ message: 'Failed to get sales' });
            }
            const getapprovel = resultPg[0];
           
          res.status(200).json({ data: getapprovel});
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getBillingDetails = async (req, res) => {
    const { billing_recid } = req.body;

    const sqlPg = `CALL SP_GetBillingDetails( ${billing_recid})`;
    try {
        db.query(sqlPg, async (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting sales:', errPg);
                return res.status(500).json({ message: 'Failed to get sales' });
            }
            const orderdata = resultPg[0];
           const billingDetails = await Promise.all(
                orderdata.map(async (item) => ({
                ...item,
                receipt_path: item.receipt_path
                    ? await generatePresignedUrl(item.receipt_path)
                    : null,
                }))
            );
            res.status(200).json({  data: billingDetails});
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getWalletDetails = async (req, res) => {
    const { wallet_id } = req.body;

    const sqlPg = `CALL SP_GetWalletDetails( ${wallet_id})`;
    try {
        db.query(sqlPg, async (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting sales:', errPg);
                return res.status(500).json({ message: 'Failed to get sales' });
            }
            const orderdata = resultPg[0];
           const billingDetails = await Promise.all(
                orderdata.map(async (item) => ({
                ...item,
                receipt_path: item.receipt_path
                    ? await generatePresignedUrl(item.receipt_path)
                    : null,
                }))
            );
            res.status(200).json({  data: billingDetails});
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getClassDetails = async (req, res) => {
    const { class_register_id } = req.body;

    const sqlPg = `CALL SP_GetClassDetails( ${class_register_id})`;
    try {
        db.query(sqlPg, async (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting sales:', errPg);
                return res.status(500).json({ message: 'Failed to get sales' });
            }
            const orderdata = resultPg[0];
           const billingDetails = await Promise.all(
                orderdata.map(async (item) => ({
                ...item,
                receipt_path: item.receipt_path
                    ? await generatePresignedUrl(item.receipt_path)
                    : null,
                }))
            );
            res.status(200).json({  data: billingDetails});
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getConsultingDetails = async (req, res) => {
    const { id } = req.body;

    const sqlPg = `CALL SP_GetConsultingDetails( ${id})`;
    try {
        db.query(sqlPg, async (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting sales:', errPg);
                return res.status(500).json({ message: 'Failed to get sales' });
            }
            const orderdata = resultPg[0];
           const billingDetails = await Promise.all(
                orderdata.map(async (item) => ({
                ...item,
                receipt_path: item.receipt_path
                    ? await generatePresignedUrl(item.receipt_path)
                    : null,
                }))
            );
            res.status(200).json({  data: billingDetails});
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.approveclass = async (req, res) => {
  const { id, status } = req.body;

  try {
    const sqlPg = `UPDATE class_register SET status = ? WHERE class_register_id = ?`;

    db.query(sqlPg, [status, id], (errPg) => {
      if (errPg) {
        console.error("Error updating class_register:", errPg);
        return res.status(500).json({ message: "Failed to update class status" });
      }

      res.status(200).json({ message: "Class approved successfully" });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectclass = async (req, res) => {
  const { id, status, reason, created_by, reg_no } = req.body;
  const userId = created_by || 0;

  try {
    // Step 1: Update class_register status and reason
    const updateQuery = `
      UPDATE class_register 
      SET status = ?,reason = ?
      WHERE class_register_id = ?;
    `;

    db.query(updateQuery, [status, reason, id], (errUpdate) => {
      if (errUpdate) {
        console.error('Error updating class_register:', errUpdate);
        return res.status(500).json({ message: 'Failed to update class_register' });
      }

      // Step 2: Fetch notification_type_id for "Tracking Status"
      const typeQuery = `SELECT notification_type_id FROM notification_types WHERE type_name = 'Tracking Status' LIMIT 1;`;

      db.query(typeQuery, (errType, resultType) => {
        if (errType) {
          console.error('Error fetching notification type:', errType);
          return res.status(500).json({ message: 'Failed to fetch notification type' });
        }

        const notificationTypeId = resultType?.[0]?.notification_type_id || 1;
        const content = `⚠️ Class Rejected: "${reg_no}" — Reason: "${reason}"`;

        // Step 3: Insert into notifications
        const insertNotification = `
          INSERT INTO notifications (user_id, notification_type_id, content, source_id, source_type, readms, trash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, 0, NOW(), NOW());
        `;

        db.query(insertNotification, [userId, notificationTypeId, content, id, 'class_register'], (errNotif) => {
          if (errNotif) {
            console.error('Error inserting notification:', errNotif);
          }

          // Step 4: Emit via socket
          if (global.io) {
            global.io.to(userId.toString()).emit('status', {
              message: `⚠️ Class Rejected "${reg_no}" — Reason: "${reason}"`,
              type: 'Tracking Status',
              timestamp: new Date().toISOString()
            });
          }

          res.status(200).json({ message: 'Class Rejected successfully' });
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveBilling = async (req, res) => {
  const { billing_recid, status } = req.body;

  try {
    const sqlPg = `UPDATE billing SET status = ? WHERE billing_recid = ?`;

    db.query(sqlPg, [status, billing_recid], (errPg) => {
      if (errPg) {
        console.error("Error updating class_register:", errPg);
        return res.status(500).json({ message: "Failed to update class status" });
      }

      res.status(200).json({ message: " Billing approved successfully" });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.rejectBilling = async (req, res) => {
  const {billing_recid, status, reason, created_by, reg_no } = req.body;
  const userId = created_by || 0;

  try {
    // Step 1: Update class_register status and reason
    const updateQuery = `
      UPDATE billing 
      SET status = ?,reason = ?
      WHERE billing_recid = ?;
    `;

    db.query(updateQuery, [status, reason, billing_recid], (errUpdate) => {
      if (errUpdate) {
        console.error('Error updating  billing', errUpdate);
        return res.status(500).json({ message: 'Failed to update billing' });
      }

      // Step 2: Fetch notification_type_id for "Tracking Status"
      const typeQuery = `SELECT notification_type_id FROM notification_types WHERE type_name = 'Tracking Status' LIMIT 1;`;

      db.query(typeQuery, (errType, resultType) => {
        if (errType) {
          console.error('Error fetching notification type:', errType);
          return res.status(500).json({ message: 'Failed to fetch notification type' });
        }

        const notificationTypeId = resultType?.[0]?.notification_type_id || 1;
        const content = `⚠️ Billing Rejected: "${reg_no}" — Reason: "${reason}"`;

        // Step 3: Insert into notifications
        const insertNotification = `
          INSERT INTO notifications (user_id, notification_type_id, content, source_id, source_type, readms, trash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, 0, NOW(), NOW());
        `;

        db.query(insertNotification, [userId, notificationTypeId, content, billing_recid, 'class_register'], (errNotif) => {
          if (errNotif) {
            console.error('Error inserting notification:', errNotif);
          }

          // Step 4: Emit via socket
          if (global.io) {
            global.io.to(userId.toString()).emit('status', {
              message: `⚠️ Billing Rejected "${reg_no}" — Reason: "${reason}"`,
              type: 'Tracking Status',
              timestamp: new Date().toISOString()
            });
          }

          res.status(200).json({ message: 'Class Rejected successfully' });
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectWallet = async (req, res) => {
  const {wallet_id, status, reason, created_by, lead_id  } = req.body;
  const userId = created_by || 0;
  console.log(req.body)

  try {
    // Step 1: Update class_register status and reason
    const updateQuery = `
      UPDATE wallet_data  
      SET status = ?,reason = ?
      WHERE wallet_id = ?;
    `;

    db.query(updateQuery, [status, reason, wallet_id], (errUpdate) => {
      if (errUpdate) {
        console.error('Error updating  wallet', errUpdate);
        return res.status(500).json({ message: 'Failed to update wallet' });
      }

      // Step 2: Fetch notification_type_id for "Tracking Status"
      const typeQuery = `SELECT notification_type_id FROM notification_types WHERE type_name = 'Tracking Status' LIMIT 1;`;

      db.query(typeQuery, (errType, resultType) => {
        if (errType) {
          console.error('Error fetching notification type:', errType);
          return res.status(500).json({ message: 'Failed to fetch notification type' });
        }

        const notificationTypeId = resultType?.[0]?.notification_type_id || 1;
        const content = `⚠️ Wallet Rejected: "${lead_id}" — Reason: "${reason}"`;

        // Step 3: Insert into notifications
        const insertNotification = `
          INSERT INTO notifications (user_id, notification_type_id, content, source_id, source_type, readms, trash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, 0, NOW(), NOW());
        `;

        db.query(insertNotification, [userId, notificationTypeId, content, wallet_id, 'class_register'], (errNotif) => {
          if (errNotif) {
            console.error('Error inserting notification:', errNotif);
          }

          // Step 4: Emit via socket
          if (global.io) {
            global.io.to(userId.toString()).emit('status', {
              message: `⚠️  Wallet Rejected "${lead_id}" — Reason: "${reason}"`,
              type: 'Tracking Status',
              timestamp: new Date().toISOString()
            });
          }

          res.status(200).json({ message: 'Class Rejected successfully' });
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.rejectConsulting = async (req, res) => {
  const {id, status, reason, created_by, lead_id  } = req.body;
  const userId = created_by || 0;

  try {
    // Step 1: Update class_register status and reason
    const updateQuery = `
      UPDATE consulting_appointments  
      SET status = ?,reason = ?
      WHERE id = ?;
    `;

    db.query(updateQuery, [status, reason, id], (errUpdate) => {
      if (errUpdate) {
        console.error('Error updating  consulting', errUpdate);
        return res.status(500).json({ message: 'Failed to update consulting' });
      }

      // Step 2: Fetch notification_type_id for "Tracking Status"
      const typeQuery = `SELECT notification_type_id FROM notification_types WHERE type_name = 'Tracking Status' LIMIT 1;`;

      db.query(typeQuery, (errType, resultType) => {
        if (errType) {
          console.error('Error fetching notification type:', errType);
          return res.status(500).json({ message: 'Failed to fetch notification type' });
        }

        const notificationTypeId = resultType?.[0]?.notification_type_id || 1;
        const content = `⚠️ Consulting Rejected: "${lead_id}" — Reason: "${reason}"`;

        // Step 3: Insert into notifications
        const insertNotification = `
          INSERT INTO notifications (user_id, notification_type_id, content, source_id, source_type, readms, trash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, 0, NOW(), NOW());
        `;

        db.query(insertNotification, [userId, notificationTypeId, content, id, 'class_register'], (errNotif) => {
          if (errNotif) {
            console.error('Error inserting notification:', errNotif);
          }

          // Step 4: Emit via socket
          if (global.io) {
            global.io.to(userId.toString()).emit('status', {
              message: `⚠️  Consulting Rejected "${lead_id}" — Reason: "${reason}"`,
              type: 'Tracking Status',
              timestamp: new Date().toISOString()
            });
          }

          res.status(200).json({ message: 'Class Rejected successfully' });
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.approveWallet = async (req, res) => {
  const { wallet_id, status, owned_by, amount } = req.body;
  try {
    // Step 1: Update wallet status
    const sqlUpdateWallet = `UPDATE wallet_data SET status = ? WHERE wallet_id = ?`;

    db.query(sqlUpdateWallet, [status, wallet_id], (errUpdate) => {
      if (errUpdate) {
        console.error("Error updating wallet_data:", errUpdate);
        return res.status(500).json({ message: "Failed to update wallet status" });
      }

      // Step 2: Check if record exists in wallet_amount
      const sqlCheck = `SELECT * FROM wallet_amount WHERE owned_by = ?`;
      db.query(sqlCheck, [owned_by], (errCheck, results) => {
        if (errCheck) {
          console.error("Error checking wallet_amount:", errCheck);
          return res.status(500).json({ message: "Failed to check wallet amount" });
        }

        if (results.length > 0) {
          // Step 3: If exists, update the amount (add)
          const sqlUpdateAmount = `
            UPDATE wallet_amount 
            SET amount = amount + ? 
            WHERE owned_by = ?
          `;
          db.query(sqlUpdateAmount, [amount, owned_by], (errUpdateAmt) => {
            if (errUpdateAmt) {
              console.error("Error updating wallet_amount:", errUpdateAmt);
              return res.status(500).json({ message: "Failed to update wallet amount" });
            }

            res.status(200).json({ message: "Wallet approved and amount updated successfully" });
          });
        } else {
          // Step 4: If not exists, insert a new record
          const sqlInsert = `
            INSERT INTO wallet_amount (owned_by, amount) 
            VALUES (?, ?)
          `;
          db.query(sqlInsert, [owned_by, amount], (errInsert) => {
            if (errInsert) {
              console.error("Error inserting wallet_amount:", errInsert);
              return res.status(500).json({ message: "Failed to insert wallet amount" });
            }
            res.status(200).json({ message: "Wallet approved and new wallet record created successfully" });
          });
        }
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.approveConsulting = async (req, res) => {
   const { id, status, owned_by, amount } = req.body;
  try {
    // Step 1: Update wallet status
    const sqlUpdateWallet = `UPDATE consulting_appointments SET status = ? WHERE id = ?`;

    db.query(sqlUpdateWallet, [status, id], (errUpdate) => {
      if (errUpdate) {
        console.error("Error updating consulting_appointments:", errUpdate);
        return res.status(500).json({ message: "Failed to update consulting_appointments status" });
      }

      // Step 2: Check if record exists in wallet_amount
      const sqlCheck = `SELECT * FROM wallet_amount WHERE owned_by = ?`;
      db.query(sqlCheck, [owned_by], (errCheck, results) => {
        if (errCheck) {
          console.error("Error checking wallet_amount:", errCheck);
          return res.status(500).json({ message: "Failed to check wallet amount" });
        }

        if (results.length > 0) {
          // Step 3: If exists, update the amount (add)
          const sqlUpdateAmount = `
            UPDATE wallet_amount 
            SET amount = amount + ? 
            WHERE owned_by = ?
          `;
          db.query(sqlUpdateAmount, [amount, owned_by], (errUpdateAmt) => {
            if (errUpdateAmt) {
              console.error("Error updating wallet_amount:", errUpdateAmt);
              return res.status(500).json({ message: "Failed to update wallet amount" });
            }

            res.status(200).json({ message: "Wallet approved and amount updated successfully" });
          });
        } else {
          // Step 4: If not exists, insert a new record
          const sqlInsert = `
            INSERT INTO wallet_amount (owned_by, amount) 
            VALUES (?, ?)
          `;
          db.query(sqlInsert, [owned_by, amount], (errInsert) => {
            if (errInsert) {
              console.error("Error inserting wallet_amount:", errInsert);
              return res.status(500).json({ message: "Failed to insert wallet amount" });
            }
            res.status(200).json({ message: "Wallet approved and new wallet record created successfully" });
          });
        }
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};