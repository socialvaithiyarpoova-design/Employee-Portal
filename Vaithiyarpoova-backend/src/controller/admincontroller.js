const { getPool } = require('../database/db');
const db = getPool();
const { sendEmail } = require("../appMiddlewares/sendMail");
const jwt = require('jsonwebtoken');
const { generatePresignedUrl } = require('../utilities/s3Utils');
require('dotenv').config();

function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

async function getSidebarListFunc(usertype_id) {
    try {
        const sqlMain = `CALL SP_GetSidebarList(${usertype_id})`;
        const sqlSub = `CALL SP_GetSubSidebarList(${usertype_id})`;

        const mainList = await new Promise((resolve, reject) => {
            db.query(sqlMain, (err, results) => {
                if (err) return reject(new Error(err));
                resolve(results[0]);
            });
        });

        const subList = await new Promise((resolve, reject) => {
            db.query(sqlSub, (err, results) => {
                if (err) return reject(new Error(err));
                resolve(results[0]);
            });
        });

        return {
            usertype_id,
            mainList,
            subList
        };

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function getAccessMenu(id) {
    try {
        const sqlMain = `CALL SP_GetAllAccessMenu(${id})`;

        const mainList = await new Promise((resolve, reject) => {
            db.query(sqlMain, (err, results) => {
                if (err) return reject(new Error(err));
                resolve(results[0]);
            });
        });

        return {
            mainList
        };

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function saveAttendanceListFunc(user, loginTime, latitude, longitude) {
    const { emp_id, name, user_type, start_work_time, end_work_time } = user;
    
        const from = start_work_time || "00:00:00";
        const to = end_work_time || "00:00:00";

        // Normalize (keep only HH:mm)
        const cleanFrom = from.substring(0,5);  
        const cleanTo = to.substring(0,5);

        const today = new Date().toISOString().split("T")[0];

        let fromDate = new Date(`${today}T${cleanFrom}:00`);
        let toDate = new Date(`${today}T${cleanTo}:00`);

        if (toDate < fromDate) {
            toDate.setDate(toDate.getDate() + 1);
        }

        const diffMs = toDate - fromDate;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        const duration = `${diffHours} hours ${diffMinutes} minutes`;
    console.log(duration);

    const officePolygon = [
        [10.933149, 76.976878],
        [10.933255, 76.977004],
        [10.933137, 76.977114],
        [10.932991, 76.976896]
    ];

    function isPointInPolygon(point, polygon) {
        const [x, y] = point;
        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i];
            const [xj, yj] = polygon[j];

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }

    const isInOffice = isPointInPolygon([latitude, longitude], officePolygon);
    const status = isInOffice ? "At Office" : "WFH";

    try {
        const sqlMain = `CALL SP_saveAttendanceData(?, ?, ?, ?, ?, ?, ?)`;

        const mainList = await new Promise((resolve, reject) => {
            db.query(sqlMain, [emp_id, name, user_type, status, duration, loginTime, "Present"], (err, results) => {
                if (err) return reject(new Error(err));
                resolve(results[0]);
            });
        });

        return mainList;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

exports.logins = async (req, res) => {
    const { username, password, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: "Location required" });
    }

    try {
        const sql = 'CALL SP_LoggedInUser(?, ?)';
        
        db.query(sql, [username, password], async (err, result) => {
            if (err) {
                console.error('Error executing stored procedure:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            const rows = result[0];
            if (rows.length > 0) {
                const user = rows[0];
                const loginTime = new Date().toISOString();
                const sidebarData = await getSidebarListFunc(user.usertype_id);
                const accessMenu = await getAccessMenu(user.user_id);
                
                await saveAttendanceListFunc(user, loginTime, latitude, longitude);

                const payload = {
                    userId: user.user_id,
                    username: user.name,
                    userType: user.user_type,
                    mobile_number: user.mobile_number,
                    usertype_id: user.usertype_id,
                    user_typecode: user.user_typecode,
                    created_by: user.created_by,
                    loginTime: loginTime
                };

                
                const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
                const pmsToken = jwt.sign(sidebarData, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
                const accessUserMenu = jwt.sign(accessMenu, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

                return res.status(200).json({
                    message: 'Login successful',
                    token: token,
                    pmsToken: pmsToken,
                    accessUserMenu: accessUserMenu
                });
            } else {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.checkmail = async (req, res) => {
    const { mail } = req.body;
    if (!mail) { return res.status(400).json({ message: 'All fields are required' }); }
    try {
        const sql = `CALL SP_CheckMail('${mail}')`;
        db.query(sql, async (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            if (results[0][0].status === 200) {
                const otp = generateOtp();
                db.query('UPDATE users SET otp = ? WHERE email = ?', [otp, mail], async (err) => {
                    if (err) {
                        console.error('Database update error:', err);
                        return res.status(500).json({ error: true, message: 'Failed to update OTP' });
                    }
                    try {
                        await sendEmail(mail, {
                            template: "otp_template",
                            otp: otp,
                        });
                        return res.json([{ message: 'OTP sent to your email.', status: 200 }]);
                    } catch (error) {
                        console.error('Error sending OTP email:', error);
                        return res.status(500).json({ message: 'Failed to send OTP email' });
                    }
                });
            } else { return res.status(200).json(results[0]); }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


exports.verifyOTP = async (req, res) => {
    const { otpValue } = req.body;

    if (!otpValue) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const sql = `CALL SP_verifyOTP('${otpValue}')`;

        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }

};

exports.setpwd = async (req, res) => {
    const { pwd, mail } = req.body;

    try {
        const query = `UPDATE users SET password = SHA2(?, 256) WHERE email = ?`;

        db.query(query, [pwd, mail], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                res.status(500).send({ error: 'Error updating password' });
            } else if (result.affectedRows === 0) {
                res.status(404).send({ error: 'User not found' });
            } else {
                res.send({ success: true, message: 'Password updated successfully' });
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send({ error: 'Server error' });
    }
};

exports.putLeadCount = async (req, res) => {
    const { count, userId } = req.body;

    try {
        const sql = 'CALL SP_PutLeadCount(?, ?)';

        db.query(sql, [count, userId], (err, result) => {
            if (err) {
                console.error('Error executing stored procedure:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const rows = result[0];

            res.status(200).json({ message: 'Lead count update', data: rows });

        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.checkLeadCount = async (req, res) => {
    const { userId } = req.body;
    try {
        const sql = 'CALL SP_CheckLeadCount(?)';

        db.query(sql, [userId], (err, result) => {
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

exports.getSidebarList = async (req, res) => {
    const { usertype_id } = req.body;
    try {
        const sidebarData = await getSidebarListFunc(usertype_id);
        const token = jwt.sign(sidebarData, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({
            data: sidebarData,
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error, "")
    }
};

exports.getSingleUserData = async (req, res) => {
    const { userId } = req.params;
    try {

        const sql = 'CALL SP_GetSingleUserData(?)';
        db.query(sql, [userId],async (err, result) => {
            if (err) {
                console.error('Error executing stored procedure:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            const rows = result[0];
            if (!rows || rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            const user = rows[0];
            let imageUrl = null;
              if (user.image_url) {
                try {
                imageUrl = await generatePresignedUrl(user.image_url);
                } catch (e) {
                console.warn('⚠️ Failed to generate user image URL:', e.message);
                }
            }
            res.status(200).json({
                data: {
                    ...user,
                    image_url: imageUrl,
                },
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateLogoff = async (req, res) => {
    const { username } = req.body;

    try {
        const sql = 'CALL SP_updateLogoff(?)';

        db.query(sql, [username], (err, result) => {
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

exports.getAllCategories = async (req, res) => {

    try {
        const sql = 'CALL SP_GetAllCategoryData()';

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