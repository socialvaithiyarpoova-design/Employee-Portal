const express = require('express');
const filtercontroller = require('../controller/filtercontroller');

const router = express.Router();

router.post('/getFilterOption', filtercontroller.getAllFilterOption);
router.post('/getEmployeeOption', filtercontroller.getEmployeeOption);

module.exports = router;
