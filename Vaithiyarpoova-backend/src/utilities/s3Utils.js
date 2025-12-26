// utilities/s3Utils.js
const generatePresignedUrl = async (objectKey) => {
  try {
    // Build URL that points to your backend proxy route
    const baseUrl = process.env.BE_SITE || 'http://localhost:3001/';
    return `${baseUrl}/s3-files?filename=${objectKey}`;
  } catch (error) {
    console.error("Error generating signed URL", error);
    return null;
  }
};

module.exports = { generatePresignedUrl };
