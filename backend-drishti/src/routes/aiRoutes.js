import express from 'express';
import { getAIStatus, updateAIConfig } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', getAIStatus);
router.post('/config', updateAIConfig);

export default router;
