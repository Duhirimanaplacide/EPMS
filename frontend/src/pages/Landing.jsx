import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`text-center transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-primary-800 font-bold text-3xl">EP</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-3">
            PayMaster Ltd
          </h1>
          <p className="text-primary-200 text-lg mb-2">Employee Payroll Management System</p>
          <p className="text-primary-300 text-sm mb-12">Rubavu District, Western Province, Rwanda</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-primary-800 px-8 py-3 rounded-xl font-medium hover:bg-primary-50 transition-colors shadow-lg"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-500 transition-colors border border-primary-500"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      <div className="pb-8 text-center">
        <p className="text-primary-400 text-xs">
          &copy; 2026 PayMaster Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Landing;
