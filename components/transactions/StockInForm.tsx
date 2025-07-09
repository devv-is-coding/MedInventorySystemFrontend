"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { TrendingUp, Plus, Search, X } from "lucide-react";

const StockInForm: React.FC = () => {
  const {
    medicines,
    addTransaction,
    transactionTypes,
    getCurrentStock,
    transactions,
  } = useApp();

  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [transactionType, setTransactionType] = useState("2");
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const rddTypes = transactionTypes.filter((t) => [2, 3, 4].includes(t.id));
  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine || !quantity || parseInt(quantity) <= 0) return;

    const medicine = medicines.find((m) => m.id === selectedMedicine);
    if (!medicine) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        medicine_id: selectedMedicine,
        txn_type_id: parseInt(transactionType),
        txn_date: new Date().toISOString().split("T")[0],
        quantity: parseInt(quantity),
        remarks,
        created_by: "admin",
      });
      setSelectedMedicine("");
      setQuantity("");
      setRemarks("");
      setSearchQuery("");
      setShowModal(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const todayRDDCounts = rddTypes.reduce((acc, type) => {
    acc[type.id] = transactions
      .filter(
        (txn) =>
          txn.txn_type_id === type.id &&
          new Date(txn.txn_date).toISOString().split("T")[0] === today
      )
      .reduce((sum, txn) => sum + txn.quantity, 0);
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="space-y-6">
      {/* Big Summary Box */}
      <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-green-800">
            Today's RDD Summary
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg font-semibold">
          {rddTypes.map((type) => (
            <div
              key={type.id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              <p className="text-gray-600">{type.label}</p>
              <p className="text-2xl text-gray-900">
                {todayRDDCounts[type.id] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Stock In Trigger Button */}
      <div
        onClick={() => setShowModal(true)}
        className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-green-500 bg-white rounded-xl p-10 text-center transition-colors"
      >
        <Plus className="mx-auto h-8 w-8 text-green-600 mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Add Stock In Transaction
        </h3>
        <p className="text-sm text-gray-500 mt-1">Tap to open form</p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-200">
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>

            {/* Modal Title */}
            <h3 className="text-xl font-semibold text-green-600 mb-4">
              Add Stock In Transaction
            </h3>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Transaction Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Transaction Type *
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none"
                >
                  {rddTypes.map((type) => (
                    <option key={type.id} value={type.id.toString()}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medicine Search */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Medicine *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicine..."
                    className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                  />
                </div>

                {searchQuery && (
                  <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto bg-white shadow-sm">
                    {filteredMedicines.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          setSelectedMedicine(m.id);
                          setSearchQuery(m.name);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {m.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {m.dosage_form} • Stock: {getCurrentStock(m.id)}{" "}
                          {m.unit}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                  required
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                  placeholder="Optional notes..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedMedicine || !quantity || isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                {isSubmitting ? "Adding..." : "Add Stock In"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInForm;
