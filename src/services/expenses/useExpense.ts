import { useState, useMemo, useCallback } from "react";
import { message } from "antd";
import { useTransactions } from "../transactions/useTransactions";
import { useAuth } from "../../contexts/AuthContext";
import { useCategories } from "../categories/useCategories";

export interface ExpenseFilters {
  searchText: string;
  selectedType?: string;
  dateRange: [string, string] | null;
}

export interface ExpenseSummary {
  totalexpense: number;
  transactionCount: number;
  averageexpense: number;
  maxexpense: number;
  minexpense: number;
}

export const useExpense = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions(user.id);
  const { categories } = useCategories(user.id);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log("categories", categories);
  // Filter states
  const [filters, setFilters] = useState<ExpenseFilters>({
    searchText: "",
    selectedType: undefined,
    dateRange: null,
  });

  // Lọc chỉ lấy expense transactions
  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === "expense" || t.type === "suddenly");
  }, [transactions]);
  console.log("expense trans", expenseTransactions);

  // Filtered expenses với search, type, date
  const filteredExpenses = useMemo(() => {
    return expenseTransactions.filter((expense) => {
      const matchSearch =
        !filters.searchText ||
        expense.desc
          ?.toLowerCase()
          .includes(filters.searchText.toLowerCase()) ||
        expense.category
          ?.toLowerCase()
          .includes(filters.searchText.toLowerCase());

      const matchType =
        !filters.selectedType || expense.category === filters.selectedType;

      const matchDate =
        !filters.dateRange ||
        (expense.date >= filters.dateRange[0] &&
          expense.date <= filters.dateRange[1]);

      return matchSearch && matchType && matchDate;
    });
  }, [expenseTransactions, filters]);

  // Summary calculations
  const summary: ExpenseSummary = useMemo(() => {
    if (filteredExpenses.length === 0) {
      return {
        totalexpense: 0,
        transactionCount: 0,
        averageexpense: 0,
        maxexpense: 0,
        minexpense: 0,
      };
    }

    const amounts = filteredExpenses.map((i) => Math.abs(i.amount));
    const totalexpense = amounts.reduce((sum, amount) => sum + amount, 0);

    return {
      totalexpense,
      transactionCount: filteredExpenses.length,
      averageexpense: Math.round(totalexpense / filteredExpenses.length),
      maxexpense: Math.max(...amounts),
      minexpense: Math.min(...amounts),
    };
  }, [filteredExpenses]);
  const expenseCategories = categories
    .filter((x) => x.type === "expense"  || x.type === "suddenly")
    .map((x) => {
      const name = { label: x.name, value: x.name };
      return name;
    });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ExpenseFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      searchText: "",
      selectedType: undefined,
      dateRange: null,
    });
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Làm mới dữ liệu thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi làm mới dữ liệu!");
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    try {
      const csvContent = [
        ["Loại", "Số tiền", "Ghi chú", "Ngày tạo"],
        ...filteredExpenses.map((expense) => [
          expense.category || "",
          Math.abs(expense.amount).toString(),
          expense.desc || "",
          expense.date,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `expense_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      message.success("Xuất file CSV thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi xuất file!");
      console.error("Error exporting CSV:", error);
    }
  }, [filteredExpenses]);

  // Get expense by category statistics
  const expenseByType = useMemo(() => {
    const categoryMap = new Map<string, number>();

    filteredExpenses.forEach((expense) => {
      const category = expense.category || "Khác";
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + Math.abs(expense.amount));
    });

    return Array.from(categoryMap.entries())
      .map(([type, amount]) => ({
        type,
        amount,
        percentage:
          summary.totalexpense > 0
            ? parseFloat(((amount / summary.totalexpense) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, summary.totalexpense]);

  return {
    // State
    expenses: filteredExpenses,
    allexpenses: expenseTransactions,
    isLoading,
    isModalOpen,
    filters,

    // Summary
    summary,
    expenseTypes: expenseCategories,
    expenseByType,

    // Actions
    setIsModalOpen,
    updateFilters,
    resetFilters,
    refreshData,
    exportToCSV,
  };
};

export default useExpense;
