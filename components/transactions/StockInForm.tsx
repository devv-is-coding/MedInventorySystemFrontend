'use client'; // Enables client-side rendering in Next.js app directory

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext'; // Global app context
import { TrendingUp, Search, Plus } from 'lucide-react'; // Icons from Lucide

const StockInForm: React.FC = () => {
  // Get required data and actions from context
  const { medicines, addTransaction, transactionTypes, getCurrentStock } = useApp();

  // Form state
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [transactionType, setTransactionType] = useState('2'); // Default to RETURN (ID 2)
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transaction types allowed for Stock-In
  const rddTypes = transactionTypes.filter(t => [2, 3, 4].includes(t.id));

  // Filtered medicine list based on search query
  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMedicine || !quantity || parseInt(quantity) <= 0) return;

    const medicine = medicines.find(m => m.id === selectedMedicine);
    if (!medicine) return;

    setIsSubmitting(true);

    try {
      await addTransaction({
        medicine_id: selectedMedicine,
        txn_type_id: parseInt(transactionType),
        txn_date: new Date().toISOString().split('T')[0],
        quantity: parseInt(quantity),
        remarks,
        created_by: 'admin',
      });

      // Reset form fields
      setSelectedMedicine('');
      setQuantity('');
      setRemarks('');
      setSearchQuery('');
    } catch (error: any) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMedicineData = medicines.find(m => m.id === selectedMedicine);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <TrendingUp className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Stock In (RDD)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Add Stock In Transaction</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Transaction Type Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type *
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {rddTypes.map(type => (
                    <option key={type.id} value={type.id.toString()}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medicine Search & Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Dropdown Results */}
                {searchQuery && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredMedicines.map(medicine => (
                      <button
                        key={medicine.id}
                        type="button"
                        onClick={() => {
                          setSelectedMedicine(medicine.id);
                          setSearchQuery(medicine.name);
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-500">
                          {medicine.dosage_form} • Current Stock: {getCurrentStock(medicine.id)} {medicine.unit}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Optional Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional notes about this transaction..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedMedicine || !quantity || isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Add Stock In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: Selected Medicine Info & Quick Stats */}
        <div className="space-y-4">
          {/* Selected Medicine Preview */}
          {selectedMedicineData && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Selected Medicine</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Name:</span>
                  <span className="ml-2 text-blue-700">{selectedMedicineData.name}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Form:</span>
                  <span className="ml-2 text-blue-700">{selectedMedicineData.dosage_form}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Unit:</span>
                  <span className="ml-2 text-blue-700">{selectedMedicineData.unit}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Current Stock:</span>
                  <span className="ml-2 text-blue-700 font-semibold">
                    {getCurrentStock(selectedMedicineData.id)} {selectedMedicineData.unit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Static Summary (You can replace this with real data) */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Today's RDD Summary</h4>
            <div className="space-y-2 text-sm">
              {rddTypes.map(type => {
                const todayCount = 0; // Replace with real summary if available
                return (
                  <div key={type.id} className="flex justify-between">
                    <span className="text-gray-600">{type.label}:</span>
                    <span className="font-medium">{todayCount}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInForm;
