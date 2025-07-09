'use client'; // Next.js directive to render this file on the client

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

/* ----------------------------------
   TypeScript Interfaces for Entities
----------------------------------- */
export interface Medicine {
  id: string;
  name: string;
  unit: string;
  dosage_form: string;
  description: string;
  current_stock?: number | string;
  created_at: string;
  updated_at: string;
}

export interface TransactionType {
  id: number;
  code: string;
  label: string;
}

export interface StockTransaction {
  id: string;
  medicine_id: string;
  medicine?: Medicine;
  txn_type_id: number;
  transaction_type?: TransactionType;
  txn_date: string;
  quantity: number;
  remarks?: string;
  created_by: string;
  created_at: string;
}

export interface MonthlyReport {
  medicine_id: string;
  medicine: Medicine;
  year: number;
  month: number;
  opening_stock: number;
  total_return: number;
  total_donation: number;
  total_new_added: number;
  total_dispensed: number;
  closing_stock: number;
}

/* ----------------------------------
   Context Shape
----------------------------------- */
export interface AppContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authToken: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  searchMedicines: (query: string) => Medicine[];
  loadMedicines: () => Promise<void>;

  transactions: StockTransaction[];
  transactionTypes: TransactionType[];
  addTransaction: (transaction: Omit<StockTransaction, 'id' | 'created_at'>) => Promise<void>;
  getTransactionsByDate: (date: string) => Promise<StockTransaction[]>;
  getCurrentStock: (medicineId: string) => number;
  getMonthlyReport: (year: number, month: number) => Promise<MonthlyReport[]>;
  performMonthClose: (year: number, month: number) => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadTransactionTypes: () => Promise<void>;
}
/* ----------------------------------
   Context Setup
----------------------------------- */
const AppContext = createContext<AppContextType | undefined>(undefined);

/* ----------------------------------
   API Config
----------------------------------- */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
console.log('API_URL configured as:', API_URL);

// Axios instance with interceptors for token & error handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
  timeout: 10000,
});

// Automatically attach token to all requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 (unauthorized) and 419 (CSRF)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      Cookies.remove('authToken');
      if (typeof window !== 'undefined') window.location.href = '/';
    }
    if (error.response?.status === 419) {
      console.error('CSRF Token Mismatch');
    }
    return Promise.reject(error);
  }
);

/* ----------------------------------
   AppProvider: Wrap your app in this
----------------------------------- */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);

  // Load initial data if token is present
  useEffect(() => {
    const initializeApp = async () => {
      const token = Cookies.get('authToken');
      if (token) {
        setAuthToken(token);
        try {
          const response = await api.get('/profile');
          if (response.data.status) {
            setIsAuthenticated(true);
            await Promise.all([
              loadMedicines(),
              loadTransactions(),
              loadTransactionTypes(),
            ]);
          } else {
            throw new Error('Invalid token');
          }
        } catch {
          Cookies.remove('authToken');
          setAuthToken(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  /* ----------------------------
     Auth Methods
  ---------------------------- */
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post('/login', { username, password });
      if (response.data.status) {
        const token = response.data.token;
        Cookies.set('authToken', token, { expires: 7 });
        setAuthToken(token);
        setIsAuthenticated(true);
        await Promise.all([loadMedicines(), loadTransactions(), loadTransactionTypes()]);
        toast.success('Login successful!');
        return true;
      }
      toast.error(response.data.message || 'Invalid credentials');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {}
    setIsAuthenticated(false);
    setAuthToken(null);
    Cookies.remove('authToken');
    setMedicines([]);
    setTransactions([]);
    setTransactionTypes([]);
    toast.success('Logout successful');
  };

  /* ----------------------------
     Medicine Methods
  ---------------------------- */
  const loadMedicines = async () => {
    try {
      const response = await api.get('/medicines');
      if (response.data.status) {
        setMedicines(response.data.data);
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  const addMedicine = async (medicine: Omit<Medicine, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await api.post('/medicines', medicine);
      if (response.data.status) {
        await loadMedicines();
        toast.success('Medicine added successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add medicine');
      throw error;
    }
  };

  const updateMedicine = async (id: string, medicine: Partial<Medicine>) => {
    try {
      const response = await api.put(`/medicines/${id}`, medicine);
      if (response.data.status) {
        await loadMedicines();
        toast.success('Medicine updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update medicine');
      throw error;
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      const response = await api.delete(`/medicines/${id}`);
      if (response.data.status) {
        await loadMedicines();
        toast.success('Medicine deleted successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
      throw error;
    }
  };

  const searchMedicines = (query: string): Medicine[] => {
    if (!query) return medicines;
    return medicines.filter((m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.unit.toLowerCase().includes(query.toLowerCase()) ||
      m.dosage_form.toLowerCase().includes(query.toLowerCase())
    );
  };

  /* ----------------------------
     Transaction Methods
  ---------------------------- */
  const loadTransactions = async () => {
    try {
      const response = await api.get('/stock-transactions');
      if (response.data.status) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadTransactionTypes = async () => {
    try {
      const response = await api.get('/transaction-types');
      if (response.data.status) {
        setTransactionTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error loading transaction types:', error);
    }
  };

  const addTransaction = async (
    transaction: Omit<StockTransaction, 'id' | 'created_at'>
  ) => {
    try {
      const response = await api.post('/stock-transactions', transaction);
      if (response.data.status) {
        await Promise.all([loadTransactions(), loadMedicines()]);
        toast.success('Transaction recorded successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record transaction');
      throw error;
    }
  };

 const getTransactionsByDate = async (date: string): Promise<StockTransaction[]> => {
  try {
    const response = await api.get('/reports/daily', { params: { date } });
    if (response.data.status) {
      return response.data.data;
    } else {
      toast.error('Failed to load daily report');
      return [];
    }
  } catch (error) {
    console.error('Error fetching daily transactions:', error);
    toast.error('Error fetching daily report');
    return [];
  }
};


  const getCurrentStock = (medicineId: string): number => {
    const medicine = medicines.find((m) => m.id === medicineId);
    if (!medicine || medicine.current_stock === undefined || medicine.current_stock === null) {
      return 0;
    }
    const raw = String(medicine.current_stock);
    const match = raw.match(/\d+/); // Extract first numeric value from mixed string
    return match ? parseInt(match[0]) : 0;
  };

  /* ----------------------------
     Reports
  ---------------------------- */
  const getMonthlyReport = async (year: number, month: number): Promise<MonthlyReport[]> => {
    try {
      const response = await api.get('/reports/monthly', { params: { year, month } });
      return response.data.status ? response.data.data : [];
    } catch (error) {
      console.error('Error getting monthly report:', error);
      return [];
    }
  };

  const performMonthClose = async (year: number, month: number): Promise<void> => {
    try {
      const response = await api.post('/reports/month-close', { year, month });
      if (response.data.status) {
        await Promise.all([loadTransactions(), loadMedicines()]);
        toast.success('Month closed successfully! Forward stocks created.');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error closing month.');
      throw error;
    }
  };

  /* ----------------------------------
     Context Value
  ----------------------------------- */
  const value: AppContextType = {
    isAuthenticated,
    isLoading,
    authToken,
    login,
    logout,
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    searchMedicines,
    loadMedicines,
    transactions,
    transactionTypes,
    addTransaction,
    getTransactionsByDate,
    getCurrentStock,
    getMonthlyReport,
    performMonthClose,
    loadTransactions,
    loadTransactionTypes,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/* ----------------------------------
   Custom Hook for Easier Use
----------------------------------- */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Optional alias
export const myAppHook = useApp;
