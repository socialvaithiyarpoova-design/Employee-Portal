const { getPool } = require('../database/db');
const db = getPool();

exports.getAssignPages = async (req, res) => {
    const { id, code } = req.body;

    const sqlPg = `CALL SP_GetAllPages()`;
    const sqlUd = `CALL SP_GetAllUserType(${id},'${code}')`;
    const sqlUsers = `CALL SP_GetAllUsers(${id},'${code}')`;
    
    try {
        db.query(sqlPg, (errPg, resultPg) => {
            if (errPg) {
                console.error('Error getting pages:', errPg);
                return res.status(500).json({ message: 'Failed to get page lists' });
            }

            db.query(sqlUd, (errUt, resultUt) => {
                if (errUt) {
                    console.error('Error getting user types:', errUt);
                    return res.status(500).json({ message: 'Failed to get user type lists' });
                }

                db.query(sqlUsers, (errUsr, resultUsr) => {
                    if (errUsr) {
                        console.error('Error getting users:', errUsr);
                        return res.status(500).json({ message: 'Failed to get user lists' });
                    }

                    res.status(200).json({
                        pages: resultPg[0],
                        userTypes: resultUt[0],
                        users: resultUsr[0]
                    });
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.saveAccessMenu = (req, res) => {
    try {
        const userId = parseInt(req.body.user_id, 10);
        const changes = Array.isArray(req.body.changes) ? req.body.changes : [];
        
        if (!userId || changes.length === 0) {
            return res.status(400).json({ message: 'user_id and changes are required' });
        }

        const toBit = (v) => (v ? 1 : 0);

        const callSp = (change) => new Promise((resolve, reject) => {
            const {
                menu_id,
                active_btn = 0,
                inactive_btn = 0,
                view_btn = 0,
                upload_btn = 0,
                search_btn = 0,
                filter_btn = 0,
                shuffle_btn = 0,
                suffle_btn = 0,
                export_btn = 0,
                add_btn = 0,
                edit_btn = 0,
                delete_btn = 0,
                permission_btn = 0,
                break_btn = 0,
                event_btn = 0,
                history_btn = 0,
                purchase_history_btn = 0,
                consulting_history_btn = 0,
                upgrade_btn = 0,
                gst_btn = 0,
                premium_btn = 0,
                add_target_btn = 0,
                schedule_btn = 0,
                category_btn = 0,
                people_btn = 0,
                shop_btn = 0,
                class_btn = 0,
                wallet_btn = 0,
                update_btn = 0,
                create_profile_btn = 0,
                events_btn = 0,
                leave_permission_btn = 0,
                list_btn = 0,
                attendance_btn = 0,
                add_new_btn = 0,
                expense_btn = 0
            } = change || {};
            if (!menu_id) return reject(new Error('menu_id is required'));

            const params = [
                userId,
                parseInt(menu_id, 10),
                toBit(active_btn),
                toBit(inactive_btn),
                toBit(view_btn),
                toBit(upload_btn),
                toBit(search_btn),
                toBit(filter_btn),
                toBit(shuffle_btn || suffle_btn),
                toBit(export_btn),
                toBit(add_btn),
                toBit(edit_btn),
                toBit(delete_btn),
                toBit(permission_btn),
                toBit(break_btn),
                toBit(event_btn),
                toBit(history_btn),
                toBit(purchase_history_btn),
                toBit(consulting_history_btn),
                toBit(upgrade_btn),
                toBit(gst_btn),
                toBit(premium_btn),
                toBit(add_target_btn),
                toBit(schedule_btn),
                toBit(category_btn),
                toBit(people_btn),
                toBit(shop_btn),
                toBit(class_btn),
                toBit(wallet_btn),
                toBit(update_btn),
                toBit(create_profile_btn),
                toBit(events_btn),
                toBit(leave_permission_btn),
                toBit(list_btn),
                toBit(attendance_btn),
                toBit(add_new_btn),
                toBit(expense_btn),
            ];
            const placeholders = new Array(params.length).fill('?').join(', ');
            console.log(params.length);
            
            const sql = `CALL SP_SaveAccessUserMenu(${placeholders})`;
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error('SP_SaveAccessUserMenu error:', err, { sql, params });
                    return reject(err);
                }
                return resolve(result);
            });
        });

        Promise.all(changes.map(callSp))
            .then(() => {
                return res.status(200).json({ message: 'Access saved' });
            })
            .catch((err) => {
                console.error('Error saving access:', err);
                res.status(500).json({ message: err?.sqlMessage || err?.message || 'Failed to save access' });
            });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};