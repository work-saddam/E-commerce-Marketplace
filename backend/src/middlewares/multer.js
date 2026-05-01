const path = require("path");
const multer = require("multer");

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const isAllowedMimeType = ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype);
  const isAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.has(extension);

  if (!isAllowedMimeType || !isAllowedExtension) {
    return cb(
      new Error("Only JPG, JPEG, PNG, and WEBP image uploads are allowed."),
      false,
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

const getUploadErrorResponse = (error) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return {
        status: 413,
        message: "Image size must be 5 MB or less.",
      };
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return {
        status: 400,
        message: "Unexpected upload field received.",
      };
    }
  }

  return {
    status: 400,
    message: error.message || "File upload failed.",
  };
};

const singleImageUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (!error) {
      return next();
    }

    const { status, message } = getUploadErrorResponse(error);
    return res.status(status).json({ message });
  });
};

module.exports = {
  singleImageUpload,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_MIME_TYPES: [...ALLOWED_IMAGE_MIME_TYPES],
};
