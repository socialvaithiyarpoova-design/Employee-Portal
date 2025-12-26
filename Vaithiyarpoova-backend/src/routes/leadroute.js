const express = require('express');
const leadcontroller = require('../controller/leadcontroller');
const setupS3Uploader = require('../appMiddlewares/s3Upload');

const router = express.Router();

setupS3Uploader().then(upload => {
    router.post('/getAllLeadDetails', leadcontroller.getallleads);
    router.post('/getLeadPool', leadcontroller.getLeadPool);
    router.post('/getLeadPoolSummary', leadcontroller.getLeadPoolSummary);
    router.post('/InsertLeadBulk', leadcontroller.uploadBulkLeads);
    router.post('/getAllLeadsDataForCl', leadcontroller.getallleadsforcl);
    router.post('/updateDisposition', leadcontroller.updateDisposition);
    router.post('/getAllProductListSale', leadcontroller.getallproducts);
    router.post('/createProfileData', leadcontroller.createprofileData);
    router.post('/insertSalesOrder', upload.single('receipt_image_url'), leadcontroller.insertSalesOrder);
    router.get('/getLatestOrderId', leadcontroller.getLatestOrderId);
    router.get('/getLatestClassId', leadcontroller.getLatestClassId);
    router.post('/getADBranchList', leadcontroller.getadminbranchlist);
    router.post('/insertClassOrder', upload.single('receipt_image_url'), leadcontroller.insertclassOrder);
    router.post('/insertWalletData', upload.single('receipt'), leadcontroller.insertWalletData);
    router.get('/getInFertilityDatas', leadcontroller.getInFertilityDatas);
    router.post('/getMaleCause', leadcontroller.getmalecause);
    router.post('/getFemaleCause', leadcontroller.getfemalecause);
    router.get('/getAllVaithiyarList', leadcontroller.getallvaithiyarlist);
    router.post('/saveConsultingAppointment', upload.single('receipt_image'), leadcontroller.saveconsultingappointment);
    router.post('/getLeadsHistoryDetails', leadcontroller.getleadshistorydetails);
    router.post('/shuffleLeads', leadcontroller.shuffleLeads);
    router.post('/getAllTimeslotList', leadcontroller.gettimes);
    router.get('/gstpercent', leadcontroller.getGstPercentage);
    router.get("/getWalletByLead/:lead_recid", leadcontroller.getWalletByLead);
    router.post('/wallet-balance',leadcontroller.walletbalance);

});

module.exports = router;