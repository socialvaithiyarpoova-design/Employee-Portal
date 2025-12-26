const express = require('express');
const appointcontroller = require('../controller/appointmentcontroller');

const router = express.Router();

router.post('/getAppointmentData', appointcontroller.getappointmentdata);
router.post('/slotBookingDetails', appointcontroller.slotBookingDetails);
router.post('/getReservedData', appointcontroller.getReservedData);
router.post('/delBookingDetails', appointcontroller.delBookingDetails);
router.post('/addComment', appointcontroller.addComment);

module.exports = router;
