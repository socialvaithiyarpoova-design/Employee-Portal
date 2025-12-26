const express = require('express');
const assigncontroller = require('../controller/assigncontroller');

const router = express.Router();

router.post('/getAssignDetails', assigncontroller.getAssignPages);
router.post('/saveAccessMenu', assigncontroller.saveAccessMenu);

module.exports = router;