const express = require('express');
const trackcontroller = require('../controller/trackingcontroller');

const router = express.Router();

router.post('/getOrderDetailsForTrack', trackcontroller.gettrackingdata);

module.exports = router;
