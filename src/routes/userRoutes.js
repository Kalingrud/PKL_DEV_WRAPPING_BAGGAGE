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
router.post('/login', UserController.login);   // route untuk login

//check trx
router.post('/Check_Trx', UserController.Check_Trx)  //route untuk check transaksi

//grabdata_payment
router.post('/grabdata_payment', UserController.grabdata_payment)  //route untuk payment data


//grabdata_price
router.post('/grabdata_price', UserController.grabdata_price)  //route untuk price list

// Penjualan trx
router.post('/lingga_trx', UserController.lingga_trx);  //route untuk penjualan

// Universal CRUD route 
router.post('/lingga_crud', UserController.lingga_crud); //route untuk universal CRUD
router.post('/Grab_Setup', UserController.Grab_Setup);



module.exports = router;
