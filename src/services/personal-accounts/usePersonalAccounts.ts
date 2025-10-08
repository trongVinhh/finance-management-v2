import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export interface PersonalAccount {
  id: string;
  user_id: string;
  type: string;
  name: string;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  password?: string | null;
  note?: string | null;
  created_at?: string;
}

export function usePersonalAccounts(userId: string) {
  const [accounts, setAccounts] = useState<PersonalAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Lấy dữ liệu
  const fetchAccounts = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("personal_accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Lỗi lấy tài khoản:", error);
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  };

  // 🟢 Thêm mới
  const addAccount = async (account: PersonalAccount) => {
    const { error } = await supabase.from("personal_accounts").insert([account]);
    if (error) console.error("❌ Lỗi thêm tài khoản:", error);
    await fetchAccounts();
  };

  // 🟢 Cập nhật
  const updateAccount = async (account: PersonalAccount) => {
    console.log(account)
    if (!account.id) return;
    const { error } = await supabase
      .from("personal_accounts")
      .update(account)
      .eq("id", account.id);
    if (error) console.error("❌ Lỗi cập nhật tài khoản:", error);
    await fetchAccounts();
  };

  // 🟢 Xóa
  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from("personal_accounts").delete().eq("id", id);
    if (error) console.error("❌ Lỗi xóa tài khoản:", error);
    await fetchAccounts();
  };

  // 🟢 Refresh thủ công
  const refresh = () => fetchAccounts();

  useEffect(() => {
    fetchAccounts();
  }, [userId]);

  return { accounts, loading, addAccount, updateAccount, deleteAccount, refresh };
}
