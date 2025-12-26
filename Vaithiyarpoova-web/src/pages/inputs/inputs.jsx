import React, { useEffect, useState } from 'react';
import axios from 'axios';
import configModule from '../../../config.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/styles/inputs.css';

function InputsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [masters, setMasters] = useState({
    // brands: [],
    // usertype: [],
    categories: [],
    form_factors: [],
    product_types: [],
    units: []
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTable, setCurrentTable] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const config = configModule.config();

  const fetchMaster = async (table) => {
    try {
      const res = await axios.get(`${config.apiBaseUrl}masters/${table}`);
      return res.data?.data ?? [];
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      return [];
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ categories, form_factors, product_types, units] = await Promise.all([
        // fetchMaster('brands'),
        // fetchMaster('usertype'),
        fetchMaster('categories'),
        fetchMaster('form_factors'),
        fetchMaster('product_types'),
        fetchMaster('units')
      ]);
      setMasters({ categories, form_factors, product_types, units });
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const addItem = async (table, name) => {
    try {
      // Auto-generate code from name (uppercase, no spaces, max 10 chars)
      const code = name.toUpperCase().replace(/\s+/g, '').substring(0, 10);
      await axios.post(`${config.apiBaseUrl}masters/${table}`, { name, code });
      toast.success('Added successfully');
      setShowAddModal(false);
      setNewItem({ name: '' });
      loadAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  };


  const openDeleteModal = async (table, item) => {
    setCurrentTable(table);
    setCurrentItem(item);
    setShowDeleteModal(true);
  };

  const deleteItem = async () => {
    if (!currentItem || !currentTable) return;

    setDeleteLoading(true);
    try {
      await axios.post(`${config.apiBaseUrl}masters/${currentTable}/delete`, {
        id: currentItem?.key
      });
      toast.success('Deleted successfully');
      setShowDeleteModal(false);
      setCurrentItem(null);
      loadAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openAddModal = (table) => {
    setCurrentTable(table);
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      toast.error('Name is required');
      return;
    }
    addItem(currentTable, newItem.name.trim());
  };

  const renderSection = (title, table, items, idKey, nameKey) => {
    // Filter out soft-deleted items
    const activeItems = items
      ? items
        .filter(item => !item.is_deleted || item.is_deleted === 0)
        .map(item => ({
          ...item,
          key: item[idKey],
          label: item[nameKey]
        }))
      : [];

    return (
      <div key={table} className="input-section">
        <div className="section-header">
          <h3 className="section-title">{title}</h3>
          <button
            className="add-button add-button-inputst"
            onClick={() => openAddModal(table)}
            title={`Add ${title}`}
          >
            <span className="add-icon">+</span>
          </button>
        </div>
        <div className="items-container">
          {activeItems.length > 0 ? (
            activeItems.map((item) => (
              <div key={item[idKey]} className="item-button item-ipbtn-st">
                <span className="item-text">{item[nameKey]}</span>
                <button
                  className="remove-button"
                  onClick={() => openDeleteModal(table, item)}
                  title={`Remove ${item[nameKey]}`}
                >
                  <span className="remove-icon">−</span>
                </button>
              </div>
            ))
          ) : (
            <div className="no-items">No {title.toLowerCase()} items</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='common-body-st inputs-page'>
      {loading && (
        <div className='loading-container w-100 h-100 d-flex align-items-center justify-content-center'>
          <div className="spinner-border text-primary" >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!loading && (
        <div className='body-div-el-in'>
          <div className='header-div-el'>
            <div className='header-divpart-el'>
              <h6 className="mt-0 mb-0 header-titlecount-el">Inputs</h6>
              <div className="d-flex align-items-center">
                <button>
                  <p className='mb-0 nav-btn-top'>Profile &gt; Inputs</p>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className='alert alert-danger mt-3'>
              {error}
            </div>
          )}

          <div className="inputs-container">
            {/* {renderSection('Brand', 'brands', masters.brands, 'brand_id', 'brand_name')} */}
            {/* {renderSection('Designation', 'usertype', masters.usertype, 'usertype_id', 'user_type')} */}
            {renderSection('Category', 'categories', masters.categories, 'category_id', 'category_name')}
            {renderSection('Form Factor', 'form_factors', masters.form_factors, 'form_factor_id', 'form_name')}
            {renderSection('Product Type', 'product_types', masters.product_types, 'product_type_id', 'type_name')}
            {renderSection('Units', 'units', masters.units, 'unit_id', 'unit_name')}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header mb-2">
              <h5>Add New {currentTable.charAt(0).toUpperCase() + currentTable.slice(1).replace('_', ' ')}</h5>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <h6>Name</h6>
                  <input
                    type="text"
                    className="form-control"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder={`Enter ${currentTable.replace('_', ' ')} name`}
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn-in"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn-in"
                  disabled={!newItem.name.trim()}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header mb-2">
              <h5>Confirm Delete</h5>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{currentItem?.name}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="cancel-btn-in"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-btn-in"
                onClick={deleteItem}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default InputsPage;

