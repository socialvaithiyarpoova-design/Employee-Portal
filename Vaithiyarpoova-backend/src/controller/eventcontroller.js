const { getPool } = require('../database/db');
const db = getPool();

// exports.saveEvent = async (req, res) => {
//     const { user_id, type, date,remark, target, action , emp_id} = req.body;
//     const sql = `CALL SP_SaveEventDetails(${user_id}, '${type}', '${date}','${remark}', '${target}', '${action}', ${emp_id || null})`;
//     try {

//         db.query(sql, (errCg, result) => {
//             if (errCg) {
//                 console.error('Error saving data:', errCg);
//                 return res.status(500).json({ message: 'Failed to saving data' });
//             }

//             const newRow = result?.[0]?.[0] ?? null;

//             const responseData = {
//                 table_name: "events",
//                 method: "INSERT",
//                 id: newRow?.event_id || null,    
//                 id_column_name: "event_id"
//             };

//             res.status(200).json({
//                 message: "Event saved successfully",
//                 data: responseData
//             });
//         });

//     } catch (error) {
//         console.error('Server error:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };



exports.saveEvent = async (req, res) => {
    const { user_id, type, date, remark, target, action, emp_id, designation } = req.body;

    const sql = `
        CALL SP_SaveEventDetails(
            ${user_id}, 
            '${type}', 
            '${date}', 
            '${remark}', 
            '${target}', 
            '${action}', 
            ${emp_id || null}
        )
    `;

    try {
        db.query(sql, async (errCg, result) => {
            if (errCg) {
                console.error("Error saving event:", errCg);
                return res.status(500).json({ message: "Failed to save event" });
            }

            const newRow = result?.[0]?.[0] ?? null;

            const eventId = newRow?.event_id || null;

            /** TRIGGER NOTIFICATION */
            await sendEventNotification({
                event: { user_id, type, date, remark, target, action, designation },
                eventId
            });

            return res.status(200).json({
                message: "Event saved successfully",
                data: {
                    table_name: "events",
                    method: "INSERT",
                    id: eventId,
                    id_column_name: "event_id"
                }
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/* --------------------------------------------------------------------
   SEND NOTIFICATION LOGIC
---------------------------------------------------------------------*/

async function sendEventNotification({ event, eventId }) {
    return new Promise((resolve, reject) => {

        // Fetch logged-in user's designation + branch
        const userInfoSql = `
            SELECT designation, branch_rceid 
            FROM users 
            WHERE user_id = ${event.user_id}
        `;

        db.query(userInfoSql, (err, userRows) => {
            if (err) return reject(err);

            const loggedUser = userRows[0];
            const designation = loggedUser.designation;
            const branchRecid = loggedUser.branch_rceid;

            let userFetchSql = "";

            // Admin, Accounts → all employees
            if (["Admin", "Accounts"].includes(designation)) {
                userFetchSql = `
                    SELECT user_id 
                    FROM users 
                    WHERE isDeleted = 0
                `;
            }

            // Branch Head → only same branch
            else if (designation === "Branch head") {
                userFetchSql = `
                    SELECT user_id
                    FROM users
                    WHERE isDeleted = 0
                      AND branch_rceid = ${branchRecid}
                `;
            }

            // Others → notify only themselves
            else {
                userFetchSql = `
                    SELECT user_id 
                    FROM users 
                    WHERE user_id = ${event.user_id}
                `;
            }

            // Now execute notification sending
            db.query(userFetchSql, (err, users) => {
                if (err) return reject(err);

                const emoji = getEmoji(event);
                const content = buildMessage(event, emoji);

                const notificationTypeId = 5;

                users.forEach((u) => {
                    const insertSql = `
                        INSERT INTO notifications (
                            user_id, notification_type_id, content,
                            source_id, source_type, created_at, updated_at
                        )
                        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                    `;

                    db.query(insertSql, [u.user_id, notificationTypeId, content, eventId, "events"]);

                    if (global.io) {
                        global.io.to(u.user_id.toString()).emit("eventReminder", {
                            message: content,
                            type: "eventReminder",
                            timestamp: new Date().toISOString()
                        });
                    }
                });

                resolve(true);
            });
        });
    });
}


/* --------------------------------------------------------------------
   EMOJI SELECTION
---------------------------------------------------------------------*/

function getEmoji(event) {
    if (event.action === "holiday") {
        if (event.type === "Government holiday") return "🏛️";
        if (event.type === "Religious holiday") return "🕌";
        if (event.type === "Company leave") return "🏢";
        if (event.type === "Week off") return "🛌";
    }

    return "🎉"; // Default emoji
}

/* --------------------------------------------------------------------
   MESSAGE BUILDER
---------------------------------------------------------------------*/

function buildMessage(event, emoji) {
    // Holiday message
    if (event.action === "holiday") {
        return `${emoji} ${event.type} on ${event.date}`;
    }

    // Events message
    if (event.action === "events") {
        return `${emoji} ${event.remark} has a ${event.target} on ${event.date} 🎈`;
    }

    // Fallback
    return `${emoji} Update scheduled for ${event.date}`;
}



exports.getEventDetails = async (req, res) => {
    const sql = `CALL SP_GetEventDetails()`;

    try {

        db.query(sql, (errCg, result) => {
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

exports.saveBrakeSchedule = async (req, res) => {
    const {
        am_break_start, am_break_end, lunch_start, lunch_end, pm_break_start, pm_break_end, created_by
    } = req.body;


    const sql = `CALL SP_SaveBrakeSchedule(${created_by}, '${am_break_start}', '${am_break_end}', '${lunch_start}', '${lunch_end}', '${pm_break_start}', '${pm_break_end}')`;

    try {

        db.query(sql, (errCg, result) => {
            if (errCg) {
                console.error('Error saving data:', errCg);
                return res.status(500).json({ message: 'Failed to saving data' });
            }

            const row = result?.[0]?.[0] ?? null;

            const responseData = {
                table_name: "break_schedule",
                method: row ? "UPDATE" : "INSERT",  
                id: row?.break_schedule_id || null,
                id_column_name: "break_schedule_id"
            };
            res.status(200).json({
                message: "Break schedule saved successfully",
                data: responseData
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.savePermission = async (req, res) => {
    const {
        permission, created_by
    } = req.body;

    const sql = `CALL SP_SavePermission(${created_by}, '${permission}')`;

    try {

        db.query(sql, (errCg, result) => {
            if (errCg) {
                console.error('Error saving data:', errCg);
                return res.status(500).json({ message: 'Failed to saving data' });
            }

            const row = result?.[0]?.[0] ?? null;
            const responseData = {
                table_name: "break_schedule",
                method: "INSERT",  
                id: row?.break_schedule_id || null,
                id_column_name: "break_schedule_id"
            };

            return res.status(200).json({
                message: "Permission saved successfully",
                data: responseData
            });
                });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getbreak = async (req, res) => {
  const { user_id } = req.query;

  try {
    const query = `
      SELECT 
        break_schedule_id,
        am_break_start,
        am_break_end,
        lunch_start,
        lunch_end,
        pm_break_start,
        pm_break_end,
        created_by,
        created_at
      FROM break_schedule
      WHERE created_by = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [results] = await db.promise().query(query, [user_id]);
    if (results.length > 0) {
      res.status(200).json({
        status: 200,
        message: "Break schedule fetched successfully",
        data: results[0]
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "No break schedule found",
        data: {
          am_break_start: null,
          am_break_end: null,
          lunch_start: null,
          lunch_end: null,
          pm_break_start: null,
          pm_break_end: null
        }
      });
    }
  } catch (error) {
    console.error("Error fetching break schedule:", error);
    res.status(500).json({
      status: 500,
      message: "Error fetching break schedule",
      error: error.message
    });
  }
};