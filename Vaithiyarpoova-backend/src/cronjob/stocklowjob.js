const { getPool } = require('../database/db');
const { getIO } = require('../../index');

let lastSent = {};

async function LowStockcheck() {
  const db = getPool();
  const io = getIO();

  try {
    const [stocks] = await db.promise().query(`
      SELECT s.stock_recid, s.stock_product_id, s.product_name, 
             s.stock_quantity, s.min_stock_qty, s.created_by, 
             u.user_id, u.designation
      FROM stock s
      JOIN users u ON s.created_by = u.user_id
      WHERE s.stock_quantity < s.min_stock_qty
    `);

    if (!stocks.length) return;

    const now = Date.now();
    const twelveHours = 10 * 60 * 60 * 1000;

    for (const stock of stocks) {
      const lastTime = lastSent[stock.stock_recid] || 0;

      if (now - lastTime < twelveHours) continue;

      const message = `⚠️ Low Stock Alert: '${stock.product_name}' (Product ID: ${stock.stock_product_id})`;

      await db.promise().query(
        `INSERT INTO notifications 
         (user_id, notification_type_id, content, source_id, source_type, created_at, updated_at)
         SELECT ?, nt.notification_type_id, ?, ?, 'stock', NOW(), NOW()
         FROM notification_types nt
         WHERE nt.type_name = 'Low Stock Alert'`,
        [stock.created_by, message, stock.stock_recid]
      );

      // 3️⃣ Emit socket event only to that creator
      io.to(stock.created_by.toString()).emit('LowStockAlert', {
        message,
        type: 'Low Stock Alert',
        timestamp: new Date().toISOString(),
      });

      console.log(`🔔 Low stock alert sent to user ${stock.created_by} for: ${stock.product_name}`);

      // 4️⃣ Update lastSent tracker
      lastSent[stock.stock_recid] = now;
    }
  } catch (error) {
    console.error('Low stock job failed:', error);
  }
}

module.exports = LowStockcheck;
