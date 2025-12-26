const express = require('express');
const creativecontroller = require('../controller/creditcontroller');

const router = express.Router();

router.post('/getCrteditsData', creativecontroller.getCrteditsData);
router.post('/putStatusForCredits', creativecontroller.putStatusForCredits);
router.post('/updateCreditsData', creativecontroller.updateCreditsData);
module.exports = router;