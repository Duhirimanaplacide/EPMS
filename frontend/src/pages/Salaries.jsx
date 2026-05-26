import React, { useState, useEffect } from 'react';
import api from '../api';

const Salaries = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    employeeNumber: '',
    grossSalary: '',
    totalDeduction: '',
    netSalary: '',
    monthOfPayment: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salRes, empRes] = await Promise.all([
        api.get('/salaries'),
        api.get('/employees'),
      ]);
      setSalaries(salRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/salaries/${editingId}`, formData);
        setMessage({ type: 'success', text: 'Record updated successfully' });
      } else {
        await api.post('/salaries', formData);
        setMessage({ type: 'success', text: 'Salary record added successfully' });
      }
      resetForm();
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Operation failed' });
    }
  };

  const handleEdit = (salary) => {
    setFormData({
      employeeNumber: salary.employeeNumber,
      grossSalary: salary.grossSalary,
      totalDeduction: salary.totalDeduction,
      netSalary: salary.netSalary,
      monthOfPayment: salary.monthOfPayment,
    });
    setEditingId(salary._id);
    setShowForm(true);
    setDeleteId(null);
    setMessage({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/salaries/${id}`);
      setMessage({ type: 'success', text: 'Record deleted successfully' });
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete record' });
    }
  };

  const resetForm = () => {
    setFormData({
      employeeNumber: '',
      grossSalary: '',
      totalDeduction: '',
      netSalary: '',
      monthOfPayment: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const calculateNet = () => {
    const gross = parseFloat(formData.grossSalary) || 0;
    const deduction = parseFloat(formData.totalDeduction) || 0;
    setFormData({ ...formData, netSalary: (gross - deduction).toFixed(2) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Payroll</h1>
          <p className="text-gray-500 mt-1">Manage employee salary records</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); setDeleteId(null); }}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Salary Record'}
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="card p-6 mb-6 border-l-4 border-l-primary-500">
          <h3 className="font-medium text-gray-800 mb-1">
            {editingId ? 'Edit Salary Record' : 'Add New Salary Record'}
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            {editingId
              ? 'Update the salary details below and click Save'
              : 'Fill in the employee salary information below'
            }
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500 mr-1">*</span> Employee
                </label>
                <select
                  value={formData.employeeNumber}
                  onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                  className="input-field"
                  required
                  disabled={!!editingId}
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.employeeNumber} value={emp.employeeNumber}>
                      {emp.employeeNumber} - {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500 mr-1">*</span> Month of Payment
                </label>
                <input
                  type="text"
                  value={formData.monthOfPayment}
                  onChange={(e) => setFormData({ ...formData, monthOfPayment: e.target.value })}
                  className="input-field"
                  placeholder="e.g., January 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500 mr-1">*</span> Gross Salary (RWF)
                </label>
                <input
                  type="number"
                  value={formData.grossSalary}
                  onChange={(e) => setFormData({ ...formData, grossSalary: e.target.value })}
                  onBlur={calculateNet}
                  className="input-field"
                  placeholder="350000"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500 mr-1">*</span> Total Deduction (RWF)
                </label>
                <input
                  type="number"
                  value={formData.totalDeduction}
                  onChange={(e) => setFormData({ ...formData, totalDeduction: e.target.value })}
                  onBlur={calculateNet}
                  className="input-field"
                  placeholder="35000"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Net Salary (RWF)
                </label>
                <input
                  type="number"
                  value={formData.netSalary}
                  onChange={(e) => setFormData({ ...formData, netSalary: e.target.value })}
                  className="input-field bg-gray-50 text-emerald-700 font-medium"
                  placeholder="Auto-calculated"
                  readOnly
                />
                <p className="text-xs text-gray-400 mt-1">Calculated as: Gross - Deductions</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Save Changes' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800">Salary Records</h3>
            <span className="text-sm text-gray-500">{salaries.length} record{salaries.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {salaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Employee</th>
                  <th className="table-header">Month</th>
                  <th className="table-header">Gross Salary</th>
                  <th className="table-header">Deductions</th>
                  <th className="table-header">Net Salary</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {salaries.map((salary, index) => (
                  <tr key={salary._id} className="hover:bg-gray-50">
                    <td className="table-cell text-gray-400">{index + 1}</td>
                    <td className="table-cell">
                      <p className="font-medium text-gray-800">{salary.firstName} {salary.lastName}</p>
                      <p className="text-xs text-gray-400">{salary.employeeNumber}</p>
                    </td>
                    <td className="table-cell">{salary.monthOfPayment}</td>
                    <td className="table-cell">{formatCurrency(salary.grossSalary)}</td>
                    <td className="table-cell text-red-600">- {formatCurrency(salary.totalDeduction)}</td>
                    <td className="table-cell font-semibold text-emerald-700">{formatCurrency(salary.netSalary)}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        {deleteId === salary._id ? (
                          <>
                            <button
                              onClick={() => handleDelete(salary._id)}
                              className="p-1.5 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                              title="Confirm delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(salary)}
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteId(salary._id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-sm">No salary records yet</p>
            <p className="text-gray-400 text-xs mt-1">Click "Add Salary Record" above to create one</p>
          </div>
        )}
      </div>
    </div>
  );
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default Salaries;
