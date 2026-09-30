import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept standard image types
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload a valid image (JPEG, PNG, WebP).'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  },
  fileFilter,
});
