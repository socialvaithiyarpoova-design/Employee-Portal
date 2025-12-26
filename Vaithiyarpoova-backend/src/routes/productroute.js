const express = require('express');
const productcontroller = require('../controller/productcontroller');
const setupS3Uploader = require('../appMiddlewares/s3Upload');
const router = express.Router();

setupS3Uploader().then(upload => {
    router.get('/getAllProductTypes', productcontroller.GetAllProductTypes);
    router.get('/getformfactor', productcontroller.GetFormfactors);
    router.get('/productUints', productcontroller.ProductUints);
    router.get('/productCategory', productcontroller.ProductCategory);
    router.get('/productBrand', productcontroller.ProductBrand);
    router.post('/getLastProductid', productcontroller.getLastProductID);
    router.post('/addProduct', upload.single('image'), productcontroller.AddProduct);
    router.post('/getProduct', productcontroller.GetProduct);
    router.post('/getProductcount', productcontroller.GetProductCount);
    router.put('/editproduct/:product_recid', upload.single('image'), productcontroller.EditeProduct);
    router.delete('/product/:product_recid', productcontroller.DeleteProduct);
    router.post('/inventoryfilter', productcontroller.Exportinventory);
    router.post('/inventoryfilter_json', productcontroller.ExportinventoryJson);
    router.post('/addstocks', productcontroller.Addstocks);
    router.post('/gettocks', productcontroller.Getstocks);
    router.put('/stockupdate/:stock_recid', productcontroller.Editstockqty);
});

module.exports = router;
