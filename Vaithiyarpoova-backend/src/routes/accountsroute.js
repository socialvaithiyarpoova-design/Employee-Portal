const express = require('express');
const acccontroller = require('../controller/accountscontroller');
const router = express.Router();
const setupS3Uploader = require('../appMiddlewares/s3Upload');

setupS3Uploader().then(upload => {
router.get('/getGSTListDetails', acccontroller.getgstlistdetails);
router.post('/onGstforPurchase', acccontroller.ongstforpurchase);
router.post('/savePremiumData', acccontroller.savepremiumdata);
router.post('/getAccountsData', acccontroller.getaccountsdata);
router.post('/getAccountsDataByEmp', acccontroller.getaccountsdatabyemp);
router.post('/saveExpenseAmountMonth', upload.single('receipt_image'),  acccontroller.saveExpenseAmountMonth);
router.get('/getLeadDesignationData', acccontroller.getLeadDesignationData);
router.post('/saveTragetAmount', acccontroller.saveTragetAmount);
router.post('/getAccountsExpenseData', acccontroller.getAccountsExpenseData);
router.post('/getAccountsEXPDataByEmp', acccontroller.getAccountsEXPDataByEmp);
router.post('/getOtherExpAllData', acccontroller.getOtherExpAllData);
router.post('/getExpensesList', acccontroller.getExpensesList);
router.post('/updateExpenseStatus', acccontroller.updateExpenseStatus);
router.post("/updateGSTHSNData", acccontroller.updateGSTData);
router.post("/handlDeleteGstHsn", acccontroller.softDeleteGstHsn);
router.post("/addGSTHSNValues", acccontroller.addGSTHSNValues);
});

module.exports = router;
