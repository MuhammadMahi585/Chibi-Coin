import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addTransaction,
  updateRecentTransaction,
  deleteRecentTransaction,
  updateUpcomingTransaction,
  deleteUpcomingTransaction,
  calculateBalance,
} from "./transactions";
import { addBudget, deleteBudget } from "./budgets";
import { addGoal, updateGoal, deleteGoal } from "./goals";
import { updateUserImage, updateUserField } from "./user";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
      password: null,
      currency: "PKR",
      imageUri: null,
    },
    budget: [],
    goals: [],
    balance: 0,
    income: 0,
    expense: 0,
    recentTransactions: [],
    upcomingTransactions: [],
    notifications: [
      { id: 1, title: "Welcome", details: "Welcome to Chibi-Coin!" },
    ],
    balanceHistory: [
      { date: "2023-01-01", balance: 1000 },
      { date: "2023-02-01", balance: 1200 },
      { date: "2023-03-01", balance: 1100 },
      { date: "2023-04-01", balance: 1300 },
      { date: "2023-05-01", balance: 1250 },
    ],
  });

  const loadUserData = async (email) => {
    try {
      const jsonValue = await AsyncStorage.getItem(`@data_${email}`);
      if (jsonValue != null) {
        setData(JSON.parse(jsonValue));
      } else {
        // If no data exists for the user, create new data with default values
        setData({
          user: {
            name: "John Doe",
            email,
            password: null,
            currency: "PKR",
            imageUri: null,
          },
          budget: [],
          goals: [],
          balance: 0,
          income: 0,
          expense: 0,
          recentTransactions: [],
          upcomingTransactions: [],
          notifications: [
            { id: 1, title: "Welcome", details: "Welcome to Chibi-Coin!" },
          ],
          balanceHistory: [],
        });
      }
    } catch (e) {
      console.error("Failed to load data from storage", e);
    }
  };

  useEffect(() => {
    const saveData = async () => {
      try {
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(`@data_${data.user.email}`, jsonValue);
      } catch (e) {
        console.error("Failed to save data to storage", e);
      }
    };

    saveData();
  }, [data]);

  // Recalculate balance, income, and expense whenever recentTransactions or user currency change
  useEffect(() => {
    calculateBalance(data, setData);
  }, [data.recentTransactions, data.user.currency]);

  // Recalculate budget whenever recentTransactions change
  useEffect(() => {
    const recalculateBudgets = () => {
      setData((prevData) => {
        const updatedBudgets = prevData.budget.map((budget) => {
          const { category, startDate, endDate } = budget;
          const transactions = prevData.recentTransactions.filter(
            (transaction) =>
              transaction.category === category &&
              new Date(transaction.date) >= new Date(startDate) &&
              new Date(transaction.date) <= new Date(endDate)
          );
          const amount = transactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
          );
          return { ...budget, amount };
        });
        return { ...prevData, budget: updatedBudgets };
      });
    };

    recalculateBudgets();
  }, [data.recentTransactions]);

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      setData({
        user: {
          name: "John Doe",
          email: "john.doe@example.com",
          password: null,
          currency: "PKR",
          imageUri: null,
        },
        budget: [],
        goals: [],
        balance: 0,
        income: 0,
        expense: 0,
        recentTransactions: [],
        upcomingTransactions: [],
        notifications: [
          { id: 1, title: "Welcome", details: "Welcome to Chibi-Coin!" },
        ],
        balanceHistory: [],
      });
    } catch (e) {
      console.error("Failed to clear storage", e);
    }
  };

  const getUserEmail = (email) => {
    loadUserData(email);
  };

  return (
    <DataContext.Provider
      value={{
        data,
        setData,
        addBudget: (newBudget) => addBudget(data, setData, newBudget),
        addGoal: (newGoal) => addGoal(data, setData, newGoal),
        updateGoal: (goalId, amountToAdd) =>
          updateGoal(data, setData, goalId, amountToAdd),
        updateUserImage: (imageUri) => updateUserImage(data, setData, imageUri),
        updateUserField: (field, value) =>
          updateUserField(data, setData, field, value),
        addTransaction: (newTransaction) =>
          addTransaction(data, setData, newTransaction),
        updateUpcomingTransaction: (updatedTransaction) =>
          updateUpcomingTransaction(data, setData, updatedTransaction),
        deleteUpcomingTransaction: (transactionId) =>
          deleteUpcomingTransaction(data, setData, transactionId),
        updateRecentTransaction: (updatedTransaction) =>
          updateRecentTransaction(data, setData, updatedTransaction),
        deleteRecentTransaction: (transactionId) =>
          deleteRecentTransaction(data, setData, transactionId),
        deleteGoal: (goalId) => deleteGoal(data, setData, goalId),
        deleteBudget: (budgetId) => deleteBudget(data, setData, budgetId),
        clearStorage,
        getUserEmail, // Add this to the context value
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
