'use client'; // Required for client-side rendering in Next.js

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext'; // Custom global context
import { TrendingDown, Search, Minus } from 'lucide-react'; // Lucide icons

const DispenseForm: React.FC = () => {
  // Accessing global state and methods
  const { medicines, addTransaction, getCurrentStock } = useApp();

  // Local form state
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered medicine list for search dropdown
  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!selectedMedicine || !quantity || parseInt(quantity) <= 0) return;

    const medicine = medicines.find((m) => m.id === selectedMedicine);
    if (!medicine) return;

    const currentStock = getCurrentStock(selectedMedicine);
    const dispenseQuantity = parseInt(quantity);

    // Check if quantity exceeds stock
    if (dispenseQuantity > currentStock) return;

    setIsSubmitting(true);

    try {
      // Send transaction to backend
      await addTransaction({
        medicine_id: selectedMedicine,
        txn_type_id: 5, // DISPENSE type ID
        txn_date: new Date().toISOString().split('T')[0],
        quantity: dispenseQuantity,
        remarks,
        created_by: 'admin',
      });

      // Clear form on success
      setSelectedMedicine('');
      setQuantity('');
      setRemarks('');
      setSearchQuery('');
    } catch (error: any) {
      console.error('Error dispensing medicine:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected medicine details
  const selectedMedicineData = medicines.find((m) => m.id === selectedMedicine);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <TrendingDown className="h-6 w-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Dispense Medicine</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Dispense Transaction</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Medicine Search + Select */}
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

                {/* Dropdown of results */}
                {searchQuery && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredMedicines.map((medicine) => {
                      const stock = getCurrentStock(medicine.id);
                      return (
                        <button
                          key={medicine.id}
                          type="button"
                          onClick={() => {
                            setSelectedMedicine(medicine.id);
                            setSearchQuery(medicine.name); // Show name in input
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-sm text-gray-500">
                            {medicine.dosage_form} • Available: {stock} {medicine.unit}
                          </div>
                          {stock === 0 && (
                            <div className="text-xs text-red-600 font-medium">
                              Out of Stock
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity to Dispense *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  max={selectedMedicineData ? getCurrentStock(selectedMedicineData.id) : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                {selectedMedicineData && (
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {getCurrentStock(selectedMedicineData.id)} {selectedMedicineData.unit}
                  </p>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Patient details, prescription info, etc..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  !selectedMedicine ||
                  !quantity ||
                  (selectedMedicineData && getCurrentStock(selectedMedicineData.id) === 0) ||
                  isSubmitting
                }
                className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Dispensing...</span>
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4" />
                    <span>Dispense Medicine</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Selected Medicine Details & Guidelines */}
        <div className="space-y-4">
          {/* Medicine Info */}
          {selectedMedicineData && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2">Selected Medicine</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-red-800">Name:</span>
                  <span className="ml-2 text-red-700">{selectedMedicineData.name}</span>
                </div>
                <div>
                  <span className="font-medium text-red-800">Form:</span>
                  <span className="ml-2 text-red-700">{selectedMedicineData.dosage_form}</span>
                </div>
                <div>
                  <span className="font-medium text-red-800">Unit:</span>
                  <span className="ml-2 text-red-700">{selectedMedicineData.unit}</span>
                </div>
                <div>
                  <span className="font-medium text-red-800">Available Stock:</span>
                  <span className="ml-2 text-red-700 font-semibold">
                    {getCurrentStock(selectedMedicineData.id)} {selectedMedicineData.unit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Dispense Guidelines</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>• Verify prescription before dispensing</div>
              <div>• Check expiration dates</div>
              <div>• Record patient information</div>
              <div>• Ensure proper dosage instructions</div>
              <div>• Update stock levels immediately</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispenseForm;
