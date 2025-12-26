const { getSecret } = require('./index');
require('dotenv').config();

let mailinstance = null;
let awsSecretCache = null;

async function mailSecrets() {
  if (mailinstance) return mailinstance;
  const secret = await getSecret(process.env.Mail_KEY);
   mailinstance = {
    FROM_EMAIL: secret.FROM_EMAIL,
    MAIL_HOST: secret.MAIL_HOST,
    MAIL_PORT: parseInt(secret.MAIL_PORT) || 587,
    MAIL_USER: secret.MAIL_USER,
    MAIL_PASS: secret.MAIL_PASS
  };

  console.log("Mail secrets loaded:", mailinstance);
  return mailinstance;
}

async function getAwsSecrets() {
  if (awsSecretCache) return awsSecretCache;

  const secret = await getSecret(process.env.AWS_KEY);

  awsSecretCache = {
    accessKeyId: secret.Access_Key,
    secretAccessKey: secret.Secret_Key,
    region: secret.Region || 'ap-south-1', 
    bucket: secret.Bucket || null,
    url: secret.URL || 'digitaloceanspaces.com'
  };

  return awsSecretCache;
}


module.exports = {mailSecrets,getAwsSecrets};
