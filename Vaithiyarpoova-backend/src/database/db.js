require('dotenv-flow').config();
const mysql = require('mysql2');
const { getSecret } = require('../utilities/index');

let pool;

async function authenticate() {
  const secret = await getSecret(process.env.MYSQL_SECRET_PATH);
  const { DB_HOST: host, DB_USER: user, DB_PASSWORD: password, DB_NAME: database, DB_PORT } = secret;
  if (!user || !password || !host || !database) {
    throw new Error('Missing MySQL Vault creds');
  }

  pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port: parseInt(DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "local", 
    dateStrings: true  
  });

  console.log('✅ MySQL pool created');
  return pool;
}

function getPool() {
  return pool; 
}

module.exports = {
  authenticate,
  getPool,
};

