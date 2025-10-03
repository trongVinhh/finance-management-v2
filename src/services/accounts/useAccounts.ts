// hooks/useAccounts.ts
import {
  BankOutlined,
  WalletOutlined,
  CreditCardOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { AccountType } from "./enum/account-type.enum";
import { useEffect, useState } from "react";
import type { Account } from "./entities/account.entity";
import { supabase } from "../../lib/supabase";
import { message } from "antd";

export function useAccounts(userId: string) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch accounts + init default
  useEffect(() => {
    if (!userId) return;

    const fetchAccounts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Lỗi fetch accounts:", error);
        message.error("Không thể tải danh sách tài khoản");
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setAccounts(data);
      } 
    //   else {
    //     // nếu user chưa có account nào -> tạo mặc định 1 tài khoản tiền mặt
    //     const { data: inserted, error: insertError } = await supabase
    //       .from("accounts")
    //       .insert([
    //         {
    //           user_id: userId,
    //           name: "Tiền mặt",
    //           type: AccountType.CASH,
    //           amount: 0,
    //           key: "CASH",
    //           logo: "",
    //         },
    //       ])
    //       .select();

    //     if (insertError) {
    //       console.error("Lỗi tạo account mặc định:", insertError);
    //     } else if (inserted) {
    //       setAccounts(inserted);
    //     }
    //   }

      setLoading(false);
    };

    fetchAccounts();
  }, [userId]);

  // CREATE
  const createAccount = async (
    accountData: Omit<Account, "id" | "userId">
  ) => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .insert([
          {
            user_id: userId,
            ...accountData,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setAccounts((prev) => [data, ...prev]);
      message.success("Thêm tài khoản thành công");
      return { data, error: null };
    } catch (error: any) {
      console.error("Lỗi tạo account:", error);
      message.error("Không thể tạo tài khoản");
      return { data: null, error };
    }
  };

  // READ - đã có trong useEffect

  // UPDATE
  const updateAccount = async (
    accountId: string,
    updates: Partial<Omit<Account, "id" | "userId">>
  ) => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .update(updates)
        .eq("id", accountId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      setAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? data : acc))
      );
      message.success("Cập nhật tài khoản thành công");
      return { data, error: null };
    } catch (error: any) {
      console.error("Lỗi cập nhật account:", error);
      message.error("Không thể cập nhật tài khoản");
      return { data: null, error };
    }
  };

  // DELETE
  const deleteAccount = async (accountId: string) => {
    try {
      // Kiểm tra xem có transaction nào liên quan không
      const { count } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("account_id", accountId);

      if (count && count > 0) {
        message.warning(
          "Không thể xóa tài khoản có giao dịch. Vui lòng xóa các giao dịch trước."
        );
        return { data: null, error: "Account has transactions" };
      }

      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", accountId)
        .eq("user_id", userId);

      if (error) throw error;

      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      message.success("Xóa tài khoản thành công");
      return { data: true, error: null };
    } catch (error: any) {
      console.error("Lỗi xóa account:", error);
      message.error("Không thể xóa tài khoản");
      return { data: null, error };
    }
  };

  // UPDATE BALANCE (helper function)
  const updateBalance = async (accountId: string, newBalance: number) => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .update({ amount: newBalance })
        .eq("id", accountId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      setAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? data : acc))
      );
      return { data, error: null };
    } catch (error: any) {
      console.error("Lỗi cập nhật số dư:", error);
      return { data: null, error };
    }
  };

  // REFRESH accounts
  const refreshAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAccounts(data);
    }
    setLoading(false);
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.CASH:
        return WalletOutlined;
      case AccountType.BANK:
        return BankOutlined;
      case AccountType.CREDIT:
        return CreditCardOutlined;
      case AccountType.SAVING:
        return SaveOutlined;
      case AccountType.WALLET:
        return WalletOutlined;
      default:
        return BankOutlined;
    }
  };

  const getAccountColor = (type: AccountType) => {
    switch (type) {
      case AccountType.CASH:
        return "#52c41a";
      case AccountType.BANK:
        return "#1890ff";
      case AccountType.CREDIT:
        return "#f5222d";
      case AccountType.SAVING:
        return "#faad14";
      case AccountType.WALLET:
        return "#722ed1";
      default:
        return "#666666";
    }
  };

  // Get account by ID
  const getAccountById = (accountId: string) => {
    return accounts.find((acc) => acc.id === accountId);
  };

  // Get total balance
  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + (acc.amount || 0), 0);
  };

  return {
    accounts,
    loading,
    // CRUD operations
    createAccount,
    updateAccount,
    deleteAccount,
    updateBalance,
    refreshAccounts,
    // Helpers
    getAccountIcon,
    getAccountColor,
    getAccountById,
    getTotalBalance,
  };
}