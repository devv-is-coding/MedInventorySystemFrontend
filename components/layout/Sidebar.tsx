'use client';

import React from 'react';
import { 
  Home, 
  Pill, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Calendar,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'medicines', icon: Pill, label: 'Medicines' },
    { id: 'stock-in', icon: TrendingUp, label: 'Stock In (RDD)' },
    { id: 'dispense', icon: TrendingDown, label: 'Dispense' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'month-close', icon: Calendar, label: 'Month Close' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
  ];

  return (
    <div className="w-64 bg-gray-50 h-screen border-r border-gray-200">
      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;