const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploader = (subFolder = '') => {
  const uploadDir = path.join(__dirname, '../uploads', subFolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  });
};

module.exports = {
  uploadProcessAudit: createUploader('processAudit'),
  uploadIhlr: createUploader('ihlr'),
  uploadTryOutStatus: createUploader('tryOutStatus'),
  createUploader
};
