import React, { useState, useEffect } from 'react';
import api from '../api';

const Rounding = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roundTo, setRoundTo] = useState(1000);
  const [mode, setMode] = useState('nearest');
  const [results, setResults] = useState(null);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const res = await api.get('/salaries');
      setSalaries(res.data);
    } catch (err) {
      console.error('Failed to fetch salaries:', err);
    } finally {
      setLoading(false);
    }
  };

  const roundValue = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    if (mode === 'up') return Math.ceil(num / roundTo) * roundTo;
    if (mode === 'down') return Math.floor(num / roundTo) * roundTo;
    return Math.round(num / roundTo) * roundTo;
  };

  const handlePreview = () => {
    const mapped = salaries.map((s) => {
      const originalGross = parseFloat(s.grossSalary) || 0;
      const originalNet = parseFloat(s.netSalary) || 0;
      const roundedGross = roundValue(originalGross);
      const roundedNet = roundValue(originalNet);
      const diffGross = roundedGross - originalGross;
      const diffNet = roundedNet - originalNet;
      return { ...s, originalGross, originalNet, roundedGross, roundedNet, diffGross, diffNet };
    });
    setResults(mapped);
    setMessage({ type: '', text: '' });
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const updates = results.map((r) => ({
        id: r._id,
        grossSalary: r.roundedGross,
        netSalary: r.roundedNet,
      }));
      await Promise.all(updates.map((u) => api.put(`/salaries/${u.id}`, {
        grossSalary: u.grossSalary,
        netSalary: u.netSalary,
        totalDeduction: parseFloat(salaries.find((s) => s._id === u.id)?.totalDeduction || 0),
        monthOfPayment: salaries.find((s) => s._id === u.id)?.monthOfPayment || '',
      })));
      setMessage({ type: 'success', text: `Rounded ${updates.length} salary record(s) successfully` });
      setResults(null);
      fetchSalaries();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to apply rounding' });
    } finally {
      setApplying(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
          <h1 className="text-2xl font-semibold text-gray-800">Salary Rounding</h1>
          <p className="text-gray-500 mt-1">Round salary values to simplify calculations</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="card p-6 mb-6 border-l-4 border-l-primary-500">
        <h3 className="font-medium text-gray-800 mb-1">Rounding Settings</h3>
        <p className="text-sm text-gray-500 mb-5">Choose rounding precision and mode</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Round To</label>
            <select
              value={roundTo}
              onChange={(e) => setRoundTo(Number(e.target.value))}
              className="input-field"
            >
              <option value={10}>10 RWF</option>
              <option value={50}>50 RWF</option>
              <option value={100}>100 RWF</option>
              <option value={500}>500 RWF</option>
              <option value={1000}>1,000 RWF</option>
              <option value={5000}>5,000 RWF</option>
              <option value={10000}>10,000 RWF</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="input-field"
            >
              <option value="nearest">Nearest</option>
              <option value="up">Round Up</option>
              <option value="down">Round Down</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button onClick={handlePreview} className="btn-primary" disabled={salaries.length === 0}>
            Preview Rounding
          </button>
        </div>
      </div>

      {results && results.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">Rounding Preview</h3>
              <span className="text-sm text-gray-500">{results.length} record(s)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Employee</th>
                  <th className="table-header">Original Gross</th>
                  <th className="table-header">Rounded Gross</th>
                  <th className="table-header">Diff</th>
                  <th className="table-header">Original Net</th>
                  <th className="table-header">Rounded Net</th>
                  <th className="table-header">Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <p className="font-medium text-gray-800">{r.firstName} {r.lastName}</p>
                      <p className="text-xs text-gray-400">{r.employeeNumber}</p>
                    </td>
                    <td className="table-cell">{formatCurrency(r.originalGross)}</td>
                    <td className="table-cell font-medium text-primary-700">{formatCurrency(r.roundedGross)}</td>
                    <td className={`table-cell font-medium ${r.diffGross >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {r.diffGross >= 0 ? '+' : ''}{formatCurrency(r.diffGross)}
                    </td>
                    <td className="table-cell">{formatCurrency(r.originalNet)}</td>
                    <td className="table-cell font-medium text-primary-700">{formatCurrency(r.roundedNet)}</td>
                    <td className={`table-cell font-medium ${r.diffNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {r.diffNet >= 0 ? '+' : ''}{formatCurrency(r.diffNet)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button onClick={() => setResults(null)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleApply} className="btn-primary" disabled={applying}>
              {applying ? 'Applying...' : 'Apply Rounding'}
            </button>
          </div>
        </div>
      )}

      {results && results.length === 0 && (
        <div className="px-5 py-12 text-center card">
          <p className="text-gray-500 text-sm">No salary records to round</p>
        </div>
      )}
    </div>
  );
};

export default Rounding;
