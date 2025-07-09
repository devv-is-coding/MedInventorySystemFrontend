"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { TrendingDown, Search, Minus } from "lucide-react";

const DispenseForm: React.FC = () => {
  const { medicines, addTransaction, transactionTypes, getCurrentStock } =
    useApp();

  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState("5");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispenseTypes = transactionTypes.filter((d) =>
    [5, 6, 7, 8].includes(d.id)
  );
  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine || !quantity || parseInt(quantity) <= 0) return;

    const currentStock = getCurrentStock(selectedMedicine);
    const dispenseQty = parseInt(quantity);
    if (dispenseQty > currentStock) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        medicine_id: selectedMedicine,
        txn_type_id: parseInt(transactionType),
        txn_date: new Date().toISOString().split("T")[0],
        quantity: dispenseQty,
        remarks,
        created_by: "admin",
      });

      setSelectedMedicine("");
      setQuantity("");
      setRemarks("");
      setSearchQuery("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Dispense error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMedicineData = medicines.find((m) => m.id === selectedMedicine);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrendingDown className="h-6 w-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Dispense</h2>
      </div>

      {/* Trigger Box */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full p-10 rounded-xl border-2 border-dashed border-red-500 text-red-600 text-lg font-semibold hover:bg-red-50 transition"
      >
        + Tap to Dispense Medicine
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-200">
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>

            {/* Modal Title */}
            <h3 className="text-xl font-semibold text-red-600 mb-4">
              Dispense Medicine
            </h3>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Transaction Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-400 focus:outline-none"
                >
                  {dispenseTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Medicine
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicine..."
                    className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
                  />
                </div>

                {searchQuery && (
                  <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto bg-white shadow-sm">
                    {filteredMedicines.map((m) => {
                      const stock = getCurrentStock(m.id);
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => {
                            setSelectedMedicine(m.id);
                            setSearchQuery(m.name);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b"
                        >
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-gray-500">
                            {m.dosage_form} — Stock: {stock} {m.unit}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  max={
                    selectedMedicineData
                      ? getCurrentStock(selectedMedicineData.id)
                      : undefined
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
                {selectedMedicineData && (
                  <div className="text-xs text-gray-500 mt-1">
                    Available: {getCurrentStock(selectedMedicineData.id)}{" "}
                    {selectedMedicineData.unit}
                  </div>
                )}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
                  placeholder="Optional notes..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  !selectedMedicine ||
                  !quantity ||
                  isSubmitting ||
                  (selectedMedicineData &&
                    getCurrentStock(selectedMedicineData.id) === 0)
                }
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                {isSubmitting ? "Dispensing..." : "Dispense Medicine"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Dispensing Guidelines
        </h4>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Verify prescription before dispensing</li>
          <li>Check expiration date</li>
          <li>Record patient info</li>
          <li>Review dosage & instructions</li>
          <li>Update stock immediately</li>
        </ul>
      </div>
    </div>
  );
};

export default DispenseForm;
