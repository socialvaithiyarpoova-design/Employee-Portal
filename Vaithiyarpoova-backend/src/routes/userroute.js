const express = require('express');
const usercontroller = require('../controller/usercontroller');

const router = express.Router();

router.post('/insertLeave', usercontroller.insertLeave);
router.post('/insertPermission', usercontroller.insertPermission);
router.post('/getstatus/:userId', usercontroller.getstatus);
router.post('/getCollectionData', usercontroller.getCollectionData);
module.exports = router;