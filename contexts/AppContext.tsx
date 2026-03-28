import React, { createContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_TRANSACTIONS } from '@/constants/data';

export type UserRole = 'collector' | 'center' | 'company';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  location: string;
  companyName?: string;
  avatar?: string;
  joinDate: string;
}

export interface Transaction {
  id: string;
  item: string;
  weight: number;
  type: string;
  earnings: number;
  date: string;
  points: number;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  totalEarned: number;
  totalWaste: number;
  co2Saved: number;
  points: number;
  transactions: Transaction[];
  login: (user: User) => void;
  logout: () => void;
  addTransaction: (tx: Transaction) => void;
}

export const AppContext = createContext<AppState | undefined>(undefined);

const calcCO2 = (waste: number) => waste * 2.1;

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [points, setPoints] = useState(922);

  useEffect(() => {
    loadPersistedUser();
  }, []);

  const loadPersistedUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('sheCycleUser');
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch {}
  };

  const totalEarned = transactions.reduce((sum, t) => sum + t.earnings, 0);
  const totalWaste = transactions.reduce((sum, t) => sum + t.weight, 0);
  const co2Saved = calcCO2(totalWaste);

  const login = async (newUser: User) => {
    setUser(newUser);
    setIsAuthenticated(true);
    try {
      await AsyncStorage.setItem('sheCycleUser', JSON.stringify(newUser));
    } catch {}
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      await AsyncStorage.removeItem('sheCycleUser');
    } catch {}
  };

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
    setPoints(prev => prev + tx.points);
  };

  return (
    <AppContext.Provider value={{
      user, isAuthenticated, totalEarned, totalWaste, co2Saved, points,
      transactions, login, logout, addTransaction,
    }}>
      {children}
    </AppContext.Provider>
  );
}
