const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authCheck = require('../middlewares/authCheck');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authCheck, authController.me);

module.exports = router;