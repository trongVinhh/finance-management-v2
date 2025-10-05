import { useState, useMemo, useCallback } from "react";
import { message } from "antd";
import { useTransactions } from "../transactions/useTransactions";
import { useAuth } from "../../contexts/AuthContext";
import { useCategories } from "../categories/useCategories";

export interface IncomeFilters {
  searchText: string;
  selectedType?: string;
  dateRange: [string, string] | null;
}

export interface IncomeSummary {
  totalIncome: number;
  transactionCount: number;
  averageIncome: number;
  maxIncome: number;
  minIncome: number;
}

export const useIncome = () => {
  const { user } = useAuth();
  const { categories } = useCategories(user.id);
  const { transactions } = useTransactions(user.id);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<IncomeFilters>({
    searchText: "",
    selectedType: undefined,
    dateRange: null,
  });

  // Lọc chỉ lấy income transactions
  const incomeTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === "income");
  }, [transactions]);
  console.log("income trans", incomeTransactions);

  // Filtered incomes với search, type, date
  const filteredIncomes = useMemo(() => {
    return incomeTransactions.filter((income) => {
      const matchSearch =
        !filters.searchText ||
        income.desc?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        income.category
          ?.toLowerCase()
          .includes(filters.searchText.toLowerCase());

      const matchType =
        !filters.selectedType || income.category === filters.selectedType;

      const matchDate =
        !filters.dateRange ||
        (income.date >= filters.dateRange[0] &&
          income.date <= filters.dateRange[1]);

      return matchSearch && matchType && matchDate;
    });
  }, [incomeTransactions, filters]);

  // Summary calculations
  const summary: IncomeSummary = useMemo(() => {
    if (filteredIncomes.length === 0) {
      return {
        totalIncome: 0,
        transactionCount: 0,
        averageIncome: 0,
        maxIncome: 0,
        minIncome: 0,
      };
    }

    const amounts = filteredIncomes.map((i) => Math.abs(i.amount));
    const totalIncome = amounts.reduce((sum, amount) => sum + amount, 0);

    return {
      totalIncome,
      transactionCount: filteredIncomes.length,
      averageIncome: Math.round(totalIncome / filteredIncomes.length),
      maxIncome: Math.max(...amounts),
      minIncome: Math.min(...amounts),
    };
  }, [filteredIncomes]);
  const incomeCategories = categories
    .filter((x) => x.type === "income")
    .map((x) => {
      const name = { label: x.name, value: x.name };
      return name;
    });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<IncomeFilters>) => {
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
        ...filteredIncomes.map((income) => [
          income.category || "",
          Math.abs(income.amount).toString(),
          income.desc || "",
          income.date,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `income_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      message.success("Xuất file CSV thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi xuất file!");
      console.error("Error exporting CSV:", error);
    }
  }, [filteredIncomes]);

  // Get income by category statistics
  const incomeByType = useMemo(() => {
    const categoryMap = new Map<string, number>();

    filteredIncomes.forEach((income) => {
      const category = income.category || "Khác";
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + Math.abs(income.amount));
    });

    return Array.from(categoryMap.entries())
      .map(([type, amount]) => ({
        type,
        amount,
        percentage:
          summary.totalIncome > 0
            ? parseFloat(((amount / summary.totalIncome) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredIncomes, summary.totalIncome]);

  return {
    // State
    incomes: filteredIncomes,
    allIncomes: incomeTransactions,
    isLoading,
    isModalOpen,
    filters,

    // Summary
    summary,
    incomeTypes: incomeCategories,
    incomeByType,

    // Actions
    setIsModalOpen,
    updateFilters,
    resetFilters,
    refreshData,
    exportToCSV,
  };
};

export default useIncome;
