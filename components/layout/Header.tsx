'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { LogOut, User, Activity } from 'lucide-react';

const Header: React.FC = () => {
  const { logout } = useApp();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Medical Inventory</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;