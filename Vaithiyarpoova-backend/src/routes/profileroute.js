const express = require('express');
const profilecontroller = require('../controller/profilecontroller');

const router = express.Router();

router.post('/getProfileData', profilecontroller.getProfileData);

module.exports = router;
