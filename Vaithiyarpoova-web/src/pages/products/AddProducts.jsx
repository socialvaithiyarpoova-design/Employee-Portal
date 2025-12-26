import React, { useState,useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './product.css';
import graterthen from '../../assets/images/graterthen.svg';
import SvgContent from '../../components/svgcontent.jsx';
import CommonSelect from "../../components/common-select.jsx";
import configModule from '../../../config.js';
import {  useLocation, useNavigate,Link  } from 'react-router-dom';
import { useAuth } from '../../components/context/Authcontext.jsx';
import axios from 'axios';
function AddProducts() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [productUnits, setProductUnits] = useState([]);
  const [productCategory, setProductCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const config = configModule.config();
  const [units, setUnits] = useState(null);
  const [category, setCategory] = useState(null);
  const location = useLocation();
  const brandCode = location.state?.brand?.target?.code;
  const brandval = location.state?.brand?.target?.value;
  const pyCode = location.state?.ptype?.target?.code;
  const ffCode = location.state?.factor?.target?.code;
  const ptyeval = location.state?.ptype?.target?.value;
  const formfact = location.state?.factor?.target?.value;
  const isEditMode = location.state?.type === "Edit";
  const productData = location.state?.productData;
  const [vpapCode, setVpapCode] = useState("XXXXXX");
  const { user } = useAuth();
  const userId = user?.userId;
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productId: vpapCode,  
    productName: '',
    brand: brandval,
    productCategory: '',
    formFactor: formfact,
    pt: ptyeval,
    package_quantity: '',
    units: '',
    price: '',
    product_dsc: '',
    image: null  
  });

  const handleChange = (e) => {
    const { name, value } = e.target; 
    setFormData(prevState => ({
      ...prevState,
      [name]: value 
    }));
  };
   
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setFormData(prevState => ({...prevState, image: file}));
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error('Please upload a valid JPEG or PNG image.');
    }
  };
  
 const handleRemoveImage = () => {
  setFormData(prev => ({ ...prev, image: null }));
  setPreviewUrl(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
   }
 };

