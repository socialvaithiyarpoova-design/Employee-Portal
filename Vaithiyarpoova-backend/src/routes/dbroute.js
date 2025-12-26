const express = require('express');
const dbcontroller = require('../controller/dbcontroller');

const router = express.Router();

router.post('/getDashboardDataUT', dbcontroller.getdbdataut);
module.exports = router;