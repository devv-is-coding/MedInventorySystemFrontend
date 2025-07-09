'use client'; // Ensures this file runs on the client side in Next.js

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext'; // Global state/context
import { Calendar, CheckCircle, AlertTriangle } from 'lucide-react'; // Icons

const MonthCloseSection: React.FC = () => {
  const { performMonthClose, getMonthlyReport } = useApp();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const report = await getMonthlyReport(selectedYear, selectedMonth);
        setMonthlyReport(report);
      } catch (err) {
        console.error('Failed to load report:', err);
        setMonthlyReport([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [selectedMonth, selectedYear, getMonthlyReport]);

  const handleMonthClose = async () => {
    const confirmText = `Are you sure you want to close ${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}? This action cannot be undone.`;

    if (window.confirm(confirmText)) {
      setIsProcessing(true);
      try {
        await performMonthClose(selectedYear, selectedMonth);
        const report = await getMonthlyReport(selectedYear, selectedMonth);
        setMonthlyReport(report);
      } catch (error) {
        console.error('Error during month close:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Month Close</h2>
      </div>

      {/* Month/Year Picker */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Select Month to Close</h3>
        <div className="flex items-center space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = now.getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Report Table + Action Button */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Closing Summary - {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={handleMonthClose}
            disabled={isProcessing || isLoading || monthlyReport.length === 0}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="animate-spin h-4 w-4 rounded-full border-b-2 border-white"></div>
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>{isProcessing ? 'Processing...' : 'Close Month'}</span>
          </button>
        </div>

        {/* Table or loading */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 mx-auto mb-2 border-b-2 border-blue-600 rounded-full"></div>
            <p className="text-gray-600">Loading month summary...</p>
          </div>
        ) : monthlyReport.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Medicine', 'Opening Stock', 'Total In', 'Total Out', 'Closing Stock', 'Forward to Next Month'].map((label) => (
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
                  const totalIn = report.total_return + report.total_donation + report.total_new_added;
                  const totalOut = report.total_dispensed;
                  const unit = report.medicine.unit;

                  return (
                    <tr key={report.medicine_id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{report.medicine.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{report.opening_stock} {unit}</td>
                      <td className="px-6 py-4 text-sm text-green-600">+{totalIn} {unit}</td>
                      <td className="px-6 py-4 text-sm text-red-600">-{totalOut} {unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{report.closing_stock} {unit}</td>
                      <td className="px-6 py-4 text-sm">
                        {report.closing_stock > 0 ? (
                          <div className="flex items-center text-green-600 space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>{report.closing_stock} {unit}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500 space-x-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>No stock to forward</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>No transactions found for the selected month.</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Month Close Process</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
          <li>Calculates closing stock for each medicine</li>
          <li>Creates forward transactions for next month's opening stock</li>
          <li>Only positive closing stocks are carried forward</li>
          <li>Zero or negative stocks are not forwarded</li>
          <li>This process should be performed at the end of each month</li>
        </ul>
      </div>
    </div>
  );
};

export default MonthCloseSection;
