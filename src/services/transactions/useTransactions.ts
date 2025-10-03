// src/services/transactions/useTransactions.ts
import { useState, useEffect } from "react";
import { message } from "antd";
import { supabase } from "../../lib/supabase";
import dayjs from "dayjs";

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  desc: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account_id: string;
  created_at?: string;
  updated_at?: string;
}

interface CreateTransactionInput {
  date: string;
  desc: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account_id: string;
}

interface UpdateTransactionInput extends CreateTransactionInput {
  id: string;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  loadTransactions: () => Promise<void>;
  createTransaction: (data: CreateTransactionInput) => Promise<Transaction | null>;
  updateTransaction: (data: UpdateTransactionInput) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getNetAmount: () => number;
}

export const useTransactions = (userId?: string): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadTransactions = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', targetUserId)
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      message.error('Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (data: CreateTransactionInput): Promise<Transaction | null> => {
    try {
      setCreating(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const transactionData = {
        user_id: user.id,
        date: data.date,
        desc: data.desc,
        amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
        type: data.type,
        category: data.category,
        account_id: data.account_id,
      };

      const { data: newTransaction, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => [newTransaction, ...prev]);
      message.success('Thêm giao dịch thành công!');
      
      return newTransaction;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      message.error('Không thể thêm giao dịch');
      return null;
    } finally {
      setCreating(false);
    }
  };

  const updateTransaction = async (data: UpdateTransactionInput): Promise<Transaction | null> => {
    try {
      setUpdating(true);

      const updateData = {
        date: data.date,
        desc: data.desc,
        amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
        type: data.type,
        category: data.category,
        account_id: data.account_id,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedTransaction, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => 
        prev.map(t => t.id === data.id ? updatedTransaction : t)
      );
      message.success('Cập nhật giao dịch thành công!');
      
      return updatedTransaction;
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      message.error('Không thể cập nhật giao dịch');
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      message.success('Xóa giao dịch thành công!');
      
      return true;
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      message.error('Không thể xóa giao dịch');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const getTransactionsByDateRange = (startDate: string, endDate: string): Transaction[] => {
    return transactions.filter(t => {
      const transactionDate = dayjs(t.date);
      return transactionDate.isSameOrAfter(dayjs(startDate), 'day') &&
             transactionDate.isSameOrBefore(dayjs(endDate), 'day');
    });
  };

  const getTotalIncome = (): number => {
    return transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpense = (): number => {
    return transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getNetAmount = (): number => {
    return getTotalIncome() - getTotalExpense();
  };

  useEffect(() => {
    if (userId) {
      loadTransactions();
    }
  }, [userId]);

  return {
    transactions,
    loading,
    creating,
    updating,
    deleting,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByDateRange,
    getTotalIncome,
    getTotalExpense,
    getNetAmount,
  };
};