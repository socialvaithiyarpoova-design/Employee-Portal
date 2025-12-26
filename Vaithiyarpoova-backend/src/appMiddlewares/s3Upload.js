const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const { getAwsSecrets } = require('../utilities/vaultClient');

let uploadInstance = null;

async function setupS3Uploader() {
  if (uploadInstance) return uploadInstance;

  const awsSecret = await getAwsSecrets();

  const s3 = new S3Client({
    endpoint: `https://${awsSecret.region}.${awsSecret.url}`,
    region: awsSecret.region,
    credentials: {
      accessKeyId: awsSecret.accessKeyId,
      secretAccessKey: awsSecret.secretAccessKey,
    },
  });

  uploadInstance = multer({
    storage: multerS3({
  s3,
  bucket: awsSecret.bucket,
  contentDisposition: 'inline', // 
  contentType: multerS3.AUTO_CONTENT_TYPE, // 
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const rawFolder = req.body.folder || 'uploads';
    const folder = rawFolder.replace(/[^a-zA-Z0-9-_]/g, '');
    const timestamp = Date.now();
    const fileName = file.originalname.replace(/\s+/g, '_');
    const key = `${folder}/${timestamp}_${fileName}`;
    cb(null, key);
  },
}),
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        // Images
        'image/jpeg', 'image/png', 'image/jpg',
        // Videos
        'video/mp4', 'video/mpeg', 'video/quicktime',
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image, video, and document files are allowed'), false);
      }
    },

    limits: {
      fileSize: 20 * 1024 * 1024, 
    },
  });

  return uploadInstance;
}

module.exports = setupS3Uploader;
