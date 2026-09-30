import express from 'express';
import { createScan, getScans, getScanById, deleteScan } from '../controllers/scanController.js';
import { optionalAuth, protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Allow scanning with optional auth so users can test immediately without barrier
router.post('/', apiLimiter, optionalAuth, upload.single('image'), createScan);
router.get('/', optionalAuth, getScans);
router.get('/:id', optionalAuth, getScanById);
router.delete('/:id', optionalAuth, deleteScan);

export default router;
