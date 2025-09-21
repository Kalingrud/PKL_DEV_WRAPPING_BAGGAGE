const express = require('express');
const UserController = require('../controllers/userController');
const router = express.Router();

// User CRUD routes
router.post('/create', UserController.create);
router.get('/read', UserController.read);    // GET untuk query params
router.post('/read', UserController.read);   // POST untuk body params
router.post('/update', UserController.update);
router.post('/delete', UserController.delete); // Bisa delete via ID atau username

// Login route
router.post('/login', UserController.login);

// Penjualan Iffat route
router.post('/penjualan_iffat', UserController.penjualan_iffat);

// Universal CRUD route
router.post('/universal-crud', UserController.universalCrud);


module.exports = router;