const getNextNumber = (lastProductid) => {
    let numbers = lastProductid || [];
    numbers = numbers.map(code => {
        let i = code.length - 1;
        while (i >= 0 && code[i] >= '0' && code[i] <= '9') {
            i--;
        }
        const numberPart = code.slice(i + 1);
        return numberPart ? parseInt(numberPart, 10) : 0;
    });
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    return (max + 1).toString().padStart(3, '0');
};

 const generateCode = (lastProductid) => {
        const prefix = brandCode;
        const number = getNextNumber(lastProductid);
        setVpapCode(`${prefix}${pyCode}${ffCode}${number}`);
        setFormData((prev) => ({
            ...prev,
            productId: `${prefix}${ffCode}${pyCode}${number}`,
        }));
 };


  const getLastProductid = async () => {
      let lastProductid= [];
          try {
                const value = `${brandCode}${ffCode}${pyCode}`;
              const response = await axios.post(`${config.apiBaseUrl}getLastProductid`, { value: value } );       
              const result = response.data;
              if (response.status === 200) {
                  if (result.data.length === 0) {
                      lastProductid = result.data;
                  } else {
                      lastProductid = [result.data[0].product_id];
                  }
                  generateCode(lastProductid);
              } else {
                  console.error("Failed to : " + result.message);
                  toast.error("Failed to fetch : " + result.message);
              }
          } catch (error) {
              console.error("Error fetching  " + error.message);
              toast.error("Error fetching: " + error.message);
         }     
  };

  useEffect(() => {
      if (!isEditMode) {
    getLastProductid();
      }
  }, []);

  const fetchData = async (endpoint, setterFunction) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      if (response.ok) {
        setterFunction(result.data || []);
      } else {
        toast.error(`Failed to fetch data: ${result.message}`);
      }
    } catch (error) {
      toast.error(`Error fetching data: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchData('productUints', setProductUnits);
    fetchData('productCategory', setProductCategory);
  }, []);



 const handleCategoryChange = (selectedOption) => {
    setCategory(selectedOption);
    setFormData(prevState => ({
      ...prevState,
      productCategory: selectedOption.target.value
    }));
  };

  const handleUnitsChange = (selectedOption) => {
    setUnits(selectedOption);
    setFormData(prevState => ({
      ...prevState,
      units: selectedOption.target.value
    }));
  };

const handleCancel = () => {
  setFormData(prev => ({
    ...prev,
    brand: prev.brand || brandval,
    productId: prev.productId || vpapCode,
    formFactor: prev.formFactor || formfact,
    pt: prev.pt || ptyeval,
    productName: '',
    productCategory: '',
    package_quantity: '',
    units: '',
    price: '',
    product_dsc: '',
    image: null  
  }));
  
  setPreviewUrl(null);        
  setUnits(null);             
  setCategory(null);              
};

useEffect(() => {
  if (isEditMode && productData) {
    setFormData({
      productId: productData.product_id,
      productName: productData.product_name,
      brand: productData.brand,
      productCategory: productData.product_category,
      formFactor: productData.form_factor,
      pt: productData.product_type,
      package_quantity: productData.package_quantity,
      units: productData.units,
      price: productData.selling_price,
      product_dsc: productData.product_description,
      image: null ,
      userId:userId
    });
    setPreviewUrl(productData.imageUrl); 
    setCategory(productData.product_category );
    setUnits(productData.units);
  }
}, [isEditMode, productData]);



const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productName || !formData.productCategory || !formData.brand  || !formData.formFactor || !formData.pt || !formData.package_quantity 
      || !formData.units || !formData.price || !formData.product_dsc) {
    toast.error("Please fill in all the required fields.");
    return;
    }

   setIsLoading(true);
    const formDataToSendAsFormData = new FormData();
    formDataToSendAsFormData.append('folder', 'products');
    formDataToSendAsFormData.append('productId', formData.productId);
    formDataToSendAsFormData.append('productName', formData.productName);
    formDataToSendAsFormData.append('productBrand', formData.brand);
    formDataToSendAsFormData.append('productCategory', formData.productCategory);
    formDataToSendAsFormData.append('formFactor', formData.formFactor);
    formDataToSendAsFormData.append('ptype', formData.pt);
    formDataToSendAsFormData.append('package_quantity', formData.package_quantity);
    formDataToSendAsFormData.append('units', formData.units);
    formDataToSendAsFormData.append('price', formData.price);
    formDataToSendAsFormData.append('product_dsc', formData.product_dsc);
    if (formData.image) {
      formDataToSendAsFormData.append('image', formData.image);
    }else if (isEditMode && previewUrl?.startsWith("http")) {
    const fileKey = previewUrl.replace("https://dev-api.vaithiyarpoovafoundation.com/s3-files?filename=", "");
    formDataToSendAsFormData.append("image", fileKey);
    }
    formDataToSendAsFormData.append('userId', userId);

    try {
       const endpoint = isEditMode
        ? `${config.apiBaseUrl}editproduct/${productData.product_recid}`
        : `${config.apiBaseUrl}addProduct`;
       const method = isEditMode ? "PUT" : "POST";
       const response = await fetch(endpoint, { method, body: formDataToSendAsFormData, });

        const result = await response.json();

        if (response.status === 200) {
             toast.success(isEditMode ? "Product updated successfully!" : "Product added successfully!");
             const responseData = result?.data;
              if (responseData) {
                fetch(`${config.apiBaseUrlpy}graph_update`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tablename: responseData.table_name,
                    type: responseData.method,
                    id: responseData.id,
                    column_name: responseData.id_column_name
                  }),
                }).catch(err => console.error("Graph update failed:", err));
              }
                handleRemoveImage();
                handleCancel();
                setTimeout(() => {
                navigate("/products");  
              }, 2000);
        } else {
          const backendError = result?.error?.sqlMessage || result?.message || "Unknown error";
          if (backendError.includes("product_img")) {
            toast.error("Please upload a product image before saving.");
          } else {
          toast.error(`${isEditMode ? "Update" : "Add"} failed: ${backendError}`);
        }
      }
    } catch (error) {
        console.error("Error adding product: ", error);
        toast.error("Error adding product: " + error.message);
    }
    finally {
    setIsLoading(false); 
  }
};

  return (
    <div className='common-body-st'>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className='header-container-products '>
        <div className=' header-product-el '>
          <div className="header-product-pvt">
            <h6 className="mt-0 mb-0 product-header-text">Add new product</h6>
            <div className="breadcrumb-container">
              <span className="breadcrumb-item"><Link className='productbacklink' to='/products'>Products</Link></span> <span className="breadcrumb-separator"> <img src={graterthen} alt='then' /> </span><span className="breadcrumb-item">Add new</span>
            </div>
          </div>
        </div>
        <div className="body-container-products-add ">
          <div className="row h-100">
            <div className="col-12 col-md-5 col-lg-5 h-100">
              <div className=" p-4 product-uplode-img ">
                <div style={{ height: "60px"}}>
                <h5>Product image</h5>
                </div>
              <div className="product-upload-container">
                <label className="upload-box w-100 h-100">
                    {previewUrl ? (
                        <>
                            <img src={previewUrl} alt="Preview" className="product-preview-image" />
                            <button className="remove-image-btn" onClick={handleRemoveImage}>
                            <SvgContent svg_name="Trash" />
                            </button>
                        </>
                    ) : (
                       <label htmlFor="imageUpload" style={{cursor:'pointer'}} className="not-getimage-st">
                            <SvgContent svg_name="upload" width="100 " height="45" />
                            <div>
                                <p className='mb-0 text-upload-st'>Upload image</p>
                                <span style={{ color: "#404040", fontSize: "12px" }}>(JPEG, PNG)</span>
                            </div>
                        </label>
                    )}
                </label>
            </div>
                <div  style={{ height: "64px"}}>
                  <div className='d-flex justify-content-end'>
                  
                      <input
                          type="file"
                          id="imageUpload"
                          ref={fileInputRef}
                          accept="image/jpeg, image/png"
                          onChange={handleImageChange}
                          className="upload-input"
                          hidden
                      />
                   <label htmlFor="imageUpload" className="product-upload-btn display-flex">
                      Upload image 
                  </label>
                  </div>
                </div>
              </div>
            </div>
          
            <div className="col-12 col-md-7 col-lg-7 h-100" >
              <div className="p-4 product-uplode-img ">
                <div className="d-flex justify-content-between align-items-center" style={{ height: "45px"}}>
                  <h5>General details</h5>
                  <div className="progress-step-wrapper d-flex justify-content-end mb-2">
                    <div className={`progress-step ${currentStep === 1 ? 'active' : ''}`}></div>
                    <div className={`progress-step ${currentStep === 2 ? 'active' : ''}`}></div>
                  </div>
                </div>
                <div className="product-card-form" >
                  <form className='mt-3'>
                    {currentStep === 1 && (
                      <>
                    <div className="row  mb-4">
                      <div className="col-6">
                        <label htmlFor="productId" className="product-form-label">Product ID</label>
                        <input
                          type="text"
                          className="product-form-input text-success fw-bold"
                          name="productId"
                          value={formData.productId}
                          disabled
                        />
                      </div>
                      <div className="col-6">
                        <label htmlFor="productName" className="product-form-label">Product name</label>
                        <input
                          type="text"
                          className="product-form-input"
                          name="productName"
                          value={formData.productName}
                          onChange={handleChange}
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                    </div>
                    <div className="row mb-4">
                      <div className=" col-6">
                        <label htmlFor="brand" className="product-form-label">Brand</label>                              
                          <input
                            type="text"
                            className="product-form-input "
                            name="brand"
                            value={formData.brand || ''}
                            disabled
                          />
                   
                      </div>
                      <div className=" col-6">
                        <label htmlFor="productCategory" className="product-form-label">Product Category</label>
                        <div className="mt-1">
                          <CommonSelect
                            name="category"
                            value={formData?.productCategory || category}
                            onChange={handleCategoryChange}
                            placeholder="Select category"
                            options={productCategory}
                          />
                        </div>
                      </div>
                    </div>
                    <div className='row mb-4'>                     
                      <div className="col-6">
                        <label htmlFor="formFactor" className="product-form-label">Form Factor</label>
                        <input
                          type="text"
                          className="product-form-input "
                          name="formFactor"
                          value={formData.formFactor || ''}
                          disabled
                        />
                      </div>
                      <div className=" col-6">
                        <label htmlFor="Product type" className="product-form-label">Product Type</label>
                        <input
                          type="text"
                          className="product-form-input "
                          name="pt"
                          value={formData.pt || ''}
                          disabled
                        />
                      </div>
                    </div>
                    <div className='row mb-4'>
                      <div className=" col-6">
                        <label htmlFor="package_quantity" className="product-form-label">Package Quantity </label>
                        <input
                          type="number"
                          className="product-form-input"
                          name="package_quantity"
                          value={formData.package_quantity}
                          onChange={handleChange}
                          placeholder="Enter package quantity"
                          min="0"
                        />
                      </div>
                      <div className=" col-6 ">
                        <label htmlFor="packageQuantity" className="product-form-label mb-2">Select Units</label>
                        <div className="mt-2">
                          <CommonSelect
                            name="units"
                            value={formData?.units || units}
                            onChange={handleUnitsChange}
                            placeholder="Select units"
                            options={productUnits}
                          />
                        </div>
                      </div>                      
                    </div>
                    <div className='row mb-4'>
                      <div className=" col-12">
                        <label htmlFor="price" className="product-form-label">Selling Price </label>
                        <input
                          type="text"
                          className="product-form-input"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="Enter selling price"
                          required
                        />
                      </div>
                      </div>
                    </>
                    )} 
                    {currentStep === 2 && (
                      <>
                     <div className='row mb-4'>
                      <div className=" col-12">
                        <label htmlFor="product_dsc" className="product-form-label">Product Description</label>                       
                        <textarea
                          name='product_dsc'
                          className=" product-form-input product-description-textarea"
                          placeholder="Enter product description"
                          rows="5"
                          value={formData.product_dsc}
                          onChange={handleChange}
                          style={{ resize: 'none' }}
                          required
                        />
                      </div>
                      </div>
                    </>
                    )}      
                  </form>
                </div>
                <div  style={{ height: "45px"}}>
                <div className="d-flex justify-content-end gap-3  mt-1" >
                  <button type="button" className="product-cancel-button" onClick={handleCancel}>Clear</button>
                  {currentStep > 1 && (
                    <button type="button" className="product-Previous-btn" onClick={() => setCurrentStep((prev) => prev - 1)}>Previous</button>
                  )}
                  {currentStep < 2 ? (
                    <button type="button" className="product-next-btn" onClick={() => setCurrentStep(2)}>Next</button>
                  ) : (
                    <button type="button" className="product-next-btn"  onClick={handleSubmit}  disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</button>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddProducts