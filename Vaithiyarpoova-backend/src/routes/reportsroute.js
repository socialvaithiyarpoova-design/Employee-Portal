const express = require('express');
const router = express.Router();
const reportsController = require('../controller/reportscontroller');

// Get reports data
router.post('/getReportsData', reportsController.getReportsData);

module.exports = router;
