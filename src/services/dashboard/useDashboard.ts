import { useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useTransactions } from "../transactions/useTransactions";
import { useAuth } from "../../contexts/AuthContext";

export interface CategoryStat {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  totalSaveAndShare: number;
  totalSuddenly: number;
}

export type FilterMode = "month" | "year" | "all";

export const useDashboard = () => {
  const { user } = useAuth();
  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const { transactions } = useTransactions(user.id);
  const [isLoading, setIsLoading] = useState(false);
  console.log("transactions", transactions);
  // Filter giao dịch theo mode
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = dayjs(t.date);
      if (filterMode === "month") {
        return d.isSame(selectedDate, "month");
      } else if (filterMode === "year") {
        return d.isSame(selectedDate, "year");
      }
      return true;
    });
  }, [transactions, filterMode, selectedDate]);
  const getTransactionsByCategory = (categoryName: string) => {
    return transactions.filter((t) => {
      const d = dayjs(t.date);
      if (filterMode === "month") {
        return d.isSame(selectedDate, "month");
      } else if (filterMode === "year") {
        return d.isSame(selectedDate, "year");
      }
      return true;
    }).filter((t) => t.category === categoryName);
  };

  // Tính toán summary từ filtered transactions
  const summary: DashboardSummary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.group === "THU_NHAP")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpense = filteredTransactions
      .filter((t) => t.group === "CHI_TIEU")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const totalSuddenly = filteredTransactions
      .filter((t) => t.group === "BAT_NGO")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const totalSaveAndShare = filteredTransactions
      .filter((t) => t.group === "SAVE_AND_SHARE")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalIncome,
      totalExpense,
      totalSuddenly,
      totalSaveAndShare
    };
  }, [filteredTransactions]);

  // Tính toán category stats từ filtered transactions
  const categoryExpenseStats: CategoryStat[] = useMemo(() => {
    // const expenseTransactions = filteredTransactions.filter(
    //   (t) => t.type === "expense"
    // );
    const expenseTransactions = filteredTransactions.filter(
      (t) => t.group === "CHI_TIEU"
    );
    const totalExpense = expenseTransactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    // Group by category
    const categoryMap = new Map<string, number>();
    expenseTransactions.forEach((t) => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Math.abs(t.amount));
    });

    // Convert to array with colors
    const colors = [
      "#ff4d4f",
      "#1890ff",
      "#52c41a",
      "#faad14",
      "#722ed1",
      "#8c8c8c",
      "#eb2f96",
      "#13c2c2",
    ];

    return Array.from(categoryMap.entries())
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage:
          totalExpense > 0
            ? parseFloat(((amount / totalExpense) * 100).toFixed(1))
            : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Tính toán category stats từ filtered transactions
  const categoryIncomeStats: CategoryStat[] = useMemo(() => {
    const categoryIncomeStats = filteredTransactions.filter(
      (t) => t.group === "THU_NHAP"
    );
    const totalIncome = categoryIncomeStats.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    // Group by category
    const categoryMap = new Map<string, number>();
    categoryIncomeStats.forEach((t) => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Math.abs(t.amount));
    });

    // Convert to array with colors
    const colors = [
      "#13c2c2",
      "#eb2f96",
      "#8c8c8c",
      "#722ed1",
      "#faad14",
      "#52c41a",
      "#1890ff",
      "#ff4d4f",
    ];

    return Array.from(categoryMap.entries())
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage:
          totalIncome > 0
            ? parseFloat(((amount / totalIncome) * 100).toFixed(1))
            : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Tính toán category stats từ filtered transactions
  const categorySuddenStats: CategoryStat[] = useMemo(() => {
    const categoryIncomeStats = filteredTransactions.filter(
      (t) => t.group === "BAT_NGO"
    );
    const totalIncome = categoryIncomeStats.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    // Group by category
    const categoryMap = new Map<string, number>();
    categoryIncomeStats.forEach((t) => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Math.abs(t.amount));
    });

    // Convert to array with colors
    const colors = [
      "#13c2c2",
      "#eb2f96",
      "#8c8c8c",
      "#722ed1",
      "#faad14",
      "#52c41a",
      "#1890ff",
      "#ff4d4f",
    ];

    return Array.from(categoryMap.entries())
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage:
          totalIncome > 0
            ? parseFloat(((amount / totalIncome) * 100).toFixed(1))
            : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Tính toán category stats từ filtered transactions
  const categorySaveAndShareStats: CategoryStat[] = useMemo(() => {
    const categoryIncomeStats = filteredTransactions.filter(
      (t) => t.group === "SAVE_AND_SHARE"
    );
    const totalIncome = categoryIncomeStats.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    // Group by category
    const categoryMap = new Map<string, number>();
    categoryIncomeStats.forEach((t) => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Math.abs(t.amount));
    });

    // Convert to array with colors
    const colors = [
      "#13c2c2",
      "#eb2f96",
      "#8c8c8c",
      "#722ed1",
      "#faad14",
      "#52c41a",
      "#1890ff",
      "#ff4d4f",
    ];

    return Array.from(categoryMap.entries())
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage:
          totalIncome > 0
            ? parseFloat(((amount / totalIncome) * 100).toFixed(1))
            : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Tính monthly trend (giữ nguyên mock data hoặc tính từ transactions)
  const monthlyTrend: MonthlyTrend[] = useMemo(() => {
    // Nếu muốn tính động từ transactions
    const last4Months = Array.from({ length: 4 }, (_, i) => {
      const month = dayjs().subtract(3 - i, "month");
      const monthTransactions = transactions.reverse().filter((t) =>
        dayjs(t.date).isSame(month, "month")
      );

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const expense = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        month: `Tháng ${month.month()}`,
        income,
        expense,
      };
    });

    return last4Months;
  }, [transactions]);

  // Refresh data (có thể gọi API)
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Trong thực tế: const data = await fetchDashboardData();
      // setTransactions(data.transactions);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Export data
  //   const exportToCSV = () => {
  //     const csvContent = [
  //       ["Ngày", "Mô tả", "Danh mục", "Loại", "Số tiền"],
  //       ...filteredTransactions.map((t) => [
  //         dayjs(t.date).format("DD/MM/YYYY"),
  //         t.description,
  //         t.category,
  //         t.type === "income" ? "Thu nhập" : "Chi tiêu",
  //         t.amount.toString(),
  //       ]),
  //     ]
  //       .map((row) => row.join(","))
  //       .join("\n");

  //     const blob = new Blob(["\uFEFF" + csvContent], {
  //       type: "text/csv;charset=utf-8;",
  //     });
  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = `dashboard_${dayjs().format("YYYY-MM-DD")}.csv`;
  //     link.click();
  //   };

  return {
    // State
    filterMode,
    transactions: filteredTransactions,
    allTransactions: transactions,
    isLoading,
    selectedDate,
    // Computed data
    summary,
    categoryExpenseStats,
    categoryIncomeStats,
    categorySaveAndShareStats,
    categorySuddenStats,
    monthlyTrend,

    // Actions
    getTransactionsByCategory,
    setFilterMode,
    setSelectedDate,
    refreshData,
  };
};

export default useDashboard;
