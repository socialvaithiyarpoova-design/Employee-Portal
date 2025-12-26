import React, { useState, useEffect } from "react";
import { PropagateLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import "../../assets/styles/addtocard.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import configModule from "../../../config.js";
import SvgContent from "../../components/svgcontent.jsx";
import { Select, MenuItem, InputLabel, FormControl, Chip, Box} from "@mui/material";
import { useAuth } from '../../components/context/Authcontext.jsx';

function AddToCartBySale() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = configModule.config();
  const [catagory, setCatagory] = useState([]);
  const { user} = useAuth();
  const userId = user?.userId;
  const categoryList = catagory;
  const rowData = location?.state?.selectedData || [];
  const [needLoading, setNeedLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [productList, setProductList] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [productMetadata, setProductMetadata] = useState({});

  const getLeadsPage = async () => {
    setNeedLoading(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}getAllLeadsDataForCl`, {
        userId: userId
      });
      const result = response.data;
      if (response.status === 200) {
        setCatagory(result.categories);
      } else {
        toast.error("Failed to fetch designation list: " + result.message);
      }
    } catch (error) {
      toast.error("Error fetching designation list: " + (error.response?.data?.message || error.message));
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getLeadsPage();
    }
  }, [user]);

  const TypeOptions = Array.isArray(categoryList)
    ? categoryList.map((item) => ({
        label: item.category_name,
        value: item.category_id,
        name: item.category_name,
      }))
    : [];


  const initialSelectedType = TypeOptions.find(
    (option) => option.label?.toLowerCase() === rowData?.category?.toLowerCase()
  );

  const [type, setType] = useState(
    initialSelectedType ? [initialSelectedType.value] : []
  );

  const handleQuantityChange = (productId, delta) => {
    setQuantities((prev) => {
      const newQty = Math.max(0, (prev[productId] || 0) + delta);
      
      // Store product metadata when quantity is set
      if (newQty > 0) {
        const product = productList.find(p => p.product_id === productId);
        if (product) {
          setProductMetadata((prevMeta) => ({
            ...prevMeta,
            [productId]: {
              rec_id: product.inventory_recid,
              id: product.product_id,
              name: product.product_name,
              price: parseFloat(product.selling_price),
              product_category: product.product_category,
            }
          }));
        }
      }
      
      return {
        ...prev,
        [productId]: newQty,
      };
    });
  };

  const getAllProducts = async () => {
    setNeedLoading(true);
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}getAllProductListSale`,
         {
            type: Array.isArray(type)
            ? type.map((item) => `'${item.label}'`).join(",") 
            : "",
            user_id:userId
        }
      );

      const result = response.data;

      if (response.status === 200) {
        setProductList(result?.data || []);
      } else {
        toast.error("Failed to fetch product list: " + result.message);
      }
    } catch (error) {
      toast.error(
        "Error fetching product list: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setNeedLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, [type]);

  // MODIFIED: Now uses productMetadata for products not in current productList
  const selectedItems = Object.keys(quantities)
    .filter(productId => quantities[productId] > 0)
    .map(productId => {
      const product = productList.find(p => p.product_id === productId);
      
      // If product is in current list, use fresh data
      if (product) {
        return {
          rec_id: product.inventory_recid,
          id: product.product_id,
          name: product.product_name,
          qty: quantities[productId],
          price: parseFloat(product.selling_price),
          product_category: product.product_category,
        };
      }
      
      // If product is not in current list, use stored metadata
      if (productMetadata[productId]) {
        return {
          ...productMetadata[productId],
          qty: quantities[productId],
        };
      }
      
      return null;
    })
    .filter(item => item !== null);

  const totalAmount = selectedItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );


  const handleProceed = () => {
    const selectedCategories = type.length > 0
      ? type.map((item) => item.label)
      : [...new Set(selectedItems.map((item) => item.product_category))];

    navigate("/sales/add-to-card/order-form", {
      state: {
        leadData: rowData,
        selectedProducts: selectedItems,
        totalAmount: totalAmount,
        catagory: selectedCategories.join(","),
        catagory_id: selectedCategories.join(","),
        dispatch_id:productList[0]?.branch_incharge_recid,
      },
    });
  };

  return (
    <div className="common-body-st">
      {needLoading && (
        <div className="loading-container w-100 h-100">
          <PropagateLoader
            height="100"
            width="100"
            color="#0B9346"
            radius="10"
          />
        </div>
      )}
      <div className="header-cart-st">
        <div>
          <p className="mb-0 fw-medium">Add to cart</p>
          <div>
            <button
              className="mb-0 nav-btn-top"
              onClick={() => navigate("/sales")}
            >
              Sales &gt; List
            </button>{" "}
            &nbsp;&gt;&nbsp;
            <p className="mb-0 nav-btn-top">{rowData.lead_id} &gt; Cart</p>
          </div>
        </div>

        <div className="rightcorn-ts-st">
          <div className="display-flex-st-multiselect gap-2">
            <div>
              <div className="comm-select-addtocart">
                <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="multi-select-label">Select Category</InputLabel>
                <Select
                labelId="multi-select-label"
                multiple
                value={type.map((t) => t.value)} 
                MenuProps={{
                    PaperProps: {
                    sx: {
                        mt: "5px",
                        maxHeight:'250px',
                        overflow:"auto"
                    },
                    },
                }}
                onChange={(e) => {
                    const selectedValues = e.target.value;
                    const newSelection = selectedValues
                    .map((id) => TypeOptions.find((option) => option.value === id))
                    .filter((item) => item !== undefined);

                    setType(newSelection); 
                }}
                renderValue={(selected = []) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((val) => {
                        const option = TypeOptions.find((opt) => opt.value === val);
                        return (
                        <Chip
                            key={val}
                            label={option?.label}
                            color="success" 
                            onMouseDown={(e) => e.stopPropagation()}
                            onDelete={() =>
                            setType((prev) => prev.filter((item) => item.value !== val))
                            }
                        />
                        );
                    })}
                    </Box>
                )}
                >
                {TypeOptions.map((option) => {
                    const isSelected = type.some((t) => t.value === option.value);
                    return (
                    <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={{
                        backgroundColor: isSelected ? "rgba(211, 211, 211, 0.15)" : "inherit",
                        fontWeight: isSelected ? "bold" : "normal",                      
                        }}
                    >
                        {option.label}
                    </MenuItem>
                    );
                })}
                </Select>
              </FormControl>
              </div>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="body-div-el">
        <div className="container-fluid overflow-auto d-flex gap-3 p-3 w-100 h-100">
          {/* Product List */}
          <div style={{ width: "50%" }}>
            <div className="addcart-table">
              <div className="addcart-header-st" style={{ minWidth: "532px" }}>
                <div className="w-25 display-flex p-2 pt-3 pb-3">
                  Product ID
                </div>
                <div className="w-25 display-flex p-2 pt-3 pb-3">Product</div>
                <div className="w-25 display-flex p-2 pt-3 pb-3">Quantity</div>
                <div className="w-25 display-flex p-2 pt-3 pb-3">Amount</div>
              </div>
             {productList.map((product) => (
          <div
            className="addcart-body-st"
            key={product.product_id}
            style={{ minWidth: "532px" }}
          >
            <div className="w-25 display-flex text-center p-2 pt-3 pb-3 fw-semibold">
              {product.product_id}
            </div>
            <div className="w-25 display-flex flex-column text-center p-2 pt-3 pb-3">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt="product"
                  width="60"
                  height="60"
                />
              ) : (
                <SvgContent svg_name="no_image" />
              )}

              <div className="small">
                <strong>{product.product_name}</strong>
                <br />₹ {product.selling_price} net weight
                <br />
                {product.form_factor} / {product.product_type}
                <br />
                {product.brand}
              </div>
            </div>
            <div className="w-25 display-flex text-center p-2 pt-3 pb-3">
              <div className="d-flex justify-content-center align-items-center">
                <button
                  className="btncart-dec-st"
                  onClick={() => handleQuantityChange(product.product_id, -1)}
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantities[product.product_id] ?? 0}
                  readOnly
                  className="form-control-st qty-inc-st text-center"
                />
                <button
                  className="btncart-inc-st"
                  onClick={() => handleQuantityChange(product.product_id, 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="w-25 display-flex text-center p-2 pt-3 pb-3">
              {quantities[product.product_id] > 0
                ? `₹ ${quantities[product.product_id] * product.selling_price}`
                : "₹ 0"}
            </div>
          </div>
            ))}

            </div>
          </div>

          {/* Order Summary */}
          <div
            style={{ width: "50%" }}
            className="overflow-auto border rounded bg-white"
          >
            <h5 className="mb-2 p-3 pb-0">Order summary</h5>
            <div className="rightside-carttab-st pe-3 ps-3">
              <div className="rightside-carthead-st">
                <div className="w-25 display-flex p-2">Product ID</div>
                <div className="w-25 display-flex p-2">Product</div>
                <div className="w-25 display-flex p-2">Quantity</div>
                <div className="w-25 display-flex p-2">Amount</div>
              </div>
              <div className="rightside-cartbody-st">
                {selectedItems.map((item, index) => (
                  <div key={item.id} className="d-flex align-items-center">
                    <div className="w-25 text-center display-flex p-2">
                      {item.id}
                    </div>
                    <div className="w-25 text-center display-flex p-2">
                      {item.name}
                    </div>
                    <div className="w-25 text-center display-flex p-2">
                      {item.qty} (net wt)
                    </div>
                    <div className="w-25 text-center display-flex p-2">
                      ₹ {item.qty * item.price}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rightside-cartfoot-st">
                <div className="total-amountcart-st">
                  <strong>Total amount</strong>
                  <p className="mb-0">₹ {totalAmount}</p>
                </div>
                <button
                  className="btn-proceed-st"
                  onClick={handleProceed}
                  disabled={selectedItems.length === 0}
                  style={{
                    opacity: selectedItems.length === 0 ? 0.6 : 1,
                    cursor:
                      selectedItems.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}

export default AddToCartBySale;