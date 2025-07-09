"use client"; // Ensures this component runs on the client side (Next.js)

import React, { useState } from "react";
import { useApp } from "@/context/AppContext"; // Import global app context
import { Plus, Search, Edit, Trash2, Package, Pill } from "lucide-react"; // Icon imports

// Type definition for medicine form input fields
interface MedicineFormData {
  name: string;
  unit: string;
  dosage_form: string;
  description: string;
}

const MedicineList: React.FC = () => {
  // Pull actions and data from app context
  const {
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    getCurrentStock,
  } = useApp();

  // Local state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<string | null>(null);
  const [formData, setFormData] = useState<MedicineFormData>({
    name: "",
    unit: "",
    dosage_form: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter medicines based on the search query
  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.dosage_form.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handles form submission for adding/updating medicine
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.unit || !formData.dosage_form) return;

    setIsSubmitting(true);

    try {
      if (editingMedicine) {
        await updateMedicine(editingMedicine, formData);
        setEditingMedicine(null);
      } else {
        await addMedicine(formData);
      }

      // Reset form after submission
      setFormData({ name: "", unit: "", dosage_form: "", description: "" });
      setShowForm(false);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load selected medicine into form for editing
  const handleEdit = (medicine: any) => {
    setFormData({
      name: medicine.name,
      unit: medicine.unit,
      dosage_form: medicine.dosage_form,
      description: medicine.description,
    });
    setEditingMedicine(medicine.id);
    setShowForm(true);
  };

  // Handle medicine deletion
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await deleteMedicine(id);
      } catch (error: any) {
        console.error("Error deleting medicine:", error);
      }
    }
  };

  // Reset form state
  const resetForm = () => {
    setFormData({ name: "", unit: "", dosage_form: "", description: "" });
    setEditingMedicine(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header + Add Medicine Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Medicines Catalog</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Medicine Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-fadeIn">
            {/* Modal Title */}
            <h3 className="text-xl font-semibold text-blue-600 mb-6 text-center">
              {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
            </h3>

            {/* Close Button */}
            <button
              onClick={resetForm}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              {/* Unit */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Unit *
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="e.g. tablet, mL, capsule"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              {/* Dosage Form */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Dosage Form *
                </label>
                <input
                  type="text"
                  value={formData.dosage_form}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage_form: e.target.value })
                  }
                  placeholder="e.g. tablet, syrup, injection"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Optional"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingMedicine ? "Updating..." : "Adding..."}
                    </div>
                  ) : (
                    `${editingMedicine ? "Update" : "Add"} Medicine`
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medicine List Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Medicines ({filteredMedicines.length})
          </h3>
        </div>

        {/* Table for displaying medicine data */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dosage Form
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => {
                const currentStock = getCurrentStock(medicine.id);
                return (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Pill className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {medicine.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {medicine.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {medicine.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {medicine.dosage_form}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-gray-500" />
                        <span
                          className={`text-sm font-medium ${
                            currentStock < 10
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {currentStock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(medicine)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(medicine.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicineList;
  