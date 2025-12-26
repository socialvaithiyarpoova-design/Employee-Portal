const cron = require('node-cron');
const { getPool } = require('../database/db');
const { getIO } = require('../../index');

module.exports = () => {
    const db = getPool();
    const io = getIO();

    let cachedNotificationTypeId = null;

    const getCachedNotificationTypeId = (callback) => {
        if (cachedNotificationTypeId) {
            callback(null, cachedNotificationTypeId);
            return;
        }

        const typeSQL = `SELECT notification_type_id FROM notification_types LIMIT 1`;
        db.query(typeSQL, (err, result) => {
            if (err) {
                console.error(`❌ Error fetching notification type:`, err);
                callback(err);
                return;
            }

            if (!result || result.length === 0) {
                console.error(`❌ notification_types table is empty`);
                callback(new Error('No notification types found'));
                return;
            }

            cachedNotificationTypeId = result[0].notification_type_id;
            callback(null, cachedNotificationTypeId);
        });
    };


    const insertNotificationAndEmit = (recipientId, message, event, typeName) => {
        if (!recipientId) return;

        getCachedNotificationTypeId((err, notification_type_id) => {
            if (err) {
                console.error(`❌ Cannot insert notification:`, err);
                return;
            }

            const notifSQL = `
                INSERT INTO notifications (
                    user_id, notification_type_id, content,
                    source_id, source_type, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `;

            db.query(
                notifSQL,
                [recipientId, notification_type_id, message, event.event_id, event.action],
                (errNotif, result) => {
                    if (errNotif) {
                        console.error(`❌ Error inserting notification for user ${recipientId}:`, errNotif);
                        return;
                    }

                    console.log(`✅ Notification inserted for user ${recipientId}`);

                    // Emit socket notification
                    io.to(recipientId.toString()).emit('eventReminder', {
                        message,
                        type: event.action === 'holiday' ? 'Holiday Reminder' : typeName,
                        timestamp: new Date().toISOString(),
                        event_id: event.event_id
                    });
                }
            );
        });
    };

    /**
     * Notify all employees in the same branch (except the person celebrating)
     */
    const notifyAllEmployees = (event, message, messageType) => {
        if (!event.branch_rceid) {
            console.warn(`⚠️ No branch_rceid for event ${event.event_id}`);
            return;
        }

        const allEmployeesSQL = `
            SELECT DISTINCT u.user_id, u.name
            FROM users u
            WHERE u.isDeleted = 0
            AND u.user_id != ?
            AND u.branch_rceid = ?
        `;

        db.query(
            allEmployeesSQL,
            [event.created_to, event.branch_rceid],
            (err, employees) => {
                if (err) {
                    console.error('❌ Error fetching branch employees:', err);
                    return;
                }

                if (!employees || employees.length === 0) {
                    console.log('✅ No other employees in branch to notify');
                    return;
                }

                let sentCount = 0;
                employees.forEach(employee => {
                    const teamMessage = `${message} - Share your wishes! 👋`;
                    insertNotificationAndEmit(
                        employee.user_id,
                        teamMessage,
                        event,
                        messageType
                    );
                    sentCount++;
                });

                console.log(`✅ Sent notifications to ${sentCount} employees in branch ${event.branch_rceid} for ${event.employee_name}`);
            }
        );
    };

    /**
     * Main cron job: Runs daily at 9:00 AM
     * Format: second minute hour day month day_of_week
     * '0 9 * * *' = Every day at 9:00 AM
     */
     cron.schedule('0 9 * * *', () => {
        console.log('🎯 Running event greeting job (for today)...');

        const sqlToday = `
            SELECT 
                e.event_id, 
                e.action, 
                e.type, 
                e.remark, 
                e.target, 
                e.created_to,
                e.created_by, 
                u.name AS employee_name, 
                u.email AS employee_email,
                u.branch_rceid,
                cu.designation
            FROM events e
            LEFT JOIN users u ON e.created_to = u.user_id
            JOIN users cu ON e.created_by = cu.user_id
            WHERE DATE_FORMAT(e.event_date, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
            AND e.type IN ('Birthday', 'Anniversary')
            AND u.isDeleted = 0
            AND cu.isDeleted = 0
            AND u.user_id IS NOT NULL
        `;

        db.query(sqlToday, (err, events) => {
            if (err) {
                console.error('❌ Error fetching today events:', err);
                return;
            }

            if (!events || events.length === 0) {
                console.log('✅ No birthdays/anniversaries today.');
                return;
            }

            console.log(`📢 Found ${events.length} event(s) for today`);

            events.forEach(event => {
                let message = '';
                let messageType = '';

                if (event.type === 'Birthday') {
                    message = `🎂 Happy Birthday ${event.employee_name || 'there'}! 🎉`;
                    messageType = 'Birthday';
                } else if (event.type === 'Anniversary') {
                    message = `💍 Happy Work Anniversary ${event.employee_name || 'there'}! 💐`;
                    messageType = 'Workiversary';
                }

                // Send to the person celebrating
                if (event.created_to) {
                    insertNotificationAndEmit(
                        event.created_to,
                        message,
                        event,
                        messageType
                    );
                    console.log(`✅ Personal greeting sent for ${event.type} to ${event.employee_name} (user: ${event.created_to})`);
                }

                notifyAllEmployees(event, message, messageType);
            });
        });
    });


};