const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const aiController = require('../controllers/aiController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadLimiter, aiLimiter } = require('../middleware/rateLimiter');

// Public read endpoints
router.get('/', optionalAuth, documentController.getDocuments);
router.get('/stats', documentController.getSystemStats);
router.get('/subjects', documentController.getDistinctSubjects);
router.get('/:id', optionalAuth, documentController.getDocumentById);

// Protected upload and mutation endpoints
router.post(
  '/',
  authenticate,
  uploadLimiter,
  upload.single('file'),
  documentController.uploadDocument
);

router.patch('/:id', authenticate, documentController.updateDocument);
router.delete('/:id', authenticate, documentController.deleteDocument);

// AI RAG Question & Answer endpoint
router.post('/:id/ask', authenticate, aiLimiter, aiController.askQuestion);

module.exports = router;
