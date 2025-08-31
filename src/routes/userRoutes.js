const express = require('express');
const UserController = require('../controllers/userController');
const router = express.Router();

// User CRUD routes
router.post('/create', UserController.create);
router.get('/read', UserController.read);
router.post('/read', UserController.read);
router.post('/update', UserController.update);
router.post('/delete', UserController.delete);

module.exports = router;
