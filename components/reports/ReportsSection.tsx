'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

const ReportsSection: React.FC = () => {
  const { medicines, transactions, transactionTypes, getTransactionsByDate, getMonthlyReport } = useApp();
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const dailyTransactions = getTransactionsByDate(selectedDate);

  // Load monthly report when month/year changes
  useEffect(() => {
    if (reportType === 'monthly') {
      const loadMonthlyReport = async () => {
        setIsLoading(true);
        try {
          const report = await getMonthlyReport(selectedYear, selectedMonth);
          setMonthlyReport(report);
        } catch (error) {
          console.error('Error loading monthly report:', error);
          setMonthlyReport([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadMonthlyReport();
    }
  }, [selectedMonth, selectedYear, reportType, getMonthlyReport]);

  const exportToPDF = () => {
    // In a real app, you would use a library like jsPDF
    console.log('Exporting to PDF...');
  };

  const exportToExcel = () => {
    // In a real app, you would use a library like xlsx
    console.log('Exporting to Excel...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setReportType('daily')}
          className={`pb-2 px-4 font-medium transition-colors ${
            reportType === 'daily'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Daily Report
        </button>
        <button
          onClick={() => setReportType('monthly')}
          className={`pb-2 px-4 font-medium transition-colors ${
            reportType === 'monthly'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Monthly Report
        </button>
      </div>

      {/* Filters */}
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={2020 + i} value={2020 + i}>
                    {2020 + i}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {reportType === 'daily' ? (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                Daily Report - {new Date(selectedDate).toLocaleDateString()}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dailyTransactions.map(transaction => {
                    const medicine = medicines.find(m => m.id === transaction.medicine_id);
                    const txnType = transactionTypes.find(t => t.id === transaction.txn_type_id);
                    return (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medicine?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {txnType?.label}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.quantity} {medicine?.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.remarks || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                Monthly Report - {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading report...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medicine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opening Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Returns
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        New Added
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dispensed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Closing Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {monthlyReport.map(report => (
                      <tr key={report.medicine_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.medicine.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.opening_stock} {report.medicine.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.total_return} {report.medicine.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.total_donation} {report.medicine.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.total_new_added} {report.medicine.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.total_dispensed} {report.medicine.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.closing_stock} {report.medicine.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsSection;