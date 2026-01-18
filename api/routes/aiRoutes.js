import express from 'express';
import * as aiController from '../controllers/aiController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiting to all AI routes
router.use(apiLimiter);

router.post('/prompt', aiController.prompt);
router.post('/summarizer', aiController.summarizer);
router.post('/writer', aiController.writer);
router.post('/rewriter', aiController.rewriter);
router.post('/translator', aiController.translator);
router.post('/language-detector', aiController.languageDetector);
router.post('/proofreader', aiController.proofreader);

export default router;
