const express = require('express');
const attcontroller = require('../controller/attendancecontroller');

const router = express.Router();

router.post('/getUserAttendanceData', attcontroller.getUAttendanceData);
router.post('/getUserActivityDatas', attcontroller.getUserActivity);
router.post('/sendApprovalStatus', attcontroller.sendApprovalStatus);

module.exports = router;
