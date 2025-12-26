const express = require('express');
const salecontroller = require('../controller/salecontroller');
const setupS3Uploader = require('../appMiddlewares/s3Upload');

const router = express.Router();

setupS3Uploader().then(upload => {
    router.get('/getAllSalesByFs', salecontroller.getallsales);
    router.post('/insertSalesOrderByFS', upload.single('receipt_image_url'), salecontroller.insertSalesOrder);
    router.get('/getLatestOrderIdByFs', salecontroller.getLatestOrderId);
    router.post('/updateDispositionByFS', salecontroller.updateDisposition);
    router.post('/getLeadsHistoryDetailsByFS', salecontroller.getleadshistorydetails);
    router.post('/createShopProfileByFS', upload.single('image'), salecontroller.createShopProfileByFS);
    router.post('/updateCollection', upload.single('receipt_image_url'), salecontroller.updateCollection);
});

module.exports = router;