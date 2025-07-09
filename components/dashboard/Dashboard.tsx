'use client'; // Ensures this component runs on the client-side (Next.js directive)

import React, { useState } from 'react';

// Layout components
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

// Dashboard content components
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import MedicineList from '@/components/medicines/MedicineList';
import StockInForm from '@/components/transactions/StockInForm';
import DispenseForm from '@/components/transactions/DispenseForm';
import ReportsSection from '@/components/reports/ReportsSection';
import MonthCloseSection from '@/components/month-close/MonthCloseSection';

const Dashboard: React.FC = () => {
  // State to track the currently active tab/section
  const [activeTab, setActiveTab] = useState('dashboard');

  // Function to render content based on the selected tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />; // Default overview/dashboard section
      case 'medicines':
        return <MedicineList />; // Displays list of medicines
      case 'stock-in':
        return <StockInForm />; // Form to record stock-in transactions
      case 'dispense':
        return <DispenseForm />; // Form to dispense medicine
      case 'reports':
        return <ReportsSection />; // Section for viewing transaction and inventory reports
      case 'month-close':
        return <MonthCloseSection />; // Section to close monthly summaries
      case 'analytics':
        // Placeholder UI for future analytics features
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            <p className="text-gray-600 mt-2">Analytics features coming soon...</p>
          </div>
        );
      default:
        return <DashboardOverview />; // Fallback to dashboard overview
    }
  };

  return (
    // Main wrapper with full height and light background
    <div className="min-h-screen bg-gray-50">
      <Header /> {/* Top navigation/header */}
      
      {/* Main dashboard layout: sidebar + dynamic content */}
      <div className="flex">
        {/* Sidebar receives current tab and function to update it */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Content section that changes based on selected tab */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
