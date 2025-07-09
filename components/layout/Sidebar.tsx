'use client'; // This component should be rendered on the client side (Next.js)

import React from 'react';
import { 
  Home,          // Icon for Dashboard
  Pill,          // Icon for Medicines
  TrendingUp,    // Icon for Stock In
  TrendingDown,  // Icon for Dispense
  FileText,      // Icon for Reports
  Calendar,      // Icon for Month Close
  BarChart3      // Icon for Analytics
} from 'lucide-react';

// Props interface for Sidebar component
interface SidebarProps {
  activeTab: string; // currently selected tab ID
  onTabChange: (tab: string) => void; // function to change the active tab
}

// Functional component definition
const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  // Define sidebar menu items with ID, label, and corresponding icon
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
    // Sidebar container with fixed width and full height
    <div className="w-64 bg-gray-50 h-screen border-r border-gray-200">
      <nav className="mt-8 px-4">
        {/* Render each menu item */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon; // Get icon component for this item
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)} // Update the active tab on click
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white' // Active tab styling
                    : 'text-gray-700 hover:bg-gray-200' // Default styling with hover effect
                }`}
              >
                <Icon className="h-5 w-5" /> {/* Render icon */}
                <span>{item.label}</span>    {/* Render tab label */}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
