const { getPool } = require('../database/db');
const { getIO } = require('../../index');

let lastSent = {}; // { inventory_recid: timestamp }

async function checkLowStock() {
  const db = getPool();
  const io = getIO();

  try {
    // 1️⃣ Find products below minimum stock
    const [inventoryRows] = await db.promise().query(`
      SELECT inventory_recid, product_id, quantity, min_stock_quantity, dispatch_id
      FROM inventory
      WHERE quantity < min_stock_quantity
    `);

    if (!inventoryRows.length) return;

    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;

    for (const inv of inventoryRows) {

      const lastTime = lastSent[inv.inventory_recid] || 0;

      if (now - lastTime < twelveHours) {
        continue; // already sent in last 12 hours
      }

      // 2️⃣ Get dispatch users of SAME BRANCH (`dispatch_id`)
      const [users] = await db.promise().query(`
        SELECT user_id 
        FROM users 
        WHERE designation = 'Dispatch'
        AND branch_rceid = ?
      `, [inv.dispatch_id]);

      if (!users.length) continue;

      const message = `⚠️ Low Stock Alert: '${inv.product_id}' is below minimum quantity.`;

      for (const user of users) {
        // 3️⃣ Insert notification
        await db.promise().query(
          `INSERT INTO notifications 
            (user_id, notification_type_id, content, source_id, source_type, created_at, updated_at)
           SELECT ?, nt.notification_type_id, ?, ?, 'inventory', NOW(), NOW()
           FROM notification_types nt
           WHERE nt.type_name = 'Low Stock Alert'`,
          [user.user_id, message, inv.inventory_recid]
        );

        // 4️⃣ Send socket message
        io.to(user.user_id.toString()).emit('LowStockAlert', {
          message,
          type: 'Low Stock Alert',
          timestamp: new Date().toISOString(),
        });
      }

      console.log(`🔔 Low stock alert sent for: ${inv.product_id}`);

      lastSent[inv.inventory_recid] = now;
    }

  } catch (error) {
    console.error('Low stock job failed:', error);
  }
}

module.exports = checkLowStock;



