const express = require('express');
const admincontroller = require('../controller/admincontroller');

const router = express.Router();

router.post('/login', admincontroller.logins);
router.post('/checkMail', admincontroller.checkmail);
router.post('/verifyOTP', admincontroller.verifyOTP);
router.post('/SetPassword', admincontroller.setpwd);
router.post('/SaveLeadCount', admincontroller.putLeadCount);
router.post('/CheckLeadCount', admincontroller.checkLeadCount);
router.post('/GetSidebarList', admincontroller.getSidebarList);
router.post('/getSingleUserData/:userId', admincontroller.getSingleUserData);
router.post('/updateLogoff', admincontroller.updateLogoff);
router.get('/getAllCategories', admincontroller.getAllCategories);

module.exports = router;
