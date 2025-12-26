const express = require('express');
const evecontroller = require('../controller/eventcontroller');

const router = express.Router();

router.post('/saveEventDetails', evecontroller.saveEvent);
router.get('/getEventDetails', evecontroller.getEventDetails);
router.post('/saveBrakeSchedule', evecontroller.saveBrakeSchedule);
router.post('/savePermission', evecontroller.savePermission);
router.get('/getbreak', evecontroller.getbreak );

module.exports = router;