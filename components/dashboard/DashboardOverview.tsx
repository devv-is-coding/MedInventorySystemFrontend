'use client'; // Ensures this component is rendered on the client side

import React from 'react';
import { useApp } from '@/context/AppContext'; // Global app state context
import { 
  Pill, 
  TrendingUp, 
  TrendingDown, 
  Package,
  AlertTriangle,
  Calendar
} from 'lucide-react'; // Icon set

const DashboardOverview: React.FC = () => {
  const { medicines, transactions, getCurrentStock } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.txn_date === today);

  const stockInTypes = [2, 3, 4];
  const dispenseTypes = [5, 6, 7, 8];

  const todayStockIn = todayTransactions
    .filter(t => stockInTypes.includes(t.txn_type_id))
    .reduce((sum, t) => sum + t.quantity, 0);

  const todayDispensed = todayTransactions
    .filter(t => dispenseTypes.includes(t.txn_type_id))
    .reduce((sum, t) => sum + t.quantity, 0);

  const lowStockMedicines = medicines.filter(m => getCurrentStock(m.id) < 10);
  const totalMedicines = medicines.length;

  const totalCurrentStock = medicines.reduce((sum, m) => {
    return sum + getCurrentStock(m.id);
  }, 0);

  const stats = [
    {
      title: 'Total Medicines',
      value: totalMedicines,
      icon: Pill,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Stock',
      value: totalCurrentStock,
      icon: Package,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Today Stock In',
      value: todayStockIn,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Today Dispensed',
      value: todayDispensed,
      icon: TrendingDown,
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with current date */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{new Intl.DateTimeFormat('en-PH', { dateStyle: 'long' }).format(new Date())}</span>
        </div>
      </div>

      {/* Statistics Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className={`${stat.bgColor} p-6 rounded-xl border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alert Section */}
      {lowStockMedicines.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-800">Low Stock Alert</h3>
          </div>
          <p className="text-amber-700 mb-4">
            {lowStockMedicines.length} medicine(s) are running low on stock (less than 10 units).
          </p>
          <div className="space-y-2">
            {lowStockMedicines.map(medicine => (
              <div key={medicine.id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{medicine.name}</p>
                  <p className="text-sm text-gray-600">{medicine.dosage_form}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">
                    {getCurrentStock(medicine.id)} {medicine.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.slice(-5).reverse().map(transaction => {
            const medicine = medicines.find(m => m.id === transaction.medicine_id);
            if (!medicine) return null;

            const txnType = stockInTypes.includes(transaction.txn_type_id)
              ? 'Stock In'
              : dispenseTypes.includes(transaction.txn_type_id)
              ? 'Dispensed'
              : 'Other';

            const isDispensed = dispenseTypes.includes(transaction.txn_type_id);

            return (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isDispensed ? 'bg-red-100' : 'bg-green-100'}`}>
                    {isDispensed ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-sm text-gray-600">{txnType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {transaction.quantity} {medicine.unit}{transaction.quantity > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-500">{transaction.txn_date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
