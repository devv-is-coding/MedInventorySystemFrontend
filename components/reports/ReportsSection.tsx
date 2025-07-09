'use client'; // Indicates this file should be rendered on the client side (Next.js)

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext'; // Custom context hook
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import type { StockTransaction } from '@/context/AppContext'; // or the correct relative path


const ReportsSection: React.FC = () => {
  const {
    medicines,
    transactions,
    transactionTypes,
    getTransactionsByDate,
    getMonthlyReport,
  } = useApp();

  // Report type: 'daily' or 'monthly'
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');

  // Daily date picker
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split('T')[0]
  );

  // Monthly selectors
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [dailyTransactions, setDailyTransactions] = useState<StockTransaction[]>([]);

useEffect(() => {
  if (reportType === 'daily') {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const txns = await getTransactionsByDate(selectedDate);
        setDailyTransactions(txns);
      } catch (err) {
        console.error('Failed to load daily report:', err);
        setDailyTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }
}, [selectedDate, reportType, getTransactionsByDate]);


  useEffect(() => {
    if (reportType === 'monthly') {
      const fetch = async () => {
        setIsLoading(true);
        try {
          const report = await getMonthlyReport(selectedYear, selectedMonth);
          setMonthlyReport(report);
        } catch (err) {
          console.error('Failed to load monthly report:', err);
          setMonthlyReport([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetch();
    }
  }, [selectedMonth, selectedYear, reportType, getMonthlyReport]);

  const exportToPDF = () => {
    console.log('Exporting to PDF... (placeholder)');
  };

  const exportToExcel = () => {
    console.log('Exporting to Excel... (placeholder)');
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Report Type Toggle */}
      <div className="flex space-x-4 border-b border-gray-200">
        {['daily', 'monthly'].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type as 'daily' | 'monthly')}
            className={`pb-2 px-4 font-medium transition-colors ${
              reportType === type
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type === 'daily' ? 'Daily Report' : 'Monthly Report'}
          </button>
        ))}
      </div>

      {/* Date / Month-Year Picker */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          {reportType === 'daily' ? (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', {
                      month: 'long',
                    })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = today.getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Report Output */}
      <div className="bg-white rounded-lg border border-gray-200">
        {reportType === 'daily' ? (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                Daily Report – {new Date(selectedDate).toLocaleDateString()}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Medicine', 'Transaction Type', 'Quantity', 'Remarks'].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dailyTransactions.map((txn) => {
                    const medicine = medicines.find((m) => m.id === txn.medicine_id);
                    const txnType = transactionTypes.find((t) => t.id === txn.txn_type_id);
                    return (
                      <tr key={txn.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{medicine?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{txnType?.label}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {txn.quantity} {medicine?.unit}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{txn.remarks || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                Monthly Report –{' '}
                {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
            </div>
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-2" />
                <p className="text-gray-600">Loading report...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        'Medicine',
                        'Opening Stock',
                        'Returns',
                        'Donations',
                        'New Added',
                        'Dispensed',
                        'Closing Stock',
                      ].map((label) => (
                        <th
                          key={label}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {monthlyReport.map((report) => {
                      const unit = report.medicine.unit;
                      return (
                        <tr key={report.medicine_id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{report.medicine.name}</td>
                          <td className="px-6 py-4 text-sm">{report.opening_stock} {unit}</td>
                          <td className="px-6 py-4 text-sm">{report.total_return} {unit}</td>
                          <td className="px-6 py-4 text-sm">{report.total_donation} {unit}</td>
                          <td className="px-6 py-4 text-sm">{report.total_new_added} {unit}</td>
                          <td className="px-6 py-4 text-sm">{report.total_dispensed} {unit}</td>
                          <td className="px-6 py-4 text-sm">{report.closing_stock} {unit}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsSection;
