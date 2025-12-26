require('dotenv-flow').config();
const { authenticate } = require('./src/database/db');
const express = require('express');
const cors = require('cors');
const http = require('http');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const app = express();
const cron = require('node-cron');
const { initSocket } = require('./index');
const checkLowStock = require('./src/cronjob/lowStockJob');
const LowStockcheck = require('./src/cronjob/stocklowjob');
const eventJob = require('./src/cronjob/eventjob');
const expireUserActivityJob = require('./src/cronjob/auto-expire.js');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getAwsSecrets } = require('./src/utilities/vaultClient');

const server = http.createServer(app);
const io = initSocket(server);
global.io = io;

console.log(`🌍 Environment: ${NODE_ENV}`);
console.log(`🌍 Env origin: ${process.env.ALLOWED_ORIGINS}`);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.get('/s3-files', async (req, res, next) => {
  try {
    const { filename } = req.query;
    if (!filename) {
      return res.status(400).json({ message: 'Filename is required' });
    }

    const awsSecret = await getAwsSecrets();
    const s3 = new S3Client({
     endpoint: `https://${awsSecret.region}.${awsSecret.url}`,
      region: awsSecret.region,
      credentials: {
        accessKeyId: awsSecret.accessKeyId,
        secretAccessKey: awsSecret.secretAccessKey,
      },
    });

    const command = new GetObjectCommand({
      Bucket: awsSecret.bucket,
      Key: filename,
    });

    const data = await s3.send(command);

    // Generate caching headers
    const eTag = `"${data.ETag || filename}"`;
    const lastModified = data.LastModified || new Date();

    if (req.headers['if-none-match'] === eTag) {
      return res.status(304).end();
    }

    res.setHeader('Content-Type', data.ContentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('ETag', eTag);
    res.setHeader('Last-Modified', lastModified.toUTCString());

    data.Body.pipe(res);
  } catch (error) {
    console.error('Error retrieving file from S3:', error);
    if (error.name === 'NoSuchKey') {
      return res.status(404).json({ message: 'File not found' });
    }
    next(error);
  }
});

(async () => {
  try {
    await authenticate();

    const admin = require('./src/routes/adminroute.js');
    const employee = require('./src/routes/employeeroute.js');
    const product = require('./src/routes/productroute');
    const branch = require('./src/routes/branchroute.js');
    const users = require('./src/routes/userroute.js');
    const assign = require('./src/routes/assignroute.js');
    const leads = require('./src/routes/leadroute.js');
    const attendance = require('./src/routes/attendanceroute.js');
    const creatives = require('./src/routes/creativesroute.js');
    const dispatch = require('./src/routes/dispatchroute.js');
    const order = require('./src/routes/ordersroute.js');
    const todolist = require('./src/routes/todoroute.js');
    const track = require('./src/routes/trackingroute.js');
    const db = require('./src/routes/dbroute.js');
    const accounts = require('./src/routes/accountsroute.js');
    const client = require('./src/routes/clientroute.js');
    const sale = require('./src/routes/saleroute.js');
    const appiontment = require('./src/routes/appointmentroute.js');
    const billing = require('./src/routes/billingroute.js');
    const event = require('./src/routes/eventroute.js');
    const masters = require('./src/routes/mastersroute.js');
    const credit = require('./src/routes/creditroute.js');
    const filter = require('./src/routes/filterroute.js');
    const profile = require('./src/routes/profileroute.js');
    const reports = require('./src/routes/reportsroute.js');
    const notification = require('./src/routes/notificationroute.js');

    app.use('/', admin, product, users, employee, branch, assign, leads, attendance,
      creatives, dispatch, order, todolist, track, db, accounts, client, sale, appiontment,
      billing, event, credit, masters, profile, filter, reports,notification );

    app.get('/', (req, res) => {
      res.send('✅ Vaithiyar Poova API is running!');
    });

    cron.schedule('0 */10 * * * ', () => {
      console.log('⏱️ Running scheduled low stock check (every 10 hours)...');
      checkLowStock();
    });

     cron.schedule('0 */10 * * *', () => {
      console.log('⏱️ Running scheduled low stock  (every 10 hours)...');
      LowStockcheck();
    });

     cron.schedule('*/30 * * * *', () => {
      console.log('⏱️ Running user activity expiry check (every 30 minutes)...');
      expireUserActivityJob();
    });

   cron.schedule('*/30 * * * *', () => {
      console.log('⏱️ Running user activity expiry check (every 30 minutes)...');
      expireUserActivityJob();
    });
    

          eventJob();

    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();