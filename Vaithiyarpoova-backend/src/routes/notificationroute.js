const express = require('express');
const router = express.Router();
const empcontroller = require('../controller/notificationcontroller'); 

router.put('/notifications/:userId/read',empcontroller.markNotificationAsRead);
router.get('/getnotifications/:userId',empcontroller.getnotification);

module.exports = router;