'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import MedicineList from '@/components/medicines/MedicineList';
import StockInForm from '@/components/transactions/StockInForm';
import DispenseForm from '@/components/transactions/DispenseForm';
import ReportsSection from '@/components/reports/ReportsSection';
import MonthCloseSection from '@/components/month-close/MonthCloseSection';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'medicines':
        return <MedicineList />;
      case 'stock-in':
        return <StockInForm />;
      case 'dispense':
        return <DispenseForm />;
      case 'reports':
        return <ReportsSection />;
      case 'month-close':
        return <MonthCloseSection />;
      case 'analytics':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            <p className="text-gray-600 mt-2">Analytics features coming soon...</p>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;