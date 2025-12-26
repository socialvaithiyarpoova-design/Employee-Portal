const express = require('express');
const empcontroller = require('../controller/employeecontroller');
const router = express.Router();
const setupS3Uploader = require('../appMiddlewares/s3Upload');

setupS3Uploader().then(upload => {
router.get('/getDesignationList', empcontroller.getDesignationList);
router.post('/getLastEmpID', empcontroller.getLastEmpID);
router.post('/saveEmpDetails', upload.single('image_url') , empcontroller.saveEmpDetails);
router.post('/getEmployeeList', empcontroller.getEmployeeList);
router.post('/updateEmpDetails', upload.single('image_url'), empcontroller.updateEmployee);
router.post('/deleteSelEmployee', empcontroller.deleteSelEmployee);
router.post('/assignTaskToOther', empcontroller.assignTaskToOther);
router.post('/GetClientsCountList', empcontroller.GetClientsCountList);
router.post('/getCreativeServicesEmployees', empcontroller.getCreativeServicesEmployees);
router.post('/getAllPayrolls', empcontroller.getAllPayrolls);
router.post('/getbranchs', empcontroller.getbranchs);
});

module.exports = router;
