const express = require('express');
const creativecontroller = require('../controller/creativescontroller');

const router = express.Router();

router.post('/getCreativeServices', creativecontroller.getallcreatives);
router.post('/saveCreativeService', creativecontroller.savecreativeservice);
router.post('/updateCreativeStatus', creativecontroller.updateCreativeStatus);
router.post('/getEmployeeListForCS', creativecontroller.getEmployeeListForCS);
router.post('/getcreativesbyemp', creativecontroller.getcreativesbyemp);
router.post('/updateCreativeService', creativecontroller.updateCreativeService);
router.delete('/deleteCreative/:creativeId', creativecontroller.deleteCreative);
module.exports = router;