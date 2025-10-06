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
import { useSettings } from "../settings/useSettings";
import { useNotify } from "../../contexts/NotifycationContext";

export function useAccounts(userId: string) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { settings, removeAccountFromSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const notify = useNotify();
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
        notify("error", "Thất bại!", "Không thể tải danh sách tài khoản");
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setAccounts(data);
      }

      setLoading(false);
    };

    fetchAccounts();
  }, [userId]);

  // CREATE
  const createAccount = async (accountData: Omit<Account, "id" | "userId">) => {
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
      notify("success", "Thành công!", "Tạo tài khoản thành công");
      return { data, error: null };
    } catch (error: any) {
      console.error("Lỗi tạo account:", error);
      notify("error", "Thất bại!", "Không thể tạo tài khoản");
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
      notify("success", "Thành công!", "Cập nhật tài khoản thành công");
      return { data, error: null };
    } catch (error: any) {
      console.error("Lỗi cập nhật account:", error);
      notify("error", "Thất bại!", "Không thể cập nhật tài khoản");
      return { data: null, error };
    }
  };

  // DELETE
  const deleteAccount = async (id: string) => {
    try {
      // Kiểm tra xem có transaction nào liên quan không
      const { count } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("account_id", id);

      if (count && count > 0) {
        notify(
          "error",
          "Thất bại!",
          "Không thể xóa tài khoản tài khoản đã có giao dịch, vui lòng xóa giao dịch."
        );
        return { data: null, error: "Account has transactions" };
      }

      if (settings?.default_account_id === id) {

      }

      if (settings?.allocations && settings.allocations.length > 0) {
        for (const { accountId } of settings.allocations) {
          if (accountId === id) {
            removeAccountFromSettings(accountId);
          }
        }
      }

      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;

      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
      notify("success", "Thành công!", "Xóa tài khoản thành công");
      return { data: true, error: null };
    } catch (error: any) {
      console.error("Lỗi xóa account:", error);
      notify("error", "Thất bại!", "Xóa tài khoản thất bại");
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
      console.log("update account success");

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
