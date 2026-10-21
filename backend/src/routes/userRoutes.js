const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/me/documents', userController.getMyDocuments);
router.get('/me/profile', userController.getMyProfile);
router.patch('/me/profile', userController.updateMyProfile);
router.delete('/me/account', userController.deleteMyAccount);

module.exports = router;
