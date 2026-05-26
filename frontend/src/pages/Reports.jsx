import React, { useState, useEffect } from 'react';
import api from '../api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    weekStart: getMonday(new Date()).toISOString().split('T')[0],
    month: String(new Date().getMonth() + 1).padStart(2, '0'),
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchReportData();
    fetchDeptData();
  }, [activeTab, filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint;
      switch (activeTab) {
        case 'daily':
          endpoint = `/reports/daily?date=${filters.date}`;
          break;
        case 'weekly':
          endpoint = `/reports/weekly?weekStart=${filters.weekStart}`;
          break;
        case 'monthly':
          endpoint = `/reports/monthly?month=${filters.month}&year=${filters.year}`;
          break;
        default:
          endpoint = `/reports/daily?date=${filters.date}`;
      }
      const response = await api.get(endpoint);
      setReportData(response.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeptData = async () => {
    try {
      const response = await api.get('/reports/department');
      setDeptData(response.data);
    } catch (err) {
      console.error('Failed to fetch department data:', err);
    }
  };

  const tabs = [
    { id: 'daily', label: 'Daily Report' },
    { id: 'weekly', label: 'Weekly Report' },
    { id: 'monthly', label: 'Monthly Report' },
    { id: 'department', label: 'By Department' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Reports</h1>
        <p className="text-gray-500 mt-1">View payroll and employee reports</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'daily' && (
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="input-field w-auto"
            />
          </div>
        </div>
      )}

      {activeTab === 'weekly' && (
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700">Week Starting:</label>
            <input
              type="date"
              value={filters.weekStart}
              onChange={(e) => setFilters({ ...filters, weekStart: e.target.value })}
              className="input-field w-auto"
            />
          </div>
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                className="input-field w-auto"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="input-field w-auto"
                min="2020"
                max="2030"
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {activeTab !== 'department' ? (
            <div className="table-container">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-medium text-gray-800">
                  {activeTab === 'daily' && `Daily Report - ${formatDate(reportData?.date)}`}
                  {activeTab === 'weekly' && `Weekly Report - ${formatDate(reportData?.startDate)} to ${formatDate(reportData?.endDate)}`}
                  {activeTab === 'monthly' && `Monthly Report - ${getMonthName(reportData?.month)} ${reportData?.year}`}
                </h3>
                <span className="text-sm text-gray-500">{reportData?.count || 0} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Employee</th>
                      <th className="table-header">Position</th>
                      <th className="table-header">Department</th>
                      <th className="table-header">Gross Salary</th>
                      <th className="table-header">Deductions</th>
                      <th className="table-header">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData?.records?.map((record) => (
                      <tr key={record.salaryId} className="hover:bg-gray-50">
                        <td className="table-cell font-medium text-gray-800">
                          {record.firstName} {record.lastName}
                        </td>
                        <td className="table-cell">{record.position}</td>
                        <td className="table-cell">{record.departmentName || '-'}</td>
                        <td className="table-cell">{formatCurrency(record.grossSalary)}</td>
                        <td className="table-cell text-red-600">{formatCurrency(record.totalDeduction)}</td>
                        <td className="table-cell font-medium text-emerald-600">{formatCurrency(record.netSalary)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {reportData?.records?.length > 0 && (
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td className="table-cell font-medium" colSpan={3}>Total</td>
                        <td className="table-cell font-medium">
                          {formatCurrency(reportData.records.reduce((sum, r) => sum + parseFloat(r.grossSalary), 0))}
                        </td>
                        <td className="table-cell font-medium text-red-600">
                          {formatCurrency(reportData.records.reduce((sum, r) => sum + parseFloat(r.totalDeduction), 0))}
                        </td>
                        <td className="table-cell font-medium text-emerald-600">
                          {formatCurrency(reportData.records.reduce((sum, r) => sum + parseFloat(r.netSalary), 0))}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              {(!reportData?.records || reportData.records.length === 0) && (
                <div className="px-5 py-8 text-center text-gray-500 text-sm">
                  No records found for the selected period
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deptData.map((dept) => (
                <div key={dept.departmentCode} className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-800">{dept.departmentName}</h4>
                      <p className="text-sm text-gray-500">{dept.departmentCode}</p>
                    </div>
                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {dept.employeeCount} employee{dept.employeeCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Gross</span>
                      <span className="font-medium text-gray-800">{formatCurrency(dept.totalGross)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Deductions</span>
                      <span className="font-medium text-red-600">{formatCurrency(dept.totalDeduction)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                      <span className="text-gray-700 font-medium">Total Net</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(dept.totalNet)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
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

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getMonthName = (monthNum) => {
  if (!monthNum) return '';
  return new Date(2000, parseInt(monthNum) - 1).toLocaleString('default', { month: 'long' });
};

const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export default Reports;
