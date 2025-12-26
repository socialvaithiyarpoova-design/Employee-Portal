const express = require('express');
const ordercontroller = require('../controller/ordercontroller');

const router = express.Router();

router.post('/getOrderDetails', ordercontroller.getallorder);
router.post('/getOrderListDis', ordercontroller.getallorderdis);
router.post('/getProductData', ordercontroller.getproductdata);
router.post('/putStatus', ordercontroller.putstatus);
router.post('/updateDisOrders', ordercontroller.updatedisorders);
router.post('/getPurchaseDatas', ordercontroller.getpurchasedatas);
router.post('/reduce-stock', ordercontroller.reduceProductStock);
router.post('/getapprovel', ordercontroller.getapprovel);
router.post('/getBillingDetails', ordercontroller.getBillingDetails);
router.post('/getClassDetails', ordercontroller.getClassDetails);
router.post('/getConsultingDetails', ordercontroller.getConsultingDetails);
router.post('/getWalletDetails', ordercontroller.getWalletDetails);
router.post('/approveclass', ordercontroller.approveclass);
router.post('/rejectclass', ordercontroller.rejectclass);
router.post('/approveBilling', ordercontroller.approveBilling);
router.post('/rejectBilling', ordercontroller.rejectBilling);
router.post('/rejectWallet', ordercontroller.rejectWallet);
router.post('/rejectConsulting', ordercontroller.rejectConsulting);
router.post('/approveWallet', ordercontroller.approveWallet);
router.post('/approveConsulting', ordercontroller.approveConsulting);
module.exports = router;