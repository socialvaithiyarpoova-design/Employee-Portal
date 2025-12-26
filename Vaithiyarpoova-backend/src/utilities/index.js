require('dotenv').config();
require('dotenv-flow').config();

const vault = require('node-vault');

const mountPoint = process.env.MOUNT_POINT;
const endpoint = process.env.VAULT_ENDPOINT;
const roleId = process.env.ROLE_ID;
const secretId = process.env.SECRET_ID;

const unauthVault = vault({
  apiVersion: 'v1',
  endpoint,
});

let cachedVaultClient = null;
let cachedToken = null;

async function getVaultClient() {
  if (cachedVaultClient && cachedToken) {
    return cachedVaultClient;
  }
  try {
    const { auth } = await unauthVault.approleLogin({
      role_id: roleId,
      secret_id: secretId,
    });
    console.log("✅ Vault authentication successful");
    cachedToken = auth.client_token;
    cachedVaultClient = vault({
      apiVersion: 'v1',
      endpoint,
      token: cachedToken,
    });
    return cachedVaultClient;
  } catch (err) {
    console.error("❌ Vault authentication failed:", err.message);
    throw err;
  }
}

async function getSecret(path) {
  try {
    const client = await getVaultClient();
    const secret = await client.read(`${mountPoint}/data/${path}`);
    return secret.data.data;
  } catch (err) {
    console.error(`❌ Failed to get secret from path: ${path}`, err.message);
    throw err;
  }
}

module.exports = { getSecret };
