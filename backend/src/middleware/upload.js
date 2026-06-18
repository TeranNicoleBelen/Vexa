const multer = require('multer');
const path = require('path');
const fs = require('fs');

let storage;

// En producción, usar Cloudinary; en desarrollo, usar disco local
if (process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
  const CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;
  const cloudinary = require('cloudinary').v2;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'vexa-productos',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
  });
} else {
  // Desarrollo local - guardar en disco
  const uploadDir = path.join(__dirname, '../../uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, 'img-' + uniqueSuffix + ext);
    }
  });
}

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter
});

module.exports = upload;