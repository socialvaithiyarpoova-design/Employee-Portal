import React from 'react';
import PropTypes from 'prop-types';

function Viewbranchmodel({ closemodel, selectedBranch }) {
  return (
    <div className="approvel-modal-overlay">
      <div className="billing-modal-container" style={{maxWidth:'570px',height:'fit-content',maxHeight:'90%'}}>
        <div style={{ 
          height: '60px', 
          padding: '16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <h6 className="fw-bold mb-0">Branch Details</h6>
          <button 
            className="fw-500" 
            style={{ 
              fontSize: "22px", 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '0 8px'
            }} 
            onClick={() => closemodel(false)}
          >
            ×
          </button>
        </div>
        <div style={{ 
          height: 'calc(100% - 60px)', 
          overflowY: 'auto', 
          padding: '16px' 
        }}>
          <div className="row-item-cm">
            <span className="label-cm-o">Branch ID:</span>
            <span className="value-cm-o">{selectedBranch?.branch_id || '-'}</span>
          </div>
          
          <div className="row-item-cm">
            <span className="label-cm-o">Branch Name:</span>
            <span className="value-cm-o">{selectedBranch?.branch_name || '-'}</span>
          </div>
          
          <div className="row-item-cm">
            <span className="label-cm-o">Branch Type:</span>
            <span className="value-cm-o">{selectedBranch?.branch_type || '-'}</span>
          </div>
          
          <div className="row-item-cm">
            <span className="label-cm-o">In-charge:</span>
            <span className="value-cm-o">{selectedBranch?.branch_in_charge || '-'}</span>
          </div>

            <div className="row-item-cm">
            <span className="label-cm-o">Rent:</span>
            <span className="value-cm-o">{selectedBranch?.rent || '-'}</span>
          </div>
          
          <div className="row-item-cm">
            <span className="label-cm-o">Phone Number:</span>
            <span className="value-cm-o">{selectedBranch?.phone_number || '-'}</span>
          </div>
          
          <div className="row-item-cm">
            <span className="label-cm-o">Email:</span>
            <span className="value-cm-o">{selectedBranch?.email || '-'}</span>
          </div>
          
          <div className="row-item-cm">
            <span className="label-cm-o">Location:</span>
            <span className="value-cm-o">{selectedBranch?.location || '-'}</span>
          </div>
          
          <div className="row-item-cm">
            <span className="label-cm-o">Address:</span>
            <span className="value-cm-o">{selectedBranch?.address || '-'}</span>
          </div>
          
          <div className="row-item-cm">
            <span className="label-cm-o">District:</span>
            <span className="value-cm-o">{selectedBranch?.district || '-'}</span>
          </div>
          
          <div className="row-item-cm">
            <span className="label-cm-o">State:</span>
            <span className="value-cm-o">{selectedBranch?.state || '-'}</span>
          </div>
          
          <div className="row-item-cm">
            <span className="label-cm-o">Country:</span>
            <span className="value-cm-o">{selectedBranch?.country || '-'}</span>
          </div>
          <div className="row-item-cm">
            <span className="label-cm-o">Opening date:</span>
            <span className="value-cm-o"> {new Date(selectedBranch.opening_date).toLocaleDateString()}</span>
          </div>
                   
        </div>
      </div>
    </div>
  );
}


Viewbranchmodel.propTypes = {
  closemodel: PropTypes.func.isRequired,
  selectedBranch: PropTypes.shape({
    branch_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    branch_name: PropTypes.string,
    branch_type: PropTypes.string,
    branch_in_charge: PropTypes.string,
    rent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    phone_number: PropTypes.string,
    email: PropTypes.string,
    location: PropTypes.string,
    address: PropTypes.string,
    district: PropTypes.string,
    state: PropTypes.string,
    country: PropTypes.string,
    opening_date: PropTypes.string,
  })
};
export default Viewbranchmodel;