import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config.js';
import { useAuth } from './context/Authcontext';

const CreativeServicesEmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { user } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, statusFilter, searchQuery]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${config.apiBaseUrl}getCreativeServicesEmployees`, {
        userId: user?.userId,
        user_typecode: user?.user_typecode
      });
      
      if (response.data.success) {
        setEmployees(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(emp => !emp.isDeleted);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(emp => emp.isDeleted);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name?.toLowerCase().includes(query) ||
        emp.emp_id?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.mobile_number?.includes(query)
      );
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (isDeleted) => {
    return (
      <span className={`badge ${isDeleted ? 'bg-danger' : 'bg-success'}`}>
        {isDeleted ? 'Inactive' : 'Active'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchEmployees}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="employee-list-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-700">Creative Services Employees</h6>
        <div className="d-flex gap-2">
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '200px' }}
          />
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '120px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-3">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5 className="card-title">{filteredEmployees.length}</h5>
              <p className="card-text">Total Employees</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h5 className="card-title">{filteredEmployees.filter(emp => !emp.isDeleted).length}</h5>
              <p className="card-text">Active</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <h5 className="card-title">{filteredEmployees.filter(emp => emp.isDeleted).length}</h5>
              <p className="card-text">Inactive</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h5 className="card-title">{filteredEmployees.filter(emp => emp.designation === 'Creative service').length}</h5>
              <p className="card-text">Creative Service</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Designation</th>
              <th>Date of Joining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {getPaginatedData().length > 0 ? (
              getPaginatedData().map((employee, index) => (
                <tr key={employee.user_id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{employee.emp_id || '-'}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {employee.image_url && (
                        <img
                          src={employee.image_url}
                          alt={employee.name}
                          className="rounded-circle me-2"
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                        />
                      )}
                      <span className="fw-500">{employee.name || '-'}</span>
                    </div>
                  </td>
                  <td>{employee.email || '-'}</td>
                  <td>{employee.mobile_number || '-'}</td>
                  <td>{employee.designation || '-'}</td>
                  <td>{formatDate(employee.date_of_joining)}</td>
                  <td>{getStatusBadge(employee.isDeleted)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredEmployees.length > itemsPerPage && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: Math.ceil(filteredEmployees.length / itemsPerPage) }, (_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === Math.ceil(filteredEmployees.length / itemsPerPage) ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredEmployees.length / itemsPerPage)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default CreativeServicesEmployeeList;
