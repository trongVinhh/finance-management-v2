// src/services/transactions/useTransactions.ts
import { useState, useEffect } from "react";
import { message } from "antd";
import { supabase } from "../../lib/supabase";
import dayjs from "dayjs";
import { useAccounts } from "../accounts/useAccounts";
import { useSettings } from "../settings/useSettings";
import { useNotify } from "../../contexts/NotifycationContext";

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  desc: string;
  amount: number;
  type: "income" | "expense" | "suddenly";
  category: string;
  account_id: string;
  created_at?: string;
  updated_at?: string;
}

interface CreateTransactionInput {
  date: string;
  desc: string;
  amount: number;
  type: "income" | "expense" | "suddenly";
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
  createTransaction: (
    data: CreateTransactionInput
  ) => Promise<Transaction | null>;
  updateTransaction: (
    data: UpdateTransactionInput
  ) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  getTransactionsByDateRange: (
    startDate: string,
    endDate: string
  ) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getNetAmount: () => number;
}

export const useTransactions = (userId?: string): UseTransactionsReturn => {
  const { getAccountById, updateBalance } = useAccounts(userId!);
  const { settings } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const notify = useNotify();

  const loadTransactions = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", targetUserId)
        .order("date", { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      setLoading(false);
    } catch (error: any) {
      console.error("Error loading transactions:", error);
      message.error("Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (
    data: CreateTransactionInput
  ): Promise<Transaction | null> => {
    try {
      setCreating(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const transactionData = {
        user_id: user.id,
        date: data.date,
        desc: data.desc,
        amount: data.amount,
        type: data.type,
        category: data.category,
        account_id: data.account_id,
      };

      // Update amount of account
      const account = getAccountById(data.account_id);
      if (data.type === "expense" || data.type === "suddenly") {
        const newBalance = account!.amount - data.amount;
        updateBalance(data.account_id, newBalance);
      } else {
        if (transactionData.category === "Lương") {
          const allocations = settings?.allocations;
          let amountAllocated = 0;
          if (allocations) {
            let total = 0;
            for (const { amount } of allocations) {
              total += amount;
            }

            if (total < data.amount) {
              notify("error", "Thất bại!", "Số tiền phân bổ vượt quá tổng thu nhập!");
              return null;
            } else if (total > data.amount) {
              notify("error", "Thất bại!", "Số tiền phân bổ vượt ít hơn tổng thu nhập!");
              return null;
            } else {
              for (const { amount, accountId } of allocations) {
                const account = getAccountById(accountId);
                const newAmount = account!.amount + amount;
                amountAllocated += amount;
                updateBalance(accountId, newAmount);
              }
            }
          }
        } else {
          const newBalance = account!.amount + data.amount;
          await updateBalance(data.account_id, newBalance);
        }
      }

      const { data: newTransaction, error } = await supabase
        .from("transactions")
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      setTransactions((prev) => [newTransaction, ...prev]);
      message.success("Thêm giao dịch thành công!");

      return newTransaction;
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      message.error("Không thể thêm giao dịch");
      return null;
    } finally {
      setCreating(false);
    }
  };

  const updateTransaction = async (
    data: UpdateTransactionInput
  ): Promise<Transaction | null> => {
    try {
      setUpdating(true);

      const updateData = {
        date: data.date,
        desc: data.desc,
        amount:
          data.type === "expense"
            ? -Math.abs(data.amount)
            : Math.abs(data.amount),
        type: data.type,
        category: data.category,
        account_id: data.account_id,
        updated_at: new Date().toISOString(),
      };

      // Update transaction, amount of account
      const transaction = getTransactionById(data.id);
      const account = getAccountById(data.account_id);

      if (!transaction || !account)
        throw new Error("Transaction or account not found");

      let newBalance = account.amount;
      if (transaction.type === "expense" || transaction.type === "suddenly") {
        newBalance += transaction.amount; // Hoàn tiền đã trừ
      } else {
        newBalance -= transaction.amount; // Hoàn tiền đã cộng
      }
      if (data.type === "expense" || data.type === "suddenly") {
        newBalance -= data.amount;
      } else {
        newBalance += data.amount;
      }

      updateBalance(data.account_id, newBalance);

      const { data: updatedTransaction, error } = await supabase
        .from("transactions")
        .update(updateData)
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;

      setTransactions((prev) =>
        prev.map((t) => (t.id === data.id ? updatedTransaction : t))
      );
      message.success("Cập nhật giao dịch thành công!");

      return updatedTransaction;
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      message.error("Không thể cập nhật giao dịch");
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);

      // Update transaction, amount of account
      const transaction = getTransactionById(id);
      if (transaction?.category == "Lương") {
        const allocations = settings?.allocations;
        let amountNonAllocated = transaction.amount;
        let amountAllocated = 0;
        if (allocations) {
          for (const { amount, accountId } of allocations) {
            const account = getAccountById(accountId);
            const newAmount = account!.amount - amount;
            amountAllocated += amount;
            amountNonAllocated -= amountAllocated;
            updateBalance(accountId, newAmount);
          }
        }
        if (amountNonAllocated > 0) {
          const defaultAccount = getAccountById(settings!.default_account_id);
          const newAmount = defaultAccount!.amount - amountNonAllocated;
          updateBalance(settings!.default_account_id, newAmount);
        }
      } else {
        const account = getAccountById(transaction!.account_id);

        if (!transaction || !account)
          throw new Error("Transaction or account not found");

        let newBalance = account.amount;
        if (transaction.type === "expense" || transaction.type === "suddenly") {
          newBalance += transaction.amount;
        } else {
          newBalance -= transaction.amount; // Hoàn tiền đã cộng
        }

        updateBalance(transaction.account_id, newBalance);
      }

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      message.success("Xóa giao dịch thành công!");

      return true;
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      message.error("Không thể xóa giao dịch");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const getTransactionsByDateRange = (
    startDate: string,
    endDate: string
  ): Transaction[] => {
    return transactions.filter((t) => {
      const transactionDate = dayjs(t.date);
      return (
        transactionDate.isSameOrAfter(dayjs(startDate), "day") &&
        transactionDate.isSameOrBefore(dayjs(endDate), "day")
      );
    });
  };

  const getTotalIncome = (): number => {
    return transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpense = (): number => {
    return transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getNetAmount = (): number => {
    return getTotalIncome() - getTotalExpense();
  };

  const getTransactionById = (id: string) => {
    return transactions.find((t) => t.id === id);
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
