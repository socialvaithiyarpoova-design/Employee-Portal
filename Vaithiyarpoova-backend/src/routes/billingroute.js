const express = require('express');
const billcontroller = require('../controller/billingcontroller');

const setupS3Uploader = require('../appMiddlewares/s3Upload');

const router = express.Router();

setupS3Uploader().then(upload => {
    router.get('/getAllCatagoryList', billcontroller.getallcat);
    router.post('/getallproductsbilling', billcontroller.getallproductsbilling);
    router.post('/insertbillingOrder', upload.single('receipt_image_url'), billcontroller.insertBillingOrder);
    router.post('/getallbilling', billcontroller.getBilling);
    router.post('/getBillingDetails', billcontroller.getBillingDetails);
});

module.exports = router;