const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authCheck = require('../middlewares/authCheck');
const roleCheck = require('../middlewares/roleCheck');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authCheck, authController.me);
router.post('/roles', authCheck, authController.createRole);
router.post('/permissions', authCheck, authController.createPermission);
router.post('/assign-role', authCheck, authController.assignRole);
router.post('/assign-role-permission', authCheck, authController.assignRolePermissions);

module.exports = router;